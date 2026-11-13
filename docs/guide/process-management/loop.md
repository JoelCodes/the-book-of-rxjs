# Bonus: `loop` and `loopScan`

::: info Draft in progress
This page is a stub — the walkthrough is on its way.
:::

A worked example: operators that feed a stream back into itself. `loopScan` is a `scan` whose accumulator can also emit follow-up actions that re-enter the pipeline, and `loop` builds the feedback wiring around it — the pattern behind state machines, retry schedulers, and reducer loops where one output becomes the next input.
