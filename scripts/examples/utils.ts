import { TapObserver } from "rxjs";

export function debug(label:string, withFinalize = false):Partial<TapObserver<any>> {
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
