import { defineConfig } from 'vitepress'

// Shared across /intro/ and /guide/ so the book reads continuously.
const guideSidebar = [
  {
    text: 'Getting Started',
    items: [
      { text: 'About This Book', link: '/intro/about-this-book' },
      { text: 'What is RxJS, and Why Do I Care?', link: '/intro/what-is-rxjs' },
    ],
  },
  {
    text: 'A Tour of the Library',
    items: [
      { text: 'Overview', link: '/guide/' },
      {
        text: 'The Observable Universe',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/guide/observable-universe/' },
          { text: 'The Observable Constructor', link: '/guide/observable-universe/observable-constructor' },
          { text: 'Creating from Other Values', link: '/guide/observable-universe/creating-observables' },
          { text: 'Subjects', link: '/guide/observable-universe/subjects' },
          { text: 'Wrapping Web APIs', link: '/guide/observable-universe/web-api-wrappers' },
          { text: 'Bonus: Writing deferAbort', link: '/guide/observable-universe/defer-abort' },
        ],
      },
      { text: 'Pipeable Operators', link: '/guide/pipeable-operators' },
      {
        text: 'Array & Iterable-like Operators',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/guide/array-like/' },
          { text: 'One In, One Out', link: '/guide/array-like/one-in-one-out' },
          { text: 'Filtering', link: '/guide/array-like/filtering' },
          { text: 'Short-Circuiting', link: '/guide/array-like/short-circuiting' },
          { text: 'Firing on Completion', link: '/guide/array-like/on-completion' },
          { text: 'Combiners and flatMaps', link: '/guide/array-like/combiners-and-flatmaps' },
          { text: 'Bonus: Writing safeMap', link: '/guide/array-like/safe-map' },
        ],
      },
      {
        text: 'Process Management',
        collapsed: false,
        items: [
          { text: 'Overview', link: '/guide/process-management/' },
          { text: 'Flow', link: '/guide/process-management/flow' },
          { text: 'Timing', link: '/guide/process-management/timing' },
          { text: 'Rx-Specific Operators', link: '/guide/process-management/rx-specific' },
        ],
      },
      { text: 'Testing & Debugging RxJS', link: '/guide/testing-debugging/' },
      { text: 'The RxJS Graveyard', link: '/guide/graveyard' },
      { text: 'Types', link: '/guide/types' },
    ],
  },
]

// Base path for GitHub Pages project site: https://<user>.github.io/the-book-of-rxjs/
// If you set up a custom domain, change this to '/'.
export default defineConfig({
  title: 'The Book of RxJS',
  description:
    'A textbook, reference guide, and cookbook for RxJS — every operator, the concepts behind them, and how to design real apps with reactive streams.',
  base: '/the-book-of-rxjs/',
  lang: 'en-US',
  cleanUrls: true,
  lastUpdated: true,
  ignoreDeadLinks: [/^https?:/],

  themeConfig: {
    search: { provider: 'local' },

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Articles', link: '/articles/' },
      { text: 'Reference', link: '/reference/all' },
      {
        text: 'Archive',
        items: [
          { text: 'A Tour of the Library', link: '/archived/guide/' },
          { text: 'Articles', link: '/archived/articles/' },
          { text: 'Cookbook', link: '/archived/cookbook/' },
        ],
      },
    ],

    sidebar: {
      '/intro/': guideSidebar,
      '/guide/': guideSidebar,
      '/articles/': [
        {
          text: 'Articles',
          items: [
            { text: 'Overview', link: '/articles/' },
            { text: 'Reactive Programming', link: '/articles/reactive-programming' },
            { text: 'Monads', link: '/articles/monads' },
            { text: 'Reducer-Based Apps', link: '/articles/reducer-apps' },
            { text: 'RxJS and React', link: '/articles/rx-and-react' },
            { text: 'RxJS and Angular', link: '/articles/rx-and-angular' },
            { text: 'RxJS and Vue', link: '/articles/rx-and-vue' },
          ],
        },
      ],
      '/archived/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Welcome to the Library', link: '/archived/guide/' },
            { text: 'What is RxJS?', link: '/archived/guide/what-is-rxjs' },
            { text: 'How much JavaScript do I need?', link: '/archived/guide/how-much-javascript' },
          ],
        },
        {
          text: 'A Tour of the Library',
          items: [
            { text: '1. The Observable Universe', link: '/archived/guide/the-observable-universe' },
            { text: '2. How To Make An Observable', link: '/archived/guide/how-to-make-an-observable' },
            { text: '3. Pipe Dreams', link: '/archived/guide/pipe-dreams' },
            { text: '4. Array-like Operators', link: '/archived/guide/array-like-operators' },
            { text: '5. RxJS For Processes', link: '/archived/guide/rxjs-for-processes' },
            { text: '6. Combining Observables', link: '/archived/guide/combining-observables' },
            { text: '7. Timing', link: '/archived/guide/timing' },
            { text: '8. Rx-Specific Operators', link: '/archived/guide/rx-specific-operators' },
            { text: '9. Testing RxJS', link: '/archived/guide/testing-rxjs' },
            { text: '10. RxJS Graveyard', link: '/archived/guide/rxjs-graveyard' },
            { text: '11. Just My Types', link: '/archived/guide/just-my-types' },
            { text: "12. What's Next?", link: '/archived/guide/whats-next' },
          ],
        },
      ],
      '/archived/articles/': [
        {
          text: 'Articles',
          items: [
            { text: 'Overview', link: '/archived/articles/' },
            { text: 'Reducers For Fun And Profit', link: '/archived/articles/reducers-for-fun-and-profit' },
            { text: 'Lazy Array Transformation', link: '/archived/articles/lazy-array-transformation' },
            { text: 'Rx Utils I Keep Making', link: '/archived/articles/rx-utils-i-keep-making' },
            { text: 'Reactive Programming', link: '/archived/articles/reactive-programming' },
          ],
        },
      ],
      '/archived/cookbook/': [
        { text: 'Cookbook', items: [{ text: 'Overview', link: '/archived/cookbook/' }] },
      ],
      '/reference/': [
        {
          text: 'By Category',
          items: [
            { text: 'Observable Creation', link: '/reference/creation' },
            { text: 'Array-Like', link: '/reference/array-like' },
            { text: 'Process and Flow', link: '/reference/process-and-flow' },
            { text: 'Combiners', link: '/reference/combiners' },
            { text: 'Timing', link: '/reference/timing' },
            { text: 'Because RxJS', link: '/reference/because-rxjs' },
          ],
        },
        {
          text: 'By Type',
          items: [
            { text: 'All Components', link: '/reference/all' },
            { text: 'Classes', link: '/reference/classes' },
            { text: 'Functions', link: '/reference/functions' },
            { text: 'Consts', link: '/reference/consts' },
            { text: 'Types', link: '/reference/types' },
            { text: 'Deprecated', link: '/reference/deprecated' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/JoelCodes/the-book-of-rxjs' },
    ],

    editLink: {
      pattern: 'https://github.com/JoelCodes/the-book-of-rxjs/edit/main/docs/:path',
    },
  },
})
