---
layout: post
title: "1. Decision Making under Uncertainity"
date: 2026-05-25
description: "Introductory notes on decisions, uncertainty, risk, and information gathering."
tags: [decision-making, uncertainty, stochastic-control, communication, risk]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# 1. Decision Making under Uncertainity

Source: [YouTube lecture](https://youtu.be/EL1URMIIhLg?si=XN7s8xQ05DuqJeSI)

## Big Picture

The course is called **Stochastic Control and Communication**, but the broader theme is **decision making under uncertainty**.

The main claim is that several fields can be studied through one common framework:

- stochastic control
- information theory and communication theory
- team decision theory
- collaborative decision making
- economics and organization theory

These areas look different on the surface, but they share the same core structure: a decision maker must choose an action while some important part of the problem is unknown.

---

## What Is a Decision?

A **decision** is a choice from a set of alternatives.

It may be:

- the value assigned to a variable
- one action selected from a feasible set
- one policy chosen from many possible policies

In mathematical models, the decision is usually represented by a variable whose value the decision maker controls.

---

## What Is Uncertainty?

**Uncertainty** refers to a variable or aspect of the problem whose value is:

- not fixed in advance, or
- not known at the time the decision must be made

So the key difficulty is timing: the decision has to be made before the uncertain variable reveals its actual value.

For example, a decision maker may only know:

- the range of possible values
- a probability distribution
- partial information about the variable
- observations that are noisy or delayed

The decision must be chosen using only this limited information.

---

## Decision Making Without Uncertainty

If there is no uncertainty, all elements of the problem are fully known and have definite values.

Then the problem is simpler:

1. identify the fixed value of every relevant variable
2. evaluate the consequences of each possible decision
3. choose the best decision for that known scenario

In this setting, the best decision can be tuned exactly to the known state of the world.

---

## Decision Making With Uncertainty

Under uncertainty, the uncertain variable can take many possible values. Each value may create a different scenario, and the best decision may be different in each scenario.

The problem is that the decision maker usually cannot wait until the scenario is known. A single decision must be chosen before the uncertainty is resolved.

This creates the central tension:

> The decision should work well across possible scenarios, even though the true scenario is not yet known.

This is the common feature behind stochastic control, communication, team decision theory, and many economic models.

---

## Two Key Aspects

Whenever uncertainty enters a decision problem, two major issues appear.

### 1. Risk

Risk is an unavoidable part of decision making under uncertainty.

Here, risk should not be understood only in the everyday sense, such as "a slippery road is risky" or "betting is risky." The lecture emphasizes that risk will later be defined more formally.

For now, the important idea is:

- uncertainty creates multiple possible outcomes
- some outcomes may be much worse than others
- the decision maker must account for this variation, not only the average outcome

Risk cannot simply be ignored because it is built into the structure of the problem.

### 2. Information Gathering

Because the uncertain variable is not known, the decision maker naturally wants more information.

This brings in questions such as:

- What information is available?
- When is it revealed?
- In what sequence is it revealed?
- Who observes what?
- Can information be transmitted?
- Can information leak?

The structure of information can completely change the problem. The same decision problem may become easy, hard, centralized, decentralized, or strategic depending on who knows what and when they know it.

This is why communication and information theory are deeply connected to decision making under uncertainty.

---

## Example: The Cake Lottery

Suppose one cake is worth 100 rupees.

You are offered a lottery:

- pay 100 rupees to enter
- with probability $2/3$, receive 3 cakes
- with probability $1/3$, receive 0 cakes

The expected number of cakes is:

$$
\frac{2}{3} \cdot 3 + \frac{1}{3} \cdot 0 = 2
$$

So the lottery gives 2 cakes on average.

Since 100 rupees can buy only 1 cake, a simple expected-value argument says the lottery is attractive:

$$
\text{average outcome} = 2 \text{ cakes} > \text{cost} = 1 \text{ cake}
$$

According to this logic, one should enter the lottery.

---

## Why Expected Value Alone Is Not Enough

Now scale the same structure up.

Suppose one house costs 1 crore rupees. You are offered another lottery:

- pay 1 crore rupees to enter
- with probability $2/3$, receive a house three times as large
- with probability $1/3$, receive no house

The expected outcome is again favorable:

$$
\frac{2}{3} \cdot 3 + \frac{1}{3} \cdot 0 = 2
$$

On average, the lottery gives the value of a house twice as large as the original house.

If we use the same expected-value logic as before, we should enter this lottery too.

But most people would reject it. Losing 100 rupees in the cake example and losing 1 crore rupees in the house example are not psychologically or practically equivalent, even if the expected-value calculation has the same form.

This reveals the flaw in pure expected-value reasoning:

> Preferences under uncertainty do not necessarily scale linearly with the size of the outcome.

The cost of a bad outcome matters, not just the average outcome.

---

## Lesson From the Lottery Examples

The cake and house lotteries have the same mathematical expected-value structure, but they feel very different.

This difference is the first signal that risk must be modeled more carefully.

Expected value compares average outcomes, but it does not capture:

- downside severity
- aversion to large losses
- nonlinear preferences
- the fact that stakes matter
- how much the decision maker values security

This motivates a more sophisticated model of risk, such as utility-based decision making, where outcomes are evaluated through preferences rather than raw numerical value alone.

---

## Takeaways

- Decision making under uncertainty studies choices made before all relevant variables are known.
- A decision is a choice from alternatives.
- Uncertainty is a variable whose value is not fixed or not known at decision time.
- Without uncertainty, the decision maker can optimize for a known scenario.
- With uncertainty, one decision must work across many possible scenarios.
- Two fundamental issues are risk and information.
- Risk arises because uncertain outcomes can vary in value and severity.
- Information matters because what is known, when it is known, and who knows it can change the entire problem.
- Expected value is useful but incomplete; it can fail to capture how people evaluate risky decisions.
