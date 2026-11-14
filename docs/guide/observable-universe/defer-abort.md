# Bonus: Writing `deferAbort`

::: info Draft in progress
This page is a stub — the walkthrough is on its way.
:::

Okay, we've talked a lot about making Observables, so I'm going to step you through an interesting exercise: designing a new creation operator.

Our use case is this: there's a JavaScript API called the AbortController.  It's a way of providing a signal to stop a process.

```ts
const abortController = new AbortController();
const abortSignal = abortController.signal;

abortSignal.addEventListener('abort', () => { console.log('Signal Aborted'); });

console.log('Is Signal Aborted?', abortSignal.aborted);

console.log('About to abort');
abortController.abort();
console.log('Is Signal Aborted?', abortSignal.aborted);

// CONSOLE:
// Is Signal Aborted? false
// About to abort
// Signal Aborted
// Is Signal Aborted? true
```

There's more to the API, like how you can create an `AbortSignal` with a timeout or combine a few together, but that's neither here or there.  Since this is native to JavaScript, there are a lot of different APIs, including other 3rd party APIs, that use this for their cancellation logic.  So what I want is to be able to coerce these APIs into Observables, but that means I'll have to create and control an `AbortSignal`.

What I want is to create a version of `defer` whose factory accepts an `AbortSignal` as a parameter and returns an `ObservableInput`like we discussed..

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  /* TODO: fill this in */ 
}
```

Let's start by returning an Observable created with the Observable constructor.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>((subscriber) => {
    /* TODO: fill this in */ 
  });
}
```

Let's assume there'll be some setup and some teardown.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>((subscriber) => {
    /* Setup */
    
    /* Teardown */
     
  });
}
```

Well, if we map the logic of `AbortController` to Observables, we probably create an `AbortController` in the setup and call its abort in the teardown.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    
    /* Teardown */
    return () => { abortController.abort(); }; 
  });
}
```

That's a good start.  And let's get the signal out of there.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    
    /* Teardown */
    return () => { abortController.abort(); }; 
  });
}
```

Now let's use the factory to create our `ObservableInput<T>`.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
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
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
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
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
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
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const abortSignal = abortController.signal;
    const observableInput = factory(abortSignal);
    const observable$ = from(observableInput);
    const subscription = observable$.subscribe(subscriber);
    
    /* Teardown */
    return subscription.add(() => { abortController.abort(); }); 
  });
}
```

Let's crunch a few of these back together.

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const subscription = from(factory(abortController.signal)).subscribe(subscriber);
    
    /* Teardown */
    return subscription.add(() => { abortController.abort(); }); 
  });
}
```

I'm going to make up an example API.  Let's create a `countUp` function that takes an `AbortSignal`.

```ts
async function *countUp(signal) {
  let n = 0;
  while(!signal.aborted){  
    await new Promise(r => setTimeout(r, 1000));
    yield ++n;
  }  
}
```

<RunRx height="12rem">

```ts
function deferAbort<T>(factory: (signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>((subscriber) => {
    /* Setup */
    const abortController = new AbortController();
    const subscription = from(factory(abortController.signal)).subscribe(subscriber);
    
    /* Teardown */
    return subscription.add(() => { abortController.abort(); }); 
  });
}

async function *countUp(signal) {
  let n = 0;
  while(!signal.aborted){  
    await new Promise(r => setTimeout(r, 1000));
    yield ++n;
  }  
}

const countUp$ = deferAbort(countUp);

const sub = countUp$.subscribe((n) => {
  log('Next', n);
  if(n >= 3) {
    log('Unsubscribing');
    sub.unsubscribe();
  }
});
```

</RunRx>

The source lives in the repo at `scripts/examples/s01-c02/000-defer-with-abort.ts`.
