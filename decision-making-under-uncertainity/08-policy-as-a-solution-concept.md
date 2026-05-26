---
layout: post
title: "8. Policy as a Solution Concept"
date: 2026-05-26
description: "Why stochastic control solves for policies, threshold policies in inventory control, and how policies induce state-transition distributions."
tags: [decision-making, uncertainty, stochastic-control, policies, inventory-control]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# 8. Policy as a Solution Concept

Source: [YouTube lecture](https://youtu.be/MQpSUVXVmYE?si=Z4ljREguq12hYP0G)

## Recap: Why Actions Are Not Enough

In the inventory control problem, the question "how much inventory should be ordered?" is not well posed at the planning stage.

The order quantity depends on the stock level available at that future time, and that stock level is random because it depends on future demand.

So before the system evolves, we cannot choose exact future actions.

Instead, we choose an action plan:

> For every possible inventory level that may be observed, specify how much inventory should be ordered.

These functions are called:

- strategies
- decision rules
- control laws

A sequence of such functions:

$$
\mu_0,\mu_1,\ldots,\mu_{N-1}
$$

is called a **policy**.

---

## Threshold Policy in Inventory Control

For many reasonable inventory cost functions, an optimal policy has a threshold form.

At time $k$, the decision rule may be:

$$
\mu_k(x_k) =
\begin{cases}
S_k - x_k, & x_k < S_k,\\
0, & x_k \geq S_k.
\end{cases}
$$

Here $S_k$ is a threshold level at time $k$.

The interpretation is simple:

- if inventory $x_k$ is below $S_k$, order enough to bring inventory up to $S_k$
- if inventory $x_k$ is already at least $S_k$, order nothing

So the policy says:

> Top up to the threshold when stock falls below it.

In a finite-horizon problem, the threshold can depend on time. So $S_k$ may differ from $S_{k+1}$.

---

## How the Threshold Policy Evolves

Under a threshold policy:

1. At time $k$, observe inventory $x_k$.
2. If $x_k<S_k$, order $S_k-x_k$.
3. Inventory is topped up to $S_k$.
4. Demand during the period reduces inventory.
5. At time $k+1$, repeat using threshold $S_{k+1}$.

The policy does not tell us a fixed order quantity in advance. It tells us how to compute the order quantity after observing the inventory state.

---

## General Stochastic Control Problem

The general stochastic control problem is to minimize expected total cost:

$$
\min_{\mu_0,\ldots,\mu_{N-1}}
\mathbb{E}\left[
g_N(x_N) + \sum_{k=0}^{N-1} g_k(x_k,u_k,w_k)
\right]
$$

where:

$$
u_k = \mu_k(x_k)
$$

Here:

- $g_N(x_N)$ is the terminal cost
- $g_k(x_k,u_k,w_k)$ is the stage-wise cost
- $\mu_k$ maps the current state to the current action

The optimization is over policies, not over realized actions.

---

## State and Action Spaces

Let:

$$
\mathcal{X}_k
$$

be the state space at time $k$, and let:

$$
\mathcal{U}_k
$$

be the action space at time $k$.

Then each decision rule is a function:

$$
\mu_k: \mathcal{X}_k \to \mathcal{U}_k
$$

In the inventory example:

$$
\mathcal{X}_k = \mathbb{R}
$$

because inventory can be positive or negative, and:

$$
\mathcal{U}_k = [0,\infty)
$$

because orders must be nonnegative.

---

## State-Dependent Feasible Actions

In some problems, the set of feasible actions depends on the current state.

Let:

$$
\tilde{\mathcal{U}}_k(x_k)
$$

denote the set of feasible actions at time $k$ when the state is $x_k$.

Then a policy must satisfy:

$$
\mu_k(x_k) \in \tilde{\mathcal{U}}_k(x_k)
$$

for every relevant state $x_k$.

This is the condition that makes a policy admissible.

In the inventory problem, the constraint is simpler:

$$
u_k \geq 0
$$

and it does not depend on $x_k$. But in general, action constraints may depend on both state and time.

---

## Inventory Control as a Stochastic Control Problem

For the inventory problem:

$$
x_{k+1} = x_k + u_k - w_k
$$

where demands:

$$
w_0,w_1,\ldots,w_{N-1}
$$

are independent across time and unknown when $u_k$ is chosen.

The constraint is:

$$
u_k \geq 0
$$

The total cost has:

- terminal cost $R(x_N)$
- stage cost $r(x_k)+cu_k$

So the inventory problem is an instance of the general stochastic control formulation.

---

## What Happens After a Policy Is Chosen?

The full policy:

$$
\pi = (\mu_0,\mu_1,\ldots,\mu_{N-1})
$$

is chosen before the uncertainty is realized.

Then the system evolves as follows.

At time 0:

1. Initial state $x_0$ is realized.
2. Action is chosen:

$$
u_0 = \mu_0(x_0)
$$

3. Nature realizes noise $w_0$.
4. The next state is:

$$
x_1 = f_0(x_0,\mu_0(x_0),w_0)
$$

At time 1:

1. State $x_1$ is known.
2. Action is chosen:

$$
u_1 = \mu_1(x_1)
$$

3. Nature realizes $w_1$.
4. The next state is:

$$
x_2 = f_1(x_1,\mu_1(x_1),w_1)
$$

This continues until the final state:

$$
x_N = f_{N-1}(x_{N-1},\mu_{N-1}(x_{N-1}),w_{N-1})
$$

---

## Two Roles of a Policy

A policy has two roles.

### 1. It Chooses Actions

Given a state $x_k$, the policy directly specifies:

$$
u_k = \mu_k(x_k)
$$

So it tells the decision maker what action to take in real time.

### 2. It Influences Future State Distributions

The next state is random because it depends on $w_k$:

$$
x_{k+1} = f_k(x_k,\mu_k(x_k),w_k)
$$

But the distribution of $x_{k+1}$ depends on the chosen policy.

So a policy also determines, indirectly, the probability distribution of future states.

This is often denoted:

$$
P^\pi(x_{k+1}\mid x_k)
$$

meaning the transition distribution under policy $\pi$.

---

## Why Policy Is the Right Solution Concept

In stochastic sequential decision making, uncertainty prevents us from choosing a fixed sequence of future actions in advance.

The right object to choose is a policy:

$$
\pi = (\mu_0,\mu_1,\ldots,\mu_{N-1})
$$

Each $\mu_k$ maps observed information, here the current state, to an action.

This lets the decision maker adapt to the actual trajectory of the system while respecting the causal order:

- observe state
- choose action
- random disturbance occurs
- next state is realized

---

## Toward Markov Decision Processes

The lecture ends by pointing toward a more abstract model.

Instead of specifying the next state explicitly as:

$$
x_{k+1}=f_k(x_k,u_k,w_k)
$$

one can directly specify the probability distribution:

$$
P(x_{k+1}\mid x_k,u_k)
$$

This is the model commonly used in operations research and computer science, called a **Markov decision process**.

The next lecture moves toward finite-state, finite-action MDPs.

---

## Takeaways

- In stochastic control, the solution is a policy, not a fixed action sequence.
- A policy is a sequence of decision rules $\mu_0,\ldots,\mu_{N-1}$.
- Each decision rule maps states to actions.
- Inventory control often has a threshold policy: order up to $S_k$ if stock is below $S_k$.
- Policies must respect feasible-action constraints.
- A policy chooses current actions and also shapes the distribution of future states.
- The notation $\pi$ is often used for the full policy.
- Markov decision processes abstract the dynamics through transition probabilities rather than explicit noise equations.
