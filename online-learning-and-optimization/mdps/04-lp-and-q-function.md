---
layout: post
title: "Linear Programming Approach and Q-Functions"
date: 2026-04-01
description: "The LP formulation of MDPs, the state-action value function, and model-free implications."
tags: [mdp, linear-programming, q-function]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Linear Programming Approach and Q-Functions

## The LP Formulation of MDPs

The Bellman optimality equations characterize $V^\ast$ as the fixed point of $B^\ast$. There is an equivalent view: $V^\ast$ is the solution to a linear program.

---

## Key Lemma

**Lemma 5.5.** *Consider the Bellman optimality operator $B^\ast$ with:*

$$B^\ast(V(i)) = \min_{a \in A}\!\left[c_i(a) + \alpha \sum_{j \in S} p_{i,j}(a) \cdot F(j)\right]$$

*If $(B^\ast(V))(i) \geq V(i)$ for all $i \in S$, then $V^\ast \geq V$ component-wise.*

**Proof.** Suppose $B^\ast(V) \geq V$. Then applying $B^\ast$ repeatedly (which preserves the inequality since $B^\ast$ is monotone):

$$V \leq B^\ast(V) \leq (B^\ast)^2(V) \leq \ldots \leq \lim_{n \to \infty} (B^\ast)^n(V) = V^\ast$$

The limit is $V^\ast$ because $B^\ast$ is a contraction converging to the unique fixed point $V^\ast$. $\square$

---

## The Linear Program

From Lemma 5.5, $V^\ast$ is the **largest** function $V$ satisfying $B^\ast(V) \geq V$ component-wise. That is:

$$V^\ast = \max \sum_{i \in S} V(i) \quad \text{s.t.} \quad V(i) \leq (B^\ast(V))(i) \quad \forall i \in S$$

Expanding $(B^\ast(V))(i) = \min_{a \in A}[\ldots]$: the constraint $V(i) \leq \min_a [\ldots]$ is equivalent to $V(i) \leq c_i(a) + \alpha \sum_j p_{ij}(a) V(j)$ for all $a \in A$.

$$\boxed{V^\ast = \max \sum_{i \in S} V(i) \quad \text{s.t.} \quad V(i) \leq c_i(a) + \alpha \sum_{j \in S} p_{ij}(a) V(j) \quad \forall i \in S, a \in A}$$

This is a **linear program**: linear objective, linear constraints. It has $|S|$ variables and $|S| \cdot |A|$ constraints.

**Complexity:** LP can be solved in polynomial time. For small MDPs, this gives an exact $V^\ast$ in one shot (no iteration needed). For large state spaces, the $|S| \cdot |A|$ constraint count becomes the bottleneck.

---

## The State-Action Value Function (Q-Function)

The value function $V_\pi(i)$ gives the expected cost starting from state $i$ under policy $\pi$. The **Q-function** extends this to include the first action explicitly.

**Definition (Q-Function).** For policy $\pi$, the Q-function $Q_\pi: S \times A \to \mathbb{R}$ is:

$$Q_\pi(i, a) = c_i(a) + \alpha \sum_{j \in S} p_{ij}(a) V_\pi(j)$$

Interpretation: $Q_\pi(i, a)$ is the expected discounted cost if the agent starts at state $i$, takes action $a$ first, then follows policy $\pi$ thereafter.

**Relationship to value function:**

$$Q_\pi(i, \pi(i)) = V_\pi(i)$$

When the first action matches the policy, the Q-function reduces to the value function.

---

## Optimal Q-Function

For the optimal policy:

$$Q^\ast(i, a) = c_i(a) + \alpha \sum_j p_{ij}(a) V^\ast(j)$$

The optimal value function satisfies:

$$V^\ast(i) = \min_a Q^\ast(i, a)$$

And the optimal policy can be read off directly:

$$\pi^\ast(i) = \arg\min_{a \in A} Q^\ast(i, a)$$

---

## Why the Q-Function Matters

In reinforcement learning (where $P$ and $C$ are unknown), the Q-function is more directly useful than $V^\ast$:

- To use $V^\ast$, you need to know $P$ to compute $\arg\min_a [c(i,a) + \alpha \sum_j p_{ij}(a) V^\ast(j)]$.
- To use $Q^\ast$, you simply look up $\arg\min_a Q^\ast(i, a)$, with no model required.

This is why Q-learning (covered in the RL post) learns $Q^\ast$ directly without learning $P$ or $C$ explicitly.

---

## LP Duality and Occupancy Measures

The dual of the MDP LP has a natural interpretation in terms of **state-action occupancy measures** $d^\pi(s, a)$: the discounted frequency of visiting state $s$ and taking action $a$ under policy $\pi$. The dual LP optimizes over these occupancy measures and is often used for constrained MDPs and inverse reinforcement learning.
