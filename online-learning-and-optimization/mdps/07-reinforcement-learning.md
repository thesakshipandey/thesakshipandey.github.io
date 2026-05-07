---
layout: post
title: "Reinforcement Learning"
date: 2026-04-10
description: "Monte Carlo, Q-learning, SARSA, Deep Q-learning, and TD learning when P and C are unknown."
tags: [reinforcement-learning, q-learning, model-free]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Reinforcement Learning

## The Unknown Model Problem

MDPs assumed full knowledge of $P$ (transition matrix) and $C$ (cost matrix). In **reinforcement learning (RL)**, only $S$ and $A$ are known. The agent must learn the optimal policy by interacting with the environment and observing outcomes.

This is the hardest setting: the model itself must be discovered through exploration.

---

## Two Axes of RL Algorithms

**Learning paradigm:**
- **Off-policy:** The learning algorithm uses historical data (state, action, cost tuples) without actively choosing the policy during learning. Batch learning.
- **On-policy:** The learning algorithm explores using some policy and refines it as data arrives. Online learning.

**Model knowledge:**
- **Model-based:** Learn estimates $\hat{P}, \hat{C}$ of the transition and cost matrices, then use standard MDP planning (Value Iteration / Policy Iteration).
- **Model-free:** Never explicitly learn $P$ or $C$. Directly learn the value function or Q-function.

---

## Monte Carlo Approach (Model-Based, Off-Policy)

Given historical trajectories, estimate $P$ and $C$ using the Law of Large Numbers:

$$\hat p_{i,j}(a) = \frac{\sum \mathbf{1}\{X_t = i, A_t = a, X_{t+1} = j\}}{\sum \mathbf{1}\{X_t = i, A_t = a\}}$$

$$\hat c_{i,j}(a) = \frac{\sum C(X_t, A_t) \cdot \mathbf{1}\{X_t = i, A_t = a, X_{t+1} = j\}}{\sum \mathbf{1}\{X_t = i, A_t = a\}}$$

Then run Value Iteration or Policy Iteration on the estimated MDP $(\hat{P}, \hat{C})$.

**Assumptions needed:**
- Finite state and action spaces.
- Irreducible MDP (every state reachable from every other state).

**For on-policy Monte Carlo:** Use an $\varepsilon_t$-optimal policy at each step (explore with probability $\varepsilon_t = 1/t$, exploit with $1 - \varepsilon_t$). This decaying schedule ensures each state-action pair is explored infinitely often almost surely.

---

## Q-Learning (Model-Free, Off-Policy)

Q-learning directly estimates $Q^\ast$ without learning $P$ or $C$. The update rule:

$$\hat{Q}(X_t, A_t) \leftarrow \hat{Q}(X_t, A_t) + a_t\!\left[C_t + \alpha \min_{a'} \hat{Q}(X_{t+1}, a') - \hat{Q}(X_t, A_t)\right]$$

where $a_t$ is a step size (learning rate). The term in brackets is the **temporal difference (TD) error**: the difference between the target $C_t + \alpha \min_{a'} \hat{Q}(X_{t+1}, a')$ and the current estimate $\hat{Q}(X_t, A_t)$.

**Intuition:** The update pushes $\hat{Q}(X_t, A_t)$ toward the Bellman target $C_t + \alpha \min_{a'} \hat{Q}(X_{t+1}, a')$. As data accumulates, $\hat{Q}$ converges to $Q^\ast$.

**Convergence:** Q-learning converges to $Q^\ast$ almost surely if:
- Every state-action pair is visited infinitely often.
- Step sizes satisfy $\sum_t a_t = \infty$ and $\sum_t a_t^2 < \infty$ (e.g., $a_t = 1/t$).

---

## SARSA (Model-Free, On-Policy)

SARSA is Q-learning's on-policy counterpart. The name comes from the quintuple $(X_t, A_t, C_t, X_{t+1}, A_{t+1})$ used in the update:

$$\hat{Q}(X_t, A_t) \leftarrow \hat{Q}(X_t, A_t) + a_t\!\left[C_t + \alpha \hat{Q}(X_{t+1}, A_{t+1}) - \hat{Q}(X_t, A_t)\right]$$

The key difference from Q-learning: instead of using $\min_{a'} \hat{Q}(X_{t+1}, a')$ (the greedy action), SARSA uses the actual next action $A_{t+1}$ taken by the current policy.

Action selection uses $\varepsilon$-greedy:

$$A_t = \begin{cases} \arg\min_{a'} \hat{Q}(X_t, a') & \text{w.p. } 1 - \varepsilon_t \\ \text{Random} & \text{w.p. } \varepsilon_t \end{cases}$$

SARSA learns the Q-function of the **behavior policy** (including its exploration). Q-learning learns $Q^\ast$ regardless of the behavior policy.

---

## Deep Q-Learning (Neural Function Approximation)

For large or continuous state spaces, storing a full Q-table is infeasible. Deep Q-learning uses a neural network with parameters $\theta$ to approximate $Q^\ast$:

$$Q_\theta(x, a) \approx Q^\ast(x, a)$$

**Training procedure:**
1. Collect transitions $(X_t, A_t, C_t, X_{t+1})$ into a **replay buffer** (a mini-batch $B$).
2. Define the target: $(X_t, A_t) \mapsto C_t + \alpha \min_{a'} Q_{\theta}(X_{t+1}, a')$.
3. Minimize the squared loss:

$$\mathcal{L}(\theta) = \sum_B \!\left[C_t + \alpha \min_{a'} Q_\theta(X_{t+1}, a') - Q_\theta(X_t, A_t)\right]^2$$

**The instability problem:** Both the input $Q_\theta(X_t, A_t)$ and the target $\min_{a'} Q_\theta(X_{t+1}, a')$ are parameterized by the same $\theta$. Updating $\theta$ moves both simultaneously, causing instability (the target is a moving goalposts).

**Two-time scale approximation (Target Network):** Maintain two networks: the online network with parameters $\theta$ (updated frequently) and a target network with parameters $\tilde{\theta}$ (updated infrequently):

$$\mathcal{L}(\theta) = \sum_B \!\left[C_t + \alpha \min_{a'} Q_{\tilde{\theta}}(X_{t+1}, a') - Q_\theta(X_t, A_t)\right]^2$$

$\theta$ updates rapidly via gradient descent. $\tilde{\theta}$ is updated by copying from $\theta$ every $k$ steps. This decouples the target from the current estimate, stabilizing training.

---

## TD Learning (Value Function Approximation)

**Temporal Difference (TD) learning** aims to learn the value function $V_\pi$ for a fixed policy $\pi$, without full model knowledge.

The TD update:

$$\hat{V}(X_t) \leftarrow \hat{V}(X_t) + a_t\!\left[C_t + \alpha \hat{V}(X_{t+1}) - \hat{V}(X_t)\right]$$

This is equivalent to Q-learning but for value functions (without the min over actions, since the policy is fixed).

**TD(0):** The version above, using only the immediate next step.

**TD($\lambda$):** Uses $\lambda$-weighted multi-step returns, interpolating between TD(0) (myopic, uses only next step) and Monte Carlo (uses full trajectory).

---

## Summary

| Algorithm | Policy | Model | Update target |
|---|---|---|---|
| Monte Carlo | Off-policy | Model-based | Estimated $\hat{P}, \hat{C}$, then VI/PI |
| Q-learning | Off-policy | Model-free | $C_t + \alpha \min_{a'} \hat{Q}(X_{t+1}, a')$ |
| SARSA | On-policy | Model-free | $C_t + \alpha \hat{Q}(X_{t+1}, A_{t+1})$ |
| Deep Q-learning | Off-policy | Model-free | $C_t + \alpha \min_{a'} Q_{\tilde{\theta}}(X_{t+1}, a')$ |
| TD learning | On-policy | Model-free | $C_t + \alpha \hat{V}(X_{t+1})$ |

All methods converge under appropriate conditions (sufficient exploration, decaying step sizes), but Deep Q-learning requires the additional target network stabilization for neural approximation.
