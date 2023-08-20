# Chapter 2: How to Make an Observable

[<<Prev](./01-the-observable-universe.md) | [Home](../README.md) | [Next >>](./03-array-like-operators.md)

So, you're up to speed on what an Observable is.  It's a thing that manipulates an Observer (or emits signals to an Observer), it represents a stream of data that may complete or throw an error, and it can represent some arbitrary async operation.

But how can we make one?

Well, there are plenty of utilities for just that purpose, and we're going to go through each and every one of them.  I've done my best to fit each of them into a convenient category, with a lightning round at the end for the oddballs.

## The Observable Constructor

First and foremost, there's the `Observable` constructor.  You've seen it in the last chapter, but I'll go over it again for good measure.  For those of you who've never heard the word "constructor" before, this is a term from Object-Oriented Programming (OOP).  Well, at least class-based OOP.  You see, in many class-based OOP languages, (like C++, Java, C#, &c.), they'd have "classes", which were like blueprints for making an object and how that object would behave.  How would you make an object from that blueprint?  You would use a special "method" on the class called a **constructor**, and in Java, C#, and JavaScript, you would use the keyword `new` to signify that that's what you were doing.  For instance, If you had a class called `Student`, and each student had an id, name, and email, you might make one by calling `const steve = new Student(1, 'Steve', 'steve@steve.steve');`

`Observable` is a type, but it's also a class, so we can call its constructor. All we have to pass is a specific callback function. This function takes a `Subscriber` object that represents any observer that this observable might be passed. Mind you, it's not the exact same observer: it's been wrapped up in such a way that if complete or error have been called, or the subscription has ended, it won't take any more signals. Let's take a look.

```ts
const countTo3 = new Observable(observer => {
  observer.next(1);
  observer.next(2);
  observer.next(3);
  observer.complete();
});
```

We can also return a `TeardownLogic` from that callback, which gets called when the subscription ends, either when the observable completes or errors, or when the subscription is unsubscribed to.  This allows us to do setup and teardown.  

```ts
const setupAndCleanup = new Observable(() => {
  console.log('Setup Happens');
  return () => { console.log('Teardown Happens'); };
});
```

There are two good rules of thumb when it comes to the Observable constructor:

1. If you use the `Observable` constructor, and you haven't returned a teardown logic, double-check to make sure that there's nothing you've created that didn't need to be cleaned up.
1. Every `subscribe()` needs an `unsubscribe()`.  I mean, not every time, but almost.

## EMPTY and NEVER

There are two constant observables in the library: `EMPTY` and `NEVER`.  They're mostly used for composition, but they're very simple in and of themselves.  `EMPTY` completes immediately on subscription without ever emitting a value.  `NEVER` doesn't emit or error out either, but it also doesn't complete.  If you subscribe to it, well, in the words of Malcolm Reynolds, "That's a long wait for a train don't come."

```ts
EMPTY.subscribe({
  next(val){ console.log('Next From EMPTY', val); },
  complete(){ console.log('Complete From EMPTY'); },
  error(err){ console.log('Error From EMPTY', err); }
});

// CONSOLE:
// Complete From EMPTY

NEVER.subscribe({
  next(val){ console.log('Next From NEVER', val); },
  complete(){ console.log('Complete From NEVER'); },
  error(err){ console.log('Error From NEVER', err); }
});

// CONSOLE:
```

## Turn a _ into an Observable

One of the great things about RxJS is that it can provide a common interface for data in many of its forms.  So, let's see all the ways we can turn things into Observables!

First is `of`.  It doesn't do any crazy magic, it just takes a value and turns it into an Observable.

```ts
of(3).subscribe({
  next(val){ console.log('Next From of(3)', val); },
  complete(){ console.log('Complete From of(3)'); },
  error(err){ console.log('Error From of(3)', err); }
});

// CONSOLE:
// Next From of(3) 3
// Complete From of(3)
```

The next one is `from`.  You can think of `from` as being able to "coerce" things into Observables.  What kind of things can you coerce into an `Observable`?  Well there's a type just for that: `ObservableInput`.  an `ObservableInput<T>` includes arrays, promises, iterables, async iterables, Observables, and a few more that you probably won't run into.

<iframe src="https://stackblitz.com/edit/stackblitz-starters-xahqqw?embed=1&file=index.ts&view=editor&terminalHeight=100" width='100%' height='400'></iframe>
<!-- <iframe src="https://replit.com/@JoelShinness1/book-of-rxjs-from?embed=true" width="800" height="400"></iframe> -->

```ts
from([1,2,3]).subscribe({
  next(val){ console.log('Next From from([1,2,3])', val); },
  complete(){ console.log('Complete From from([1,2,3])'); },
  error(err){ console.log('Error From from([1,2,3])', err); }
});

// CONSOLE:
// Next From from([1,2,3]) 1
// Next From from([1,2,3]) 2
// Next From from([1,2,3]) 3
// Complete From from([1,2,3])

function *iterate():Iterable<number>{
  yield 4;
  yield 5;
  yield 6;
}

from(iterate()).subscribe({
  next(val){ console.log('Next From from(iterate())', val); },
  complete(){ console.log('Complete From from(iterate())'); },
  error(err){ console.log('Error From from(iterate())', err); }
});

// CONSOLE:
// Next From from(iterate()) 4
// Next From from(iterate()) 5
// Next From from(iterate()) 6
// Complete From from(iterate())

from(Promise.resolve(7)).subscribe({
  next(val){ console.log('Next From from(Promise.resolve(7))', val); },
  complete(){ console.log('Complete From from(Promise.resolve(7))'); },
  error(err){ console.log('Error From from(Promise.resolve(7))', err); }
});

// CONSOLE:
// Next From from(Promise.resolve(7)) 7
// Complete From from(Promise.resolve(7))

from(Promise.reject("Boo!")).subscribe({
  next(val){ console.log('Next From from(Promise.reject("Boo!"))', val); },
  complete(){ console.log('Complete From from(Promise.reject("Boo!"))'); },
  error(err){ console.log('Error From from(Promise.reject("Boo!"))', err); }
});

// CONSOLE:
// Error From from(Promise.reject("Boo!")) Boo!

async function *asyncIterate():AsyncIterable<>{
  for(let i = 8; i <= 10; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    yield i;
  }
}

from(asyncIterate()).subscribe({
  next(val){ console.log('Next From from(asyncIterate())', val); },
  complete(){ console.log('Complete From from(asyncIterate())'); },
  error(err){ console.log('Error From from(asyncIterate())', err); }
});

// CONSOLE:
// Next From from(asyncIterate()) 8
// Next From from(asyncIterate()) 9
// Next From from(asyncIterate()) 10
// Complete From from(asyncIterate())
```

This is great for an `ObservableInput` that we already have.  But what if we don't want to get the value right now?  What if we want to create or fetch the data *on subscription*?  Well, that's where `defer` comes in.  It works exactly like `from`, but instead of taking an `ObservableInput`, it takes a function that *returns* an `ObservableInput`.  That's where it gets its name: it lets us `defer` the creation of our `ObservableInput`.

```ts
const obs = defer(() => {
  console.log('Creating my array now');
  return [11, 12, 13];
})

console.log('Subscribing now');

obs.subscribe({
  next(val){ console.log('Next From defer(() => [11, 12, 13])', val); },
  complete(){ console.log('Complete From defer(() => [11, 12, 13])'); },
  error(err){ console.log('Error From defer(() => [11, 12, 13])', err); }
});

// CONSOLE:
// Subscribing now
// Creating my array now
// Next From defer(() => [11, 12, 13]) 11
// Next From defer(() => [11, 12, 13]) 12
// Next From defer(() => [11, 12, 13]) 13
// Complete From defer(() => [11, 12, 13])
```

Ever since I really started playing with `defer`, it's shown itself to be a real powertool.  I can use it to delay the creation of Observables, I can use it to query some state when it's run and not a moment before, I can use it to manage some piece of state locally, and there's a lot more. You can read more about that in the article [Rx Utils I Keep Making](../section-2/03-rx-utils-i-keep-making.md).

Also, this idea of coercing an `ObservableInput<T>` into a proper `Observable<T>` is something you'll see more of further down the road, especially when we get into some of the upcoming operators.  Check the index of this book, and you'll see how often it's used.

## Callback Heaven (Or at least Callback Purgatory)

Well, we've turned all sorts of *values* and *data structures* into Observables.  What about all those libraries that use callbacks?  Can't we do anything about them?  Do we need to wait until they've been turned into promises or arrays first, or do we just need to use the Observable constructor?

Well, there's a few conversions for callback-based API's.  First off is `fromEvent`.  This can wrap around an object that, according to the documentation is "The DOM EventTarget, Node.js EventEmitter, JQuery-like event target, NodeList or HTMLCollection to attach the event handler to."  Sooo, this can work well front-end or back-end.

It's important to not that `fromEvent` is lazy.  It's so lazy in fact, that **it will not add the event listener *until* it's subscribed to**.  In other words, it doesn't just emit events; it also handles the setup and teardown of the event listener.  Failing to removing event listeners is a great way to introduce memory leaks into your app, but with this teardown and cleanup, we can compose them together without fear.

```ts
const alertButton = document.querySelector('button#alert');

const subscription = fromEvent(alertButton, 'click').subscribe(() => {
  alert('Hi!');
});
```

`fromEvent` gets a lot of work done, and it's compatible with the most common interfaces for event handlers.  But what if you're working with something that doesn't quite fit that mold? Well, `fromEventPattern` is perfect for that.  It takes two callbacks, one for adding an event listener and one for removing an event listener.  So if you are wrapping a library with a strange interface, this is the one for you.

```ts
// Let's say we have some library called weird-event
type Listener<T> = (event:T) => void

function makeWeirdEvent<T>(){
  const listeners = new Set<Listener<T>>();
  function listen(listener:Listener<T>){
    console.log('WE: Adding Listener');
    listeners.add(listener);
  }
  function unlisten(listener:Listener<T>){
    console.log('WE: Removing Listener');
    listeners.remove(listener);
  }
  function fire(event:T){
    console.log('WE: Firing', event)
    listeners.forEach(listener => listener(event))
  }
  return {
    listen,
    unlisten,
    fire
  }
}

// And we want to use it in our app code:
const helloer = makeWeirdEvent<"Hello">();
const hello$ = fromEventPattern<"Hello">(
  (listener) => { helloer.listen(listener); },
  (listener) => { helloer.unlisten(listener); }
);
console.log('Subscribing...');
const subscription = hello$.subscribe(val => { console.log('Next', val); });
helloer.fire('Hello');

console.log('Unsubscribing...');
subscription.unsubscribe();
// CONSOLE:
// Subscribing...
// WE: Adding Listener
// WE: Firing Hello
// Next Hello
// Unsubscribing...
// WE: Removing Listener
```

* fromEvent
* fromEventPattern
* bindCallback
* bindNodeCallback

## Subjects

In the language of Reactive Programming, a `Subject` is a component that some components can subscribe to for signals, and other components can send signals to.  Sometimes, the pattern has the name "Pub/Sub" which is short for "Publish / Subscribe".

```ts
const subject = new Subject<number>();

subject.subscribe({
  next(val){ console.log('Next', val); },
  complete(){ console.log('Complete'); },
  error(err){ console.log('Error', err); }
});

subject.next(3);
// CONSOLE:
// Next 3

```

In RxJS, a `Subject<T>` is both an `Observer<T>` *and* an `Observable<T>`.  Another way of saying that is that it has an Observer end and an Observable end, the same way that an extension cord has one end that plugs into the wall and one end that a device plugs into.  So, a `Subject<T>` can subscribe an `Observer<T>`, and an `Observable<T>` can subscribe a `Subject<T>`.

```ts
const someObservable = interval(1000);
const someObserver = {
  next(val){ console.log('Next', val); },
  complete(){ console.log('Complete'); },
  error(err){ console.log('Error', err); }
}

const subject = new Subject<number>();
subject.subscribe(someObserver);
someObservable.subscribe(subject);
setTimeout(() => {
  subject.complete();
}, 3500);
```

A Subject is one of the few examples of a naturally "hot" Observable, as opposed to other "cold" observables.  This is a famously confusing topic in the world of RxJS, so I'm going to do my best to clear it up succinctly.

When you hear "cold", think "like a diesel engine on a cold morning".  It takes some setup, and some cooldown. The `interval(1000)` is a great example: every time you subscribe to it, it calls `setInterval`.  Every time one of those subscriptions end, it calls `clearInterval`.  Setup, teardown. In other words:

* Every subscription triggers some setup when it starts and some teardown when it ends
* Every subscription is getting different information.

With a "hot" observable, it's like turning on the news.  Everyone who turned on the news is getting the exact same news at the exact same time, and if you took 5 minutes to turn on the news, you just missed 5 minutes of news.

* A subscription doesn't necessarily trigger any extra setup or teardown
* Each subscription is getting the same information as all the other subscriptions at exactly the same time.

Wait, what if we want old information?  Well, RxJS has you there.  You see, it also has a couple of variations on `Subject` that are all about catching you up on what's happened.

The first is `BehaviorSubject`  The word "Behavior" here is a classic Reactive Programming term: it refers to an observable that has a state.  You see some observables are like drums: they are sharp and quick.  If you missed one signal, you have to wait around for the next one.  Some are more like violins.  They can hold onto a note for a long time, and whenever you start listening, you can hear what the last note played was.  `BehaviorSubject` is like that.  The `BehaviorSubject` will:

* Start with an initial value.
* When its `next` is triggered, it will let go of its last value (or initial value) and hold on to the new value.
* On a new subscription, the `BehaviorSubject` immediately emits the current value to the subscriber.
* At any point, we can call `.value` to get the current value.

```ts
const behaviorSubject = new BehaviorSubject<number>(3);
console.log('Subscribing...');

behaviorSubject.subscribe(val => { 
  console.log('BSubj Next', val); 
});

console.log('Current Value: ', behaviorSubject.value);

console.log('Emitting New Value...');
behaviorSubject.next(4);
console.log('Current Value: ', behaviorSubject.value);

// CONSOLE:
// Subscribing...
// BSubj Next 3
// Current Value: 3
// Emitting New Value...
// BSubj Next 4
// Current Value: 4
```

This "Behavior" behaviour makes this a great strategy for holding onto the "state" of an application.  If you've spent enough time in the world of JavaScript, especially front end, you've seen a lot of state management libraries, like Redux or MobX.  RxJS cooperates great with those kinds of libraries, but you can also use this to make a little state management mechanism of your own, as we'll discuss further in [Reducers for Fun and Profit](../section-2/01-reducers-for-fun-and-profit.md).

`BehaviorSubject` is great, but what if you need to play back more signals?  Like what if you need the last 10 signals when you subscribe?  Or the last 10 seconds worth of signals?  This is where `ReplaySubject` comes in.  You can define a limit of how many signals, a limit of time window, or both.

```ts
const replayLast3Subject = new ReplaySubject<number>(3);

console.log('Subscribing live...')
replayLast3Subject.subscribe(val => { console.log('A', val); });
replayLast3Subject.next(1);
replayLast3Subject.next(2);
replayLast3Subject.next(3);
replayLast3Subject.next(4);

console.log('Subscribing for the replay...');
replayLast3Subject.subscribe(val => { console.log('B', val); })

// CONSOLE:
// Subscribing live...
// A 1
// A 2
// A 3
// A 4
// Subscribing for the replay...
// B 2
// B 3
// B 4
```

There is also the `AsyncSubject`, which waits until it completes to send the last signal to anyone.  I haven't found a use case for this one yet, but here it is.

## Timing Creators

If there's one area that RxJS shines with, it's timing.  If I have an issue with starting, stopping, grouping, or otherwise managing timing, I'll often write my code with RxJS as a first draft.  There's a whole chapter on this subject coming up, but here are the creation operators that are connected to creating Observables that emit signals on a schedule.

The two most common timing utilities in JavaScript are `setInterval`, and `setTimeout`.  There's a lot more to be said about these utilities, how they work in regular JavaScript, and how RxJS wraps them, and we'll discuss that in our [chapter on timing](./07-timing.md).For now, we have three functions to create Observables with these:

* `interval(period:number):Observable<number>`
* `timer(dueTime:number|Date = 0):Observable<0>`

```ts
const start = Date.now();

const iSub = interval(1000).subscribe((val) => {
  console.log('Interval next', val, Date.now() - start);
  if(val >= 3) iSub.unsubscribe();
});

const tSub = timer(3500).subscribe({
  next(val) { console.log('Timer next', val, Date.now() - start); },
  complete() { console.log('Timer complete!', Date.now() - start); }
});

// CONSOLE:
// Interval next 0 1000
// Interval next 1 2000
// Interval next 2 3000
// Timer next 0 3500
// Timer complete 3500
// Interval next 3 4000
```

There's also a utility for `requestAnimationFrame`.  This one is browser specific, tied to the repaint cycle, though it can be approximated in Node or Node-like environments with `setImmediate`.  Either way, this is meant to be run ~60 times a second, so it's good for animations or visualizations or anything else that needs to be updated very frequently.

`animationFrames` returns an observable of objects with two data members: `timestamp` and `elapsed`.  Anyone who has used any game framework will recognize this pattern, which lets us see how much time has passed since beginning to see how much it should "advance" a system or an animation.  By default, this number is decided by the [`DOMHighResTimeStamp`](https://developer.mozilla.org/en-US/docs/Web/API/DOMHighResTimeStamp) native to `requestAnimationFrame`, but you can also provide your own if something else makes sense.

```ts
// TODO: animationFrames() demo
```

Now, you may be asking yourself, "What about `setImmediate`? What about `process.nextTick`?  What if I want logic that will use one timing mechanism in one environment and a different one in another?"  RxJS has a mechanism for this called `Scheduler`'s, and `Scheduler` implementations for animationFrames, `setImmediate`, and more.

If you have a scheduler you like, you can use `scheduled` to take an `ObservableInput` and emit its signals with whichever timing mechanism you like.  Again, a subject we'll discuss in length later.

## How To Talk To The Internet

RxJS is such a general-purpose library, that it seems 

* ajax
* fetch
* WebSocketSubject

## Lightning Round!!

* using
* range
* generate
* iif

[<<Prev](./01-the-observable-universe.md) | [Home](../README.md) | [Next >>](./03-array-like-operators.md)
