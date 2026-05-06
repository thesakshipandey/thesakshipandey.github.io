---
layout: post
title: "Bellman Operators and Value Iteration"
date: 2026-02-27
description: "Contraction maps, Banach's fixed point theorem, and convergence of Value Iteration."
tags: [mdp, bellman, value-iteration]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Bellman Operators and Value Iteration

## From Equations to Operators

The Bellman equations describe the value function as a fixed point. The Bellman operator makes this formal: it maps any function $F: S \to \mathbb{R}$ to a new function, and the value function is the unique fixed point of this map.

---

## The Bellman Operator

**Definition (Bellman Operator for Policy $\pi$).** For a function $F: S \to \mathbb{R}$:

$$B_\pi(F(i)) \stackrel{\text{def}}{=} c_i(\pi(i)) + \alpha \sum_{j \in S} p_{i,j}(\pi(i)) \cdot F(j)$$

**Definition (Bellman Optimality Operator).** The policy-free version minimizes over all actions:

$$B^*(F(i)) \stackrel{\text{def}}{=} \min_{a \in A}\!\left[c_i(a) + \alpha \sum_{j \in S} p_{i,j}(a) \cdot F(j)\right]$$

By the Bellman equations:
- $V_\pi$ is the unique fixed point of $B_\pi$: $B_\pi(V_\pi) = V_\pi$
- $V^*$ is the unique fixed point of $B^*$: $B^*(V^*) = V^*$

---

## Contraction Property

**Lemma 5.4.** *Both $B_\pi$ and $B^*$ are contraction maps in the Banach space $(\mathbb{R}^S, \|\cdot\|_\infty)$ with contraction factor $\alpha$.*

**Proof for $B_\pi$.**

$$\|B_\pi(F) - B_\pi(G)\|_\infty = \max_{i \in S}\!\left|\sum_j p_{i,j}(\pi(i))[F(j) - G(j)]\right| \cdot \alpha$$

$$\leq \alpha \max_{i \in S} \sum_j p_{i,j}(\pi(i)) |F(j) - G(j)| \leq \alpha \max_{i \in S} \sum_j p_{i,j}(\pi(i)) \|F - G\|_\infty = \alpha \|F - G\|_\infty$$

So $B_\pi$ is a contraction with factor $\alpha < 1$. $\square$

**Proof for $B^*$.** The difficulty is the $\min$: the minimizing action may differ for $F$ and $G$.

Let $a'$ be the minimizer for $G$ at state $i$. Then:

$$B^*(F(i)) - B^*(G(i)) \leq \left[c_i(a') + \alpha\sum_j p_{i,j}(a') F(j)\right] - \left[c_i(a') + \alpha\sum_j p_{i,j}(a') G(j)\right]$$

$$= \alpha \sum_j p_{i,j}(a')[F(j) - G(j)] \leq \alpha \|F - G\|_\infty$$

By symmetry (swapping $F$ and $G$), the bound holds in both directions:

$$\|B^*(F) - B^*(G)\|_\infty \leq \alpha \|F - G\|_\infty \quad \square$$

---

## Value Iteration

Since $B^*$ is a contraction map, by **Banach's Fixed Point Theorem** (see Appendix C), starting from any initial value function $V_0$, iterating $B^*$ converges to the unique fixed point $V^*$:

$$V_t \to V^* \quad \text{as } t \to \infty, \quad \text{at rate } \alpha^t$$

**Algorithm 15: Value Iteration**

**Require:** MDP $M = (S, A, P, C, \alpha)$, initial estimate $V_0$

$t = 0$

**While** True **do:**
- **For** $s \in S$: $V_{t+1}(s) \leftarrow \min_{a \in A} \sum_{s' \in S} p_{s,s'}(a)\!\left[c_{s,s'}(a) + \alpha V_t(s')\right]$
- **If** $\|V_{t+1} - V_t\|_\infty \approx 0$: **return** $V_{t+1}$
- $t \leftarrow t + 1$

**End while**

### Convergence Rate

From the contraction property:

$$\|V_t - V^*\|_\infty \leq \alpha^t \|V_0 - V^*\|_\infty$$

To achieve $\epsilon$-accuracy, we need $t \geq \frac{\ln(1/\epsilon) + \ln\|V_0 - V^*\|_\infty}{\ln(1/\alpha)}$ iterations. For small $\alpha$ (heavy discounting), convergence is fast. For $\alpha$ close to 1, convergence slows significantly.

### Extracting the Optimal Policy

Once $V^*$ is known (approximately), the optimal policy is:

$$\pi^*(s) = \arg\min_{a \in A}\!\left[c_s(a) + \alpha \sum_{s'} p_{s,s'}(a) V^*(s')\right]$$

---

## Banach's Fixed Point Theorem (Summary)

For completeness, the theorem that underpins Value Iteration:

**Theorem C.1 (Banach's Fixed Point Theorem).** *Let $(X, \|\cdot\|)$ be a Banach space and $Z: X \to X$ be a contraction map with factor $l \in [0, 1)$. Then:*

- $Z$ has a unique fixed point $x^* \in X$.
- For all $x \in X$ and $m \geq 0$: $\|Z^m(x) - x^*\| \leq l^m \|x - x^*\|$.

Applying to $Z = B^*$ and $X = \mathbb{R}^S$ with $l = \alpha$: Value Iteration converges to the unique $V^*$ at a geometric rate.

---

## Value Iteration vs. Solving Bellman Equations Directly

For a fixed policy $\pi$, the Bellman equations are linear and can be solved exactly as $(I - \alpha P_\pi) V_\pi = C_\pi$. This requires $O(|S|^3)$ time (matrix inversion).

Value Iteration instead applies the nonlinear $B^*$ iteratively. Each iteration costs $O(|S|^2|A|)$ (one Bellman backup per state). For large state spaces where $|S|^3$ is prohibitive, Value Iteration is more practical.
