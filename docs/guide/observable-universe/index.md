# The Observable Universe

::: info Draft in progress
This chapter is being rewritten. The original draft is archived here: [The Observable Universe](/archived/guide/the-observable-universe).
:::

Every bit of RxJS orbits three types that work together — the **trinity**:

- **Observer** — the thing that reacts. An object with `next`, `error`, and `complete` handlers.
- **Observable** — the thing that produces. A lazy stream of values you subscribe to with an Observer.
- **Subscription** — the thing that stops it. The handle returned by `subscribe`, used to tear everything down.

Understand how these three relate and the rest of the library falls into place. This section builds them up, then shows every way to bring an Observable into existence.

## In this section

- [The Observable Constructor](/guide/observable-universe/observable-constructor) — building one by hand.
- [Creating Observables from Other Values](/guide/observable-universe/creating-observables) — `of`, `from`, and `defer`.
- [Subjects](/guide/observable-universe/subjects) — Observables that are also Observers.
- [Wrapping Web APIs](/guide/observable-universe/web-api-wrappers) — `interval`, `timer`, `animationFrames`, `ajax`, `fromFetch`, `WebSocketSubject`.
- [Bonus: Writing `deferAbort`](/guide/observable-universe/defer-abort) — a small custom creator, start to finish.
