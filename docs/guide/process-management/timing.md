# Timing

::: info Draft in progress
This page is a stub. Related archived draft: [Timing](/archived/guide/timing).
:::

Operators whose whole job is about **when** values arrive, not what they are. Rate-limiting a firehose, waiting for a lull, spacing things out, and sampling on a clock:

- **`debounce`** / **`debounceTime`** — emit only after a quiet gap.
- **`throttle`** / **`throttleTime`** — emit at most once per window.
- **`audit`** / **`auditTime`** / **`sample`** / **`sampleTime`** — emit the latest value on a signal or interval.
- **`delay`** / **`delayWhen`** — shift emissions later in time.
- **`timeInterval`** / **`timestamp`** — annotate values with timing information.
