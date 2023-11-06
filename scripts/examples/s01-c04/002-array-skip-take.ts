import { from, tap, skip, take } from "rxjs"
import { debug } from "../utils"

from([1,2,3,4,5])
  .pipe(
    tap(debug('Source')),
    skip(1), 
    tap(debug('After Skip')),
    take(3),
    tap(debug('After Take'))
  ).subscribe()

// CONSOLE:
// After Take Subscribe
// After Skip Subscribe
// Source Subscribe
// Source Next 1
// Source Next 2
// After Skip Next 2
// After Take Next 2
// Source Next 3
// After Skip Next 3
// After Take Next 3
// Source Next 4
// After Skip Next 4
// After Take Next 4
// After Take Complete
// Source Unsubscribe
// After Skip Unsubscribe
