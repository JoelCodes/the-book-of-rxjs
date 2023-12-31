const { group } = require('console');
const fs = require('fs/promises');
const path = require('path');
const componentsData = fs.readFile(path.join(__dirname, './components.json'), 'utf8')
  .then(JSON.parse)
  .then(items => items.sort((a, b) => a.name.localeCompare(b.name)));

const sections = {
  ['../section-1']: 'A Tour Of The Library',
  ['../section-2']: 'RxJS Articles',
  ['../section-3']: 'RxJS Cookbook',
}
const fileNames = Promise.all(
  Object.keys(sections)
    .map(section => fs.readdir(path.join(__dirname, section)).then(files => files.map((file) => [section, file])))
).then(files => files.flatMap(files => files));

const componentReferences = Promise.all([fileNames, componentsData]).then(async([fileNames, componentsData]) => {
  const componentReferences = {};

  for(const [section, fileName] of fileNames) {
    const contents = await fs.readFile(path.join(__dirname, section, fileName), 'utf8');
    if(!contents.includes('#')) continue;
    const allLines = skipWhile(contents.split('\n'), line => !line.trim().startsWith('#'));
    if(allLines.length === 0) continue;
    const [first, ...lines] = allLines;
    const groups = [];
    const last = [first];
    groups.push(last);

    const groupedLines = [[first]];
    for(const line of lines){
      const trimmedLine = line.trim();

      if(!trimmedLine) continue;
      if(trimmedLine.startsWith('#')){
        groupedLines.push([line]);
      } else {
        groupedLines[groupedLines.length - 1].push(line);
      }
    }
    for(const component of componentsData){
      componentReferences[component.name] = componentReferences[component.name] || [];
      for(const group of groupedLines){
        if(group.some(line => line.includes(component.name))){
          componentReferences[component.name].push(
            [
              section, 
              first.replace(/^#+/, '').trim(), 
              `${section}/${fileName}#${group[0].replaceAll('#', '').trim().split(' ').join('-').toLowerCase()}`
            ]
          );
        }
      }
    }
  }
  return componentReferences;
});

const entries = Promise.all([
  componentsData, componentReferences
]).then(([componentsData, componentReferences]) => {
  return Object.fromEntries(componentsData.map(component => {
    const references = componentReferences[component.name] || [];
    const content = `* [${component.name}](${component.link}) - ${component.type}
${
  references.map(([section, title, link]) => `  * [${section} - ${title}](${link})`).join('\n')
}`
    return [component.name, content];
  }));  
});

const clearIndexFiles = fs.rm(path.join(__dirname, '../index'), { recursive: true }).then(() => fs.mkdir(path.join(__dirname, '../index')));
clearIndexFiles
  .then(() => Promise.all([entries, componentsData]))
  .then(async ([entries, componentsData]) => {
    const {
      pipeable, creation, function: functions, const: consts, class: classes, interface: interfaces
    } = groupBy(componentsData, component => component.type);
    const allFileContents = `# Index of Rxjs Components

[Classes](./classes.md) | [Subjects](./classes.md#subjects) | [Functions](./functions.md) | [Schedulers](./consts.md#schedulers) | [Consts](./consts.md) | [Types](./types.md) | [Deprecated](./deprecated.md)

${
  componentsData.map(component => entries[component.name]).join('\n\n')
}
`;

    await fs.writeFile(path.join(__dirname, '../index/all.md'), `# Index of Rxjs Components

[Classes](./classes.md) | [Subjects](./classes.md#subjects) | [Functions](./functions.md) | [Pipeable Operators](./functions.md#pipeable-operators) | [Creation Operators](./functions.md#creation-operators) | [Schedulers](./consts.md#schedulers) | [Consts](./consts.md) | [Types](./types.md) | [Deprecated](./deprecated.md)
    
${
  componentsData.map(component => entries[component.name]).join('\n\n')
}
`);
    const {
      subjects, otherClasses
    } = groupBy(classes, component => component.name.includes('Subject') ? 'subjects' : 'otherClasses');

    await fs.writeFile(path.join(__dirname, '../index/classes.md'), `# Classes

[Back to All Components](./all.md) | [Subjects](#subjects) | [Others](#others)

## Subjects

${subjects.map(component => entries[component.name]).join('\n\n')}

## Others

${otherClasses.map(component => entries[component.name]).join('\n\n')}
`);

  await fs.writeFile(path.join(__dirname, '../index/functions.md'), `# Functions

[Back to All Components](./all.md) | [Pipeable Operators](#pipeable-operators) | [Creation Operators](#creation-operators) | [Other Functions](#other-functions)

## Pipeable Operators

${pipeable.map(component => entries[component.name]).join('\n\n')}

## Creation Operators

${creation.map(component => entries[component.name]).join('\n\n')}

## Other Functions

${functions.map(component => entries[component.name]).join('\n\n')}

`);
    const {
      schedulers, observables, otherConsts
    } = groupBy(consts, component => component.name.includes('Scheduler') ? 'schedulers' : component.name.toUpperCase() === component.name ? 'observables' : 'otherConsts');
    await fs.writeFile(path.join(__dirname, '../index/consts.md'), `# Consts

[Back to All Components](./all.md) | [Schedulers](#schedulers) | [Observable Consts](#observable-consts) | [Other Consts](#other-consts)

## Schedulers

${schedulers.map(component => entries[component.name]).join('\n\n')}

## Observable Consts

${observables.map(component => entries[component.name]).join('\n\n')}

## Other Consts

${otherConsts.map(component => entries[component.name]).join('\n\n')}
`);
    await fs.writeFile(path.join(__dirname, '../index/types.md'), `# Types

[Back to All Components](./all.md)

${interfaces.map(component => entries[component.name]).join('\n\n')}

`);
    await fs.writeFile(path.join(__dirname, '../index/deprecated.md'), `# Deprecated

[Back to All Components](./all.md)

${componentsData.filter(component => component.deprecated).map(component => entries[component.name]).join('\n\n')}
`);
  });


function groupBy(items, keySelector){
  const groups = {};
  let index = 0;
  for(const item of items){
    const key = keySelector(item, index++);
    groups[key] = groups[key] || [];
    groups[key].push(item);
  }
  return groups;
}
  
function* skipWhile(items, predicate){
  let skipped = true;
  let index = 0;
  for(const item of items){
    if(!predicate(item, index++)){
      skipped = false;
    }
    if(!skipped){
      yield item;
    }
  }
}