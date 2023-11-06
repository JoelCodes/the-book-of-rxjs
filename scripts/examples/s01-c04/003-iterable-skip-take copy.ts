import { from, tap, skip, take } from "rxjs"
import { debug } from "../utils";

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