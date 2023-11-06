import { ObservableInput, Observable, from } from "rxjs";

function deferWithAbort<T>(factory:(signal:AbortSignal) => ObservableInput<T>):Observable<T> {
  return new Observable<T>(observer => {
    const controller = new AbortController();
    return from(factory(controller.signal))
      .subscribe(observer)
      .add(() => { controller.abort(); });
  });
}

function countSlowlyTillAbort(signal:AbortSignal, cb:(n:number) => void){
  let n = 0;
  function tick(){
    if(signal.aborted) return;
    cb(n++);
    setTimeout(tick, 1000);
  }
  tick();
}

const subscription = deferWithAbort(signal => new Observable(observer => {
  countSlowlyTillAbort(signal, x => observer.next(x))
})).subscribe(console.log);

setTimeout(() => {
  subscription.unsubscribe();
}, 3500);
