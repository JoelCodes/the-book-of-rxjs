# Chapter 4: Array-Like Operators

[<<Prev](./03-pipe-dreams.md) | [Home](../README.md) | [Next >>](./05-rxjs-for-processes.md)

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

However, not every iterable is like an array.  For instance:

* Arrays are finite, since they need to have all of their data in memory all at once.  Iterables could be infinite.
* Arrays have a fixed length.  An iterable's length could be unknown until it stops.
* At any point in an iteration over an array, I can use indexing to grab items further on.  With iterables, I can know about any item that has already been emitted, but I have no idea about the value or quantity of future items.
* Arrays are mutable, but you can't assume that an iterable is mutable
* With arrays, you can change the order of items.  You can't with iterables.

The easiest way to make an iterable that isn't an array is to use a **generator** function.  These are easy to identify by the use of the `*` in its type signature, and the `yield` keyword in its block.  Here's an example:

```ts
function *countToThree():Iterable<number>{
  yield 1;
  yield 2;
  yield 3;
}

for(const item of countToThree()){
  console.log('From Generator', item);
}

// CONSOLE:
// From Generator 1
// From Generator 2
// From Generator 3

console.log('Into an array', [...countToThree()]);

// CONSOLE:
// Into an array [1, 2, 3]
```

Now, I could also create an infinite generator very easily.

```ts
function *countForever():Iterable<number>{
  for(let i = 0; true; i++){
    yield i;
  }
}
```

And if I ran this as is, it would run forever.

```ts
for(const item of countForever()){
  console.log('Forever', item);
}

// CONSOLE:
// Forever 0
// Forever 1
// Forever 2
// Forever 3
// Forever 4
// ... &c.
```

But if I want an iterable to stop, I can interrupt it early.  I just have to `break` or `return` from the loop.

```ts
for(const item of countForever()){
  console.log('Just to three', item);
  if(item === 3) break;
}
console.log('Done!');

// CONSOLE:
// Just to three 0
// Just to three 1
// Just to three 2
// Just to three 3
// Done!
```

And since I don't want this section of the chapter to go on forever, I'm going to keep it here.  There's an async version of this as well, but we'll leave that alone for the time being.

So what does an iterable operator look like?  Well, let's write the identity.  I need a function that will take in an iterable and return an iterable

```ts
function identityIterable<A>(source:Iterable<A>):Iterable<A>{
  return source;
}
```

And let's expand this to use a generator with `yield`:

```ts
function *identityIterable<A>(source:Iterable<A>):Iterable<A>{
  for(const item of source){
    yield item;
  }
}
```

I can also use the `yield *` with another iterable to say, "iterate through this iterable one by one".

```ts
function *identityIterable<A>(source:Iterable<A>):Iterable<A>{
  yield *source;
}
```

So, for each of the operators going forward, I'm going to describe it, but I'm also going to write the "generator" version of it, so you know I'm on the level.

Well, I'm certainly going to try.

> NOTE: for the time being, there's no more prose here.  This is an outline with some code written for each operator, but eventually, I STG, this will be a well-crafted, clear-yet-thorough explanation of each operator.

## One goes in, one comes out

Okay, let's get to it.  We're gonna start with two operators of type `OperatorFunction<A, B>` that take a the granddaddy of all operators: `map`.  It's an oldie and a goldie.  In fact, in Category Theory, there's a special name given to a data source that can implement map: "Functor".  In plain English, we use make to make an Observable where every input item "maps" to one output item.

```ts
function map<A, B>(txfm: (item:A, index:number) => B){
  return function *(source:Iterable<A>):Iterable<B>{
    let index = 0;
    for(let item of source){
      yield txfm(item, index++);
    }
  }
}
```

There's another one like it called `scan`, and `scan` is an absolute workhorse.  It employs the *reducer* function pattern, so it fits in well with code from Redux or React's `useReducer` hook.

```ts
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
  tap(debugger('From Source')),
  skipLast(2),
  tap(debugger('After Skip')),
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
```

[<<Prev](./03-pipe-dreams.md) | [Home](../README.md) | [Next >>](./05-rxjs-for-processes.md)
