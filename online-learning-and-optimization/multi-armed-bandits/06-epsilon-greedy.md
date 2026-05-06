---
layout: post
title: "Epsilon-Greedy"
date: 2026-02-11
description: "Explicit random exploration with decaying epsilon and comparison to UCB."
tags: [bandits, stochastic, exploration]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Epsilon-Greedy

## The Simplest Adaptive Exploration Strategy

UCB achieves adaptive exploration through optimistic indices. Epsilon-Greedy takes a more direct approach: with probability $\epsilon_t$, explore uniformly at random; with probability $1 - \epsilon_t$, exploit the current best arm.

---

## Algorithm 10: Epsilon-Greedy

**Require:** Number of arms $K$, horizon $n$, bias $\epsilon_0$

**Initialize:** Empirical mean of each arm $= 0$.

**For** $t = 1$ to $n$ **do:**

$$A_t = \begin{cases} \text{Uniform}([K]) & \text{w.p. } \epsilon_t \\ \arg\max_{i} \hat{\mu}_i & \text{w.p. } 1 - \epsilon_t \end{cases}$$

Decay $\epsilon_t = \frac{1}{t}$

**End for**

The exploration probability $\epsilon_t = 1/t$ decays over time. Early on, the agent explores frequently. As estimates sharpen, exploitation dominates. The $1/t$ decay ensures each arm is explored infinitely often (almost surely), which is necessary for consistent estimation.

---

## Intuition and Trade-offs

**Why decay $\epsilon_t$?** A fixed $\epsilon$ means the agent always wastes a constant fraction of pulls on random arms, giving linear regret. Decaying $\epsilon_t$ ensures the exploration cost is eventually negligible.

**Why $1/t$ specifically?** It is the boundary rate: slow enough to explore each arm infinitely often, but fast enough that the exploration cost ($\sum_t \epsilon_t$) diverges slowly (as $\ln n$).

**Compared to UCB:**
- UCB explores implicitly through uncertainty estimates; high-uncertainty arms get high indices automatically.
- $\epsilon$-greedy explores explicitly and uniformly among all arms, wasting pulls on clearly sub-optimal arms.
- UCB has provably logarithmic regret with matching constants. $\epsilon$-greedy requires more careful tuning to match UCB's guarantees.

---

## Regret Analysis (Sketch)

Performing a full regret analysis for $\epsilon$-greedy with $\epsilon_t = \epsilon_0/t$ (a more general form) involves:

1. **Exploration cost:** At each step $t$, with probability $\epsilon_t$ a random arm is pulled. The expected cost of random pulls is $\epsilon_t \cdot \bar{\Delta}$ where $\bar{\Delta}$ is the average sub-optimality gap. Total: $\sum_{t=1}^n \epsilon_t \cdot \bar{\Delta}$.

2. **Exploitation cost:** With probability $1 - \epsilon_t$, the empirically best arm is pulled. If estimates are good, this is the right arm. The probability of picking the wrong arm decays as $t$ grows.

The optimal $\epsilon_0$ depends on the instance ($\Delta$ values) and horizon $n$, making $\epsilon$-greedy harder to tune in practice.

---

## Practical Considerations

**$\epsilon$-greedy is simple to implement:** no confidence interval computation, just a coin flip. This makes it popular in practice despite its weaker theoretical guarantees.

**It handles non-stationarity better than UCB** in some empirical settings, since the uniform exploration prevents the algorithm from getting stuck.

**The decay schedule matters:** $\epsilon_t = c/t$ for well-chosen $c$ can achieve logarithmic regret. The regret analysis parallels the ETC analysis but with the exploration interleaved throughout.

---

## Relationship to Other Algorithms

| Algorithm | Exploration mechanism | Exploitation | Regret |
|---|---|---|---|
| ETC | Fixed upfront (first $mK$ steps) | Pure (last $n - mK$ steps) | $O(\ln n / \Delta)$ with known $\Delta$ |
| UCB | Implicit (high UCB $=$ high uncertainty) | Greedy on UCB index | $O(\ln n / \Delta)$ instance-independent |
| $\epsilon$-Greedy | Explicit random (w.p. $\epsilon_t$) | Greedy on empirical mean | $O(\ln n / \Delta)$ with tuned $\epsilon_0$ |

All three achieve logarithmic regret in the stochastic setting, but UCB does so with the weakest assumptions and no tuning on the instance parameters.
