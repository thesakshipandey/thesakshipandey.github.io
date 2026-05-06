---
layout: post
title: "Anytime UCB"
date: 2026-02-04
description: "Decaying confidence parameter, Apery's constant, and the alpha-UCB family."
tags: [bandits, stochastic, ucb]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Anytime UCB

## The Horizon Dependence Problem

The vanilla UCB algorithm (Algorithm 8) sets $\delta = 1/n^2$, which requires knowing the horizon $n$ in advance. An algorithm that works without prior knowledge of $n$ is called an **anytime algorithm**.

The fix is simple in principle: let $\delta$ decay with time rather than fixing it at the start.

---

## Algorithm 9: Anytime UCB

**Require:** Number of arms $K$

**Initialize:** UCB of each arm $= \infty$. Pull each arm once.

**For** $t = K+1$ to $\infty$ **do:**
- **For** $j = 1$ to $K$: $\text{UCB}_j(t) = \hat{\mu}_{j,t-1} + \sqrt{\dfrac{8\ln t}{T_j(t-1)}}$
- Pick arm $A \in \arg\max_{i \in [K]} \text{UCB}_i(t-1)$

**End for**

The key change: vanilla UCB uses $\delta = 1/n^2$, while anytime UCB uses $\delta_t = 1/t^4$ (a decaying confidence parameter). This makes the UCB depend only on the current time $t$, not the horizon.

---

## Regret Bound

**Theorem 3.5.** *For Anytime UCB (Algorithm 9), the regret at any horizon $n$ satisfies:*

$$R_n(t) \leq \left(1 + 2\zeta(3)\right)\sum_{i=1}^K \Delta_i + \sum_{i:\Delta_i > 0} \frac{32\ln n}{\Delta_i}$$

where $\zeta(3) = \sum_{t=1}^\infty t^{-3} \approx 1.202$ is **Apery's constant**.

---

## Proof

Fix a sub-optimal arm $i$ with $\Delta_i > 0$. We claim that if arm $i$ is pulled at time $t$, at least one of three conditions holds:

1. $\text{UCB}_1(t) \leq \mu_1$ (arm 1's UCB falls below its true mean)
2. $\text{LCB}_i(t) > \mu_i$ (arm $i$'s LCB rises above its true mean)
3. $T_i(t-1) < \frac{32\ln t}{\Delta_i^2}$ (arm $i$ has not been pulled enough times yet)

**Why this is true.** If none of the three conditions hold, then:
- $\text{UCB}_1(t) > \mu_1$, so $\text{UCB}_1(t) \geq \mu_1 + \Delta_i \geq \mu_i + \Delta_i$
- $\text{LCB}_i(t) \leq \mu_i$, so $\text{UCB}_i(t) = \text{LCB}_i(t) + 2\alpha_t < \mu_i + 2\sqrt{8\ln t / T_i(t-1)}$
- $T_i(t-1) \geq 32\ln t / \Delta_i^2$, so $2\sqrt{8\ln t / T_i(t-1)} \leq \Delta_i$

Combining: $\text{UCB}_i(t) < \mu_i + \Delta_i \leq \text{UCB}_1(t)$. So arm $i$ would not be the argmax and would not be pulled. Contradiction. $\square$

Now we bound $T_i(n)$:

$$T_i(n) = \sum_{t=1}^n \mathbf{1}\{A_t = i\} \leq 1 + \frac{32\ln n}{\Delta_i^2} + \sum_{t=1}^n \mathbf{1}\{\text{Cond. 1 holds}\} + \sum_{t=1}^n \mathbf{1}\{\text{Cond. 2 holds}\}$$

**Bounding Condition 1.** With $\delta_t = 1/t^4$, using a union bound over all times arm 1 could be pulled:

$$\mathbb{P}\{\text{UCB}_1(t) \leq \mu_1\} \leq \mathbb{P}\!\left(\bigcup_{s=1}^t \left\{\hat{\mu}_{1,s} + \sqrt{\frac{8\ln t}{s}} \leq \mu_1\right\}\right) \leq t \cdot \delta_t = t \cdot \frac{1}{t^4} = t^{-3}$$

**Bounding Condition 2.** Similarly: $\mathbb{P}\{\text{LCB}_i(t) > \mu_i\} \leq t^{-3}$

Taking expectation:

$$\mathbb{E}[T_i(n)] \leq 1 + \frac{32\ln n}{\Delta_i^2} + \sum_{t=1}^n t^{-3} + \sum_{t=1}^n t^{-3} \leq 1 + \frac{32\ln n}{\Delta_i^2} + 2\sum_{t=1}^\infty t^{-3} = 1 + \frac{32\ln n}{\Delta_i^2} + 2\zeta(3)$$

Multiplying by $\Delta_i$ and summing:

$$R_n \leq (1 + 2\zeta(3))\sum_i \Delta_i + \sum_{i:\Delta_i>0} \frac{32\ln n}{\Delta_i} \quad \square$$

---

## Comparison: Vanilla UCB vs Anytime UCB

| | Vanilla UCB | Anytime UCB |
|---|---|---|
| $\delta$ | $1/n^2$ (fixed) | $1/t^4$ (decaying) |
| Requires horizon | Yes | No |
| Instance-dependent regret | $\frac{16\ln n}{\Delta_i}$ per arm | $\frac{32\ln n}{\Delta_i}$ per arm |
| Constant term | $3\sum \Delta_i$ | $(1+2\zeta(3))\sum \Delta_i$ |

The anytime version pays a factor of 2 in the logarithmic term and a larger constant, as expected for the added flexibility of not knowing $n$.

---

## The $\alpha$-UCB Family

With $\delta_t = t^{-\alpha}$ for $\alpha > 2$, the probability bound becomes $t^{1-\alpha}$, which is summable as long as $\alpha > 2$. This gives the $\alpha$-UCB family:

- $\alpha = 4$ (used above): $\mathbb{P}(\text{bad event}) \leq t^{-3}$, constant $= 1 + 2\zeta(3)$
- $\alpha = 3$: $\delta_t = 1/t^3$, gives $\mathbb{P} \leq t^{-2}$, constant involves $\pi^2/6$ (Basel problem)

Using $\delta_t = 1/t^3$ (i.e., $\alpha = 3$) gives:

$$R_n(t) \leq \left(1 + \frac{\pi^2}{3}\right)\sum_i \Delta_i + \sum_{i:\Delta_i>0} \frac{24\ln n}{\Delta_i}$$

The constant on the first term is higher but the logarithmic coefficient is smaller (24 vs 32). The choice of $\alpha$ trades off between the two.
