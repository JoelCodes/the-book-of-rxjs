# Wrapping Web APIs

::: info Draft in progress
This page is a stub. Related archived draft: [How To Make An Observable](/archived/guide/how-to-make-an-observable).
:::

RxJS ships Observables that wrap common browser and platform APIs, so timers, requests, and sockets all speak the same streaming language:

- **`interval`** / **`timer`** — emit on a schedule.
- **`animationFrames`** — emit once per animation frame.
- **`ajax`** — HTTP requests as an Observable (`rxjs/ajax`).
- **`fromFetch`** — the Fetch API as an Observable, with `AbortController` wired in (`rxjs/fetch`).
- **`WebSocketSubject`** / **`webSocket`** — a bidirectional socket you can both send to and subscribe to (`rxjs/webSocket`).
