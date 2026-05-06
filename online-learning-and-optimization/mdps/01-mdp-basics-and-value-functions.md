---
layout: post
title: "MDP Basics and Value Functions"
date: 2026-02-20
description: "Markov chains, controlled Markov property, the MDP tuple, and existence of optimal stationary policies."
tags: [mdp, reinforcement-learning, value-function]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# MDP Basics and Value Functions

## The Reinforcement Learning Process

In MABs, actions were stateless: pulling an arm had no effect on future arm distributions. In MDPs, actions affect the future environment. The general RL loop:

1. Agent observes environment state $S_t$.
2. Agent takes action $A_t$ given $S_t$.
3. Environment transitions to $S_{t+1}$ based on $S_t$ and $A_t$.
4. Environment returns a cost $C_t$ (or reward $R_t$) based on $S_t$ and $A_t$.

The agent aims to minimize expected cumulative cost (or maximize cumulative reward).

---

## Markov Chains

A **discrete-time Markov Chain** is a random process $\{X_n\}_{n \geq 0}$ taking values in a countable set $S$ satisfying the **Markovian property**:

$$\mathbb{P}(X_{n+1} = j \mid X_0 = i_0, X_1 = i_1, \ldots, X_n = i) = \mathbb{P}(X_{n+1} = j \mid X_n = i)$$

The future state depends only on the current state, not the full history. If transition probabilities are constant over time (i.e., $\mathbb{P}(X_{n+1}=j \mid X_n=i)$ does not depend on $n$), the chain is **time-homogeneous**.

### Controlled Markov Property

When an agent takes actions, the state evolution satisfies the **controlled Markov property**:

$$\mathbb{P}(X_{n+1} = j \mid X_0, A_0, C_0, \ldots, X_n = i, A_n = a_n) = \mathbb{P}(X_{n+1} = j \mid X_n = i, A_n = a_n)$$

Given the current state and action, the next state is independent of all previous history.

---

## Formal MDP Definition

A **Markov Decision Process** is a tuple $M = (S, A, P, C, \alpha)$ where:

- $S$: countable state space
- $A$: finite action space
- $P$: transition matrix, where $P(s, a, s') = \mathbb{P}(X_{t+1} = s' \mid X_t = s, A_t = a)$
- $C$: cost matrix, where $C(s, a, s')$ is the cost of transitioning from $s$ to $s'$ under action $a$. (Often written as $C(s, a)$ when cost doesn't depend on $s'$.)
- $\alpha \in (0, 1)$: discount factor

**Two ways to define total cost:**

1. **Discounted:** Weight future costs by $\alpha^t$, so distant costs matter less.
2. **Expected time-average:** Normalize total cost by horizon, taking the limit.

---

## Value Functions

A **policy** $\pi: S \to A$ (or $S \to \Delta(A)$ for randomized policies) specifies which action to take in each state.

**Definition (Value Function).** For policy $\pi$, the value function $V_\pi: S \to \mathbb{R}$ is the expected infinite-horizon discounted cost starting from each state:

$$V_\pi(i) = \mathbb{E}_\pi\!\left[\sum_{t=0}^\infty \alpha^t C(X_t, A_t) \;\Big|\; X_0 = i\right]$$

Collecting across all states: $V_\pi = [V_\pi(i)]_{i \in S}$.

**Optimal value function:**

$$V^*(i) = \inf_\pi V_\pi(i)$$

A policy $\pi^*$ is **optimal** if $V_{\pi^*}(i) = V^*(i)$ for all $i \in S$.

Note: the optimal value function is unique, but there may be multiple optimal policies.

---

## Existence of an Optimal Policy

One might worry that the infimum is not achieved (no policy attains $V^*$). The following theorem resolves this.

**Theorem 5.1.** *Consider an MDP $M = (S, A, T, R, \gamma)$ and the set of policies $\Pi$ such that every $\pi \in \Pi$ is:*

- **Markovian:** the action depends only on the current state,
- **Deterministic:** the action at each state is chosen with probability 1,
- **Stationary:** the policy does not change with time.

*Then $M$ is guaranteed to have an optimal policy $\pi^* \in \Pi$ such that $V^*(s) \geq V_\pi(s)$ for all $s \in S$ and $\pi \in \Pi$.*

This is a powerful result: we never need to consider history-dependent, randomized, or time-varying policies for discounted MDPs. The best stationary deterministic Markovian policy is globally optimal.

The proof of this theorem follows from the Bellman equations and the contraction property of the Bellman operator (covered in the next posts).

---

## Intuition on Discounting

Without discounting ($\alpha = 1$), the infinite sum $\sum_{t=0}^\infty C(X_t, A_t)$ may diverge. Discounting with $\alpha < 1$ ensures convergence:

$$V_\pi(i) \leq \frac{C_{\max}}{1 - \alpha}$$

where $C_{\max} = \max_{s,a} C(s,a)$.

Economically: costs/rewards in the far future are worth less than costs/rewards today. Mathematically: it converts an infinite sum into a contraction problem, enabling algorithmic solutions.

The choice of $\alpha$ trades off patience vs. myopia. As $\alpha \to 1$, the agent values the future almost as much as the present; as $\alpha \to 0$, the agent is purely myopic.
