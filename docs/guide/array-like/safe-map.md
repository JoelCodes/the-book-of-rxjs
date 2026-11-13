# Bonus: Writing `safeMap`

::: info Draft in progress
This page is a stub — the walkthrough is on its way.
:::

A worked example: a version of `map` whose projection can't tear the stream down. When the mapping function throws, a plain `map` sends `error` and the Observable is finished. `safeMap` catches the throw per value and routes it somewhere useful instead — an `Either`-style result, a skipped value, or a side channel — so one bad input doesn't kill the whole pipeline.
