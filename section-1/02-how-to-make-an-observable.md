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

<iframe src="https://replit.com/@JoelShinness1/book-of-rxjs-from" width="600" height="400"></iframe>

The next one is `from`.  You can think of `from` as being able to "coerce" things into Observables.  What kind of things can you coerce into an `Observable`?  Well there's a type just for that: `ObservableInput`.  an `ObservableInput<T>` includes arrays, promises, iterables, async iterables, Observables, and a few more that you probably won't run into.

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

It's important to not that `fromEvent` is lazy.  It's so lazy in fact, that **it will not add the event listener *until* it's subscribed to**.  In other words, it doesn't just emit events; it also handles the setup and teardown of the event listener.  Not removing an event listener is a great way to introduce memory leaks into your app, but with this teardown and cleanup, we can be assured that we're only attaching listeners for as long as they're needed and no longer.

* fromEvent
* fromEventPattern
* bindCallback
* bindNodeCallback

## Subjects

* Subject
* BehaviorSubject
* ReplaySubject
* AsyncSubject

## Timing Creators

* interval
* timer
* animationFrames
* scheduled

## How To Talk To The Internet

* ajax
* fetch
* WebSocketSubject

## Lightning Round!!

* using
* range
* generate
* iif

[<<Prev](./01-the-observable-universe.md) | [Home](../README.md) | [Next >>](./03-array-like-operators.md)
