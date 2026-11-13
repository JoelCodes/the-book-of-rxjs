# Pipeable Operators

::: info Draft in progress
This page is a stub. Related archived draft: [Pipe Dreams](/archived/guide/pipe-dreams).
:::

Before the tour of individual operators: what a **pipeable operator** actually is. It's just a function that takes an Observable and returns a new one — `(source: Observable<A>) => Observable<B>` — composed together with `.pipe()`. This one idea is the spine of everything that follows.

This page covers how `pipe` composes operators, why operators are lazy and reusable, and how to read an operator's type signature.
