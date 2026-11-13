# Testing

::: info Draft in progress
This page is a stub. Related archived draft: [Testing and Debugging RxJS](/archived/guide/testing-rxjs).
:::

Making time deterministic. The **`TestScheduler`** (`rxjs/testing`) runs your Observables in virtual time, so a test that would take seconds runs instantly and repeatably. Covered here:

- **Marble syntax** — describing streams as strings like `'-a--b-|'`.
- **`run` and the helpers** — `cold`, `hot`, `expectObservable`, `expectSubscriptions`.
- Testing operators, timing, and error paths without real delays.
