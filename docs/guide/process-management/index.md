# Process Management

::: info Draft in progress
This page is a stub — content is on the way.
:::

Once a stream is more than a list of values — once it's a running **process** with side effects, failures, and multiple consumers — you need a different set of tools. This section is about managing that process: observing it without disturbing it, keeping it alive when things go wrong, and wiring several streams together.

## In this section

- [Hot, Cold, and Side Effects](/guide/process-management/hot-and-cold) — `tap`, `finalize`, and the hot-vs-cold distinction that everything else depends on.
- [Robustness Operators](/guide/process-management/robustness) — surviving errors and empty streams: `catchError`, `retry`, `repeat`, `timeout`, and friends.
- [Combiners, Revisited](/guide/process-management/combiners) — the combiner functions and flatMaps again, now with real process-shaped examples.
- [Timing](/guide/process-management/timing) — operators about _when_ values arrive: debouncing, throttling, delaying, sampling.
- [Bonus: `loop` and `loopScan`](/guide/process-management/loop) — feeding a stream back into itself.
