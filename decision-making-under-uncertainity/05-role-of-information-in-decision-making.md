---
layout: post
title: "5. Role of Information in Decision Making"
date: 2026-05-26
description: "A two-stage control example showing how information changes feasible policies and optimal values."
tags: [decision-making, uncertainty, information, sequential-decisions, stochastic-control]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# 5. Role of Information in Decision Making

Source: [YouTube lecture](https://youtu.be/PZBkfpuKj-A?si=8V1nCkJtvH5ur2je)

## Big Picture

So far, risk has been treated as one central feature of decision making under uncertainty.

The second central feature is **information**.

Information matters because the nature of a decision problem depends on what is known when each decision is made.

Changing the information structure can change:

- the feasible decisions
- the form of the optimal decision rule
- the optimal value of the objective
- whether the decision is a fixed scalar or an adaptive policy

The lecture illustrates this through a simple two-stage system.

---

## System Model

Consider a scalar system evolving over two time steps:

$$
x_1 = u_0 + w_0
$$

$$
x_2 = x_1 + u_1
$$

where:

- $x_1, x_2$ are the system states at times 1 and 2
- $u_0, u_1$ are decisions
- $w_0$ is an external random disturbance

The disturbance is:

$$
w_0 =
\begin{cases}
+1, & \text{with probability } 1/2,\\
-1, & \text{with probability } 1/2.
\end{cases}
$$

The objective is to choose $u_0$ and $u_1$ to minimize:

$$
\mathbb{E}[|x_2|]
$$

This is a decision problem under uncertainty because $w_0$ is not controlled by the decision maker.

---

## Information Structure 1: Decisions Chosen Before Uncertainty

First assume that both $u_0$ and $u_1$ are chosen **before** $w_0$ is realized.

Then $u_0$ and $u_1$ are deterministic scalars. They cannot depend on $w_0$, $x_1$, or any later information.

Using the system equations:

$$
x_2 = x_1 + u_1 = u_0 + w_0 + u_1
$$

So:

$$
|x_2| = |u_0 + u_1 + w_0|
$$

Taking expectation over the only random quantity, $w_0$:

$$
\mathbb{E}[|x_2|]
=
\frac{1}{2}|u_0 + u_1 + 1|
+
\frac{1}{2}|u_0 + u_1 - 1|
$$

Let:

$$
z = u_0 + u_1
$$

Then the objective becomes:

$$
\frac{1}{2}|z+1| + \frac{1}{2}|z-1|
$$

This is the average distance of $z$ from $-1$ and $+1$.

---

## Solving the Deterministic-Decision Case

If:

$$
z \in [-1,1]
$$

then:

$$
|z+1| + |z-1| = 2
$$

and therefore:

$$
\frac{1}{2}|z+1| + \frac{1}{2}|z-1| = 1
$$

If $z$ lies outside $[-1,1]$, the sum of distances becomes larger.

Therefore:

$$
\min_{u_0,u_1}\mathbb{E}[|x_2|] = 1
$$

and the minimum is attained whenever:

$$
u_0 + u_1 \in [-1,1]
$$

There are many optimal deterministic pairs $(u_0,u_1)$, but all of them achieve the same optimal value:

$$
1
$$

---

## Information Structure 2: Sequential Decisions

Now change the information structure.

Assume:

- $u_0$ is chosen before $w_0$ is realized
- $x_1$ is then realized
- $x_1$ is known to the decision maker when choosing $u_1$

So $u_1$ is not just a fixed scalar anymore. It can be a function of the observed state:

$$
u_1 = \gamma_1(x_1)
$$

This turns the decision problem into a policy-design problem.

The decision maker is no longer choosing just two numbers. The decision maker chooses:

- a scalar $u_0$
- a rule or policy for how to choose $u_1$ after observing $x_1$

---

## Solving the Sequential Case

The objective is still:

$$
\mathbb{E}[|x_2|]
$$

and:

$$
x_2 = x_1 + u_1
$$

But now $x_1$ is known when choosing $u_1$.

So choose:

$$
u_1 = -x_1
$$

Then:

$$
x_2 = x_1 + (-x_1) = 0
$$

Therefore:

$$
\mathbb{E}[|x_2|] = 0
$$

This is the smallest possible value because absolute value is always nonnegative.

So under this information structure:

$$
\min \mathbb{E}[|x_2|] = 0
$$

Here $u_0$ can be any scalar. Its value does not matter because once $x_1$ is observed, $u_1$ can exactly cancel it.

---

## Comparing the Two Information Structures

The only difference between the two cases is what is known when $u_1$ is chosen.

| Case | What is allowed? | Optimal value |
|---|---|---|
| Both decisions chosen before $w_0$ | $u_0,u_1$ are deterministic scalars | $1$ |
| $u_1$ chosen after observing $x_1$ | $u_1$ can be a function of $x_1$ | $0$ |

The second case performs better because the decision maker can adapt the second decision to observed information.

This shows that information has real operational value. It changes what decisions are available and can improve the best achievable objective value.

---

## Actions vs. Policies

In the first problem, the decision maker chooses actions:

$$
u_0, u_1 \in \mathbb{R}
$$

In the second problem, the decision maker chooses a policy:

$$
u_1 = \gamma_1(x_1)
$$

A policy is a rule that maps available information to an action.

This distinction is fundamental in sequential decision making. Once decisions happen over time, it is not enough to specify actions. One must specify what information each action can depend on.

---

## Role of Information

This example shows that the information structure determines the problem.

Changing the information structure changes:

- whether decisions are deterministic numbers or functions of observations
- the set of feasible strategies
- the optimal policy
- the optimal value

In the first case, the decision maker cannot react to the random disturbance. In the second case, the decision maker observes $x_1$ and can choose $u_1$ to cancel the state exactly.

So information is not merely a detail in the model. It is part of the model itself.

---

## Toward Sequential Decision Models

The lectures so far have isolated two core aspects of decision making under uncertainty:

1. **Risk:** uncertain outcomes must be evaluated through preferences or utilities, not just averages.
2. **Information:** decisions depend on what is known at the time they are made.

The next step is to build formal models of sequential decision making where risk, uncertainty, dynamics, and information all interact.

---

## Takeaways

- Information plays a critical role in decision making under uncertainty.
- A decision problem is incomplete unless we specify what is known when each decision is made.
- If $u_0$ and $u_1$ are chosen before $w_0$ is realized, the best value of $\mathbb{E}[|x_2|]$ is $1$.
- If $u_1$ is chosen after observing $x_1$, choosing $u_1=-x_1$ gives optimal value $0$.
- More information can expand the set of feasible policies and improve performance.
- In sequential problems, the decision object is often a policy, not a single action.
