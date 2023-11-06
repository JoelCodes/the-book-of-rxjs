import { from, tap, map, filter } from "rxjs"
import { debug } from "../utils"

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
