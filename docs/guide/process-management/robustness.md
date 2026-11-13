# Robustness Operators

::: info Draft in progress
This page is a stub. Related archived draft: [RxJS For Processes](/archived/guide/rxjs-for-processes).
:::

Keeping a process alive when things go wrong. The operators that catch errors, retry failed work, repeat finished work, and guard against streams that finish empty or hang:

- **`catchError`** — recover from an error by switching to another Observable.
- **`retry`** — resubscribe to the source after a failure.
- **`repeat`** — resubscribe after a successful completion.
- **`throwIfEmpty`** / **`defaultIfEmpty`** — handle sources that complete without emitting.
- **`timeout`** — fail (or fall back) when the source goes quiet too long.
