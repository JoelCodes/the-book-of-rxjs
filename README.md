# The Book of RxJS

A textbook, reference guide, and cookbook for RxJS — every operator, the concepts behind them, and how to design real apps with reactive streams.

The book is a [VitePress](https://vitepress.dev) site. Content lives in `docs/`.

## Local development

```bash
npm install
npm run docs:dev      # dev server with hot reload
npm run docs:build    # regenerate the reference index + build static site
npm run docs:preview  # preview the production build
npm run index         # regenerate docs/reference/ from scripts/components.json
```

## Structure

- `docs/guide/` — Section I: A Tour of the Library
- `docs/articles/` — Section II: Articles
- `docs/cookbook/` — Section III: Cookbook
- `docs/reference/` — generated operator index (do not edit by hand; see `scripts/scrape-for-index.js`)
- `docs/.vitepress/theme/` — interactive components (`RunRx`, `Marble`, `Quiz`)
- `scripts/examples/` — standalone runnable TypeScript examples

## Deploy

Pushing to `main` builds and deploys to GitHub Pages via `.github/workflows/deploy.yml`.
Enable Pages → Source: "GitHub Actions" in the repo settings. The site serves under
`/the-book-of-rxjs/` (`base` in `docs/.vitepress/config.ts`); change it to `/` if you add a custom domain.

## How can I help?

Found a mistake or want more explanation? Open an issue. Have a good tool for visualizing
RxJS streams, embedding content, or running quizzes? Fork and PR. Contributions welcome and credited.
If you'd like to support the work: [buy me a coffee](https://ko-fi.com/yesthatjoelshinness).
