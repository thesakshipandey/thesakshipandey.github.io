---
layout: post
title: "Bellman Equations"
date: 2026-02-25
description: "Self-consistency of value functions, the linear system for fixed policies, and Bellman optimality."
tags: [mdp, bellman, dynamic-programming]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Bellman Equations

## The Self-Consistency of Value Functions

The value function satisfies a fundamental self-consistency condition: the value of a state equals the immediate cost plus the discounted value of the next state (in expectation). This is the **Bellman equation**.

Rather than computing $V_\pi$ by simulating an infinite trajectory, we can solve a system of linear equations.

---

## Bellman Equations for a Fixed Policy

**Theorem 5.2.** *Consider a discounted MDP $M(S, A, P, C, \alpha)$ and a fixed policy $\pi$. Then:*

$$V_\pi(s) = C(s, \pi(s), s') + \alpha \sum_{s' \in S} P(s, \pi(s), s') \cdot V_\pi(s')$$

or more cleanly when cost does not depend on $s'$:

$$V_\pi(s) = C(s, \pi(s)) + \alpha \sum_{s' \in S} P(s, \pi(s), s') \cdot V_\pi(s')$$

**Proof.** By definition:

$$V_\pi(s) = \mathbb{E}_\pi\!\left[c_0 + \alpha c_1 + \alpha^2 c_2 + \ldots \mid s_0 = s\right]$$

Expanding over the first transition (summing over possible next states $s'$):

$$V_\pi(s) = \sum_{s'} P(s, \pi(s), s') \mathbb{E}_\pi\!\left[c_0 + \alpha c_1 + \alpha^2 c_2 + \ldots \mid s_0 = s, s_1 = s'\right]$$

Split into $c_0$ and the tail:

$$= \sum_{s'} P(s, \pi(s), s') \mathbb{E}_\pi[c_0 \mid s_0 = s, s_1 = s'] + \alpha \sum_{s'} P(s, \pi(s), s') \mathbb{E}_\pi\!\left[c_1 + \alpha c_2 + \ldots \mid s_0 = s, s_1 = s'\right]$$

The first term: $\mathbb{E}_\pi[c_0 \mid s_0 = s, s_1 = s'] = C(s, \pi(s), s')$. Since cost is state-action dependent (not $s'$ dependent), $\sum_{s'} P(\cdot) C(s, \pi(s), s') = C(s, \pi(s))$.

The second term: the sum $c_1 + \alpha c_2 + \ldots$ starting from $s_1 = s'$ is exactly $V_\pi(s')$ (by the Markov property, the future depends only on $s'$, not on $s_0 = s$).

Therefore:

$$V_\pi(s) = C(s, \pi(s)) + \alpha \sum_{s'} P(s, \pi(s), s') V_\pi(s') \quad \square$$

---

## Structure of the Bellman Equations

For a state space $S$ with $|S| = N$ states, the Bellman equations give us $N$ equations with $N$ unknowns $V_\pi(1), \ldots, V_\pi(N)$:

$$V_\pi(s) = C(s, \pi(s)) + \alpha \sum_{s'} P(s, \pi(s), s') V_\pi(s'), \quad \forall s \in S$$

This is a system of linear equations. In matrix form:

$$V_\pi = C_\pi + \alpha P_\pi V_\pi$$

where $C_\pi$ is the cost vector and $P_\pi$ is the transition matrix under policy $\pi$. Solving:

$$V_\pi = (I - \alpha P_\pi)^{-1} C_\pi$$

The matrix $(I - \alpha P_\pi)$ is invertible since $\alpha < 1$ and $P_\pi$ is a stochastic matrix (its spectral radius is 1, so $\alpha P_\pi$ has spectral radius $< 1$).

---

## Bellman Optimality Equations

For the optimal value function, the Bellman equation takes a nonlinear form involving a minimization.

**Lemma 5.3.** *For a discounted MDP $M(S, A, P, C, \alpha)$:*

$$V^*(i) = \min_{a \in A}\!\left[c_{i,a} + \alpha \sum_{j \in S} p_{i,j}(a) V^*(j)\right] \quad \forall i \in S$$

**Proof.** For any policy $\pi$:

$$V_\pi(i) = \sum_{a \in A} P_\pi(a)\!\left[c(i, a) + \sum_{j \in S} p_{i,j}(a) W(j)\right]$$

where $W(j)$ is the expected discounted cost from time step 1 onwards under $\pi$. Since $W(j) \geq \alpha V^*(j)$ (the optimal value is a lower bound on any future cost):

$$V_\pi(i) \geq \sum_{a \in A} P_\pi(a)\!\left[c(i,a) + \alpha \sum_{j \in S} p_{i,j}(a) V^*(j)\right] \geq \min_{a \in A}\!\left[c(i,a) + \alpha \sum_{j \in S} p_{i,j}(a) V^*(j)\right]$$

This holds for all policies $\pi$. Taking the infimum over $\pi$:

$$V^*(i) \geq \min_{a \in A}\!\left[c(i,a) + \alpha \sum_{j \in S} p_{i,j}(a) V^*(j)\right]$$

The reverse inequality follows from the existence of an optimal policy (Theorem 5.1): applying the optimal action at state $i$ achieves the minimum. $\square$

---

## Significance

The Bellman optimality equations characterize $V^*$ uniquely. However, unlike the policy-specific equations, they are nonlinear (due to the $\min$). This is why we cannot directly solve them as a linear system.

The Bellman operator framework (next post) turns this into an iterative algorithm.
