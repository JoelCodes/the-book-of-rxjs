# The Observable Universe

::: info Draft in progress
This chapter is being rewritten. The original draft is archived here: [The Observable Universe](/archived/guide/the-observable-universe).
:::

RxJS has a dizzying collection of mechanisms, and when you look at the sheer number of components in the library, it can be daunting.

But RxJS is just like LEGO, and no matter how crazy any LEGO build looks, you can still see the individual blocks and the connections between them.  Everything in RxJS is about the interplay of 3 pieces: the **Observable**, the **Observer**, and the **Subscription**.

And honestly, this is all there is to it.  All the constructions we're going to make can be broken down to this pattern connected in new, exciting ways, and we'll keep coming back to the same question: "Where's the Observer, Observable, and Subscription?"

So, before we start, we're going to talk about what they represent as abstractions, and then how they work mechanically.

## In the Abstract

I find that, when I think about RxJS builds, I'm often switching between the abstract and the mechanical, and as long as I know how one connects to the other, it's easier to bridge that gap. So let's start with this:

> An `Observable<T>` represents a stream of signals of type `T`.  The stream remains open until it completes or ends with an error, though there is no guarantee that the stream will end on its own.

<Marble label="Emits 1 2 3 and Completes" diagram="1-2-3-|" />
<Marble label="Emits 1 2 3 and Errors" diagram="1-2-3-#" />

But what do we do with the signals?  Or handle the ending of the stream, with or without an error?  That brings us to the next piece:

> An `Observer<T>` listens to an `Observable<T>` and does *something* in response to the incoming signals.

I mean, what's the point of a stream of signals if we're not going to do something about it?  The Observer represents that work.

We have the Observable, and we have the Observer; the source and the consumer.  But these pieces are inert until they connect, which brings us to:

> A `Subscription` represents the live connection between an `Observable` and an `Observer`.

Until an Observer subscribes to the Observable, it won't receive any signals.  When it does subscribe, that returns a Subscription object.

The Subscription can end in one of 3 ways:

1. The Observable completes
2. The Observable errors
3. Some code calls the `.unsubscribe()` method of the Subscription object.

## But Let's Get Real

### Observer

Okay, that's all well and good.  But how do we make that work mechanically?  I'm going to start with the `Observer<T>`, the simplest part.  It represents the work to be done.  Let's start with the official type:

```ts
interface Observer<T> {
  next(val: T): void;
  complete(): void;
  error(err: any): void;
}
```

That said, RxJS is pretty good at coercing a few different types into proper Observers.  For instance, the `subscribe` method of Observable can accept a `PartialObserver<T>` (an `Observer<T>` with at least one method defined), or a function of type `(val:T) => void` that acts as the "next".

For the rest of this page, let's make a little `Observer<string>` that we can reuse.

```ts
const stringObserver:Observer<string> = {
  next(val:string):void {
    console.log('Next', val);
  },
  complete():void {
    console.log('Complete');
  },
  error(err:any):void {
    console.log('Error', err);
  },
};
```

### Observable

When you're thinking about the Observable, there are two important mechanics:

1. An Observable is (like) a function that accepts an Observer and calls its methods.
2. An Observable may have some setup logic when a subscription starts and some teardown logic when the subscription ends.

Honestly, that's it.  That's really the only two things we'll think about while creating Observables.  Let's take a look at the Observable constructor.  It accepts a function that accepts an Observer and can call its methods.

> Also, from here on in, whenever I have a variable or parameter for an Observable, I'm going to end its name with a `$`.  Helps me keep track.

```ts
const hello$ = new Observable<string>((subscriber:Subscriber<string>) => {
  subscriber.next("Hello");
  subscriber.complete();
});

hello$.subscribe(stringObserver);

// CONSOLE:
// Next Hello
// Complete
```

It's worth noting that if your internal callback calls `.complete()` or `.error()` on the subscriber, you're done.  You can call any of the other methods, and nothing will happen.

So, that's the first half.  The second half is the setup and teardown.

### Setup and Teardown

Generally, you want to think of Observables as **lazy**. That means that they don't start processes *until* their subscription starts.  Think of everything in that Observable callback as happening only when the subscription starts. But some things that start may need to be cleaned up, or even cancelled altogether.  The Observable constructor allows us to define that setup and teardown.

A good example is `setInterval` and `clearInterval`.  Anytime you have a `setInterval`, there probably should be a `clearInterval`.

```ts
const intervalId = setInterval(() => { console.log('Interval'); }, 1000);

// Later...
clearInterval(intervalId);
```

Well, we can bundle that together by returning a `TeardownLogic`.  Easiest way to define that is with a simple function.

```ts
const _interval = (delayInMs: number) => new Observable<undefined>((subscriber) => {
  // SETUP
  const intervalId = setInterval(() => { subscriber.next(undefined); }, delayInMs);
  
  // TEARDOWN  
  return () => { clearInterval(intervalId); };
});
```

The teardown logic will be called on any of those 3 events that end a subscription.  There are other forms of `TeardownLogic` we'll get to in a second, but this pattern is amazing.  Honestly, one of my biggest critiques of Promises is that they're not cancellable, so this speaks to my soul.

And with that, we finally get to the last mechanism.

### Subscription

A Subscription object is created when you call the `.subscribe()` method of an Observable.

```ts
const subscription = hello$.subscribe(stringObserver);
```

As I've said a bunch of times now, when you call `unsubscribe()`, it ends that Subscription, which is one way to fire the teardown logic of an Observable.

```ts
const doNothing$ = new Observable<string>((subscriber) => {
  console.log('Setup');
  return () => { console.log('Teardown'); };
});

console.log('Subscribing...');
const sub = doNothing$.subscribe(stringObserver);

console.log('Unsubscribing...');
sub.unsubscribe();

// CONSOLE:
// Subscribing...
// Setup
// Unsubscribing...
// Teardown
```

You'll notice, by the way, that none of the methods of `stringObserver` were called.  The Observable didn't complete or error out, after all.  There are ways of capturing that, but this is important to know.

The other cool thing about Subscriptions is that we can add additional `TeardownLogic` to it with `.add`.

```ts
const doNothing$ = new Observable<string>((subscriber) => {
  console.log('Setup');
  return () => { console.log('Teardown'); };
});

console.log('Subscribing...');
const sub = doNothing$.subscribe(stringObserver);
sub.add(() => { console.log('Extra Teardown Logic'); });

console.log('Unsubscribing...');
sub.unsubscribe();

// CONSOLE:
// Subscribing...
// Setup
// Unsubscribing...
// Teardown
// Extra Teardown Logic
```

A Subscription is also a `TeardownLogic` all its own, so if we return it in that Observable constructor, or use the `.add` method of another Subscription, it'll work.  We'll be seeing that a lot as we get into operators.

## In this section

- [The Observable Constructor](/guide/observable-universe/observable-constructor) — building one by hand.
- [Creating Observables from Other Values](/guide/observable-universe/creating-observables) — `of`, `from`, and `defer`.
- [Subjects](/guide/observable-universe/subjects) — Observables that are also Observers.
- [Wrapping Web APIs](/guide/observable-universe/web-api-wrappers) — `interval`, `timer`, `animationFrames`, `ajax`, `fromFetch`, `WebSocketSubject`.
- [Bonus Build-it: `deferAbort`](/guide/observable-universe/defer-abort) — a small custom creator, start to finish.
