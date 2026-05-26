---
layout: post
title: "6. State Space Modelling of Sequential Decision Making; Inventory Control Problem I"
date: 2026-05-26
description: "State-space formulation for sequential decision making and the first setup of an inventory control model."
tags: [decision-making, uncertainty, state-space, stochastic-control, inventory-control]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# 6. State Space Modelling of Sequential Decision Making; Inventory Control Problem I

Source: [YouTube lecture](https://youtu.be/QX6K05pSg3U?si=6563FDUMq_l1pEE7)

## Big Picture

The previous lecture showed that information changes what decisions are possible and how well a decision maker can perform.

We now begin the formal study of **sequential decision making**: problems where actions are chosen over multiple time steps and the goal is to minimize a total cost over a finite horizon.

This general framework is known by different names in different fields:

- **stochastic control** in control theory
- **Markov decision processes** in operations research and computer science

Both names refer to a state-based model for decision making under uncertainty.

---

## Discrete-Time Model

Time evolves in discrete steps:

$$
k = 0,1,\ldots,N-1
$$

where $N$ is the finite **time horizon**.

The model does not describe every continuous event between time steps. Instead, it describes the system at decision epochs.

---

## State

Let:

$$
x_k
$$

denote the **state of the system** at time $k$.

The state is meant to contain enough information about the system so that the decision problem can be described using it.

Informally, the state is the complete configuration of the system at a given time.

---

## Control Action

At each time $k$, the decision maker chooses an action:

$$
u_k
$$

This is also called:

- a control action
- a decision
- an input

The value of $u_k$ is chosen by the decision maker.

---

## Random Disturbance

At each time $k$, there is also a random parameter:

$$
w_k
$$

This is an external disturbance or noise.

Unlike $u_k$, the decision maker does not control $w_k$ or its distribution. It is chosen by nature.

Because $w_k$ is random, the future state is generally random even after the current state and action are fixed.

---

## System Dynamics

The system evolves according to:

$$
x_{k+1} = f_k(x_k,u_k,w_k)
$$

The function $f_k$ is called the **dynamics** of the system.

It describes how the next state is generated from:

- the current state $x_k$
- the chosen action $u_k$
- the random disturbance $w_k$

The disturbance makes the transition uncertain. The next state is not completely determined by the decision maker.

---

## Cost Structure

The goal is to minimize total cost over the horizon.

The total cost has two parts:

$$
g_N(x_N) + \sum_{k=0}^{N-1} g_k(x_k,u_k,w_k)
$$

Here:

- $g_k(x_k,u_k,w_k)$ is the **stage-wise cost** at time $k$
- $g_N(x_N)$ is the **terminal cost**

The terminal state $x_N$ is the state reached after the final action at time $N-1$ and the final system transition.

Since the disturbances are random, the total cost is random. Therefore, the usual objective is to minimize expected cost:

$$
\mathbb{E}\left[
g_N(x_N) + \sum_{k=0}^{N-1} g_k(x_k,u_k,w_k)
\right]
$$

---

## Stage-Wise and Terminal Costs

The **stage-wise costs** are incurred at every decision stage:

$$
g_0, g_1, \ldots, g_{N-1}
$$

Each stage cost can depend on:

- current state
- current action
- current disturbance

The **terminal cost**:

$$
g_N(x_N)
$$

depends only on the final state of the system.

This captures how desirable or undesirable it is to end the problem in a particular state.

---

## Open-Loop Problems

In an **open-loop** problem, all actions are chosen before the system evolves:

$$
u_0,u_1,\ldots,u_{N-1}
$$

These actions are selected without observing the future states or disturbances.

So open-loop actions are not adapted to the realized evolution of the system.

They are like a fixed plan made before uncertainty is revealed.

---

## Closed-Loop Problems

In a **closed-loop** problem, the action at time $k$ is chosen using information available up to time $k$.

In general, this information could include the history:

$$
x_0,u_0,x_1,u_1,\ldots,x_k
$$

However, in the state-space model, the current state $x_k$ is designed to summarize the relevant past.

So, without loss of generality in this setting, we often choose:

$$
u_k = \mu_k(x_k)
$$

where $\mu_k$ is a decision rule or policy at time $k$.

Thus, the action is chosen based on the current state.

---

## Timing of Information

The order of events at time $k$ is important:

1. $x_k$ is known.
2. $u_k$ is chosen based on $x_k$.
3. $w_k$ is realized.
4. The next state is generated:

$$
x_{k+1} = f_k(x_k,u_k,w_k)
$$

The key point:

> $u_k$ can depend on $x_k$, but it cannot depend on $w_k$ because $w_k$ is not known when $u_k$ is chosen.

This preserves the causal structure of the decision problem.

---

## Inventory Control Example

To understand the framework, consider an inventory control problem.

Example setting:

- a shop sells items, such as shoes
- inventory is consumed by customer demand
- future demand is random
- at each time period, the shop must decide how much inventory to order

The decision problem is to choose replenishment quantities over time while accounting for uncertain demand.

---

## Inventory State

Let:

$$
x_k
$$

be the stock available at the beginning of the $k$th time period.

For example:

- $x_0$ is the initial stock at the beginning of period 0
- $x_1$ is the stock available at the beginning of period 1
- and so on

The horizon is:

$$
k = 0,1,\ldots,N-1
$$

---

## Inventory Action

Let:

$$
u_k
$$

be the stock ordered at the beginning of the $k$th period.

The lecture assumes **immediate delivery**:

> Stock ordered at time $k$ becomes available immediately during period $k$.

This is equivalent to assuming that delivery time is negligible compared with the length of a decision period.

---

## Random Demand

Let:

$$
w_k
$$

be the demand during time period $k$.

The demand sequence is assumed independent:

$$
w_0,w_1,\ldots,w_{N-1}
\quad \text{are independent.}
$$

Demand is the source of randomness in the inventory problem.

---

## Timing in the Inventory Problem

The sequence of events during period $k$ is:

1. Stock $x_k$ becomes known.
2. Order quantity $u_k$ is chosen.
3. Demand $w_k$ is realized.
4. Inventory evolves based on the order and demand.

So:

> $u_k$ is chosen before $w_k$ is known.

This matters because the shop cannot order inventory after seeing the demand for the same period. It must decide using the current stock and whatever distributional information it has about future demand.

---

## Connecting Inventory Control to State Space Models

The inventory control problem fits the state-space framework:

| State-space object | Inventory interpretation |
|---|---|
| $x_k$ | stock at the beginning of period $k$ |
| $u_k$ | amount ordered at the beginning of period $k$ |
| $w_k$ | random demand during period $k$ |
| $f_k$ | inventory update rule |
| $g_k$ | cost during period $k$ |
| $g_N$ | terminal inventory cost |

The exact dynamics and cost functions are developed further in the next part of the inventory-control example.

---

## Takeaways

- Sequential decision problems involve actions chosen over multiple time steps.
- A state-space model describes the system using states, actions, disturbances, dynamics, and costs.
- The state $x_k$ summarizes the system at time $k$.
- The action $u_k$ is chosen by the decision maker.
- The disturbance $w_k$ is chosen by nature and is not known when $u_k$ is chosen.
- Open-loop decisions are fixed before the system evolves.
- Closed-loop decisions adapt to the current state.
- In inventory control, the state is stock, the action is order quantity, and the disturbance is demand.
