# Observable Creation

**By category:** [Observable Creation](./creation) | [Array-Like](./array-like) | [Process and Flow](./process-and-flow) | [Combiners](./combiners) | [Timing](./timing) | [Because RxJS](./because-rxjs)

**By type:** [All](./all) | [Classes](./classes) | [Functions](./functions) | [Consts](./consts) | [Types](./types) | [Deprecated](./deprecated)

Functions that create an Observable from some source — values, events, timers, promises, callbacks.

* [ajax](https://rxjs.dev/api/ajax/ajax) - const
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#how-to-talk-to-the-internet)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-processes)

* [animationFrames](https://rxjs.dev/api/index/function/animationFrames) - pipeable
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#timing-creators)

* [bindCallback](https://rxjs.dev/api/index/function/bindCallback) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#callback-heaven-(or-at-least-callback-purgatory))

* [bindNodeCallback](https://rxjs.dev/api/index/function/bindNodeCallback) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#callback-heaven-(or-at-least-callback-purgatory))

* [defer](https://rxjs.dev/api/index/function/defer) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#turn-a-_-into-an-observable)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#let's-make-our-own:-`deferwithabort`)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#smooth-operator)

* [EMPTY](https://rxjs.dev/api/index/const/EMPTY) - const
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#empty-and-never)

* [from](https://rxjs.dev/api/index/function/from) - creation
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#chapter-4:-array-like-operators)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#adorable-iterables)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#start-at-the-top)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#and-now-for-the-etcetera)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#one-goes-in,-one-comes-out)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#one-goes-in,-maybe-one-comes-out.)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#skip-to-the-good-parts)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#at-the-end-of-the-day)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#the-observable-constructor)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#turn-a-_-into-an-observable)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#callback-heaven-(or-at-least-callback-purgatory))
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#how-to-talk-to-the-internet)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#let's-make-our-own:-`deferwithabort`)
  * [A Tour Of The Library - Section 1: A Tour of the Library](/guide/#how-to-keep-your-brains-from-exploding)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#smooth-operator)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#multiple-identity)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#tap-dancing)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#`observable<t>`)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-functions)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-streams)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-processes)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#`subscription`)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#rxjs-in-a-nutshell)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#what-is-reactive-programming?)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#monads!)

* [fromEvent](https://rxjs.dev/api/index/function/fromEvent) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#callback-heaven-(or-at-least-callback-purgatory))
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#rxjs-in-a-nutshell)

* [fromEventPattern](https://rxjs.dev/api/index/function/fromEventPattern) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#callback-heaven-(or-at-least-callback-purgatory))

* [fromFetch](https://rxjs.dev/api/fetch/fromFetch) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#how-to-talk-to-the-internet)

* [generate](https://rxjs.dev/api/index/function/generate) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#lightning-round!!)

* [iif](https://rxjs.dev/api/index/function/iif) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#lightning-round!!)

* [interval](https://rxjs.dev/api/index/function/interval) - creation
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#skip-to-the-good-parts)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#subjects)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#timing-creators)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-processes)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#`subscription`)

* [NEVER](https://rxjs.dev/api/index/const/NEVER) - const
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#empty-and-never)

* [of](https://rxjs.dev/api/index/function/of) - creation
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#chapter-4:-array-like-operators)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#adorable-iterables)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#start-at-the-top)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#one-goes-in,-one-comes-out)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#material-girls)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#one-goes-in,-maybe-one-comes-out.)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#with-distinction)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#skip-to-the-good-parts)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#at-the-end-of-the-day)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#short-circuit)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#searching-for-the-one)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#that-empty-feeling)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#at-the-end-of-the-day)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#observables-of-observables,-observables-of-arrays,-and-arrays-of-observables-(aka-what-happened-to-flatmap?))
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#making-operators-for-fun-and-profit)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#chapter-2:-how-to-make-an-observable)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#the-observable-constructor)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#empty-and-never)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#turn-a-_-into-an-observable)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#callback-heaven-(or-at-least-callback-purgatory))
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#subjects)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#timing-creators)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#let's-make-our-own:-`deferwithabort`)
  * [A Tour Of The Library - Section 1: A Tour of the Library](/guide/#section-1:-a-tour-of-the-library)
  * [A Tour Of The Library - Section 1: A Tour of the Library](/guide/#how-to-keep-your-brains-from-exploding)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#chapter-3:-pipe-dreams)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#smooth-operator)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#multiple-identity)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#tap-dancing)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#here-we-go!)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#chapter-1:-the-observable-universe)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#`observer<t>`)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#`observable<t>`)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-functions)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-streams)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-processes)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#`subscription`)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#rxjs-in-a-nutshell)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#what-is-reactive-programming?)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#monads!)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#immutable-data-wrappers)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#transformable)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#combinable)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#abstract-away-general-purpose-programming-idea)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#but-why-the-monad?)
  * [RxJS Articles - RxJS Articles](/articles/#rxjs-articles)

* [range](https://rxjs.dev/api/index/function/range) - creation
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#skip-to-the-good-parts)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#callback-heaven-(or-at-least-callback-purgatory))
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#how-to-talk-to-the-internet)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#lightning-round!!)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#smooth-operator)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#immutable-data-wrappers)

* [scheduled](https://rxjs.dev/api/index/function/scheduled) - creation
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#timing-creators)
  * [A Tour Of The Library - Chapter 7: Timing](/guide/timing#on-a-schedule)

* [throwError](https://rxjs.dev/api/index/function/throwError) - creation
  * [A Tour Of The Library - Chapter 5: Orchestrating Processes with RxJS](/guide/rxjs-for-processes#robustness)

* [timer](https://rxjs.dev/api/index/function/timer) - creation
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#one-goes-in,-maybe-one-comes-out.)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#timing-creators)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#`observable<t>`)

* [using](https://rxjs.dev/api/index/function/using) - creation
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#adorable-iterables)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#start-at-the-top)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#skip-to-the-good-parts)
  * [A Tour Of The Library - Chapter 4: Array-Like Operators](/guide/array-like-operators#at-the-end-of-the-day)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#subjects)
  * [A Tour Of The Library - Chapter 2: How to Make an Observable](/guide/how-to-make-an-observable#lightning-round!!)
  * [A Tour Of The Library - Chapter 3: Pipe Dreams](/guide/pipe-dreams#here-we-go!)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-streams)
  * [A Tour Of The Library - Chapter 1: The Observable Universe](/guide/the-observable-universe#observables-as-processes)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#rxjs-in-a-nutshell)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#immutable-data-wrappers)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#combinable)
  * [A Tour Of The Library - What is RxJS?](/guide/what-is-rxjs#but-why-the-monad?)

* [webSocket](https://rxjs.dev/api/webSocket/webSocket) - function

