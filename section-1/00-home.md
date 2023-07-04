# Section 1: A Tour of the Library

[<<Prev](../00-what-is-rxjs.md) | [Home](../README.md) | [Next >>](./01-the-observable-universe.md)

If I'm being honest, I'm not sure how to describe what comes next.

You see, I've read many books on programming, and I've read many API references.  They both have their aims, they both have their limitations, and they both have a familiar structures based on that.  Books tend to be well categorized by concept, but not exhaustive.  API references are exhaustive, but rarely categorized by concepts.

Well, this is going to be *both* a book *and* a reference.  

We're going to go through every. Single. Component. In. The. Library.  Every class, every function, every type.  Every single Observable, Subject, Scheduler, and operator will have its name, an explanation, and code examples.  Even the deprecated members, so that you know what they're doing when you see them in the wild.

But be warned: this tour takes a different approach to organizing that information.  Rather than just presenting an alphabetical list, I've gone over every single member and grouped them by the problem space (or spaces) that they address.  In doing that, I recognized 6 different things that you might want to do, and the library components that address them.

* Making Observables
* Data Transformation
* Managing Processes
* Timing
* Combining Observables Together
* RxJS-Specific Shenanigans

So here's how this is going to work:  Each category is a chapter.  I'm also adding a chapter for types and a chapter for deprecated members.  We're going to discuss the "sub-problems" within that, and then talk about all the components that address that.

## How To Keep Your Brains From Exploding

"But isn't that... you know... a lot?"

Yes.  Yes it is.

So here's the most important piece of advice I can give:

> ***YOU DON'T HAVE TO READ IT THROUGH ALL AT ONCE!!!***
> 
> This tour ***IS NOT*** meant to take you gently from beginner to expert!  
>
> If you try to read it all the way through, line by line, it can be really intimidating.
>
> Sometimes, the most important thing you can take away is "*X* can be done", and you can come back later to find out, "This is how to do *X*"

My intent with this tour is really threefold:
1. Give you a high-level, cloudy understanding of the RxJS library that refines with each reading;
2. Let you approach the text with a specific problem (e.g. "How do I keep an Observable from giving me too much data in a given time window?") and go directly to the chapter that deals with that; and
3. When you're wondering what a certain function or class does, give you a context for it, and possibly compare and contrast it with similar functions or classes.

So, Here's what I recommend:

* Skim through each chapter, reading the section titles and seeing what items get mentioned.
* Look through the examples.
* Try out some of these on your own, either in little examples, or by building little apps.
* Rinse and repeat.

And, everything in every chapter will be cross-referenced in the index, so you'll be able to use that to search for anything that's in the library.

Well, with no further ado, and no more gilding of the lily, let's start by looking at the basic building blocks of RxJS: Observers, Observables, and Subscriptions.

[<<Prev](../00-what-is-rxjs.md) | [Home](../README.md) | [Next >>](./01-the-observable-universe.md)
