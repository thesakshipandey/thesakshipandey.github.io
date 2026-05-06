---
layout: post
title: "Weighted Majority Algorithm"
date: 2026-01-09
description: "Relaxing the perfect-expert assumption with exponential weight decay and regret analysis."
tags: [online-learning, expert-advice, regret]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Weighted Majority Algorithm

## Dropping the Perfect Expert Assumption

The Majority Algorithm required a perfect expert. Now we drop that assumption entirely. The adversary has full knowledge of our algorithm and can ensure we make mistakes at every step. The question shifts: instead of bounding absolute loss, we bound **regret** relative to the best expert in hindsight.

The key insight is that if the adversary forces us to err, it must also be forcing many experts to err. It is unreasonable to demand better performance than the best expert.

**Regret** is defined as:

$$R_n = L_n - \min_i L_{i,n}$$

where $L_{i,n}$ is the cumulative loss of expert $i$ over the horizon.

---

## Algorithm 2: Weighted Majority Algorithm (WMA)

Each expert $i$ starts with weight $W_0[i] = 1$. When an expert makes a mistake, its weight decays by a factor $(1 - \beta)$ for some learning rate $\beta \in (0, 1)$.

**Require:** Number of experts $K$, horizon $n$, learning rate $\beta \in (0, 1)$

1. **Initialize:** $W_0 = \{1, 1, \ldots, 1\}$
2. **For** $t = 1$ to $n$ **do:**
   - $w_1 = \sum_{k=1}^K W_t[k] \cdot \mathbf{1}[Y_{k,t} = 1]$
   - $w_0 = \sum_{k=1}^K W_t[k] \cdot \mathbf{1}[Y_{k,t} = 0]$
   - $A_t = \mathbf{1}\{w_1 \geq w_0\}$
   - Observe $X_t$
   - **For** $i = 1$ to $K$: $W_{t+1}[i] = \begin{cases} W_t[i] & \text{if } Y_{i,t} = X_t \\ (1-\beta) W_t[i] & \text{otherwise} \end{cases}$
3. **End for**

Note: the Majority Algorithm is a special case of WMA with $\beta = 1$ (full elimination on mistake).

Also note: the adversary knows Algorithm 2 and can force a mistake at every step. However, this means experts are also making mistakes, which decays their weights and limits how much we can suffer relative to them.

---

## Regret Analysis

Define $W_t = \sum_{i=1}^K W_{i,t}$ as the total weight at time $t$, starting from $W_1 = K$.

### Lower Bound

**Claim.** $W_{n+1} \geq (1-\beta)^{L_{i,n}}$ for any expert $i$.

**Proof.** Expert $i$'s individual weight after the horizon is $W_{i,n+1} = (1-\beta)^{L_{i,n}}$ since their weight decays exactly once for each of their $L_{i,n}$ mistakes. Since total weight is the sum of all individual weights, $W_{n+1} \geq W_{i,n+1} = (1-\beta)^{L_{i,n}}$. $\square$

### Upper Bound

Decompose total weight into "good" weight $GW_t$ (experts who predicted correctly this round) and "bad" weight $BW_t$ (experts who made a mistake):

$$W_t = GW_t + BW_t$$
$$W_{t+1} = GW_t + (1-\beta) BW_t = (1-\beta)W_t + \beta \cdot GW_t$$

Because the agent errs only when the majority is wrong, meaning $GW_t \leq \frac{1}{2} W_t$ whenever the agent makes a mistake. So on each agent mistake:

$$W_{t+1} \leq (1-\beta)W_t + \frac{\beta}{2} W_t = \left(1 - \frac{\beta}{2}\right) W_t$$

Over $L_n$ agent mistakes:

$$W_{n+1} \leq \left(1 - \frac{\beta}{2}\right)^{L_n} \cdot K$$

### Combining the Bounds

From the lower and upper bounds:

$$\left(1 - \frac{\beta}{2}\right)^{L_n} \cdot K \geq (1-\beta)^{L_{i,n}}$$

Taking logs and applying the inequality $1 - \frac{1}{x} \leq \ln x \leq x - 1$ with $x = 1 - \frac{\beta}{2}$:

$$\ln K + L_n \ln\!\left(1 - \frac{\beta}{2}\right) \geq L_{i,n} \ln(1-\beta)$$

Using $\ln(1 - \beta/2) \leq -\beta/2$ and $\ln(1-\beta) \geq -\beta/(1-\beta)$:

$$\ln K - \frac{\beta}{2} L_n \geq L_{i,n} \cdot \frac{-\beta}{1-\beta}$$

Rearranging:

$$\boxed{L_n \leq \frac{2}{1-\beta} L_{i,n} + \frac{2}{\beta} \ln K}$$

This holds for any expert $i$. Taking $i$ to be the best expert:

$$L_n \leq \frac{2}{1-\beta} \left[\min_i L_{i,n}\right] + \frac{2}{\beta} \ln K$$

### Regret Bound

$$R_n^{\text{WMA}} = L_n - \min_i L_{i,n} \leq \frac{1+\beta}{1-\beta} \left[\min_i L_{i,n}\right] + \frac{2}{\beta} \ln K$$

For the regret to be **sub-linear** in $n$, we need $\min_i L_{i,n}$ to be sub-linear. If the best expert makes $O(\sqrt{n})$ mistakes, WMA will too.

---

## The Impossibility of Deterministic Sub-linear Regret

**Claim 1.3.** *For the $0$-$1$ loss formulation, no deterministic algorithm can achieve sub-linear regret.*

**Proof.** Suppose algorithm $A$ is deterministic. The adversary knows $A$ in advance. With $K = 2$ experts (one always predicts 1, one always predicts 0), the adversary simply reveals the ground truth to be whichever prediction $A$ did not make. So $A$ errs at every step:

$$R_n^{\text{best}} \geq \frac{n}{2} = \Theta(n)$$

The best expert makes at most $n/2$ mistakes, but $A$ makes $n$ mistakes, giving linear regret. $\square$

This tells us that to get sub-linear regret, we need either:
1. A **softer loss** (not $0$-$1$), or
2. A **randomized algorithm**.

The Exponential WMA addresses point 1. The Randomized Exponential WMA addresses point 2.
