# Chapter 1: A Basic Vocabulary

[<<Prev](/section-1/00-home.md) | [Home](/README.md) | [Next >>](/section-1/02-how-to-make-an-observables.md)

So far, we've been speaking in very broad, abstract terms.  It's been all "Reactive Programming" and "Subjects" and "Signals" and the like.  How does any of that apply to this library?

Well we're going to get to that immediately.  There are 6 types of components in this library, and we're going to give a brief explanation of each one.  Well, some will have briefer explanation than others.  And like all brief explanations, they will fail miserably at giving you the big picture of what these terms mean, what the components can do, and how we build systems.  But don't worry: we'll be getting into all of the nuances and variations in time, and when you see these pieces assembled, you'll see better what's possible.

So let's start with the simplest building block:

## `Observer<T>`

An `Observer<T>` is a bit of code that does some work based on some signal.  This is where a lot of the "doing" in our app takes place.  In our Reactive Programming paradigm, this is the consumer.  It might need to be told when to do something, and it might need to be told what to do something with, but its job is to do it.

The basic `Observer<T>` signature looks like this:

```typescript
type Observer<T> = {
    next(item:T):void;
    complete():void;
    error(err:any):void;
}
```

Now, you might not need to have all three callbacks.  You may only need a single callback with the signature `(item:T) => void`.  In pretty much every case that requires an Observer, that'll be fine.  There are even a few types in the library to cover this: `NextObserver<T>`, `CompleteObserver`, `ErrorObserver`, and `PartialObserver<T>`, which is the union of all those types.

Throughout the examples in this entire section, we'll mostly use this very simple observer:

```typescript
const simpleObserver:Observer<unknow> = {
    next(item:unknown){ console.log('Next', item); },
    complete(){ console.log('Complete!'); },
    error(err:any){ console.log('Error', err); }
}
```

Okay, simple enough.  But what makes the Observer do anything?  Well, that brings us to...

## Observable<T>

Observables are the biggest deal in RxJS.  They're what the whole thing's about.  If you take an `Observer<T>` and give it to a properly constructed `Observable<T>`, the Observable will make sure that the Observer will do all the work it was intended to do.  Not only that, but it will do it at the right time, and with the right data.

Observables are like the unholy love child of arrays and promises.  They can represent a sequence of data like arrays, a changing state, or control some asynchronous operation.  They can be transformed, combined, chained, cancelled, and more.  They're also a great "universal adapter", since it's trivial to coerce many types of data into an Observable, including arrays, iterables, promises, async iterables, callbacks, timers, event listeners, and more!  If you find yourself dealing with data from many sources, all with different APIs, there's some way to turn that into an Observable.

In order to understand Observables, there are three different ways to understand them, and you often need to switch quickly between these understandings:

* Observables are like functions that take an Observer and call its callbacks.
* Observables are streams of data
* Observables have a start and stop

### Observables act on Observers

Lets start out by using the `Observable<T>` constructor.  The constructor takes a callback, and that callback's argument is an `Observer<T>`.  In other words, this `Observable<T>` can be given any `Observer<T>`, and as far as that Observer (which we'll call the "subscriber") is aware, it's gonna get its methods called.  In the language of push & pull, the Observable pushes to the Observer.

```typescript
const countToThreeObservable = new Observable<number>((subscriber:Observer<number>) => {
    console.log('Starting To Count');
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
});
```

Now, Observables are **lazy** by nature.  That means they won't do any work until called upon.  In order to get this to do anything, we'll need to *subscribe* to it with some Observer, like so:

```typescript
countToThreeObservable.subscribe(simpleObserver);

// CONSOLE:
// Starting To Count
// Next 1
// Next 2
// Next 3
// Complete!
```

Simple as that!  It's even worth noting that this meets our criteria from the Reactive Programming section:

* The consumer is oblivious to the producer
* The producer is oblivious to the consumer

This observable will work the same regardless of the observer, and vice versa.

> Now, Observables are so important, that when I'm writing my code, I tend to add a `$` sign to the end of any variable name for an Observable or even functions that return Observables, so my `countToThreeObservable` will become `countToThree$`.  I'll use this notation throughout my examples.

### Observables have a start and stop

Like I said, Observables are **lazy**.  That means that they don't start that internal process of manipulating an Observer until the point of subscription.  (There are exceptions, but let's ignore those for now).  So let's compare using a promise for an AJAX request to using an Observable.

The two signatures are fairly similar:

```typescript
import axios from 'axios';
import {ajax} from 'rxjs';

function handleResponse(res:any){ /* */ }
function handleError(err:any){ /* */ }

const ajaxCallPromise = axios.get('/some/api/endpoint');
const ajaxCall$ = ajax.get('/some/api/endpoint');
```

But at this point one of those has started the network call, and one of those have not.  Promises are "lagging" indicators that will let you get the result of an operation, and they'll let you know when it finishes; but by the time you get it, the operation has already started.  The Observable, however represents the entire operation from start to finish.  The network call won't start until a subscription starts.

Lets use the Observable constructor to do `setInterval` to see this in action.  I'll make the Observable like this:

```typescript
const TIMEOUT_DURATION = 1000;

const onceASecond$ = new Observable<number>(subscriber => {
    console.log('Setting up the interval...')
    let index = 0;
    setInterval(() => {
        subscriber.next(index++);
    }, TIMEOUT_DURATION);
});

onceASecond$.subscribe(simpleObserver);

// CONSOLE: 
// Setting up the interval
// Next 0
// Next 1
// Next 2
// ...
```

As you can see, this creates an observable that counts up from 0 once a second, and it was able to do this setup logic at the beginning of the call.  And notable, it also goes forever.  There is a function called `interval` in the library that does just this exact thing.

So it's worth noting: ***Observables are not guaranteed to end on their own***.  Arrays may have that guarantee, but observables don't.  That's a trait they share with iterables, async iterables and promises, so they're in good company.

For the sake of argument, let's make this one call `subscriber.complete()` after it reaches 5.

```typescript
const TIMEOUT_DURATION = 1000;

const onceASecond$ = new Observable<number>(subscriber => {
    console.log('Setting up the interval...')
    let index = 0;
    setInterval(() => {
        subscriber.next(index);
        if(index === 5){
            subscriber.complete();
        }
        index++;
    }, TIMEOUT_DURATION);
});

onceASecond$.subscribe(simpleObserver);

// CONSOLE: 
// Setting up the interval...
// Next 0
// Next 1
// Next 2
// Next 3
// Next 4
// Next 5
// Complete!
```

But if we run this, we find there's an insidious thing that's happened: the interval is still ticking.  We're not getting any more new values, but it's still in there... ticking...  Let's add a log to see...

```typescript
const TIMEOUT_DURATION = 1000;

const onceASecond$ = new Observable<number>(subscriber => {
    console.log('Setting up the interval...')
    let index = 0;
    setInterval(() => {
        subscriber.next(index);
        console.log('Tick', index)
        if(index === 5){
            subscriber.complete();
        }
        index++;
    }, TIMEOUT_DURATION);
});

onceASecond$.subscribe(simpleObserver);

// CONSOLE: 
// Setting up the interval...
// Tick 0
// Next 0
// Tick 1
// Next 1
// Tick 2
// Next 2
// Tick 3
// Next 3
// Tick 4
// Next 4
// Tick 5
// Next 5
// Complete!
// Tick 6
// Tick 7
// Tick 8
// Tick 9
// ...
```

Forgetting to clear an interval or timeout or event listener or even an animation frame is a really easy way to get memory leaks in JavaScript, or at the very least, to ensure that your app is doing a lot of unnecessary work.  We need a way to know when the work is done so we can clear up that interval.  Thank goodness that RxJS knows exactly how to do this!  If we return a function in the callback to the constructor, it'll do all our cleanup!

```typescript
const TIMEOUT_DURATION = 1000;

const onceASecond$ = new Observable<number>(subscriber => {
    console.log('Setting up the interval...')
    let index = 0;
    setInterval(() => {
        subscriber.next(index);
        console.log('Tick', index)
        if(index === 5){
            subscriber.complete();
        }
        index++;
    }, TIMEOUT_DURATION);

    return () => {
        console.log('Cleaning up the interval...);
    };
});

onceASecond$.subscribe(simpleObserver);

// CONSOLE: 
// Setting up the interval...
// Tick 0
// Next 0
// Tick 1
// Next 1
// Tick 2
// Next 2
// Tick 3
// Next 3
// Tick 4
// Next 4
// Tick 5
// Next 5
// Complete!
// Cleaning up the interval...
```

That cleanup logic will be called when the subscription ends, which will be the result of one of 3 things:

* The observable calls `complete()`
* The observable calls `error(err)`
* Whatever subscribed to the observable unsubscribes.

Now, we'll get to how you unsubscribe in a bit, but here's the TL;DR version of all of this for now.

* An observable is lazy, and won't do anything until subscribed to.
* When the subscription starts, the observable may do some setup logic.
* A subscription can be ended by the observable, or by the code that subscribed.
* When the subscription ends, the observable may do some teardown logic.

This means that it's easy to take an operation that is async, requires some setup and teardown, and/or produces many values, and easily express it as an Observable.

