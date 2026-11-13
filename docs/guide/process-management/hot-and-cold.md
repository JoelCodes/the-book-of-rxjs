# Hot, Cold, and Side Effects

::: info Draft in progress
This page is a stub. Related archived draft: [RxJS For Processes](/archived/guide/rxjs-for-processes).
:::

The single most important distinction once streams become processes: **cold** Observables do their work fresh for each subscriber, while **hot** ones share one running source among all of them. Get this wrong and you'll see duplicate requests, missed values, or leaks — so this page makes it concrete before anything else.

Alongside it, the two operators for stepping into a running process without changing its values:

- **`tap`** — run a side effect (logging, debugging, cache writes) for each notification.
- **`finalize`** — run teardown once, whenever the stream ends for any reason.
