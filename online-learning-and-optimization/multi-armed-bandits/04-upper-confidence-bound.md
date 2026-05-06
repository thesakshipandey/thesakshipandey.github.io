---
layout: post
title: "Upper Confidence Bound (UCB)"
date: 2026-01-30
description: "Optimism under uncertainty, instance-dependent and instance-independent regret proofs."
tags: [bandits, stochastic, ucb]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Upper Confidence Bound (UCB)

## The Core Idea: Optimism Under Uncertainty

ETC separates exploration and exploitation into two hard phases. UCB integrates them: at every step, pull the arm that looks best under an **optimistic** estimate of its mean.

The optimism principle: assign each arm an upper confidence bound on its true mean. Always pull the arm with the highest UCB. An arm gets pulled either because it is genuinely good (exploitation) or because we are uncertain about it (exploration). As we pull it more, uncertainty shrinks and the UCB tightens.

This is called an **index algorithm**: each arm gets an independent index, and we pick the arm with the highest index.

---

## Constructing the UCB

Assume the arm rewards are **1-sub-Gaussian**. After $n$ pulls of arm $i$, the empirical mean $\hat{\mu}_{i,n}$ satisfies:

$$\mathbb{P}(\hat{\mu}_{i,n} - \mu_i \leq -\epsilon) \leq e^{-n\epsilon^2/2} = \delta$$

Setting $\delta = e^{-n\epsilon^2/2}$ and solving for $\epsilon$:

$$\epsilon = \sqrt{\frac{2\ln(1/\delta)}{n}}$$

So with probability at least $1 - \delta$:

$$\mu_i \leq \hat{\mu}_{i,n} + \sqrt{\frac{2\ln(1/\delta)}{n}}$$

This is the **UCB**: the empirical mean plus a confidence width that shrinks as the arm is pulled more. Define:

$$\text{UCB}_i(t-1) = \begin{cases} \infty & \text{if } T_i(t-1) = 0 \\ \hat{\mu}_{i,t-1} + \sqrt{\dfrac{2\ln(1/\delta)}{T_i(t-1)}} & \text{otherwise} \end{cases}$$

Arms that have never been pulled get UCB $= \infty$ to ensure they are explored first.

---

## Algorithm 8: UCB

**Require:** Number of arms $K$, horizon $n$, confidence parameter $\delta$

**Initialize:** UCB of each arm $= \infty$. Pull each arm once.

**For** $t = K+1$ to $n$ **do:**
- **For** $j = 1$ to $K$: $\text{UCB}_j(t) = \hat{\mu}_{j,t-1} + \sqrt{\dfrac{2\ln(1/\delta)}{T_j(t-1)}}$
- Pick arm $A \in \arg\max_{i \in [K]} \text{UCB}_i(t-1)$

**End for**

---

## Instance-Dependent Regret Bound

**Theorem 3.3.** *Under Algorithm 8 with $\delta = 1/n^2$:*

$$R_n \leq 3\sum_{i=1}^K \Delta_i + \sum_{i: \Delta_i > 0} \frac{16\ln n}{\Delta_i}$$

The first term is a small one-time cost; the logarithmic term dominates.

**Proof.** Fix a sub-optimal arm $i$. Define the **good event** $G_i$:

$$G_i \stackrel{\text{def}}{=} \left\{\mu_1 < \min_{t \in [n]} \text{UCB}_1(t)\right\} \cap \left\{\hat{\mu}_{i,u_i} + \sqrt{\frac{2\ln(1/\delta)}{u_i}} < \mu_1\right\}$$

where $u_i = \left\lceil\frac{8\ln(1/\delta)}{\Delta_i^2}\right\rceil$.

The good event $G_i$ says: (1) the UCB of arm 1 always covers its true mean, and (2) once arm $i$ has been pulled $u_i$ times, its UCB falls below $\mu_1$.

**Claim:** On $G_i$, we have $T_i(n) \leq u_i$.

**Proof of claim.** Suppose $T_i(n) > u_i$. Then there exists a time $t$ when arm $i$ was pulled for the $(u_i + 1)$-th time. At that moment, $\text{UCB}_i(t) \geq \text{UCB}_1(t) > \mu_1$. But from the second condition of $G_i$, $\text{UCB}_i(t) < \mu_1$ when $T_i(t) \geq u_i$. Contradiction. $\square$

Using total expectation:

$$\mathbb{E}[T_i(n)] = \mathbb{E}[T_i(n) \cdot \mathbf{1}_{G_i}] + \mathbb{E}[T_i(n) \cdot \mathbf{1}_{G_i^C}] \leq u_i + \mathbb{P}(G_i^C) \cdot n$$

**Bounding $\mathbb{P}(G_i^C)$.** The complement $G_i^C = J_1 \cup J_2$ where:

- $J_1$: UCB of arm 1 drops below $\mu_1$ (UCB is violated for the optimal arm)
- $J_2$: arm $i$'s UCB stays above $\mu_1$ even after $u_i$ pulls

For $J_1$: taking a union bound over all times $s$ arm 1 could be pulled,

$$\mathbb{P}(J_1) \leq \sum_{s=1}^n \mathbb{P}\!\left(\hat{\mu}_{1,s} + \sqrt{\frac{2\ln(1/\delta)}{s}} \leq \mu_1\right) \leq n\delta$$

For $J_2$: with $u_i = \lceil 8\ln(1/\delta)/\Delta_i^2 \rceil$, we have $\Delta_i - \sqrt{2\ln(1/\delta)/u_i} \geq \Delta_i/2$, so

$$\mathbb{P}(J_2) = \mathbb{P}\!\left(\hat{\mu}_{i,u_i} - \mu_i \geq \frac{\Delta_i}{2}\right) \leq \exp\!\left[\frac{-u_i \Delta_i^2}{8}\right] = \delta$$

So $\mathbb{P}(G_i^C) \leq n\delta + \delta$.

Setting $\delta = 1/n^2$:

$$\mathbb{E}[T_i(n)] \leq 1 + \frac{8\ln(1/\delta)}{\Delta_i^2} + n(n\delta + \delta) \leq 3 + \frac{16\ln n}{\Delta_i^2}$$

Therefore:

$$R_n = \sum_i \Delta_i \mathbb{E}[T_i(n)] \leq 3\sum_i \Delta_i + \sum_{i:\Delta_i>0} \frac{16\ln n}{\Delta_i} \quad \square$$

---

## Instance-Independent Regret Bound

The instance-dependent bound is useful when $n \to \infty$ with fixed instance. But if $\Delta_i$ is very small, the bound blows up. We need an **instance-independent** bound.

**Theorem 3.4.** *Under Algorithm 8 with $\delta = 1/n^2$:*

$$R_n \leq 8\sqrt{nK\ln n} + 3\sum_{i=1}^K \Delta_i$$

**Proof.** Split arms into two groups by threshold $\Delta > 0$:

$$R_n = \sum_{i:\Delta_i \leq \Delta} \Delta_i \mathbb{E}[T_i(n)] + \sum_{i:\Delta_i > \Delta} \Delta_i \mathbb{E}[T_i(n)]$$

For the first group: $\Delta_i \leq \Delta$, so their total contribution is at most $n\Delta$.

For the second group: apply the instance-dependent bound:

$$\sum_{i:\Delta_i > \Delta} \Delta_i \mathbb{E}[T_i(n)] \leq 3\sum_{i:\Delta_i>\Delta} \Delta_i + \frac{16K\ln n}{\Delta}$$

So:

$$R_n \leq n\Delta + 3\sum_i \Delta_i + \frac{16K\ln n}{\Delta}$$

Minimize over $\Delta$ by setting $\Delta = \sqrt{\frac{16K\ln n}{n}}$:

$$R_n \leq 8\sqrt{nK\ln n} + 3\sum_i \Delta_i \quad \square$$

The dominant term $8\sqrt{nK\ln n}$ is **instance-independent**.

---

## UCB Optimality

UCB achieves logarithmic instance-dependent regret $O(\ln n / \Delta)$, matching the lower bound (up to constants). The instance-independent bound $O(\sqrt{nK\ln n})$ is near-optimal, with the minimax lower bound being $\Omega(\sqrt{nK})$.
