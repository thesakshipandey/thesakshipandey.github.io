---
layout: post
title: "Pure Exploration: Fixed Budget"
date: 2026-03-11
description: "Best-arm identification with uniform exploration and successive rejects."
tags: [bandits, pure-exploration, best-arm]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Pure Exploration: Fixed Budget

## A Different Objective

All previous MAB algorithms aimed to maximize cumulative reward (minimize regret). Pure exploration problems have a different goal: **identify the best arm**, not maximize reward along the way.

In the **fixed budget** variant:
- You are given a total budget of $n$ arm pulls.
- After exhausting the budget, you must output an estimate $\hat{a}$ of the best arm $a^\ast = \arg\max_i \mu_i$.
- The metric is the **error probability** $p_e = \mathbb{P}\{\hat{a} \neq a^\ast\}$.

The aim is to minimize $p_e$ within the budget.

---

## Algorithm 11: Uniform Exploration

The simplest approach: pull each arm equally and pick the empirically best.

**Require:** Number of arms $K$, budget $n$, arm distributions $\nu = \{\nu_i\}$

- Pull each arm $n/K$ times (assume $K \mid n$ for simplicity)
- Return $\hat{a} = \arg\max_i \hat{\mu}_i$

### Error Analysis

For 1-sub-Gaussian arms, arm $i$ is incorrectly selected over arm 1 only if $\hat{\mu}_i \geq \hat{\mu}_1$. By a union bound:

$$p_e^{\text{UE}} = \sum_{i=2}^K \mathbb{P}(\hat{\mu}_i \geq \hat{\mu}_1)$$

$$= \sum_{i=2}^K \mathbb{P}\!\left\{(\hat{\mu}_1 - \mu_1) + (\mu_i - \hat{\mu}_i) \leq -\Delta_i\right\}$$

Splitting the deviation using union bound:

$$p_e^{\text{UE}} \leq \sum_{i=2}^K \left[\mathbb{P}\!\left(\hat{\mu}_1 - \mu_1 \leq \frac{-\Delta_i}{2}\right) + \mathbb{P}\!\left(\mu_i - \hat{\mu}_i \leq \frac{-\Delta_i}{2}\right)\right]$$

Each term is bounded by $\exp(-\Delta_i^2 n / (8K))$ using Hoeffding's inequality with $n/K$ samples. Therefore:

$$p_e^{\text{UE}} \leq 2\sum_{i=2}^K \exp\!\left\{-\frac{\Delta_i^2 n}{8K}\right\} \leq 2K\exp\!\left\{-\frac{\Delta_2^2 n}{8K}\right\}$$

where $\Delta_2 = \mu_1 - \mu_2$ is the smallest sub-optimality gap. The error decays exponentially in $n$, at rate $\Delta_2^2 / (8K)$.

**Key observation:** Arms that are highly sub-optimal ($\Delta_i$ large) are easy to distinguish and contribute little to $p_e$. The bottleneck is the closest competitor, arm 2.

---

## The Problem with Uniform Exploration

Uniform exploration gives every arm the same number of pulls regardless of how sub-optimal it is. If arm $K$ has $\Delta_K = 0.9$ (clearly bad), pulling it $n/K$ times is wasteful. We should concentrate on the close competition at the top.

---

## Algorithm 12: Successive Rejects

Successive Rejects (SR) runs a **tournament** in phases. In each phase, every remaining arm gets some pulls, and the worst-performing arm is eliminated.

**Require:** Number of arms $K$, budget $n$, arm distributions $\nu = \{\nu_i\}$

Let $\bar{\log}(K) = \frac{1}{2} + \sum_{i=2}^K \frac{1}{i}$ and define the elimination schedule:

$$n_i = \left\lceil\frac{n - K}{\bar{\log}(K)(K - i + 1)}\right\rceil \quad \text{for } i \in [K-1]$$

(Total constraint: $\sum_{i=1}^{K-2} n_i + 2n_{K-1} \leq n$)

**For** $i = 1$ to $K-1$ **do:**
- Phase $i$ begins.
- Give each remaining arm $n_i - n_{i-1}$ additional pulls (so each arm has $n_i$ total pulls).
- Eliminate arm $j = \arg\min_j \hat{\mu}_j(n_i)$ (the worst-performing remaining arm).

**End for**

Return the sole surviving arm.

### Why This Schedule?

$n_i \propto \frac{1}{K - i + 1}$: the number of pulls in phase $i$ is inversely proportional to the number of surviving arms. Early phases (many arms) get fewer pulls per arm; later phases (few arms remain) get more. This concentrates budget on the hard discrimination problem at the top.

If $n_1 = n_2 = \ldots = n_{K-1} = n/K$, this reduces to Uniform Exploration.

---

## Error Analysis for Successive Rejects

Define error event $E_i$: the optimal arm 1 gets eliminated in phase $i$.

$$p_e^{\text{SR}} = \sum_{i=1}^{K-1} \mathbb{P}(E_i)$$

**Phase $i$ intuition:** At phase $i$, exactly $i-1$ arms have been eliminated. So at least one of the worst $i$ arms ($K-i+1$ through $K$ in terms of rank) is still in the competition. If arm 1 gets eliminated, it lost to at least one of these worst $i$ arms.

$$\mathbb{P}(E_i) \leq \mathbb{P}\!\left(\bigcup_{j=K-i+1}^K \hat{\mu}_1(n_i) \leq \hat{\mu}_j(n_i)\right) \leq \sum_{j=K-i+1}^K \mathbb{P}(\hat{\mu}_1(n_i) \leq \hat{\mu}_j(n_i))$$

Each term is bounded by $2\exp\{-n_i \Delta_j^2 / 8\}$. Since $\Delta_j \geq \Delta_{K-i+1}$ for $j \geq K-i+1$:

$$\mathbb{P}(E_i) \leq 2i \exp\!\left\{\frac{-n_i \Delta_{K-i+1}^2}{8}\right\}$$

Summing over phases:

$$\boxed{p_e^{\text{SR}} \leq \sum_{i=1}^{K-1} 2i \exp\!\left\{-\frac{n_i \Delta_{K-i+1}^2}{8}\right\}}$$

### Substituting the Schedule

With the schedule $n_i = \lceil (n-K) / (\bar{\log}(K)(K-i+1))\rceil$, define:

$$H_2 = \max_{i \geq 2} \frac{i}{\Delta_i^2}$$

Then:

$$p_e^{\text{SR}} \leq 2K^2 \exp\!\left\{-\frac{(n-K)}{8\bar{\log}(K) H_2}\right\}$$

---

## Comparison: Uniform Exploration vs Successive Rejects

| | Uniform Exploration | Successive Rejects |
|---|---|---|
| Pulls per arm | Equal ($n/K$) | Adaptive (more on close arms) |
| Error decay rate | $\Delta_2^2 / (8K)$ | $1 / (8\bar{\log}(K) H_2)$ |
| Key complexity | $\Delta_2$ (closest competitor) | $H_2 = \max_i i/\Delta_i^2$ |

SR has a faster error decay rate in most instances (when the $H_2$ complexity is small). The quantity $H_2$ captures the effective hardness of the best-arm identification problem.

The ratio $H_2 = \max_i i / \Delta_i^2$ penalizes instances where many arms have small gaps. If all gaps are equal ($\Delta_i = \Delta$ for all $i$), then $H_2 = K/\Delta^2$, comparable to the uniform exploration regime.
