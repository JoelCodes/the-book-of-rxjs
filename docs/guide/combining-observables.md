# Chapter 6: Combining Observables

> NOTE:  This is currently just an outline.  Real prose and code are coming, I promise.

## Combine and Flatten

### Three ways to Concat

* concat, concatWith
* merge, mergeWith
* race, raceWith

### The Four flatMaps

* mergeAll, mergeMap, mergeScan
* switchAll, switchMap, switchScan
* concatAll, concatMap
* exhaustAll, exhaustMap

## Combine without flattening

* combineLatest, combineLatestAll, combineLatestWith
* withLatestFrom
* zip, zipAll, zipWith
* forkJoin

## Controlling One Observable With Another

* takeUntil, skipUntil
* window, windowWhen, windowToggle

## Let's make a new flatMap!

* semaphoreMap, semaphoreAll

