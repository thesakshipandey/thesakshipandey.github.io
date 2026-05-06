---
layout: post
title: "Explore-then-Commit (ETC)"
date: 2026-01-28
description: "Hard exploration-exploitation separation, optimal exploration length, and logarithmic regret."
tags: [bandits, stochastic, exploration]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Explore-then-Commit (ETC)

## The Bandit Setting

We now face the true bandit problem: only the pulled arm's reward is observed. Pure exploitation (always pulling the empirically best arm) fails because we may never explore arms that are actually better than our initial guesses.

The simplest structured approach: **explore first, then commit**.

---

## Algorithm 7: Explore-then-Commit (ETC)

**Require:** Number of arms $K$, horizon $n$, number of exploration pulls $m$

**Initialize:** Pull each arm $m$ times.

**For** $j = 1$ to $K$: compute $\hat{\mu}_j(m)$ (empirical mean after $m$ pulls)

Pick the arm $A \in \arg\max_{i \in [K]} \hat{\mu}_i(m)$

**For** $t = mK + 1$ to $n$ **do:** Pull arm $A$

**End for**

The algorithm has two hard phases: pure exploration ($mK$ steps) followed by pure exploitation (the remaining $n - mK$ steps). Once committed, it never revisits.

> "Ek baar maine commitment kar di, toh main apni bhi nahi sunta." This algorithm takes its commitment seriously.

---

## Regret Analysis

Assume arm 1 is optimal (WLOG). For any sub-optimal arm $i$:

$$\mathbb{E}[T_i(n)] = m + \mathbb{P}(\hat{\mu}_i(m) \in \arg\max_j \hat{\mu}_j(m)) \cdot (n - mK)$$

The second term captures the probability that arm $i$ looks best after exploration, causing full commitment to it. Using the same sub-Gaussian analysis as the full-info setting:

$$\mathbb{E}[T_i(n)] \leq m + (n - mK) \cdot e^{-m\Delta_i^2/4}$$

Summing over all arms (using the regret decomposition):

$$\boxed{R_n^{\text{ETC}} \leq m\sum_{i=1}^K \Delta_i + (n - mK)\sum_{i=1}^K \Delta_i \cdot e^{-m\Delta_i^2/4}}$$

This is an **instance-dependent** bound: it depends on the specific values of $\Delta_i$.

---

## Choosing the Optimal $m$

The bound has two competing terms: $m\sum \Delta_i$ (exploration cost) and $(n-mK)\sum \Delta_i e^{-m\Delta_i^2/4}$ (exploitation cost from wrong commitment). We want to balance them.

For a cleaner analysis, consider the two-arm case: arm 1 optimal ($\Delta_1 = 0$), arm 2 sub-optimal ($\Delta_2 = \Delta > 0$).

$$R_n^{\text{ETC}} \leq m\Delta + (n - 2m)\Delta \cdot e^{-m\Delta^2/4}$$

Differentiating with respect to $m$ and setting to zero:

$$m^* = \frac{4}{\Delta^2} \ln\!\left(\frac{n\Delta^2}{4}\right)$$

Substituting back:

$$R_n^{\text{ETC}} \leq \frac{4}{\Delta}\left[1 + \ln\!\left(\frac{n\Delta^2}{4}\right)\right]$$

---

## Key Observations

**Logarithmic regret:** Even in the best case (optimal $m$), regret scales as $O(\ln n / \Delta)$. This is the fundamental scale for stochastic bandit problems.

**Instance-dependent bound:** The bound depends on $\Delta$. As $\Delta \to 0$, the optimal $m^*$ explodes: arms that are very close in distribution require far more exploration to distinguish. This makes intuitive sense.

**You need to know $\Delta$ to set $m^*$:** In practice, $\Delta$ is unknown. ETC requires knowing the sub-optimality gap to tune $m$, which it does not have access to.

**ETC is anytime:** Algorithm 7 itself does not depend on $n$ (it just commits after $mK$ pulls). However, finding $m^*$ requires $n$. A doubling trick can make this fully anytime.

**Lower bound:** Even with optimal $m$, the regret is $\Omega(\ln n)$. Logarithmic regret is both achievable and optimal for stochastic bandits. The question is whether we can achieve it without knowing $\Delta$.

---

## The Limitation of ETC

ETC commits irrevocably after the exploration phase. If the exploration phase was unlucky (e.g., arm 2 happened to get high rewards by chance), the algorithm stays with the wrong arm forever. More adaptive algorithms continuously update their arm selection rather than committing once.
