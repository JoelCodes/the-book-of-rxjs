import { from, tap, startWith, endWith } from "rxjs"
import { debug } from "../utils"

from([1,2,3])
  .pipe(
    tap(debug('Source')),
    startWith(0), 
    tap(debug('After StartWith')),
    endWith(4),
    tap(debug('After EndWith'))
  ).subscribe()