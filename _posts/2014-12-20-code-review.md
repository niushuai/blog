---
layout: post
title: Code Review
categories: Java
tags: CodeReview
---

看到一篇非常好的文章，特地转过来分享一下。原文地址：[Things Everyone Should Do: Code Review](http://goodmath.scientopia.org/2011/07/06/things-everyone-should-do-code-review/)

---

As I alluded to in my last post (which I will be correcting shortly), I no longer work for Google. I still haven't decided quite where I'm going to wind up - I've got a couple of excellent offers to choose between. But in the interim, since I'm not technically employed by anyone, I thought I'd do a bit of writing about some professional things that are interesting, but that might have caused tension with coworkers or management.

Google is a really cool company. And they've done some really amazing things - both outside the company, where users can see it, and inside the company. There are a couple of things about the inside that aren't confidential, but which also haven't been discussed all that widely on the outside. That's what I want to talk about.

The biggest thing that makes Google's code so good is simple: code review. That's not specific to Google - it's widely recognized as a good idea, and a lot of people do it. But I've never seen another large company where it was such a universal. At Google, no code, for any product, for any project, gets checked in until it gets a positive review.

Everyone should do this. And I don't just mean informally: this should really be a universal rule of serious software development. Not just product code - everything. It's not that much work, and it makes a huge difference.

What do you get out of code review?

There's the obvious: having a second set of eyes look over code before it gets checked in catches bugs. This is the most widely cited, widely recognized benefit of code review. But in my experience, it's the least valuable one. People do find bugs in code review. But the overwhelming majority of bugs that are caught in code review are, frankly, trivial bugs which would have taken the author a couple of minutes to find. The bugs that actually take time to find don't get caught in review.

The biggest advantage of code review is purely social. If you're programming and you know that your coworkers are going to look at your code, you program differently. You'll write code that's neater, better documented, and better organized -- because you'll know that people who's opinions you care about will be looking at your code. Without review, you know that people will look at code eventually. But because it's not immediate, it doesn't have the same sense of urgency, and it doesn't have the same feeling of personal judgement.

There's one more big benefit. Code reviews spread knowledge. In a lot of development groups, each person has a core component that they're responsible for, and each person is very focused on their own component. As long as their coworkers components don't break their code, they don't look at it. The effect of this is that for each component, only one person has any familiarity with the code. If that person takes time off or - god forbid - leaves the company, no one knows anything about it. With code review, you have at least two people who are familiar with code - the author, and the reviewer. The reviewer doesn't know as much about the code as the author - but they're familiar with the design and the structure of it, which is incredibly valuable.

Of course, nothing is every completely simple. From my experience, it takes some time before you get good at reviewing code. There are some pitfalls that I've seen that cause a lot of trouble - and since they come up particularly frequently among inexperienced reviewers, they give people trying code reviews a bad experience, and so become a major barrier to adopting code review as a practice.

The biggest rule is that the point of code review is to find problems in code before it gets committed - what you're looking for is correctness. The most common mistake in code review - the mistake that everyone makes when they're new to it - is judging code by whether it's what the reviewer would have written.

Given a problem, there are usually a dozen different ways to solve it. Andgiven a solution, there's a million ways to render it as code. As a reviewer, your job isn't to make sure that the code is what you would have written - because it won't be. Your job as a reviewer of a piece of code is to make sure that the code as written by its author is correct. When this rule gets broken, you end up with hard feelings and frustration all around - which isn't a good thing.

The thing is, this is such a thoroughly natural mistake to make. If you're a programmer, when you look at a problem, you can see a solution - and you think of what you've seen as the solution. But it isn't - and to be a good reviewer, you need to get that.

The second major pitfall of review is that people feel obligated to say something. You know that the author spent a lot of time and effort working on the code - shouldn't you say something?

No, you shouldn't.

There is never anything wrong with just saying "Yup, looks good". If you constantly go hunting to try to find something to criticize, then all that you accomplish is to wreck your own credibility. When you repeatedly make things to criticize just to find something to say, then the people who's code you review will learn that when you say something, that you're just saying it to fill the silence. Your comments won't be taken seriously.

Third is speed. You shouldn't rush through a code review - but also, you need to do it promptly. Your coworkers are waiting for you. If you and your coworkers aren't willing to take the time to get reviews done, and done quickly, then people are going to get frustrated, and code review is just going to cause frustration. It may seem like it's an interruption to drop things to do a review. It shouldn't be. You don't need to drop everything the moment someone asks you to do a review. But within a couple of hours, you will take a break from what you're doing - to get a drink, to go to the bathroom, to talk a walk. When you get back from that, you can do the review and get it done. If you do, then no one will every be left hanging for a long time waiting on you.
