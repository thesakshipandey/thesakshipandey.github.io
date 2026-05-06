---
layout: post
title: "Expected Time-Average MDPs"
date: 2026-04-08
description: "Long-run average cost, the ETA Bellman equation, and conditions for stationary optimal policies."
tags: [mdp, average-cost, ergodic]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Expected Time-Average MDPs

## Dropping the Discount Factor

Discounted MDPs are mathematically convenient but artificially downweight long-term costs. The **expected time-average (ETA)** formulation instead measures the long-run average cost per step:

$$\Phi_\pi(i) = \limsup_{n \to \infty} \frac{1}{n+1} \mathbb{E}_\pi\!\left[\sum_{t=0}^n C(X_t, A_t) \;\Big|\; X_0 = i\right]$$

The MDP is now $\mathcal{M} = (S, A, P, C)$ with no discount factor. A policy $\pi^\ast$ is optimal if $\Phi_{\pi^\ast}(i) = \inf_\pi \Phi_\pi(i)$ for all $i \in S$.

---

## Existence of an Optimal Policy: The Answer is Subtle

For discounted MDPs, a stationary optimal policy always exists (Theorem 5.1). For ETA MDPs, this is **not** always true.

### Counterexample 1: No Optimal Policy Exists

Consider $S = \{1, 1', 2, 2', \ldots\}$, $A = \{1, 2\}$:
- At natural state $i$: action 1 goes to $i+1$, action 2 goes to $i'$.
- At prime state $i'$: both actions stay at $i'$.
- Costs: $C(i, \cdot) = 1$, $C(i', \cdot) = 1/i$.

Any policy that takes action 2 at some state $\bar{n}$ traps the agent at $\bar{n}'$ with cost $1/\bar{n}$. As $\bar{n} \to \infty$, the ETA cost approaches 0. But no fixed $\bar{n}$ achieves 0. So there is no optimal policy.

### Counterexample 2: No Optimal Stationary Policy

Even restricting to stationary policies, optimality may fail. The optimal ETA cost approaches 0 but is never achieved by any fixed stationary policy.

**Key result:** There exists a **non-stationary** policy achieving ETA cost 0 for the following MDP:
- $S = \mathbb{N}$, $A = \{1, 2\}$
- Action 1: go to $i+1$; Action 2: stay at $i$
- $C(i, 1) = 1$, $C(i, 2) = 1/i$
- Policy: at state $i$, take action 1 with probability $2^{-i}$, action 2 otherwise.

The expected time at state $i$ is $2^i$, and by the Stolz-Cesaro theorem, the time-average cost under this policy is 0.

---

## When Does an Optimal Stationary Policy Exist?

**Theorem 5.10.** *Given an ETA MDP $M(S, A, P, C)$, if there exist a function $h \in \mathcal{B}(S)$ and a scalar $g$ such that:*

$$g + h(i) = \min_{a \in A}\!\left[c_i(a) + \sum_{j \in S} p_{ij}(a) h(j)\right] \quad \forall i \in S$$

*Then a stationary optimal policy exists:*
- $\pi^\ast(i) = \arg\min_{a \in A}\!\left[c_i(a) + \sum_{j \in S} p_{ij}(a) h(j)\right]$
- $\Phi_{\pi^\ast}(i) = g$ for all $i \in S$

This equation is the **ETA Bellman equation**. It looks like the discounted Bellman equation but with $\alpha = 1$ and a normalization by $g$ instead of discounting. Here $h$ plays the role of the value function and $g$ is the optimal average cost.

**Proof sketch.** Define the process $M_t = h(X_t) - g - h(X_{t-1}) + C(X_{t-1}, A_{t-1})$. Using the Bellman equation, this is a martingale difference sequence. Summing and dividing by $n$ gives:

$$g \leq \frac{\mathbb{E}[h(X_n)] - \mathbb{E}[h(X_0)]}{n} + \frac{1}{n}\mathbb{E}\!\left[\sum_{t=1}^n C(X_{t-1}, A_{t-1})\right]$$

As $n \to \infty$, the first term vanishes (if $h$ is bounded), giving $g \leq \Phi_\pi$ for all policies $\pi$. The optimal policy achieves equality. $\square$

---

## Connecting ETA to Discounted MDPs

For a discounted MDP with factor $\alpha$, the value function $V_\alpha(i)$ satisfies:

$$V_\alpha(i) = \min_a\!\left[c_i(a) + \alpha \sum_j p_{ij}(a) V_\alpha(j)\right]$$

Define $h_\alpha(i) = V_\alpha(i) - V_\alpha(0)$ (value relative to a reference state 0). Then:

$$h_\alpha(i) + (1-\alpha) V_\alpha(0) = \min_a\!\left[c_i(a) + \alpha \sum_j p_{ij}(a) h_\alpha(j)\right]$$

Setting $g = (1-\alpha) V_\alpha(0)$, as $\alpha \to 1$:

$$h_\alpha(i) + g \to \min_a\!\left[c_i(a) + \sum_j p_{ij}(a) h(j)\right]$$

If this limit exists, the ETA Bellman equation is satisfied, guaranteeing a stationary optimal policy.

**Theorem 5.11.** *If $\exists N < \infty$ such that $|V_\alpha(i) - V_\alpha(0)| < N$ for all $\alpha, i$, then there exist $g \in \mathbb{R}$ and $h \in \mathcal{B}(S)$ satisfying the ETA Bellman equations.*

---

## When is $h$ Bounded? Expected Hitting Times

The boundedness condition $|V_\alpha(i) - V_\alpha(0)| < N$ is related to how quickly the MDP can return to state 0.

**Definition.** The **expected hitting time** $M_{i,0}(\pi^\ast_\alpha)$ is the expected time to reach state 0 from state $i$ under the optimal discounted policy $\pi^\ast_\alpha$.

**Theorem 5.12.** *If $\exists N < \infty$ such that the expected hitting time $M_{i,0}(\pi^\ast_\alpha) < N$ for all $i, \alpha$, then $|V_\alpha(i) - V_\alpha(0)| < N$ for all $\alpha, i$.*

**Proof sketch.** The value function from state $i$ can be split into the cost of reaching state 0 (bounded by $CN$) and the cost from state 0 onwards ($V_\alpha(0)$). The difference is bounded by $CN$. The reverse bound follows from Jensen's inequality. $\square$

**Corollary 1.** *If the state space is finite and any stationary policy induces an irreducible Markov chain (every state reachable from every other state), then the hitting times are finite and bounded, and a stationary optimal ETA policy exists.*

This is the practical condition most finite-state MDPs satisfy.

---

## Summary: Discounted vs. ETA MDPs

| | Discounted MDP | ETA MDP |
|---|---|---|
| Objective | $\inf_\pi \mathbb{E}[\sum_t \alpha^t C_t]$ | $\inf_\pi \limsup \frac{1}{n}\mathbb{E}[\sum_t C_t]$ |
| Optimal stationary policy? | Always (Theorem 5.1) | Not always |
| Bellman equation | $V^\ast(i) = \min_a[c + \alpha \sum p V^\ast]$ | $g + h(i) = \min_a[c + \sum p h]$ |
| Key algorithm | Value Iteration / Policy Iteration | Same, when $g, h$ exist |
| Sufficient condition | $\alpha < 1$ | Finite state + irreducibility |
