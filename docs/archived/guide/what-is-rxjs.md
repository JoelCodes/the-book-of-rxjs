# What is RxJS?

## RxJS In A Nutshell

If you need a two-sentence description of RxJS written in plain English, here it is:

> RxJS is a platform-agnostic library that allows you to express your data sources and processes as streams of data.  It also includes a host of operators to transform, compose, and control these streams in a declarative style, and takes care of setup and teardown behind the scenes.

But maybe we need to define what we mean by some of these terms if pressed. For instance, what kind of "data sources" and "processes" are we talking about? Well, this could be anything from:

* Arrays, Promises, Iterables, and AsyncIterables
* AJAX calls and other async operations
* Live connections to data like Websockets
* DOM Events
* Timing mechanisms like `setInterval` and `setTimeout`

By using a unified interface, we can easily change things about our sources.  For instance, if you had a game with movement, and you wanted to move left and right based on the "A" and "D" keys or the "Z" and "X" keys, or clicking buttons with the ids "#left" and "#right", you could just get all of them!

```ts
type Move = 'LEFT'|'RIGHT'

const keyMaps:Record<string, Move> = {
  'a': 'LEFT',
  'd': 'RIGHT',
  'z': 'LEFT',
  'x': 'RIGHT',
  'arrowleft': 'LEFT',
  'arrowright': 'RIGHT'
}

const movesFromKeys = fromEvent<KeyboardEvent>(document, 'keydown').pipe(
  map((keyEvent):Move|undefined => keyMaps[keyEvent.key.toLowerCase()]),
  filter((move):move is Move => move !== undefined)
)

const movesFromLeftButton = fromEvent<MouseEvent>(document.querySelector('#left'), 'click').pipe(
  map(() => 'LEFT' as const)
)

const movesFromRightButton = fromEvent<MouseEvent>(document.querySelector('#right'), 'click').pipe(
  map(() => 'RIGHT' as const)
);

const allMoves = merge(movesFromKeys, movesFromLeftButton, movesFromRightButton);
```

Okay, but what does "transform" mean here?  Well, we can take one of these streams and do things like:

* Map and filter items like you'd do with an array,
* End a stream early when we need to, triggering it to clean up after itself,
* Use timing and backpressure operations to delay, batch, or otherwise ignore data based on time, saving ourselves from unnecessary work.

And "compose"?  Composition is the true magic of RxJS.  We can take processes and do things like:

* Retry them if they fail.
* Repeat them as many times as we want.
* Concatenate them together so that one starts after another, or so that they all run and end together.
* Cause new processes to start and end based on incoming data and signals.

The "declarative" part is where the rubber meets the road.  RxJS creates an abstraction layer that can be composed, but understanding that abstraction can be a bit uncomfortable if you're not used to it.  It expands on some of the Functional Programming ideas that have been baked into JavaScript from the start, but expands on them in a way that can feel foreign if you're used to just doing things in a procedural way.

But I think that I might be able to make some of these decisions and abstractions make sense, and hopefully you can experience what I've experienced: a brand new lens for looking at your code.

## What is Reactive Programming?

The term "Reactive Programming" is something that gets thrown around a lot in the world of JavaScript, especially in the UI space.  React, currently the biggest UI framework, gets its name from the concept.  But what is Reactive Programming?  If you look online, you'll find a lot of definitions that talk about "data streams", but to me, that's more of an implementation detail.  

I have my own definition of "reactive" and it has the Joel Shinness guarantee: probably wrong, but in a useful way.  Here's how it goes.

1. Reactive programming identifies relationships between "Producers" and "Consumers" of data and signals.
1. Producers don't know about their Consumers.
1. Consumers don't know about their Producers.

Let's try an example.  Imagine that we're creating a game, and there's a `Player` class and a `Healthbar` class.  When the Player loses or recovers health, the internal rectangle on the healthbar needs to change.

Here's the *least* reactive way we could do that:

```ts
class Healthbar {
  internalRectangle: Rectangle;
  maxInternalRectangleWidth: number = 96;
}

const healthbar = new Healthbar();

class Player {
  health = 100;
  maxHealth = 100;
  takeDamage(n:number){
    this.health = Math.max(0, Math.min(this.maxHealth, this.health - n));
    healthbar.internalRectangle.width = healthbar.maxInternalRectangleWidth * this.health / this.maxHealth;
  }
}

const player = new Player();
```

I mean, let's just list all the issues here:

* We can't test the Player class without a `healthbar` instance already existing.
* If we get rid of, rename, or refactor the healthbar, we have to change the `Player` class as well.
* How do we know that there's implementation details about the `healthbar` hiding in the `Player` class?
* What if there are more and more indicators that need to change when the player's health changes?
* What if there's more than just the `player` instance that affect the healthbar?

We can get rid of some of these problems by switching the directions, making the Player the "Producer", the healthbar the "Consumer", and making the "Producer" responsible for sending a signal, while the "Consumer" is responsible for doing the work once that signal is sent.

```ts
type PlayerHealthState = {health:number, maxHealth:number};
type PlayerUpdateListener = (type: 'HEALTH'|'OTHER') => void;

class Player {
  health = 100;
  maxHealth = 100;
  listeners: PlayerUpdateListener[] = [];
  listenToUpdates(listener:PlayerUpdateListener){
    listeners.push(listener);
  }
  get healthState():PlayerHealthState{
    const {health, maxHealth} = this;
    return {health, maxHealth};
  }
  takeDamage(n:number){
    this.health = Math.max(0, Math.min(this.maxHealth, this.health - n));
    listeners.forEach(listener => { listener('HEALTH'); });
  }
}

const player = new Player();

class Healthbar {
  internalRectangle: Rectangle;
  maxInternalRectangleWidth: number = 96;
  constructor(){
    player.listenToUpdates((type) => {
      if(type === 'HEALTH'){
        this.update();
      }
    })
  }
  update(){
    const { health, maxHealth } = player.healthState
    this.internalRectangle.width = this.maxInternalRectangleWidth * health / maxHealth;
  }
}

const healthbar = new Healthbar();
```

Now there's a decent separation of concerns, since it makes more sense for an indicator to refer to the thing being indicated.  

However, we can include one more step to make this even more in line with Reactive Programming: we can hide the player from the healthbar.  There are a couple of ways that we can do this, such as making a global PubSub node, or abstracting the "signaling" part to its own type and passing that to the healthbar in the constructor.  Heck, we could do both!

## Monads!

So Reactive Programming encourages us to make this separation between producers and consumers of data.  Cool.  It's not hard to get behind that.  But there's another pattern at the heart of RxJS that drives a lot of the decisions around it, and it's the Monad pattern.

This is a term from a branch of Math called Category Theory, and it's popular in the world of Functional Programming.  It sounds pretty intimidating, but I'm gonna give you one of the most easy-peasy descriptions that'll win you points in any job interview.

Monads are:
* **data wrappers** (or data *providers*) that are:
* **Immutable**
* **Transformable**
* And **Combinable**.
* They usually abstract away some general-purpose programming challenge.

Good examples of these in JavaScript include Arrays, Promises, and Iterables.  Basically, any generic data structure that can follow the following rules counts.

Let's go through those 1 by 1.

### Immutable Data Wrappers

*Providers* is the more correct term, but I think wrappers is easier to think about.  A Monad must have at least some function to create a new wrapper given some data.  For instance, if we have the number `1`, we can create an array of just that by writing `[1]`.  We can also make a Promise by writing `Promise.resolve(1)` or the lengthier `new Promise(resolve => { resolve(1) })` and the possibly stranger `(async () => 1)();`  We can call that the `unit` function.

This isn't part of the formal definition, but there'll usually be some way to access or handle that data, often by using a callback like `[1].forEach(console.log)` or `Promise.resolve(1).then(console.log)`.

### Transformable

The idea of "Immutability" and "Transformation" may seem at odds, but in this case, we mean that we have Immutable Transformations: functions which give us new, transformed versions while leaving our source data intact.  In fact, many structures that follow the Monad pattern are absolutely mutable, so don't view mutablility as a disqualifier.  It just means that immutable transformations are present.

For instance, `[1, 2, 3].map(n => n * 2)` gives us a brand new array of `[2,4,6]` and leaves the original untouched, and calling `Promise.resolve(1).then(n => n * 2)` is equivalent to `Promise.resolve(2)`.

Fun fact: in Ruby, there often have two versions of methods like these.  One would give you a new array without changing the underlying data, and one would change the underlying data.  They would have similar names, but the "spicier" version would end with an exclamation mark, so there'd be `collect` and `collect!`.  When I was talking about them, I'd often say the spicier version with emphasis.

Depending on the structure available, we might have other similar immutable transformations available, like `filter`, `reduce`, or `slice` on Arrays or `catch` on Promises, so that's noteworthy, but we only need `map` for this definition.

### Combinable

There are a number of functions that combine Arrays and Promises, but for the sake of this definition, we only really need one: `join`.  If you have a generic type `A<T>`, and there is some function to turn `A<A<T>>` into an `A<T>`, that's join.

With arrays, it's called `.flat()`.  For any type `T`, this function takes a `T[][]` and makes it into a `T[]`.  For instance `[[1,2],[3,4]].flat()` is the same as `[1,2,3,4]`.  In fact, `flatMap(proj:(a:A) => B[])` is (usually) equivalent to calling `map(proj:(a:A) => B[]).flat()`.  Promises have this logic built in, so when you create a `Promise<Promise<T>>`, it automagically flattens it into a `Promise<T>` every time.

So `flat` and `flatMap` meet this definition of `join` and `bind`.  You might also notice that the `.then` function of Promises is a value accessor AND a `map` AND a `bind` all at the same time.  It's a real hard worker.

Just like how there are multiple immutable transformations for arrays, there might also be various ways of combining a certain Monad that fall out of this base definition.  For instance, you can combine any number of Promises using `Promise.all` or `Promise.race`.  They both combine Promises, they just employ different strategies.

### Abstract away General Purpose Programming Idea

Generally speaking, when you're dealing with the Monad pattern in code, it's there to address some thing that you do all the time.  Here's a quick list:

* Iterables -> doing some operation one at a time for each value in some sequence until the sequence is empty or you quit.
* Arrays -> Having an unknown number of values in order
* Set -> Having an unknown number of unique values
* Promises -> Getting the result (or error) of some awaited value or operation

Another common example that isn't in JavaScript but is in Rust and Haskell is the `Option` or `Maybe` Monad.  It addresses "Not being sure if you have a value or not".  I think it'll provide a great example of how this looks in a simple application.

```ts
const NONE = {type: 'NONE'} as const;
type Option<T> = {type: 'SOME', value:T} | typeof NONE;

function unit<T>(value:T){
  return {type: 'SOME', value:T}
}

// This will only access if the option is a "SOME"
function access<T>(opt:Option<T>, cb:(val:T) => void){
  if(opt.type === 'SOME'){
    cb(opt.value);
  }
}

// This performs the map on the "SOME", and passes on the "NONE"
function map<A, B>(opt:Option<A>, txfm:(val:A) => B):Option<B>{
  if(opt.type === 'NONE') return opt;
  return unit(txfm(opt.value));
}

// This flattens on "SOME"
function join<A>(opt:Option<Option<A>>):Option<A>{
  if(opt.type === 'NONE') return opt;
  return opt.value
}

// This only transforms on "SOME"
function bind<A, B>(opt:Option<A>, txfm:(val:A) => Option<B>):Option<B>{
  if(opt.type === 'NONE') return opt;
  return txfm(opt.value);
}

// And here's an extra `concat` utility for funsies.
function firstIter<A>(opts:Option<A>[]):Option<A>{
  for(const opt of opts){
    if(opt.type === "SOME") return opt;
  }
  return NONE;
}
```

### But why the Monad?

Is their any real, tangible value of using this "Monad" lingo for any of this?

Yes.  Yes there is. The fact that we have Promises at all in JavaScript is a testament to this.  I remember the days of callback hell, and I remember when Promises were just libraries people brought into their projects, similar to RxJS today.  This is also the same with all those "immutable" methods in JavaScript arrays.  Once upon a time, I had to bring `lodash` or `underscore` into every project just to be able to do `map`, `filter`, or `reduce` on arrays.  But these constructs give us two important benefits:

1. **Code Readability.**  I'll be the first to admit that readability is a very subjective quality.  It can't really be measured in any meaningful way, especially in the small, so maybe the better way to say that is this: it provided a language.  Once you understood the language, it was really easy to make the leap about what certain code was doing.  For instance, if you had a bunch of sales data, and you wanted a total for all boat sales in March, you could write:

```ts
let total = 0;

for(const sale in allSales){
  // Sale dates are strings of YYYY-MM-DD
  if(!sale.date.startsWith('2023-03')) continue;
  for(const lineItem in sale.lineItems){
    if(lineItem.category === 'Boats'){
      total += sale.subtotal;
      break;
    }
  }
}

console.log(total);
```

But you could also write the following:
```ts
const total = allSales
  .filter(sale => sale.date.startsWith('2023-03'))
  .filter(sale => sale.lineItems.some(lineItem => lineItem.category === 'Boats'))
  .map(sale => sale.subtotal)
  .reduce((a, b) => a + b);
```

In the first one, I have to read really closely and pay attention to the `break` and `continue` to see what's going on.  It's not until I look closely that I realize that the behaviour inside the inner loop will only ever run once per `sale` record, if that.

In the second one, each line tells a story, but only if I'm fluent in "Array".

```ts
const total = allSales
  // For all sales in Mar 2023
  .filter(sale => sale.date.startsWith('2023-03'))
  // That have a lineItem with the category 'Boats',
  .filter(sale => sale.lineItems.some(lineItem => lineItem.category === 'Boats'))
  // Get that sale's subtotal,
  .map(sale => sale.subtotal)
  // Then add them all together to get one big sum.
  .reduce((a, b) => a + b);
```

2. **Code Equivalencies**.  This one is a little more abstract, but thanks to the monad laws, we have some knowledge about certain combinations of operations, and that gives us flexibility to change things around without losing guarantees.

For instance, I ran `filter` twice in a row.  If I have two tester functions `a` and `b`, then I can rely on a certain mathematical truth here: calling `items.filter(a).filter(b)` is going to give me the same output as calling `items.filter((...args) => a(...args) && b(...args))`.  I can split them or combine them as I see fit.  I like the legibility of the split I have above, but if I want to improve the performance, I can just combine them, and I know that I'll get the same output.

```ts
const total = allSales
  // For all sales in Mar 2023 that have a lineItem with the category 'Boats'
  .filter(sale => 
    sale.date.startsWith('2023-03') &&
    sale.lineItems.some(lineItem => lineItem.category === 'Boats'))
  // Get that sale's subtotal,
  .map(sale => sale.subtotal)
  // Then add them all together to get one big sum.
  .reduce((a, b) => a + b);
```

I can also change that `reduce` in a subtle way.  Currently, I have no seed value, so the first value is used.  In other words: `items.reduce(reducer)` is roughly equivalent to `const [first, ...rest] = items;  return rest.reduce(reducer, first)`.   But there is a case where they aren't equivalent: when `items` is empty.  In JavaScript, we get an undefined, but in other languages, they might give us an error.  So in order for me to make this foolproof, I do need to either provide a seed value, create a default value, or handle the `undefined` in my code to represent "No sales found".

```ts
  // either add a seed
  .reduce((a, b) => a + b, 0);

  // add a default
  .reduce((a, b) => a + b) ?? 0;

  // Handle it.
if(total === undefined) console.log('No Sales Data');
else console.log(`$${total} In Total Boat Sales`);
```

## Why Is RxJS So... Complicated?

## Where Do We Start?
