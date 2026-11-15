# Creating Observables from Other Values

::: info Draft in progress
This page is a stub. Related archived draft: [How To Make An Observable](/archived/guide/how-to-make-an-observable).
:::

Turning values you already have into Observables:

- **`of`** — emit a fixed list of arguments, then complete.
- **`from`** — convert an array, iterable, Promise, or another Observable into a stream.
- **`defer`** — build a fresh Observable per subscriber, so the work is lazy and not shared.
- **`fromEvent`** — turn an event source (a DOM element, an `EventEmitter`, etc.) into a stream of events.
- **`fromEventPattern`** — build an event stream from your own add/remove-handler functions, for sources `fromEvent` doesn't recognize.
- **`bindCallback`** — wrap a callback-style function so calling it returns an Observable of the callback's result.
- **`bindNodeCallback`** — the same, for Node-style error-first callbacks `(err, result) => ...`.
