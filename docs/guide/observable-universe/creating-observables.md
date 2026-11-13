# Creating Observables from Other Values

::: info Draft in progress
This page is a stub. Related archived draft: [How To Make An Observable](/archived/guide/how-to-make-an-observable).
:::

Turning values you already have into Observables:

- **`of`** — emit a fixed list of arguments, then complete.
- **`from`** — convert an array, iterable, Promise, or another Observable into a stream.
- **`defer`** — build a fresh Observable per subscriber, so the work is lazy and not shared.
