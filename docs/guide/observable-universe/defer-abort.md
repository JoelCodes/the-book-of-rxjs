# Bonus: Writing `deferAbort`

::: info Draft in progress
This page is a stub — the walkthrough is on its way.
:::

A worked example of building your own creation function. `deferAbort` defers work until subscribe time (like `defer`), but also hands the factory an `AbortSignal` that fires when the subscription is torn down — so fetches, timers, and listeners clean themselves up.

The whole thing is a few lines around the raw `Observable` constructor:

<RunRx height="12rem">

```ts
function deferWithAbort(factory) {
  return new Observable(observer => {
    const controller = new AbortController();
    return from(factory(controller.signal))
      .subscribe(observer)
      .add(() => controller.abort());
  });
}

function countTillAbort(signal, cb) {
  let n = 0;
  (function tick() {
    if (signal.aborted) return;
    cb(n++);
    setTimeout(tick, 1000);
  })();
}

const sub = subscribe(
  deferWithAbort(signal => new Observable(observer => {
    countTillAbort(signal, x => observer.next(x));
  }))
);

// tear down after 3.5s — watch the signal abort the counter
setTimeout(() => sub.unsubscribe(), 3500);
```

</RunRx>

The source lives in the repo at `scripts/examples/s01-c02/000-defer-with-abort.ts`.
