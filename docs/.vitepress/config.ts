import { defineConfig } from 'vitepress'

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
      { text: 'Cookbook', link: '/cookbook/' },
      { text: 'Reference', link: '/reference/all' },
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Welcome to the Library', link: '/guide/' },
            { text: 'What is RxJS?', link: '/guide/what-is-rxjs' },
            { text: 'How much JavaScript do I need?', link: '/guide/how-much-javascript' },
          ],
        },
        {
          text: 'A Tour of the Library',
          items: [
            { text: '1. The Observable Universe', link: '/guide/the-observable-universe' },
            { text: '2. How To Make An Observable', link: '/guide/how-to-make-an-observable' },
            { text: '3. Pipe Dreams', link: '/guide/pipe-dreams' },
            { text: '4. Array-like Operators', link: '/guide/array-like-operators' },
            { text: '5. RxJS For Processes', link: '/guide/rxjs-for-processes' },
            { text: '6. Combining Observables', link: '/guide/combining-observables' },
            { text: '7. Timing', link: '/guide/timing' },
            { text: '8. Rx-Specific Operators', link: '/guide/rx-specific-operators' },
            { text: '9. Testing RxJS', link: '/guide/testing-rxjs' },
            { text: '10. RxJS Graveyard', link: '/guide/rxjs-graveyard' },
            { text: '11. Just My Types', link: '/guide/just-my-types' },
            { text: "12. What's Next?", link: '/guide/whats-next' },
          ],
        },
      ],
      '/articles/': [
        {
          text: 'Articles',
          items: [
            { text: 'Overview', link: '/articles/' },
            { text: 'Reducers For Fun And Profit', link: '/articles/reducers-for-fun-and-profit' },
            { text: 'Lazy Array Transformation', link: '/articles/lazy-array-transformation' },
            { text: 'Rx Utils I Keep Making', link: '/articles/rx-utils-i-keep-making' },
            { text: 'Reactive Programming', link: '/articles/reactive-programming' },
          ],
        },
      ],
      '/cookbook/': [
        { text: 'Cookbook', items: [{ text: 'Overview', link: '/cookbook/' }] },
      ],
      '/reference/': [
        {
          text: 'Reference',
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
