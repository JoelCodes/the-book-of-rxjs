# Debugging Examples

::: info Draft in progress
This page is a stub — more walkthroughs on the way.
:::

A gallery of streams that misbehave, and how to find and fix them. Each example is a small, runnable pipe with a bug you can see in the emission log — then the fix.

## Wrong flattening strategy

A search-as-you-type that uses `mergeMap` keeps stale responses: an earlier, slower request can resolve _after_ a newer one and overwrite it. Watch the out-of-order emissions, then switch to `switchMap` to cancel the in-flight request.

<RunRx height="12rem">

```ts
// simulate a request whose latency shrinks as you "type"
const search = (term) => of(`result(${term})`).pipe(delay(400 - term * 100));

// BUG: mergeMap lets a slow early result arrive after a fast later one
subscribe(
  of(1, 2, 3).pipe(
    concatMap(t => of(t).pipe(delay(50))), // stand in for keystrokes
    mergeMap(search),
  )
);
// try changing mergeMap -> switchMap and compare the order
```

</RunRx>

## More to come

- A cold Observable firing duplicate HTTP requests (and `shareReplay` to fix it).
- A subscription leak from a stream that never completes.
- Operators in the wrong order changing the result.
