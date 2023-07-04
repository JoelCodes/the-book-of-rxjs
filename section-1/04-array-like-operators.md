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

So for each of the operators going forward, I'm going to describe it, but I'm also going to write the "generator" version of it, so you know I'm on the level.

Well, I'm certainly going to try.

> NOTE: for the time being, there's no more prose here.  This is an outline with some code written for each operator, but eventually, I STG, this will be a well-crafted, clear-yet-thorough explanation of each operator.

## One goes in, one-ish comes out

* map
* scan

```ts
function map<A, B>(txfm: (item:A, index:number) => B){
  return function *(source:Iterable<A>):Iterable<B>{
    let index = 0;
    for(let item of source){
      yield txfm(item, index++);
    }
  }
}

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

### Blocks

* filter
* ignoreElements

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

function *ignoreElements(source:Iterable<any>):Iterable<never>{
  for(const item of source);
}
```

### With Distinction

* distinct
* distinctUntilChanged
* distinctUntilKeyChanged

```ts
function distinct<A, K>(keySelector:(item:A) => K){
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

function distinctUntilChanged<T, K>(comparator:(prev:K, curr:K) => boolean = (prev, curr) => prev === curr, keySelector:(item:T) => K = identity as (item:T) => K){
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

function distinctUntilKeyChanged<T, K extends keyof T>(key:K, compare: (x: T[K], y: T[K]) => boolean = (x, y) => x === y){
  return distinctUntilChanged<T, K>(compare, t => t[key]);
}
```

### Skip to the good parts

* skip
* skipWhile
* skipLast

```ts
function skip<T>(count:number){
  if(count <= 0) return identity;

  return function *(source:Iterable<T>):Iterable<T>{
    let remaining = count;
    for(const item of source){
      if(remaining <= 0){
        yield item;
      } else {
        remaining -= 1;
      }
    }
  }
}

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

### Material Girls

* materialize / dematerialize

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

## Short Circuit

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
