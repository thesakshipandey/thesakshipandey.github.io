---
layout: post
title: "7. Inventory Control Problem II"
date: 2026-05-26
description: "Backlogged demand, inventory costs, closed-loop policies, and why stochastic problems require strategies rather than fixed actions."
tags: [decision-making, uncertainty, inventory-control, stochastic-control, policies]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# 7. Inventory Control Problem II

Source: [YouTube lecture](https://youtu.be/IeajGgUgUXw?si=duh2rSLIplKOa6-6)

## Recap

In the inventory-control model:

- $x_k$ is the stock available at the beginning of period $k$
- $u_k$ is the additional stock ordered at the beginning of period $k$
- $w_k$ is the random demand during period $k$

The order is assumed to be delivered immediately.

The timing in each period is:

1. $x_k$ becomes known.
2. $u_k$ is chosen.
3. demand $w_k$ is realized.

So the inventory decision is made before the demand for that period is known.

---

## Backlogged Demand

The lecture assumes that unfulfilled demand can be backlogged.

This means if demand cannot be satisfied in the current period, it can be carried forward and fulfilled in later periods.

As a result, inventory can be negative:

- $x_k > 0$ means positive stock is available
- $x_k < 0$ means there is backlog or unfulfilled demand

This allows the state to take values on the real line, not just nonnegative values.

---

## Inventory Dynamics

Because backlogging is allowed, the next inventory state is:

$$
x_{k+1} = x_k + u_k - w_k
$$

Interpretation:

- start with stock $x_k$
- order additional stock $u_k$
- demand $w_k$ consumes stock
- the remaining stock, possibly negative, becomes $x_{k+1}$

If:

$$
w_k > x_k + u_k
$$

then demand exceeds available inventory, and:

$$
x_{k+1} < 0
$$

This negative inventory represents backlogged demand.

---

## Stage Cost

At each time period, there is a cost:

$$
r(x_k) + c u_k
$$

where:

- $r(x_k)$ is the inventory-related penalty
- $cu_k$ is the purchasing cost
- $c$ is the per-unit purchasing cost

The function $r(x_k)$ can capture two kinds of penalties.

### Positive Stock

If $x_k > 0$, then $r(x_k)$ can represent a holding cost:

- storage cost
- excess inventory cost
- cost of keeping unsold stock

### Negative Stock

If $x_k < 0$, then $r(x_k)$ can represent a shortage cost:

- penalty for unfulfilled demand
- customer dissatisfaction
- cost of delayed fulfillment

So $r(x_k)$ penalizes both too much inventory and too little inventory.

---

## Terminal Cost

At the end of the horizon, there may be leftover inventory or backlog.

This is captured by a terminal cost:

$$
R(x_N)
$$

where $x_N$ is the inventory state at time $N$.

The terminal cost penalizes being left with inventory or backlog after the final period.

---

## Total Cost Objective

The total cost is:

$$
R(x_N) + \sum_{k=0}^{N-1} \left(r(x_k) + c u_k\right)
$$

Since demand is random, the states are random, and the total cost is random.

The stochastic control objective is therefore:

$$
\min \mathbb{E}\left[
R(x_N) + \sum_{k=0}^{N-1} \left(r(x_k) + c u_k\right)
\right]
$$

The order quantity must satisfy:

$$
u_k \geq 0
$$

because the store can order additional stock but cannot return existing stock in this model.

---

## Open-Loop and Closed-Loop Inventory Policies

In an **open-loop** model, the sequence:

$$
u_0,u_1,\ldots,u_{N-1}
$$

is chosen before the uncertainties are realized.

This gives a fixed ordering schedule that does not react to actual inventory levels or realized demand.

In a **closed-loop** model, the order quantity at time $k$ is chosen using the information available at time $k$.

Here the relevant information is the current inventory state $x_k$, so:

$$
u_k = \mu_k(x_k)
$$

This means the order quantity adapts to the stock level observed at the beginning of the period.

---

## Action vs. Strategy

The lecture emphasizes a key distinction:

- an **action** is the actual order quantity $u_k$
- a **strategy** or **decision rule** is a function $\mu_k$ that tells us what action to take for each possible state

In real time, after observing $x_k$, the decision maker takes an action:

$$
u_k
$$

But before the system evolves, the decision maker cannot know what $x_k$ will be in the future. So the decision maker cannot pre-select the exact future action.

Instead, the decision maker must choose a plan:

$$
\mu_k: x_k \mapsto u_k
$$

This plan specifies what to do for every possible inventory level that may be realized.

---

## Policies

A full plan over the horizon is a sequence:

$$
\mu_0,\mu_1,\ldots,\mu_{N-1}
$$

This sequence is called a **policy**.

Each $\mu_k$ is:

- a strategy
- a decision rule
- a mapping from state to action

In this inventory model:

$$
\mu_k: \mathbb{R} \to [0,\infty)
$$

because:

- the state $x_k$ can be any real number due to backlogging
- the action $u_k$ must be nonnegative

---

## Correct Optimization Variable

The closed-loop problem is not really:

$$
\min_{u_0,\ldots,u_{N-1}} \mathbb{E}\left[
R(x_N) + \sum_{k=0}^{N-1} \left(r(x_k) + c u_k\right)
\right]
$$

because the future $u_k$ values cannot be fixed in advance without knowing the future states.

Instead, the correct problem is:

$$
\min_{\mu_0,\ldots,\mu_{N-1}} \mathbb{E}\left[
R(x_N) + \sum_{k=0}^{N-1} \left(r(x_k) + c\mu_k(x_k)\right)
\right]
$$

subject to:

$$
x_{k+1} = x_k + \mu_k(x_k) - w_k
$$

and:

$$
\mu_k(x_k) \geq 0
$$

The decision variables are functions, not numbers.

---

## Why Stochasticity Changes the Problem

If demand were deterministic and known in advance, future inventory levels would be known.

Then one could choose a fixed sequence of actions:

$$
u_0,u_1,\ldots,u_{N-1}
$$

But demand is random. Therefore future inventory levels are random.

At time 0, the decision maker cannot know what action should be taken at future times because future states are not yet known.

The best one can do is choose rules that say:

> If this stock level occurs, take this action.

This is why stochastic decision problems are naturally formulated over strategies or policies.

---

## Lifting from Actions to Functions

In deterministic optimization, the decision variables may be scalars or vectors.

In stochastic sequential decision making, the decision variables are often functions:

$$
\mu_k: \text{state space} \to \text{action space}
$$

For this inventory problem:

$$
\mu_k: \mathbb{R} \to [0,\infty)
$$

This makes stochastic decision problems harder than deterministic ones.

The problem is lifted from choosing quantities to choosing functions.

---

## Takeaways

- Backlogged demand allows inventory $x_k$ to become negative.
- The inventory dynamics are $x_{k+1}=x_k+u_k-w_k$.
- The stage cost is $r(x_k)+cu_k$.
- $r(x_k)$ captures holding costs for positive stock and shortage costs for negative stock.
- The terminal cost is $R(x_N)$.
- The constraint $u_k \geq 0$ reflects that stock can be ordered but not returned.
- In closed-loop control, $u_k$ is chosen as a function of $x_k$.
- The true optimization variables are decision rules $\mu_k$, not realized actions $u_k$.
- A policy is a sequence of decision rules $\mu_0,\ldots,\mu_{N-1}$.
- Stochasticity lifts the problem from choosing actions to choosing functions.
