# Chapter 2: How to Make an Observable

[<<Prev](./01-the-observable-universe.md) | [Home](../README.md) | [Next >>](./03-array-like-operators.md)

So, you're up to speed on what an Observable is.  It's a thing that manipulates an Observer (or emits signals to an Observer), it represents a stream of data that may complete or throw an error, and it can represent some arbitrary async operation.

But how can we make one?

Well, there are plenty of utilities for just that purpose, and we're going to go through each and every one of them.  I've done my best to fit each of them into a convenient category, with a lightning round at the end for the oddballs.

## The Observable Constructor
## EMPTY and NEVER
## Turn a _ into an Observable
* of
* from
* defer
* fromEvent
* fromEventPattern
* bindCallback
* bindNodeCallback
## Subjects
* Subject
* BehaviorSubject
* ReplaySubject
* AsyncSubject
## Timing Creators
* interval
* timer
* animationFrames
* scheduled
## How To Talk To The Internet
* ajax
* fetch
* WebSocketSubject
## Lightning Round!!
* using
* range
* generate
* iif

[<<Prev](./01-the-observable-universe.md) | [Home](../README.md) | [Next >>](./03-array-like-operators.md)
