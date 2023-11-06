# Chapter 4: Array-Like Operators

[<< Prev](./03-pipe-dreams.md) | [Home](../README.md) | [Next >>](./05-rxjs-for-processes.md)

This might be me, but I find that a lot of my app code, the code that really ties my apps together, follows the same pattern quite a lot:

1. Get data from a source.
2. Massage that data into something you can use.
3. Do something with your freshly massaged data.

This becomes especially true in the days of microservices and API's that are split up across multiple domains or even just come from a variety of sources.  When you have that, there are a lot of ways you might want to shape data into a form your app's ready for.

JavaScript arrays come with a ton of methods to do that.  For instance, let's say that you had an array of Student objects from some data source, and you wanted to find the ones who had a grade less than 70% so you could send them a sternly worded email.  You could write this:

```ts
for(const student of students){
  if(student.grade < 70){
    const message = `Dear ${student.name}, your grades are bad.  Do better.`
    sendEmail(student.email, message);
  }
}
```

Or, you could write it like this instead:

```ts
const emailsToSend = students
  .filter(student => student.grade < 70)
  .map(student => [student.email, `Dear ${student.name}, your grades are bad.  Do better.`]);

for(const [address, message] of emailsToSend){
  sendEmail(student.email, message);
}
```

What's the difference?  Well they both do the same thing.  The second one tells a story, though, so if you're familiar with `map` and `filter`, you know what you are getting: an email address and a message for each student whose grade has fallen below 70%.

So, for the sake of this chapter, we're gonna go through all the operators that exist for this purpose, and my criteria is this: can I write this for an Iterable?

## Adorable Iterables

Okay, I said arrays earlier, but this isn't really about arrays: it's about **iterables**.  If you haven't seen iterables before, they're a type in JavaScript that does a lot of what you think about arrays doing.  In fact, every array is an iterable, though not every iterable is an array.  All iterables, including arrays, can do the following:

* Be looped over using `for(const item of iterable){ /* do something */ }` until there are no more items.
* Be copied into an array using `const newArray = [...iterable]` or `const newArray = Array.from(iterable);`

However, not every iterable is *exactly* like an array.  For instance:

* Arrays are finite, since they need to have all of their data in memory all at once.  Iterables could be infinite.
* Arrays have a fixed length.  An iterable's length could be unknown until it stops.
* At any point in an iteration over an array, I can use indexing to grab items further on.  With iterables, I can know about any item that has already been emitted, but I have no idea about the value or quantity of future items.
* Arrays are mutable, but you can't assume that an iterable is mutable
* With arrays, you can change the order of items.  You can't with iterables.

All that to say, our operators can't take it for granted that they know how many items they have, or even if their source is guaranteed to end; they can't do mutations, or change the order; and they don't know about any values after the one they're looking at, but might no about ones before.

Oh, and while we're at it, I'm also requiring that they must operate synchronously by default.

## Start at the Top

Maybe you've gotten this far, and you'd like me to tell you something useful.  You know what, that's totally fair.  So, I'm gonna give you my top 5 array-like operator / operator families right off the top.  It's only fair.

1. `map`

What list of top-tier array operators wouldn't start with `map`? It's just basic-level data transformation.  One item goes in, a new item goes out.  It's like a makeover show, but for our data.

```ts
from([1,2,3,4]).pipe(
  tap(debug('Source')),
  map((x) => x * x)
).subscribe(debug('After Map'));
```

2. `filter`

Another oldie but goldie.  Filter works exactly like you'd expect.  When a value is sent to it, `filter` runs a test on that value to decide whether or not to pass that value on.

```ts
from([1,2,3,4])
  .pipe(
    tap(debug('Source')),
    map(x => x * x),
    tap(debug('After Map')),
    filter(x => x % 2 !== 0),
    tap(debug('After Filter'))
  ).subscribe()

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
// After Map Next 16
// Source Complete
// After Map Complete
// After Filter Complete
```

There's some added goodness to `filter` for all you TypeScript fans: if you pass a [type predicate](https://www.typescriptlang.org/docs/handbook/2/narrowing.html#using-type-predicates) as your predicate, your output Observable is of that narrower type.  In the example below, we create a type predicate that knows if a `string` fits the narrower definition of `TicTacToeMark`.  By passing this to the `filter` function, we go from the broader `Observable<string>` to the narrower `Observable<TicTacToeMark>`.

```ts
const string$:Observable<string> = from(["A", "X", "O"]);

type TicTacToeMark = 'X'|'O';

function isTicTacToeMark(s:string):s is TicTacToeMark {
  return s === 'X' || s === 'O';
}

const xsAndOs$:Observable<TicTacToeMark> = string$.pipe(
  filter(isTicTacToeMark)
);
```

3. `scan` / `reduce`

If you've been in the world of JavaScript for long enough, or if you've dipped into the world of functional programming, you might know the glory of reducers.  I go at length on their goodness [here](../section-2/01-reducers-for-fun-and-profit.md), but the gist is this: we can take an entire sequence and boil it down (or reduce it down) to one value, something that tells us about the whole collection.  All we need is a seed value, and a function that takes the current running value, and updates it based on a current value.

```ts
const nums = [1,2,3,4]
const sumOfNums = nums.reduce((aggregate, item) => aggregate + item, 0);
const prodOfNums = nums.reduce((aggregate, item) => aggregate * item, 1);

console.log(sumOfNums, prodOfNums);
// CONSOLE:
// 10 24
```

And good news, we have a `reduce` function that works that way in RxJS!

```ts
const num$ = from([1,2,3,4])
const sumAndProdOfNum$ = num$.pipe(
  reduce(([sum, prod], item) => [sum + item, prod * item], [0, 1])
)

sumAndProdOfNum$.subscribe(debug('Sum And Prod'));

// CONSOLE:
// Sum And Prod Next [10, 24]
// Sum And Prod Complete
```

But there's a behaviour here that has a serious drawback: it only emits once, when the observable completes.  When you're dealing with arrays, that's not really an issue, since "reduce all the values I have so far" and "reduce all the values in the collection" mean the same thing.  With Observables, those two things could, in fact, be different.  We may be getting new values in a second, or we may be dealing with an Observable that never ends, but we still may want to get the totals now.

This is exactly what `scan` gives us.  `scan` has the same signature as `reduce`, but instead of waiting for the end to give us all the values, it gives it to us as new values roll in.

```ts
const num$ = from([1,2,3,4])
const sumAndProdOfNum$ = num$.pipe(
  scan(([sum, prod], item) => [sum + item, prod * item], [0, 1])
)

sumAndProdOfNum$.subscribe(debug('Sum And Prod'));

// CONSOLE:
// Sum And Prod Next [1, 1]
// Sum And Prod Next [3, 2]
// Sum And Prod Next [6, 6]
// Sum And Prod Next [10, 24]
// Sum And Prod Complete
```

This is another absolute juggernaut.  If you have any situation with a running state that's being calculated, and you want to know what that state is at any given moment, this is the one.  When I have a weird situation to express with RxJS, I often ask myself, "How could I represent this with `scan`?" as my first question.

Here's a practical example.  Let's say you had a batch of sales records, and you wanted to see the sales total for each sales rep, as well as their biggest sale.

```ts
import { from, scan } from "rxjs";

type SalesRecord = {name: string, amount: number};
type Scoreboard = Record<string, {total:number, max:number}>

const sale$ = from([
  {name: 'Jeff', amount: 100},
  {name: 'Janet', amount: 200},
  {name: 'Jeff', amount: 100},
  {name: 'Mike', amount: 300}
])

sale$.pipe(
  scan<SalesRecord, Scoreboard>((agg, {name, amount}) => {
    const lastRecordForName = agg[name];
    const nextRecordForName = 
      lastRecordForName === undefined
        ? { total: amount, max: amount }
        : { 
          total: lastRecordForName.total + amount, 
          max: Math.max(lastRecordForName.max, amount) 
        };
    return {
      ...agg,
      [name]: nextRecordForName
    }
  }, {})
).subscribe(console.log);

// CONSOLE:
// { Jeff: { total: 100, max: 100 } }
// { Jeff: { total: 100, max: 100 }, Janet: { total: 200, max: 200 } }
// { Jeff: { total: 200, max: 100 }, Janet: { total: 200, max: 200 } }
// {
//   Jeff: { total: 200, max: 100 },
//   Janet: { total: 200, max: 200 },
//   Mike: { total: 300, max: 300 }
// }
```

And if you pipe that stream of state updates into a `BehaviorSubject`, you know have an object that you can query for that state that will also update you when the state has changed.

```ts
import { BehaviorSubject, from, scan } from "rxjs";

type SalesRecord = {name: string, amount: number};
type Scoreboard = Record<string, {total:number, max:number}>

const scoreboardState$ = new BehaviorSubject<Scoreboard>({});
scoreboardState$.subscribe(() => {
  console.log(scoreBoard$.value);
});

const sale$ = from([
  {name: 'Jeff', amount: 100},
  {name: 'Janet', amount: 200},
  {name: 'Jeff', amount: 100},
  {name: 'Mike', amount: 300}
])

sale$.pipe(
  scan<SalesRecord, Scoreboard>((agg, {name, amount}) => {
    const lastRecordForName = agg[name];
    const nextRecordForName = 
      lastRecordForName === undefined
        ? { total: amount, max: amount }
        : { 
          total: lastRecordForName.total + amount, 
          max: Math.max(lastRecordForName.max, amount) 
        };
    return {
      ...agg,
      [name]: nextRecordForName
    }
  }, {})
).subscribe(scoreboardState$);


// CONSOLE:
// { Jeff: { total: 100, max: 100 } }
// { Jeff: { total: 100, max: 100 }, Janet: { total: 200, max: 200 } }
// { Jeff: { total: 200, max: 100 }, Janet: { total: 200, max: 200 } }
// {
//   Jeff: { total: 200, max: 100 },
//   Janet: { total: 200, max: 200 },
//   Mike: { total: 300, max: 300 }
// }
```

Now, in our little case here, there's no difference in the output.  But in a real application, any function that wasn't tied to the update cycle would still be able to call `scoreboardState$.value` to get the current state of the scoreboard, and any component of our system would be able to connect to and disconnect from the `scoreboardState$` to get the current state and any updates.

4. `take` (and `takeWhile`, `skip`, and `skipWhile`, I guess).

You know, I wanted to just make this entry about `take`, but its kinda hard to do without including its buddy, `skip`, since they're very similar in their description.  They let us define limits on when we start emitting items from a source, and when we stop emitting items from a source.  Their most basic variation does this with a count.

You've probably used the `slice` method of arrays to get the same behaviour. Let's say you had an array like below, and you only wanted to skip the first one and take the next 3.

```ts
const nums = [1,2,3,4,5];
const allButTheFirst = nums.slice(1); // [2,3,4,5]
const allButTheFirstAndLast = allButTheFirst.slice(0, 3); // [2,3,4]
```

Yeah, more than likely, you'd actually use `nums.slice(1, 4)`, but `slice` isn't in the RxJS library, so let's pretend it was always 2 steps.

Anyway, we can recreate the logic above in RxJS, so lets do that!

```ts
const nums$ = from([1,2,3,4,5])
const allButFirst$ = num$.pipe(skip(1));
allButFirst$.subscribe(console.log);
// CONSOLE:
// 2
// 3
// 4
// 5

const allButFirstAndLast$ = allButFirst$.pipe(take(3))
allButFirstAndLast$.subscribe(console.log);
// CONSOLE:
// 2
// 3
// 4
```

Let's run them both together with some logging, and we'll see something really important about `take`:

```ts
import { from, tap, skip, take } from "rxjs"
import { debug } from "../utils"

from([1,2,3,4,5])
  .pipe(
    tap(debug('Source')),
    skip(1), 
    tap(debug('After Skip')),
    take(3),
    tap(debug('After Take'))
  ).subscribe()

// CONSOLE:
// After Take Subscribe
// After Skip Subscribe
// Source Subscribe
// Source Next 1
// Source Next 2
// After Skip Next 2
// After Take Next 2
// Source Next 3
// After Skip Next 3
// After Take Next 3
// Source Next 4
// After Skip Next 4
// After Take Next 4
// After Take Complete
// Source Unsubscribe
// After Skip Unsubscribe
```

You'll notice that the last three messages in the log are `After Take Complete`, `Source Unsubscribe`, `After Skip Unsubscribe`.  The `take` operator didn't just stop emitting values.  It completed, and in doing so, it unsubscribed from its source, which then triggered unsubscribes all the way back.

This is the magic of `take` and its variants `takeWhile` and `takeUntil`.  They stop subscriptions, which can clean up all sorts of processes.

When it comes to arrays, this isn't a huge deal.  It may save you from doing unnecessary operations on a big array if you already have what you need, so that's a plus, but it probably wouldn't kill your whole app.  But you may remember what I said about the differences between arrays and iterables: arrays are finite, iterables could be infinite.  So if I run the code above on an infinite iterable, then I know it'll stop and my code won't be stuck in an infinite loop.

```ts
function *countForever(n:number = 1){
  while(true) yield n++;
}

from(countForever(1))
  .pipe(
    tap(debug('Source')),
    skip(3), 
    tap(debug('After Skip')),
    take(2),
    tap(debug('After Take'))
  ).subscribe()

// CONSOLE:
// After Take Subscribe
// After Skip Subscribe
// Source Subscribe
// Source Next 1
// Source Next 2
// Source Next 3
// Source Next 4
// After Skip Next 4
// After Take Next 4
// Source Next 5
// After Skip Next 5
// After Take Next 5
// After Take Complete
// Source Unsubscribe
// After Skip Unsubscribe
```

Same output, and more importantly, `take` killed our iterable so it didn't go forever.  This will be important for cancelling all sorts of things, like event listeners, AJAX calls, socket connections, and more.  We'll get into more of this later, but `take` is a big part of how we clean up our processes.

> NOTE: `takeLast` doesn't do this, for reasons we'll discuss further down the chapter, so don't count on it to do any cleanup for you.

It's worth mentioning `skipWhile` and `takeWhile` here.  They work the same way, but instead of counting out *n* number of items, it applies a test and decides when to stop skipping or stop taking based on that.

```ts
from([1,2,3,2,1]).pipe(
  skipWhile(x => x < 2),
  takeWhile(x => x >= 2)
).subscribe(debug('TW-SW'));

// CONSOLE:
// TW-SW Next 2
// TW-SW Next 3
// TW-SW Next 2
// TW-SW Complete
```

We'll discuss `skipUntil` and `takeUntil` in a later chapter, and we'll talk about `skipLast` and `takeLast` further below in this chapter.  But closer to the end.  Because they're weird.

4. `startWith` / `endWith`

Okay, these are pretty straightforward: `startWith` emits a value before emitting any others, and `endWith` waits until the source completes, emits the value, then completes.

```ts
from([1,2,3])
  .pipe(
    tap(debug('Source')),
    startWith(0), 
    tap(debug('After StartWith')),
    endWith(4),
    tap(debug('After EndWith'))
  ).subscribe()

// After EndWith Subscribe
// After StartWith Subscribe
// After StartWith Next 0
// After EndWith Next 0
// Source Subscribe
// Source Next 1
// After StartWith Next 1
// After EndWith Next 1
// Source Next 2
// After StartWith Next 2
// After EndWith Next 2
// Source Next 3
// After StartWith Next 3
// After EndWith Next 3
// Source Complete
// After StartWith Complete
// After EndWith Next 4
// After EndWith Complete
```

5. `distinctUntilChanged`

There's a whole `distinct` family that we'll discuss below, but this one is the one I use most.  It allows you to run

## And now for the etcetera

Okay, from

## One goes in, one comes out

Okay, let's get to it.  We're gonna start with two operators of type `OperatorFunction<A, B>` that take a the granddaddy of all operators: `map`.  It's an oldie and a goldie.  In fact, in Category Theory, there's a special name given to a data source that can implement map: "Functor".  In plain English, we use make to make an Observable where every input item "maps" to one output item.

```ts
// Iterable Version
function map<A, B>(txfm: (item:A, index:number) => B){
  return function *(source:Iterable<A>):Iterable<B>{
    let index = 0;
    for(let item of source){
      yield txfm(item, index++);
    }
  }
}

// Observable Version
function map<A, B>(txfm: (item:A, index:number) => B){
  return (source:Observable<A>) => new Observable<B>(subscriber => {
    let index = 0;
    const subscription = source.subscribe({
      next(val){ subscriber.next(txfm(val, index++)); },
      complete(){ subscriber.complete(); },
      error(err:any){ subscriber.error(err); }
    })
    return () => { subscription.unsubscribe(); };
  });
}
```

There's another one like it called `scan`, and `scan` is an absolute workhorse.  It employs the *reducer* function pattern, so it fits in well with code from Redux or React's `useReducer` hook.

```ts
// Iterable Version
function scan<A, B>(reducer:(accum: B, item:A, index:number) => B, seed:B) {
  return function *(source:Iterable<A>):Iterable<B>{
    let index = 0;
    let current = seed;
    for(let item of source){
      current = reducer(current, item, index++);
      yield current;
    }
  }
}

// Observable Version
function scan<A, B>(reducer:(accum: B, item:A, index:number) => B, seed:B) {
  return (source:Observable<A>) => new Observable<B>(subscriber => {
    let index = 0;
    let current = seed;
    const subscription = subscriber.subscribe({
      next(val){
        current = reducer(current, val);
        subscriber.next(current);
      },
      complete(){ subscriber.complete(); },
      error(err:any){ subscriber.error(err); }
    });
    return () => { subscription.unsubscribe(); };
  });
}
```

"But wait!" you might be saying.  "Isn't that just [`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)?  Is it different? And isn't there a `reduce` operator?  What's going on?"

This is, in fact, very similar to `Array.prototype.reduce`, but with a couple of differences:

1. The array version of reduce has two versions: with a seed value or without.  When it's missing, the array basically picks the first value and then reduces from there.  `scan` on the other hand, won't work without a seed value.
1. More importantly, the reduce method from array and the `reduce` operator both return only one value, where `scan` returns one value for each input value.

Why return more than 1 value?  Why doesn't reduce do that?  Well, this comes from one of the big differences between dealing with Observables and dealing with arrays: if you are iterating through an array, you already have all the values you could ever need; if you're subscribing to Observable, you may need the current aggregate even if you don't have all the values.

`scan` is great for keeping track of something as you're going along.  For instance, if you had a bunch of sales people, and you wanted to keep track of their sale amounts and who had the highest, you could do something like this:

```ts
const sale$ = from([
  {name: 'Jeff', amount: 100},
  {name: 'Janet', amount: 200},
  {name: 'Jeff', amount: 100},
  {name: 'Mike', amount: 300}
]).pipe(
  scan((agg, {name, amount}) => {
    return {
      ...agg,
      [name]: (agg[name] || 0) + amount
    }
  }, {})
).subscribe(console.log);

// CONSOLE:
// { Jeff: 100 }
// { Jeff: 100, Janet: 200 }
// { Jeff: 200, Janet: 200 }
// { Jeff: 200, Janet: 200, Mike: 300 }
```

> Learn more about reducers in [Reducers for Fun and Profit](../section-2/01-reducers-for-fun-and-profit.md)

### Material Girls

Now, this is gonna be an odd one, but I want to introduce `materialize`. Its an alright debugging tool and a decent tool for interop with other systems, so it deserves its place in the library.  `materialize` takes an Observable and turns it into... well, another Observable.  But this is an Observable of "tokens" that represents the next, complete, and error events. And `dematerialize` does the same thing in the opposite direction, turning an Observable of these tokens back into a "normal" stream.

```ts
type NextNotification<T> = { kind: 'N', value: T }, 
type CompleteNotification = { kind: 'C' };
type ErrorNotification = { kind: 'E', error: any };

type ObservableNotification<T> = NextNotification<T> | CompleteNotification | ErrorNotification;

// Iterable Versions
function *materalize<T>(source:Iterable<T>):Iterable<ObservableNotification<T>>{
  try {
    for(const value of items){
      yield {kind: 'N', value };
    }
    yield { kind: 'C' };
  } catch(error){
    yield { kind: 'E', error }
  }
}

function *dematerialize<T>(source:Iterable<ObservableNotification<T>>):Iterable<T>{
  for(const item of source){
    switch(item.kind){
      case 'E': throw item.error;
      case 'C': return;
      case 'N': yield item.value;
    }
  }
}

// Observable Versions
function materialize<T>(source:Observable<T>){
  return new Observable<ObservableNotification<T>>(subscriber => {
    const subscription = source.subscribe({
      next(value){ subscriber.next({kind: 'N', value}); },
      complete(){ 
        subscriber.next({kind: 'C'});
        subscriber.complete();
      }
    })
  });
}
```

Now, I have not yet found a use for this one myself, BUT I have done the *exact same thing* with Promises to solve an honest-to-goodness Promise composition problem:

```ts
type SuccessNotification<T> = {kind: 'S', value: T}
type PromiseNotification<T> = SuccessNotification<T> | ErrorNotification

function materializePromise<T>(promise:Promise<T>):Promise<PromiseNotification<T>>{
  return promise.then(value => ({kind: 'S', value}, error => ({kind: 'E', error})));
}

function dematerializePromise<T>(promise:Promise<PromiseNotification<T>>){
  return promise.then(notification => {
    if(notification.kind === 'S') return notification.value;
    return Promise.reject(notification.error);
  })
}
```

So, you know what?  No notes.

## One goes in, maybe one comes out.

Well, that brings us to the next important category: operators that decide what input gets through.  For every 1 input that comes in, either the same input comes out, or it doesn't.  And all of these will be `MonoTypeOperatorFunction<T>`'s, which means that there's no change to the values.

Sooo, the good news is that ya boi `filter` works the same in RxJS as it does with arrays: it takes in a "tester" function (which is referred to as a **predicate**), and runs each item and index through that test.  If it returns true, the input will be seen on the other side.  If it returns false, *then that input is never heard from again mwahaHAHAHA!!!!!*

```ts
function filter<A>(pred:(item:A, index:number) => boolean){
  return function *(source:Iterable<A>):Iterable<A>{
    let index = 0;
    for(const item of source){
      if(pred(item, index++)){
        yield item;
      }
    }
  }
}
```

Top tier stuff.  We also have an operator like it, but it answers the question: "What if you took `filter` and gave it a predicate that always returned `false`?"  Well, you'd have `ignoreElements`.  It does exactly what it says on the tin.  If its source completes or errors out, it'll pass that on.  But its `next` function is *never* getting called.

```ts
function *ignoreElements(source:Iterable<any>):Iterable<never>{
  for(const item of source);
}
```

I know, it probably looks useless, but it does have its charms.  I find myself reaching for `timer(n).pipe(ignoreElements())` when I just want an observable to wait a while and then complete.

### With Distinction

Sometimes, you want to make sure there are no repeats of items.  I often use `[...new Set(items)]` to accomplish this with arrays, but obviously, this won't work the same way when you have a stream of items, right?

Well, an iterable version could look like this:

```ts
function distinct<A, K>(keySelector:(item:A) => K = identity as (item:A) => K){
  return function *(source:Iterable<A>){
    const set = new Set<K>();
    for(const item of set){
      const key = keySelector(item);
      if(!set.has(key)){
        yield item;
        set.add(key);
      }
    }
  }
}
```

We hold on to the set, and every time we have an item that hasn't been seen yet, we yield it, but add its key to the set.

This is a really common pattern I use with arrays, but again, I do different things with arrays than I do with streams because all the data is there.  Sometimes, I care more about change.

Consider the `span` example above.  There are many cases where an input will not result in a state change, and we just repeat the old state.  But maybe we don't want to trigger some transformation if the state hasn't changed.  `distinctUntilChanged` will filter out values that are the same as the last emitted state (with an equality operator you can define).

```ts
function distinctUntilChanged<T>():(source:Iterable<T>) => Iterable<T>;
function distinctUntilChanged<T>(comparator:(prev:T, curr:T) => boolean):(source:Iterable<T>) => Iterable<T>;
function distinctUntilChanged<T, K>(keyComparator:(prev:K, curr:K) => boolean, keySelector:(item:T) => K):(source:Iterable<T>) => Iterable<T>;

function distinctUntilChanged(
  comparator:(prev:any, curr:any) => boolean = (prev:any, curr:any) => prev === curr, 
  keySelector:(item:any) => any = identity
){
  return function*([first, ...rest]:Iterable<T>):Iterable<T>{
    let lastKey = keySelector(first);
    yield first;
    for(const item of rest){
      let currKey = keySelector(item);
      if(comparator(currKey, lastKey)) continue;
      lastKey = currKey
      yield item;
    }
  }
}
```

You may think that the `keySelector` / `keyComparator` is a bit much, and for your use case it might be, but this ability to create a "hash" for a value is really common where distinct is involved, and it might be perfect for your usecase.  The `distinctUntilKeyChanged` is a simple shorthand for the case for this where your key can be accessed through a key like "name" or "id" or something.

```ts
function distinctUntilKeyChanged<T, K extends keyof T>(key:K, compare: (x: T[K], y: T[K]) => boolean = (x, y) => x === y){
  return distinctUntilChanged<T, K>(compare, t => t[key]);
}
```

### Skip to the good parts

Another common thing you might do with an array is to get a slice of it.  For instance, if you wanted to skip 4 items but then take 3, you could write `items.slice(4, 7)` or `items.slice(4).slice(0, 3)`.  The language for this in RxJS is `skip` and `take`.

The mechanism behind `skip` belongs in this section, since it does what filter and distinct do: go item for item and decide if it should be passed on to the new observable.  The only difference is that once it starts emitting, it doesn't stop.

```ts
function skip<T>(count:number){
  if(count <= 0) return identity;

  return function *(source:Iterable<T>):Iterable<T>{
    let countDown = count;
    for(const item of source){
      if(countDown <= 0){
        yield item;
      } else {
        countDown -= 1;
      }
    }
  }
}
```

As you can see, it skips items until it's ready to start, but after that, it just emits.  We can also use `skipWhile` with a predicate.  Its type signature is identical to `filter`, but once something passes muster, then it doesn't apply the predicate anymore.

```ts
function skipWhile<T>(predicate:(item:T, index:number) => boolean){
  return function *(source:Iterable<T>):Iterable<T>{
    let skipping = true;
    let index = 0;
    for(const item of items){
      if(!skipping){
        yield item;
      } else if(predicate(item, index++)){
        skipping = false;
        yield item;
      }
    }
  }
}
```

That brings us to `skipLast`.  It makes sense that this is in the library, but honestly, it's a strange one, and I'll tell you why.  You could think of `skip` as `skipFirst`, so if `from([1,2,3,4,5]).pipe(skip(2))` is equivalent to `from([3,4,5])`, then using `skipLast(2)` instead is equivalent to `from([1,2,3])`.  Here's the iterable version of that.

```ts
function skipLast<T>(count:number){
  if(count <= 0) return identity;
  return function *(source:Iterable<T>):Iterable<T> {
    let skipped = [];
    for(const item of items){
      if(skipped.length >= count){
        yield skipped.shift();
      }
      skipped.push(item);
    }
  }
}
```

But here's where the strangeness sets in.  You see, in every operator we've talked about in this chapter, if the newly created observable emits a signal, it's because it just received it from its source.  Not so with `skipLast`.  If we run a debug tap we can see what's really happening:

```ts
interval(1000).pipe(
  tap(debug('From Source')),
  skipLast(2),
  tap(debug('After Skip')),
).subscribe();

// Console
// After Skip Subscribed
// From Source Subscribed
// From Source Next 0
// From Source Next 1
// From Source Next 2
// After Skip Next 0
// From Source Next 3
// After Skip Next 1
// From Source Next 4
// After Skip Next 2
// ... ad infinitum
```

Can you see the delay?  `skipLast(2)` emits the first item *after* it gets the third item.  It will emit the right values, but since it doesn't know the future values or length to come, it uses a delay to make that happen.  So if you're going to use this one, make sure you don't need the most current values at the current moment.  In fact, maybe only use this one for synchronous transformations.

The last variation is `skipUntil`.  Now this one doesn't have an iterable version we can write out, and for good reason: this depends on another Observable, so its pretty hard to do this synchronously.  In fact, everywhere you see "until" in RxJS, think "until another Observable emits".

We'll cover that and other ways that Observables interact with each other in [Chapter 6: Combining Observables](./06-combining-observables.md)

## At the end of the day

Well, we've talked about all the operators that only spring into action while the source is emitting variables, telling us something along the way.  But sometimes, the thing we want to know about the sequence is something we can only know at the end.  So, we're going to look at operators that don't emit anything until the source completes.

Here's another way to look at it: the iterable versions of these operators don't necessarily need to return an `Iterable<T>`; they can just return the value itself.  In the same way, the async iterable versions wouldn't need to return an `AsyncIterable<T>`, they could just return a `Promise<T>`.  Now, when it comes to observable operators, they will need to return an Observable, but it will be an Observable that will emit exactly one value and then complete.  You could even use `lastValueFrom` or `firstValueFrom` to turn it into a Promise.

An operator that really shows this is `count`.  `count` does exactly what it says on the tin: it counts how many items the source emits.  If you pass it a predicate, it'll count how many meet that predicate.

```ts
const ALWAYS_TRUE = () => true;
// Iterable Version
function count<T>(predicate:(item:T, index:number) => boolean = ALWAYS_TRUE) {
  return (source:Iterable<T>):number => {
    let index = 0;
    let count = 0;
    for(const item of source){
      if(predicate(item, index++)){
        count++;
      }
    }
    return count;
  }
}

// Async Iterable Version
function count<T>(predicate:(item:T, index:number) => boolean = ALWAYS_TRUE){
  return async (source:AsyncIterable<T>):Promise<number> => {
    let index = 0;
    let count = 0;
    for await (const item of source){
      if(predicate(item, index++)){
        count++
      }
    }
    return count;
  }
}

// Observable version
function count<T>(predicate:(item:T, index:number) => boolean = ALWAYS_TRUE){
  return (source:Observable<T>) => new Observable<number>(subscriber => {
    let index = 0;
    let count = 0;
    source.subscriber({
      next(value){
        if(predicate(item, index++)){
          count++;
        }
      },
      complete(){ 
        subscriber.next(count); 
        subscriber.complete();
      },
      error(err:any){ subscriber.error(err); }
    })
  });
}
```

You can see that, unlike all the operators we've seen so far, we're not using generator functions.  We don't need to `yield` in any of them.  And in the Observable version, we don't emit a signal until the source is all finished.  We just keep counting.  And when the source does complete, we emit one value and immediately complete.

A similar one to it is `toArray`. When it starts, it creates a new array, and each time it source emits, it pushes that element into the array.  When the sequence completes, it emits one value: the array.

```ts
// Iterable Version
function *toArray<T>(items:Iterable<T>):T[]{
  const collectedItems = [];
  for(const item of items){
    collectedItems.push(item);
  }
  return collectedItems;
}

// Async Iterable Version
async function *toArray<T>(items:AsyncIterable<T>):Promise<T[]>{
  const collectedItems = [];
  for await(const item of items){
    collectedItems.push(item);
  }
  return collectedItems
}

// Observable version
function toArray<T>(source:Observable<T>):Observable<T[]>{
  return new Observable<T[]>(subscriber => {
    const collectedItems = [];
    const subscription = source.subscribe({
      next(value){ collectedItems.push(value); },
      complete(){ subscriber.next(collectedItems); },
      error(err:any){ subscriber.error(err); }
    });

    return () => { subscription.unsubscribe(); };
  });
}
```

`toArray` plays a really important role when you use RxJS to do lazy transformations on arrays, but you can read more about that here: [Lazy Array Transformation](../section-2/02-lazy-array-transformation.md).

And to cap off this little section, here's `reduce`!  `reduce` works very similar to its counterpart from [`Array.prototype.reduce`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce).  You have a sequence of type A, you pass in a reducer function (with the type signature `(acc:B, item:A, index:number) => B`), and a seed of type B, and bam!  You have a B at the end!

* min
* max
* takeLast

```ts
function reduce<T, R>(reducer:(accum:R, item:T, index:number) => R, seed:R){
  return function(source:Iterable<T>):R{
    let current = seed;
    let index = 0;
    for(const item of source){
      current = reducer(current, item, index++);
    }
    return current;
  }
}

function *toArray<T>(source:Iterable<T>):T[] {
  return [...source];
}

function count(predicate?: (value: T, index: number) => boolean) {
  return function*(source:Iterable<T>):number{
  let index = 0;
  let count = 0;
  for(const item of source){
    if(!predicate || predicate(item, index++)){
      count++
    }
  }
  return count;
}
```

## Short Circuit

All right, we've 

* every

```ts
function every<T>(predicate:(item:T, index:number) => boolean){
  return function(source:Iterable<T>):boolean{
    let index = 0;
    for(const item of source){
      if(!predicate(item, index++)) return false;
    }
    return true;
  }
}
```

### Searching for the one

* find
* findIndex
* elementAt
* first
* last
* single

```ts
function find<T>(predicate:(item:T, index:number) => boolean, default?:T|undefined){
  return function(source:Iterable<T>):T|undefined{
    let index = 0;
    for(const item of source){
      if(predicate(item, index++)){
        return item;
      }
    }
    return undefined;
  }
}

function findIndex<T>(predicate:(item:T, index:number) => boolean){
  return function(source:Iterable<T>):number{
    let index = 0;
    for(const item of source){
      if(predicate(item, index)){
        return index;
      }
      index += 1;
    }
    return -1;
  }
}

function elementAt<T>(index:number){
  return function(source:Iterable<T>):T {
    if(index < 0 || Math.floor(index) !== index) throw new ElementOutOfRangeError();
    let _index = 0;
    for(const item of source){
      if(_index++ === index) return item;
    }
    throw new ElementOutOfRangeError();
  }
}

function first<T, D>(predicate:((item:T, index:number) => boolean)|null = () => true, defaultValue?: T|D){
  const hasDefault = arguments.length > 1;
  return function(source:Iterable<T>):T|D{
    let index = 0;
    for(const item of source){
      if(!predicate || predicate(item, index++)){
        return item;
      }
    }
    if(hasDefault) return defaultValue;
    throw new EmptyError();
  }
}

function last<T, D>(predicate:((item:T, index:number) => boolean)|null = () => true, defaultValue?: T|D){
  const hasDefault = arguments.length > 1;
  return function(source:Iterable<T>):T|D{
    let index = 0;
    let valueFound = false;
    let foundValue = defaultValue
    for(const item of source){
      if(!predicate || predicate(item, index++)){
        foundValue = item;
        valueFound = true;
      }
    }
    if(valueFound || hasDefault) return foundValue;
    throw new EmptyError();
  }
}

function single<T>(predicate:((item:T, index:number) => boolean)|null = () => true){
  return function(source:Iterable<T>):T{
    let index = 0;
    let valueFound = false;
    let foundValue = defaultValue
    for(const item of source){
      if(!predicate || predicate(item, index++)){
        if(!valueFound){
          throw new SequenceError();
        }
        foundValue = item;
        valueFound = true;
      }
    }
    if(valueFound) return foundValue;
    throw new EmptyError();
  }
}

```

### That empty feeling

* isEmpty
* defaultIfEmpty
* throwIfEmpty

```ts
function isEmpty(source:Iterable<any>):boolean{
  for(const item of source){
    return false;
  }
  return true;
}

function defaultIfEmpty<T, R>(defaultValue:R){
  return function*(source:Iterable<T>):Iterable<T|R>{
    let isEmpty = true;
    for(const item of source){
      isEmpty = false;
      yield item;
    }
    if(isEmpty){
      yield defaultValue;
    }
  }
}

function throwIfEmpty<T>(errorFactory:() => any){
  return function*(source:Iterable<T>):Iterable<T>{
    let isEmpty = true;
    for(const item of source){
      isEmpty = false;
      yield item;
    }
    if(isEmpty){
      throw errorFactory();
    }
  }
}
```

## At the end of the day

* reduce
* toArray
* count
* min
* max
* endWith / startWith

```ts
function reduce<T, R>(reducer:(accum:R, item:T, index:number) => R, seed:R){
  return function(source:Iterable<T>):R{
    let current = seed;
    let index = 0;
    for(const item of source){
      current = reducer(current, item, index++);
    }
    return current;
  }
}

function *toArray<T>(source:Iterable<T>):T[] {
  return [...source];
}

function count(predicate?: (value: T, index: number) => boolean) {
  return function*(source:Iterable<T>):number{
  let index = 0;
  let count = 0;
  for(const item of source){
    if(!predicate || predicate(item, index++)){
      count++
    }
  }
  return count;
}
```

## Observables of Observables, Observables of Arrays, and Arrays of Observables (AKA What happened to flatMap?)

* bufferCount
* windowCount
* groupBy
* partition

```ts
function bufferCount<T>(bufferSize:number, startBufferEvery:number = bufferSize){
  if(bufferSize < 1) throw new Error('Buffer Size too small');
  if(startBufferEvery < 1) throw new Error('StartBufferEvery too small');

  return function*(source:Iterable<T>):Iterable<T[]>{
    const buffers:T[][] = [[]];
    let countTillNextBuffer = startBufferEvery;
    for(const item of source){
      for(const buffer of buffers){
        buffer.push(item);
      }
      while(buffer.length > 0 && buffer[0].length >= bufferSize){
        yield buffer.shift();
      }
      if(--countTillNextBuffer === 0){
        countTillNextBuffer = startBufferEvery;
        buffers.push([]);
      }
    }
    yield *buffers;
  }
}

function partition<T>(predicate:(item:T, index:number) => boolean){
  return function(source:Iterable<T>){
    function *trues(){
      let index = 0;
      for(const item of source){
        if(predicate(item, index++)){
          yield item;
        }
      }
    }
    function *falses(){
      let index = 0;
      for(const item of source){
        if(!predicate(item, index++)){
          yield item;
        }
      }
    }
    return [trues(), falses()];
  }
}

function groupBy<T, K>(keySelector:(item:T) => K){
  return function*(source:Iterable<T>):Iterable<[K, Iterable<T>]>{
    function *byKey(key:K):Iterable<T>{
      for(const item of source){
        if(keySelector(item) === key){
          yield item;
        }
      }
    }
    const keys = new Set<K>();
    for(const item of source){
      const key = keySelector(item);
      if(!keys.has(key)){
        keys.add(key);
        yield [key, byKey(key)]
      }
    }
  }
}
```

### But what did happen to flatMap?

## Making Operators for fun and profit

* safeMap

```ts
function safeMap<A, B>(txfm:(item:A, index:number) => B, onError:(err:any, item:A, index:number) => void = noop){
  return function*(source:Iterable<A>):Iterable<B>{
    let index = 0;
    for(const item of source){
      try {
        yield txfm(item, index);
      } catch(err) {
        onError(err, item, index)
      }
      index++;
    }
  }
}

function safeMap$<A, B>(txfm:(item:A, index:number) => B, onError:(err:any, item:A, index:number) => void = noop){
  return (source:Observable<A>) => new Observable<B>(subscriber => {
    let index = 0;
    return source.subscribe({
      next(value){
        try {
          txfm(vaue, index);
          index++
        } catch(err){
          try {
            onError(err, item, index);
          } catch(err) {
            subscriber.error(err);
          }
        }
      },
      complete(){
        subscriber.complete();
      },
      error(err){
        subscriber.error(err);
      }
    });
  });
}
``` -->

[<< Prev](./03-pipe-dreams.md) | [Home](../README.md) | [Next >>](./05-rxjs-for-processes.md)
