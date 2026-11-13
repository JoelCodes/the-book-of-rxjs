const fs = require('fs/promises');
const path = require('path');

const componentsData = fs.readFile(path.join(__dirname, './components.json'), 'utf8')
  .then(JSON.parse)
  .then(items => items.sort((a, b) => a.name.localeCompare(b.name)));

// folder on disk (relative to this script) -> { title, url } where url is the
// VitePress route prefix for pages in that folder.
const sections = {
  '../docs/guide': { title: 'A Tour Of The Library', url: '/guide' },
  '../docs/articles': { title: 'RxJS Articles', url: '/articles' },
  '../docs/cookbook': { title: 'RxJS Cookbook', url: '/cookbook' },
};

const OUT = path.join(__dirname, '../docs/reference');

const fileNames = Promise.all(
  Object.keys(sections)
    .map(section => fs.readdir(path.join(__dirname, section)).then(files => files.map((file) => [section, file])))
).then(files => files.flatMap(files => files));

const componentReferences = Promise.all([fileNames, componentsData]).then(async ([fileNames, componentsData]) => {
  const componentReferences = {};

  for (const [section, fileName] of fileNames) {
    if (!fileName.endsWith('.md')) continue;
    const contents = await fs.readFile(path.join(__dirname, section, fileName), 'utf8');
    if (!contents.includes('#')) continue;
    const allLines = skipWhile(contents.split('\n'), line => !line.trim().startsWith('#'));
    const [first, ...lines] = [...allLines];
    if (first === undefined) continue;

    // VitePress route for this file: /guide, /guide/<slug>, etc. index.md -> folder root.
    const slug = fileName.replace(/\.md$/, '');
    const pageUrl = slug === 'index'
      ? sections[section].url + '/'
      : `${sections[section].url}/${slug}`;

    const groupedLines = [[first]];
    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine) continue;
      if (trimmedLine.startsWith('#')) groupedLines.push([line]);
      else groupedLines[groupedLines.length - 1].push(line);
    }

    for (const component of componentsData) {
      componentReferences[component.name] = componentReferences[component.name] || [];
      for (const group of groupedLines) {
        if (group.some(line => line.includes(component.name))) {
          const anchor = group[0].replaceAll('#', '').trim().split(' ').join('-').toLowerCase();
          componentReferences[component.name].push([
            sections[section].title,
            first.replace(/^#+/, '').trim(),
            `${pageUrl}#${anchor}`,
          ]);
        }
      }
    }
  }
  return componentReferences;
});

const entries = Promise.all([componentsData, componentReferences]).then(([componentsData, componentReferences]) => {
  return Object.fromEntries(componentsData.map(component => {
    const references = componentReferences[component.name] || [];
    const content = `* [${component.name}](${component.link}) - ${component.type}
${references.map(([section, title, link]) => `  * [${section} - ${title}](${link})`).join('\n')}`;
    return [component.name, content];
  }));
});

// Operator categories, in teaching order, with their page slugs.
const CATEGORIES = [
  ['Observable Creation', 'creation'],
  ['Array-Like', 'array-like'],
  ['Process and Flow', 'process-and-flow'],
  ['Combiners', 'combiners'],
  ['Timing', 'timing'],
  ['Because RxJS', 'because-rxjs'],
];

const CAT_NAV = CATEGORIES.map(([title, slug]) => `[${title}](./${slug})`).join(' | ');
const NAV = `**By category:** ${CAT_NAV}

**By type:** [All](./all) | [Classes](./classes) | [Functions](./functions) | [Consts](./consts) | [Types](./types) | [Deprecated](./deprecated)`;

const clearIndexFiles = fs.rm(OUT, { recursive: true, force: true }).then(() => fs.mkdir(OUT, { recursive: true }));
clearIndexFiles
  .then(() => Promise.all([entries, componentsData]))
  .then(async ([entries, componentsData]) => {
    const { pipeable, creation, function: functions, const: consts, class: classes, interface: interfaces } =
      groupBy(componentsData, component => component.type);

    await fs.writeFile(path.join(OUT, 'all.md'), `# Index of RxJS Components

${NAV}

${componentsData.map(component => entries[component.name]).join('\n\n')}
`);

    const { subjects, otherClasses } = groupBy(classes, c => c.name.includes('Subject') ? 'subjects' : 'otherClasses');
    await fs.writeFile(path.join(OUT, 'classes.md'), `# Classes

${NAV}

## Subjects

${(subjects || []).map(c => entries[c.name]).join('\n\n')}

## Others

${(otherClasses || []).map(c => entries[c.name]).join('\n\n')}
`);

    await fs.writeFile(path.join(OUT, 'functions.md'), `# Functions

${NAV}

## Pipeable Operators

${(pipeable || []).map(c => entries[c.name]).join('\n\n')}

## Creation Operators

${(creation || []).map(c => entries[c.name]).join('\n\n')}

## Other Functions

${(functions || []).map(c => entries[c.name]).join('\n\n')}
`);

    const { schedulers, observables, otherConsts } = groupBy(consts, c =>
      c.name.includes('Scheduler') ? 'schedulers' : c.name.toUpperCase() === c.name ? 'observables' : 'otherConsts');
    await fs.writeFile(path.join(OUT, 'consts.md'), `# Consts

${NAV}

## Schedulers

${(schedulers || []).map(c => entries[c.name]).join('\n\n')}

## Observable Consts

${(observables || []).map(c => entries[c.name]).join('\n\n')}

## Other Consts

${(otherConsts || []).map(c => entries[c.name]).join('\n\n')}
`);

    await fs.writeFile(path.join(OUT, 'types.md'), `# Types

${NAV}

${(interfaces || []).map(c => entries[c.name]).join('\n\n')}
`);

    await fs.writeFile(path.join(OUT, 'deprecated.md'), `# Deprecated

${NAV}

${componentsData.filter(c => c.deprecated).map(c => entries[c.name]).join('\n\n')}
`);

    // One page per operator category. Non-deprecated members only; alphabetical.
    const byCategory = groupBy(
      componentsData.filter(c => c.category && !c.deprecated),
      c => c.category,
    );
    const CAT_INTRO = {
      'Observable Creation': 'Functions that create an Observable from some source — values, events, timers, promises, callbacks.',
      'Array-Like': 'Operators with a direct Array or Iterable analogue: transform, filter, and reduce the values of a single stream.',
      'Process and Flow': 'Operators that shape a stream’s lifecycle — error handling, retries, repetition, and completion.',
      'Combiners': 'Operators and functions that combine or flatten multiple Observables into one.',
      'Timing': 'Operators that work with time: debouncing, throttling, delaying, sampling, and scheduling.',
      'Because RxJS': 'Utilities that exist because of what RxJS is — multicasting, materialization, side effects, and Promise interop.',
    };
    for (const [title, slug] of CATEGORIES) {
      const members = (byCategory[title] || []).sort((a, b) => a.name.localeCompare(b.name));
      await fs.writeFile(path.join(OUT, `${slug}.md`), `# ${title}

${NAV}

${CAT_INTRO[title] || ''}

${members.map(c => entries[c.name]).join('\n\n')}
`);
    }

    console.log('wrote reference pages to', path.relative(process.cwd(), OUT));
  });

function groupBy(items, keySelector) {
  const groups = {};
  let index = 0;
  for (const item of items) {
    const key = keySelector(item, index++);
    groups[key] = groups[key] || [];
    groups[key].push(item);
  }
  return groups;
}

function* skipWhile(items, predicate) {
  let skipped = true;
  for (const item of items) {
    if (!predicate(item)) skipped = false;
    if (!skipped) yield item;
  }
}
