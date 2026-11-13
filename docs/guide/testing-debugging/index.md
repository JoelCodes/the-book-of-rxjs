# Testing and Debugging RxJS

::: info Draft in progress
This chapter is being rewritten. The original draft is archived here: [Testing and Debugging RxJS](/archived/guide/testing-rxjs).
:::

Asynchronous, time-dependent streams are exactly the code that's hardest to test and debug by eye. RxJS gives you tools to make time deterministic in tests, and a handful of techniques for seeing what a stream is actually doing at runtime.

## In this section

- [Testing](/guide/testing-debugging/testing) — virtual time and marble tests with the `TestScheduler`.
- [Debugging](/guide/testing-debugging/debugging) — tracing emissions, spotting leaks, and the usual gotchas.
- [Debugging Examples](/guide/testing-debugging/debugging-examples) — worked walkthroughs of problematic streams, bug and fix.
