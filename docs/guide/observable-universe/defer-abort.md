# Bonus Build-it: `deferAbort`

One of the coolest things about RxJS is that there are tons of new patterns that show up, and instead of waiting for the library maintainers to get their act together, we can just make our own.  And one of the time-honoured practices of learning anything in the realm of Functional Programming is recreating the well-worn components.  So from time to time, we're gonna do the same.  We're going to take a general-purpose problem, and go step-by-step making our own tools.  And today, I'm making a new creation operator called `deferAbort`.

Our use case is this: there's a JavaScript API called the [AbortController API](https://developer.mozilla.org/en-US/docs/Web/API/AbortController).  It's a way of providing a signal to stop a process.

<RunRx>

```ts
const abortController = new AbortController();
const abortSignal = abortController.signal;

abortSignal.addEventListener('abort', () => { log('Signal Abort Event'); });

log('Is Signal Aborted?', abortSignal.aborted);

setTimeout(() => {
    log('About to abort');
    abortController.abort();
    log('Is Signal Aborted?', abortSignal.aborted);
}, 1000);
```

</RunRx>

There's more to the API, like how you can create an `AbortSignal` with a timeout or combine a few together, but that's neither here nor there.  Since this is native to JavaScript, there are a lot of different APIs, including other 3rd party APIs, that use this for their cancellation logic.  So what I want is to be able to coerce these APIs into Observables, but that means I'll have to create and control an `AbortSignal`.

What I want is to create a version of `defer` whose factory accepts an `AbortSignal` as a parameter and returns an `ObservableInput` like we discussed.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  /* TODO: fill this in */ 
}
```

Let's start by returning an Observable created with the Observable constructor.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>) {
  return new Observable<T>((subscriber) => {
    /* TODO: fill this in */ 
  });
}
```

Let's assume there'll be some setup and some teardown.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>) {
  return new Observable<T>((subscriber) => {
    /* Setup */
    
    /* Teardown */
     
  });
}
```

Well, if we map the logic of `AbortController` to Observables, we probably create an `AbortController` in the setup and call its `.abort()` method in the teardown.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>) {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    
    /* Teardown */
    return () => { abortController.abort(); }; 
  });
}
```

That's a good start.  Now let's get the signal out of there.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>){
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    
    /* Teardown */
    return () => { abortController.abort(); }; 
  });
}
```

Now let's use the factory and our `AbortSignal` to create our `ObservableInput<T>`.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>) {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const observableInput = factory(abortSignal);
    
    /* Teardown */
    return () => { abortController.abort(); }; 
  });
}
```

We can use `from` to coerce the `ObservableInput<T>` into a real `Observable<T>`...

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>) {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const observableInput = factory(abortSignal);
    const observable$ = from(observableInput);
    
    /* Teardown */
    return () => { abortController.abort(); }; 
  });
}
```

And then we can subscribe the `subscriber` to it.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>) {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const observableInput = factory(abortSignal);
    const observable$ = from(observableInput);
    const subscription = observable$.subscribe(subscriber);
    
    /* Teardown */
    return () => { abortController.abort(); }; 
  });
}
```

We also need to return the Subscription as teardownLogic, so let's combine that with the abort.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>) {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const observableInput = factory(abortSignal);
    const observable$ = from(observableInput);
    const subscription = observable$.subscribe(subscriber);
    
    /* Teardown */
    subscription.add(() => { abortController.abort(); });
    return subscription;
  });
}
```

Let's crunch a few of these back together.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>) {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const subscription = from(factory(abortController.signal)).subscribe(subscriber);
    
    /* Teardown */
    subscription.add(() => { abortController.abort(); });
    return subscription;
  });
}
```

I'm going to make up an example API.  Let's create a `countUp` function that takes an `AbortSignal`.

```ts
async function *countUp(signal: AbortSignal): AsyncGenerator<number> {
  let n = 0;
  while(!signal.aborted){
    await new Promise(r => setTimeout(r, 1000));
    yield ++n;
  }
}
```

Pretty dang gnarly.  But with `deferAbort` it just becomes another `Observable<number>`, and can plug in with the rest of our code.

<RunRx height="12rem">

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const subscription = from(factory(abortController.signal)).subscribe(subscriber);
    
    /* Teardown */
    subscription.add(() => { abortController.abort(); });
    return subscription;
  });
}

// Our gnarly, Rx-unfriendly 3rd party API
async function *countUp(signal: AbortSignal): AsyncGenerator<number> {
  let n = 0;
  while(!signal.aborted){
    await new Promise(r => setTimeout(r, 1000));
    yield ++n;
  }
}

// Now ready to fit into our Rx flow!
const countUp$ = deferAbort(countUp);

const sub = subscribe(countUp$);

setTimeout(() => { 
  sub.unsubscribe(); 
  log('Unsubscribing');
}, 3500);
```

</RunRx>

