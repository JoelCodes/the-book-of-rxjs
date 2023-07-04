# Chapter 1: The Observable Universe

[<<Prev](./00-home.md) | [Home](../README.md) | [Next >>](./02-how-to-make-an-observable.md)

So far, we've been speaking in very broad, abstract terms.  It's been all "Reactive Programming" and "Subjects" and "Signals" and the like.  How does any of that apply to this library?

Well we're going to get to that immediately.  There are 3 major building blocks in this library, and we're going to go through them one by one, giving a brief explanation of each.  

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
    error(err:any){ console.log('Error!', err); }
}
```

And as you may already have noticed, in the "push/pull" we discuss earlier, the Observer does not pull.  It has information pushed to it.

Okay, simple enough.  But what makes the Observer do anything?  What pushes to it?  Well, that brings us to the...

## `Observable<T>`

Observables are the biggest deal in RxJS.  They're what the whole thing's about.  If you take an `Observer<T>` and give it to a properly constructed `Observable<T>`, the Observable will make sure that the Observer will do all the work it was intended to do.  Not only that, but it will do it at the right time, and with the right data.

Observables are like the unholy love child of arrays and promises.  They can represent a sequence of data like arrays, a changing state, or control some asynchronous operation.  They can be transformed, combined, chained, cancelled, and more.  They're also a great "universal adapter", since it's trivial to coerce many types of data into an Observable, including arrays, iterables, promises, async iterables, callbacks, timers, event listeners, and more!  If you find yourself dealing with data from many sources, all with different APIs, there's some way to turn that into an Observable.

In order to understand Observables, there are three different ways to view them, and you often need to switch quickly between these perspectives:

* Observables are like functions that take an Observer and call its callbacks.
* Observables are streams of data, emitting signals until they complete or error out.
* Observables can wrap async processes, setting up at the start, and cleaning up at the end.

### Observables as Functions

Imagine a function that accepts an Observer and calls its methods, like the following:

```typescript
const countToThreeThenQuit = (observer:Observer<number>) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
}
```

Well, that's basically what an Observable is!  In fact, we could take that function and pass it straight into the Observable constructor!

```typescript
const countToThree$ = new Observable((subscriber:Observer<number>) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
});
```

Now, this `Observable<number>` is ready to act on an `Observer<number>`, as soon as one's available.  In order to put these two together, we just need the Observable to subscribe to the Observer.

```typescript
countToThree$.subscribe(simpleObserver);

// CONSOLE:
// Next 1
// Next 2
// Next 3
```

Simple as that!  It's even worth noting that this meets our criteria from the Reactive Programming section:

* The consumer is oblivious to the producer
* The producer is oblivious to the consumer

This observable will work the same regardless of the observer, and vice versa.

> Now, Observables are so important, that when I'm writing my code, I tend to add a `$` sign to the end of any variable name for an Observable or even functions that return an Observable, hence `countToThree$`.  I'll use this notation throughout my examples.

### Observables as Streams

There are three types of signals the observer responds to: `next`, `complete`, and `error`.  These names aren't arbitrary: they represent stages in a stream of data.  The stream goes `next`, `next`, `next` over and over again, but it may also `complete` of its own accord.  It may also have an `error`.  My example of `countToThree$`?  Isn't that exactly like an array?  In fact we would get the same behaviour if we created the Observable using `from([1,2,3])`.

So when you're subscribed to an Observable, just know that it might send a `complete`, and it might send an `error`.  If it does, you'll get no more signals out of this subscription.  In fact, if we took our `countToThree$` and added some `next` calls after the `complete`, guess what happens?

```typescript
const countToThree$ = new Observable<number>((subscriber:Observer<number>) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
    observer.next(4);
    observer.next(5);
    observer.next(6);
});

countToThree$.subscribe(simpleObserver);

// CONSOLE:
// Next 1
// Next 2
// Next 3
// Complete!
```

Nothing.  The console output is exactly the same.  The same happens if an error was before the complete.

```typescript
const countToThree$ = new Observable<number>((subscriber:Observer<number>) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.error('Oh no!');
    observer.complete();
    observer.next(4);
    observer.next(5);
    observer.next(6);
});

countToThree$.subscribe(simpleObserver);

// CONSOLE:
// Next 1
// Next 2
// Next 3
// Error! Oh no!
```

And just for thoroughness' sake, here it is with the error and complete calls switched.

```typescript
const countToThree$ = new Observable<number>((subscriber:Observer<number>) => {
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.complete();
    observer.error('Oh no!');
    observer.next(4);
    observer.next(5);
    observer.next(6);
});

countToThree$.subscribe(simpleObserver);

// CONSOLE:
// Next 1
// Next 2
// Next 3
// Complete!
```

So you can think of the stream has having three states: open, completed, and error.  If it's open, it can emit any of the three messages.  Once it completes or errors, it's done.

### Observables as Processes

Like I said, Observables are **lazy**.  That means that they don't start that internal process of manipulating an Observer until the point of subscription.  (There are exceptions, but let's ignore those for now).  Let's compare using a promise for an AJAX request to using an Observable.

The two signatures are fairly similar:

```typescript
import axios from 'axios';
import {ajax} from 'rxjs';

function handleResponse(res:any){ /* */ }
function handleError(err:any){ /* */ }

const ajaxCallPromise = axios.get('/some/api/endpoint');
const ajaxCall$ = ajax.get('/some/api/endpoint');

/* Banana */

ajaxCallPromise.then(handleResponse, handleError);
ajaxCall$.subscribe({next:handleResponse, error:handleError});
```

These two piece of code look very, very similar, and they'll produce the same result eventually, but there's an interesting difference at the point of the `/* Banana */`.  One of those two calls has fired a network call, and one of them has not.  When I attach handlers to the `then` method of the Promise, I'm accessing (or waiting to access) the result of a process that has already started.  When I subscribe to the observable, I'm asking the process to start.

In other words, the promise represents the result of an operation.  The observable represents the whole operation.

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
    const intervalId = setInterval(() => {
        subscriber.next(index);
        console.log('Tick', index)
        if(index === 5){
            subscriber.complete();
        }
        index++;
    }, TIMEOUT_DURATION);

    return () => {
        console.log('Cleaning up the interval...');
        clearInterval(intervalId);
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

Now the observable captures the beginning, middle, and end of the whole process!  This is really similar to how `useEffect` works in React, by the way:

```tsx
useEffect(() => {
    console.log('Setting up interval...');

    let index = 0;
    const intervalId = setInterval(() => {
        console.log('Next', index++)
    }, TIMEOUT_DURATION);
    
    return () => {
        console.log('Cleaning up the interval...');
        clearInterval(intervalId);   
    };
}, []);
```

That teardown logic will be called when the subscription ends, which will be the result of one of 3 things:

* The observable calls `complete()`
* The observable calls `error(err)`
* Whatever subscribed to the observable unsubscribes.

So, here's the TL;DR version of all of this for now.

* An observable is lazy, and won't do anything until subscribed to.
* When the subscription starts, the observable may do some setup logic.
* A subscription can be ended by the observable, or by the code that subscribed to it.
* When the subscription ends, the observable may do some teardown logic.

This means that it's easy to take some operation that:

* is async
* requires some setup and/or teardown, 
* produces zero, one, or many values,
* or possibly could be cancelled

and easily express it as an Observable.

### `Subscription`

Wait, I mentioned unsubscribing.  How do we do that?

Well, we're back to the brief explanations, thank the gods.  When we subscribe, we actually create a `Subscription` object.

```typescript
const subscription = interval(1000).subscribe(simpleObserver);
```

And that `Subscription` object implements the `Unsubscribable` interface.  Okay, I'll be honest, the first twenty times I saw the name `Unsubscribable`, it made me think that "not subscribable", like how the word "unfathomable" works.  But no, it means that it has a method called `unsubscribe()`!  So if we're done listening to a subscription, but the observable hasn't ended the subscription for us, we can do that from the subscribing side!

```typescript
const subscription = interval(1000).subscribe(simpleObserver);
setTimeout(() => {
    subscription.unsubscribe();
}, 3500);

// CONSOLE:
// Next 0
// Next 1
// Next 2
```

It's as simple as that!  In fact, I have a pretty strict rule for myself that, if there's a `subscribe` somewhere, there better be a `subscription.unsubscribe()` that matches it, or a really good reason why not.

We can also create one `Subscription` object that groups many subscriptions together so they can be ended all at once!

```typescript
const allSubscriptions = new Subscription();

allSubscriptions.add(interval(1000).subscribe(val => { console.log('A', val); }));
allSubscriptions.add(interval(750).subscribe(val => { console.log('B', val); }));

setTimeout(() => {
    console.log('Unsubscribing');
    allSubscriptions.unsubscribe();
}, 3500);

// CONSOLE:
// B 0
// A 0
// B 1
// A 1
// B 2
// A 2
// B 3
// Unsubscribing
```

Honestly, at this point, we could call it quits, because we really have everything that we need!  With these three building blocks, we honestly can build anything, orchestrate any system, and more!

But as I said earlier, RxJS is also a repository of patterns.  Everything that follows is honestly just "utilities", but they're also what will make your code readable and keep you from falling into bad patterns (or having to find the errors yourself), so let's keep going.

[<<Prev](./00-home.md) | [Home](../README.md) | [Next >>](./02-how-to-make-an-observable.md)
