# Combiners, Revisited

::: info Draft in progress
This page is a stub. Related archived draft: [Combining Observables](/archived/guide/combining-observables).
:::

We met the combiner functions and flatMaps back in [Array-like](/guide/array-like/combiners-and-flatmaps) as a way to reshape values. Here we come back to them as **process** tools, with real examples: coordinating requests, merging event sources, racing timeouts, and choosing the right flattening strategy (`mergeMap` vs `concatMap` vs `switchMap` vs `exhaustMap`) for the job at hand.
