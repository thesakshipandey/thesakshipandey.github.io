---
layout: post
title: "Randomized Exponential WMA"
date: 2026-01-16
description: "Handling non-convex action spaces via randomization, and high-probability regret bounds."
tags: [online-learning, expert-advice, randomized]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Randomized Exponential WMA

## The Need for Randomization

In the Exponential WMA, we assumed the action space $\mathcal{D}$ is **convex**, so the weighted average $A_t \in \mathcal{D}$ is well-defined. But when $Y_{i,t}$ and $A_t$ live in different spaces (e.g., experts output binary labels but the agent must also output a binary label), taking a weighted average does not make sense.

At this level of generality, no deterministic algorithm can achieve sub-linear regret. The only way out is **randomization**: instead of averaging expert outputs, randomly select one expert to follow.

---

## Algorithm 4: Randomized Exponential WMA (REWMA)

**Require:** Number of experts $K$, horizon $n$, learning rate $\beta \in (0, 1)$

1. **Initialize:** $W_0 = \{1, 1, \ldots, 1\}$
2. **For** $t = 1$ to $n$ **do:**
   - Choose expert $I_t$ with probability $\mathbb{P}(I_t = i) = \frac{W_t[i]}{\sum_{j=1}^K W_t[j]}$
   - $A_t = Y_{I_t, t}$
   - Observe $X_t$
   - **For** $i = 1$ to $K$: $W_{t+1}[i] = W_t[i] \cdot e^{-\beta \cdot \ell(X_t, Y_{i,t})}$
3. **End for**

The weight update is identical to EWMA. Only the action selection differs: we sample an expert rather than average over them.

---

## Equivalence of Expected Loss

To analyze REWMA, reframe it as EWMA on an extended space. Define:

- $D' = \{p \in \mathbb{R}_+^K : \sum_{i=1}^K p_i = 1\}$ (the $K$-dimensional simplex, representing distributions over experts)
- $E' = E \times D^K$ where $E$ is the space of $X_t$

Let $Y'_{i,t}$ be the vector that is $0$ everywhere except position $i$ (indicating expert $i$ is chosen). Define the extended loss:

$$\ell'(x', p) = \ell'\!\left((x, [y_1, \ldots, y_K]), p\right) = \sum_{i=1}^K p_i \ell(x, y_i)$$

This is convex in $p$ (linear, actually). Under Algorithm 3 (EWMA) applied to this extended formulation, the action is:

$$A'_t = \left(\frac{w_{1,t}}{\sum_j w_{j,t}}, \ldots, \frac{w_{K,t}}{\sum_j w_{j,t}}\right) \in D'$$

and the expected loss equals:

$$\ell'(X'_t, A'_t) = \sum_{i=1}^K \frac{w_{i,t}}{\sum_j w_{j,t}} \ell(X_t, Y_{i,t}) = \mathbb{E}[\ell(X_t, A_t)]$$

**The loss of REWMA equals the expected loss of EWMA.** Therefore the expected regret of REWMA inherits the same bound:

$$\mathbb{E}\!\left[R_n^{\text{REWMA}}\right] \leq \sqrt{\frac{n \ln K}{2}} \quad ; \quad \beta = \sqrt{\frac{8 \ln K}{n}}$$

---

## High-Probability Bound

The expected regret bound tells us how REWMA performs on average. But what if the actual regret deviates significantly from its expectation?

**Hoeffding's Inequality.** For independent random variables $X_1, \ldots, X_n$ bounded in $[0,1]$:

$$\sum_{i=1}^n X_i \leq \mathbb{E}\!\left[\sum_{i=1}^n X_i\right] + \sqrt{\frac{n \ln(1/\delta)}{2}} \quad \text{w.p. } \geq 1 - \delta$$

Note: even though $A_t$ depends on the weights (which depend on past losses), the **loss values** $\ell(X_t, A_t)$ are still independent across time steps. So Hoeffding's inequality applies.

**Claim 1.5.** *Under Algorithm 4 with $\beta = \sqrt{\frac{8 \ln K}{n}}$, with probability at least $1 - \delta$:*

$$R_n^{\text{REWMA}} \leq \mathbb{E}\!\left[R_n^{\text{REWMA}}\right] + \sqrt{\frac{n \ln(1/\delta)}{2}} \leq \sqrt{\frac{\pi n}{2}}\!\left(\sqrt{\frac{\ln K}{2}} + \sqrt{\frac{\ln(1/\delta)}{2}}\right)$$

---

## Summary of the Expert Advice Section

| Algorithm | Assumption | Regret |
|---|---|---|
| Majority (MA) | Perfect expert exists | $\leq \log_2 K$ mistakes (absolute) |
| Weighted Majority (WMA) | None (0-1 loss) | $\leq \frac{2}{1-\beta} L^* + \frac{2}{\beta} \ln K$ |
| Exponential WMA (EWMA) | Convex loss, $\mathcal{D}$ convex | $O(\sqrt{n \ln K})$ |
| Randomized EWMA | Convex loss, $\mathcal{D}$ arbitrary | $O(\sqrt{n \ln K})$ in expectation |

The progression shows how relaxing assumptions forces us toward randomization or softer loss. The fundamental barrier is that a deterministic agent against an all-knowing adversary with $0$-$1$ loss cannot escape linear regret.
