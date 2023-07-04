# Chapter 3: Pipe Dreams

[<<Prev](./02-how-to-make-an-observable.md) | [Home](../README.md) | [Next >>](./04-array-like-operators.md)

Before we get into any more of the library, it's time to talk about another important building block.  It's all well and good making an Observable and subscribing to it, but one of the promises of Observables was that they were transformable.  If we have an Observable, we should be able to mold it into any shape we want.

And that's where **operators** come in.

Operators allow us to do all sorts of transformations on Observables, and that includes things like:

* Transform each emitted item into something else.
* Decide which items should get emitted.
* Complete a subscription early
* Do some side effect when an observable closes
* Make sure that you're not getting too many signals too quickly

And so, so much more.  Operators are what I'm going to be talking for the next few chapters, so we need to get into it, and I think the easiest way to start, is by creating one.

## Smooth Operator

So, what is an operator?  Well, according to the official documentation, an operator is any function that returns an Observable.  And you've seen a few of those already, like `from` and `of` and `defer`.  It may seem strange, but we call those **creation operators** because they create an Observable where there was none before.

But when I say "operator" in the RxJS world, I'm usually talking about **pipeable operators**.  These are operators that take in an Observable and return an Observable.  

Let's take this trivial example: we have an array of numbers, and we want to get a new array of the odd ones squared.  What would that look like?

```typescript
const oddSquares = [1, 2, 3, 4, 5]
  .map(x => x * x)
  .filter(x => x % 2 !== 0);

console.log(oddSquares);
// [1, 9, 25]
```

Okay, that's arrays.  But what about Observables?

Well, at the start of RxJS, it worked much the same.  Observables would have methods like these, and just like the array methods, they would return a new Observable with those criteria applied.

But Observables are not arrays.  Observables have a LOT of potential operators, and the Observable prototype became pretty crowded pretty quickly.  So, the pipeable operator was born!

The Observable wouldn't have a bunch of operators in its class definition.  Instead, the operators were expressed as functions that took in an Observable and returned an Observable.  The following interface was born:

```typescript
type OperatorFunction<A, B> = (source:Observable<A>) => Observable<B>;
```

And its even less complicated sibling:

```ts
type MonoTypeOperatorFunction<A> = OperatorFunction<A, A>
```

Simple as that.

So if we want to do a map, we don't call `Observable.map`.  We grab `map` from the library and call it!  Now, technically speaking, in the most "um, actually..." way, `map` isn't an operator: it's an **operator factory**.  It's a function that *produces* an operator function, which we then feed the observable to.  Like this!

```ts
const squareNumber = map<number, number>(x => x * x);
const numbers$ = from([1,2,3,4]);
const squaredNumbers$ = squareNumber(numbers$);
```

Okay, and now we can add that filter, I guess...

```ts
const squareNumber = map<number, number>(x => x * x);
const filterOnlyOdds = filter<number>(x => x % 2 !== 0)
const numbers$ = from([1, 2, 3, 4]);
const squaredNumbers$ = squareNumber(numbers$);
const oddSquareNumbers$ = filterOnlyOdds(squaredNumber$);
```

Uuhhhh... so re-writing that without the variables would be...

```ts
filter(x => x % 2 !== 0)(
  map(x => x * x)(
    from([1, 2, 3, 4, 5])
  )
).subscribe(x => { console.log('Next', x); });
// CONSOLE:
// Next 1
// Next 9
// Next 25
```

Gross.  That's gross.  In the immortal words of every informercial, "There's got to be a better way!"

Well, yes, Observable did get rid of all those extra methods, but it kept a reeeeally important one: `pipe`.  What does `pipe` do?  Well it lets us take our list of operators and apply them one at a time in order, e.g.

```ts
from([1, 2, 3, 4, 5]).pipe(
  map(x => x * x),
  filter(x => x % 2 !== 0)
).subscribe({
  next(x){ console.log('Next', x); }
});
```

Now we're back in business!  It tells a story, doesn't it?  I've got an Observable of numbers, I square them, I filter out the odds, and then I subscribe.  Simple as that.  There's even a utility function called `pipe` you can use to string a bunch of operators in a row to create a brand new operator!

```ts
const getOddSquares = pipe(
  map(x => x * x),
  filter(x => x * 2 !== 0)
);

from([1, 2, 3, 4, 5]).pipe(
  getOddSquares
).subscribe({
  next(x){ console.log('Next', x); }
});
```

All right, that tells us how we can apply and combine operators.  But what do they do?

Well, everything!  Honestly, they're how we're going to transform data, manage and combine streams, handle timing, and more!  Knowing how to make an Observable and listen to it is great, but the real craft is in the operators.  For the next (mumble, mumble) chapters, we are going to go through every operator in the library.  Every single one.  But before we do that, let's learn how to make our own!

## Multiple Identity

A really common exercise in the world of Functional Programming is writing some operators like map and filter, both for practice and to understand how they work.  So let's do that!  I'm going to start with the easiest operator: `identity`.  I mean, that name is taken, so let's call ours `identity1`.  It's job is to take an Observable and return an Observable that has the exact same behaviour.  Should be easy.

```ts
function identity1<A>(source:Observable<A>):Observable<A>{
  return source;
}
```

Like I said.  Too easy.  Okay, but that's just the same Observable right?  When we're writing real operators, we're not getting off that easy.  Let's at least return a new Observable.

```ts
function identity2<A>(source:Observable<A>):Observable<A>{
  return from(source);
}
```

Ummm... okay, I wasn't being clear, I guess.  You see, one of the things we might want to do with an operator is control when the source's subscription starts and ends.  For instance, `take(5)` will wait until you've emitted 5 signals, then quit.  So our operator should *at least* let us control a subscription to the source.

```ts
function identity3<A>(source:Observable<A>):Observable<A>{
  return new Observable<A>(subscriber => {
    const subscription = source.subscribe(subscriber);

    return () => {
      subscription.unsubscribe();
    };
  });
}
```

All right!  Now we're talking!  But we might also want to control when values or what values get sent, like in the case of `map` and `filter`.  Let's make an Observer that'll let us have some more fine tuned control.

```ts
function identity4<A>(source:Observable<A>):Observable<A>{
  return new Observable<A>(subscriber => {
    const subscription = source.subscribe({
      next(value:A){ subscriber.next(value); },
      complete(){ subscriber.complete(); },
      error(err:any){ subscriber.error(err); }
    });

    return () => {
      subscription.unsubscribe();
    };
  });
}
```

Oh, now that's really fine-tuned control.  I mean, honestly, it's a pretty straight shot from this to making a `map` of our own:

```ts
function map1<A, B>(txfm:(item:A, index:number) => B):OperatorFunction<A, B>{
  return (source:Observable<A>) => new Observable<B>(subscriber => {
    let index = 0;
    const subscription = source.subscribe({
      next(value:A){ subscriber.next(txfm(value, index++)); },
      complete(){ subscriber.complete(); },
      error(err:any){ subscriber.error(err); }
    });

    return () => {
      subscription.unsubscribe();
    };
  });
}
```

And the `filter` writes itself as well!

```ts
function filter<A>(test:(item:A, index:number) => boolean):MonoTypeOperatorFunction<A> {
  return (source:Observable<A>) => new Observable<A>(subscriber => {
    let index = 0;
    const subscription = source.subscribe({
      next(value:A){
        if(test(value, index++)){
          subscriber.next(value);
        }
      },
      complete(){ subscriber.complete(); },
      error(err:any){ subscriber.error(err); }
    });

    return () => {
      subscriber.unsubscribe();
    };
  })
}
```

## Tap Dancing

One last operator I'm going to introduce is `tap`.  `tap` is an amazing little utility that lets us capture all sorts of events that occur during the lifecycle of a subscription, and it even has a special type of Observer that's just used with it: the `TapObserver<T>`.

```ts
interface TapObserver<T> extends Observer<T> {
  subscribe: () => void
  unsubscribe: () => void
  finalize: () => void

  // inherited from index/Observer
  next: (value: T) => void
  error: (err: any) => void
  complete: () => void
}
```

The `TapObserver<T>` responds to our big 3 (`next`, `error`, & `complete`), but it also responds to `subscribe`, `unsubscribe`, and `finalize`.  `finalize` means "end for any reason", and will fire on `error`, `complete`, *or* `unsubscribe`.

Its stated purpose is to "perform a side effect" on those events, but we're going to use it to debug our RxJS, or at least to show what's happening at every step of the way.  In fact, lets make a little utility to help with that.

I'm going to create a new function called `debugger` that takes in a label and returns a `TapObserver<any>` that'll log all the events to the console.  I'll also add a flag to allow or disallow `finalize`.  After all, if we're firing `error`, `complete`, and `unsubscribe`, maybe `finalize` is too much noise.

```ts
function debugger(label:string, withFinalize = false):Partial<TapObserver<any>>{
  const allButFinalize: Omit<TapObserver<any>, 'finalize'> = {
    subscribe:() => { console.log(label, 'Subscribe'); },
    unsubscribe:() => { console.log(label, 'Unsubscribe'); },
    next:(value:any) => { console.log(label, 'Next', value); },
    error:(err:any) => { console.log(label, 'Error', err); },
    complete:() => { console.log(label, 'Complete'); }
  }
  if(withFinalize) return {
    ...allButFinalize,
    finalize:() => { console.log(label, 'Finalize'); }
  };
  return allButFinalize;
}
```

Now we can string these inbetween the steps of our pipeline above, and see *exactly* what transpired between each step:

```ts
from([1, 2, 3, 4, 5]).pipe(
  tap(debugger('Source')),
  map(x => x * x),
  tap(debugger('After Map')),
  filter(x => x * 2 !== 0)
  tap(debugger('After Filter')),
).subscribe(/* Do we really need an observer here? */);

// CONSOLE:
// After Filter Subscribe
// After Map Subscribe
// Source Subscribe
// Source Next 1
// After Map Next 1
// After Filter Next 1
// Source Next 2
// After Map Next 4
// Source Next 3
// After Map Next 9
// After Filter Next 9
// Source Next 4
// After Map Next 4
// Source Next 5
// After Map Next 25
// After Filter Next 25
// Source Complete
// After Map Complete
// After Filter Complete
```

A clear record of everything!  We can even see when `After Map` fired and `After Filter` didn't!  We have incredibly clear visibility on every step of our pipeline.

## Here We Go!

So, we now know what operators are, how to apply them to observables, how to write them, combine them, and see exactly what they produce at every step.  It's time to dive in and see what operators we have to work with in this library.

What I've done is gone through every operator (and frankly, every single component of the RxJS library) and categorized them according to what they're doing.  I've sort of arrived at these 5 categories:

* **Array-like operators**: The operators that would make sense on an array.  These are largely for "knowing something about the data in the stream"
* **Process Handling**: The operators that treat Observables like async processes.  This involves the sort of operations you'd expect in a procedural paradigm, like catching errors, repeating processes, ending them early, etc.
* **Composing Observables**: The operators that let you compose Observables into new Observables.  This might mean listening to many Observables at once, or using one Observable to control the behaviour of another.
* **Timing**: The operators that recognize that Observables are happening over time.  This includes scheduling for synchronization, and dealing with "backpressure" (when too many signals are coming in for your output processing).
* **Rx-Specific Stuff**: The operators that are just about managing, sharing, and replaying subscriptions.

[<<Prev](./02-how-to-make-an-observable.md) | [Home](../README.md) | [Next >>](./04-array-like-operators.md)
