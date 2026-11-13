# Array and Iterable-like Operators

::: info Draft in progress
This chapter is being rewritten. The original draft is archived here: [Array and Iterable-like Operators](/archived/guide/array-like-operators).
:::

The test for this section: **could I have written this operator as `Iterable<A> => Iterable<B>`?** If an operator makes sense on a plain iterable — no notion of time or concurrency required — it belongs here. That covers most of the day-to-day shaping you do to a stream.

We group them by shape:

## In this section

- [One In, One Out](/guide/array-like/one-in-one-out) — operators where every input produces exactly one output.
- [Filtering](/guide/array-like/filtering) — the `filter` family: keep some values, drop the rest.
- [Short-Circuiting](/guide/array-like/short-circuiting) — operators that stop early once they've seen enough.
- [Firing on Completion](/guide/array-like/on-completion) — operators that emit only once the source completes.
- [Combiners and flatMaps](/guide/array-like/combiners-and-flatmaps) — mapping to inner streams and joining them back together.
- [Bonus: Writing `safeMap`](/guide/array-like/safe-map) — a `map` that won't blow up the stream.
