# Debugging

::: info Draft in progress
This page is a stub. Related archived draft: [Testing and Debugging RxJS](/archived/guide/testing-rxjs).
:::

Seeing what a stream is actually doing at runtime, and fixing it when it isn't:

- **Tracing with `tap`** — logging `next`/`error`/`complete`, plus subscribe and teardown.
- **The usual gotchas** — cold-vs-hot surprises, forgotten subscriptions and leaks, operators in the wrong order, and streams that never complete.
- **Tooling** — source maps, `rxjs-spy`-style approaches, and reading long pipes.
