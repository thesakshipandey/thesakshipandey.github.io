---
layout: post
title: "Exponential Weighted Majority Algorithm"
date: 2026-01-14
description: "Real-valued predictions, Hoeffding's Lemma, and the O(sqrt(n ln K)) regret bound."
tags: [online-learning, expert-advice, regret]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Exponential Weighted Majority Algorithm

## From Binary to Real-Valued Predictions

We now move from binary sequences to real-valued ones. Let $X_t, Y_{i,t}, A_t \in [0, 1]$. Define a loss function $\ell(X_t, A_t) \in [0, 1]$ incurred when the agent takes action $A_t$ and the truth is $X_t$.

**Key assumption:** $\ell$ is **convex** in its second argument $A_t$.

The cumulative loss is:

$$L_n = \sum_{t=1}^n \ell(X_t, A_t)$$

---

## Algorithm 3: Exponential WMA (EWMA)

Rather than a binary vote, the agent takes a **weighted average** of expert predictions. Weights are updated exponentially based on each expert's loss.

**Require:** Number of experts $K$, horizon $n$, learning rate $\beta > 0$

1. **Initialize:** $W_0 = \{1, 1, \ldots, 1\}$
2. **For** $t = 1$ to $n$ **do:**
   - $A_t = \frac{\sum_{i=1}^K W_t[i] \cdot Y_{i,t}}{\sum_{i=1}^K W_t[i]}$ (weighted average of expert predictions)
   - Observe $X_t$
   - **For** $i = 1$ to $K$: $W_{t+1}[i] = W_t[i] \cdot e^{-\beta \cdot \ell(X_t, Y_{i,t})}$
3. **End for**

The action $A_t$ is now a real number, not binary. Experts with low recent loss have higher weights and contribute more to the prediction. Higher $\beta$ makes the algorithm more sensitive: small losses still cause significant weight decay.

---

## Hoeffding's Lemma

Before the regret analysis, we need a key tool for bounding the MGF of bounded random variables.

**Lemma 1.4 (Hoeffding's Lemma).** *For a bounded random variable $X \in [a, b]$:*

$$\mathbb{E}[e^{SX}] \leq \exp\!\left\{S\mathbb{E}[X] + \frac{1}{8} S^2 (b-a)^2\right\}$$

*For $X \in [0,1]$ specifically:*

$$\mathbb{E}[e^{SX}] \leq \exp\!\left\{S\mathbb{E}[X] + \frac{1}{8}S^2\right\}$$

**Proof sketch.** Introduce $X'$, an independent copy of $X$ with the same distribution. By convexity of $e^x$ and Jensen's inequality:

$$\mathbb{E}_X[\exp\{S(X - \mathbb{E}_X[X])\}] \leq \mathbb{E}_X[\mathbb{E}_{X'}[\exp\{S(X - X')\}]]$$

This symmetrization reduces the problem to a symmetric random variable, and the rest follows from Taylor expansion. $\square$

---

## Regret Analysis

Define $W_t = \sum_{i=1}^K W_{i,t}$, the total weight at time $t$. We bound $W_{n+1}$ from both sides.

### Lower Bound

For any expert $i$, their weight after the horizon is $W_{i,n+1} = e^{-\beta L_{i,n}}$ (since each time step multiplies by $e^{-\beta \ell}$ and the product telescopes). Since total weight sums over all experts:

$$W_{n+1} \geq e^{-\beta L_{i,n}}$$

### Upper Bound

We track how total weight changes each step. Define a random variable $Z = Y_{I,t}$ where expert $I$ is chosen with probability proportional to its weight $\frac{W_{i,t}}{\sum_j W_{j,t}}$. Then $A_t = \mathbb{E}[Z]$.

$$\frac{W_{t+1}}{W_t} = \mathbb{E}\left[e^{-\beta \cdot \ell(X_t, Z)}\right]$$

Applying Hoeffding's Lemma with $S = -\beta$:

$$\frac{W_{t+1}}{W_t} \leq e^{-\beta \cdot \mathbb{E}[\ell(X_t, Z)]} \cdot e^{\beta^2/8}$$

By convexity of $\ell$ in its second argument and Jensen's inequality:

$$\mathbb{E}[\ell(X_t, Z)] \geq \ell(X_t, \mathbb{E}[Z]) = \ell(X_t, A_t)$$

Therefore:

$$\frac{W_{t+1}}{W_t} \leq e^{-\beta \cdot \ell(X_t, A_t)} \cdot e^{\beta^2/8}$$

Telescoping over all $n$ steps and using $W_1 = K$:

$$\frac{W_{n+1}}{K} = \prod_{t=1}^n \frac{W_{t+1}}{W_t} \leq \exp\!\left\{-\beta L_n + \frac{n\beta^2}{8}\right\}$$

$$W_{n+1} \leq K \cdot e^{-\beta L_n + n\beta^2/8}$$

### Final Regret Bound

Combining lower and upper bounds:

$$e^{-\beta L_{i,n}} \leq W_{n+1} \leq K \cdot e^{-\beta L_n + n\beta^2/8}$$

Taking $\log$ and dividing by $\beta$:

$$-L_{i,n} \leq \ln K - \beta L_n + \frac{n\beta^2}{8}$$

$$\boxed{L_n \leq L_{i,n} + \frac{n\beta}{8} + \frac{\ln K}{\beta}}$$

This holds for any expert $i$. Taking the best expert:

$$L_n^{\text{EWMA}} \leq \left[\min_i L_{i,n}\right] + \frac{n\beta}{8} + \frac{\ln K}{\beta}$$

### Optimal $\beta$ and Regret

To minimize the bound over $\beta$, balance the two terms $\frac{n\beta}{8}$ and $\frac{\ln K}{\beta}$. Setting $\beta = \sqrt{\frac{8 \ln K}{n}}$:

$$R_n^{\text{EWMA}} = L_n^{\text{EWMA}} - \min_i L_{i,n} \leq \sqrt{\frac{n \ln K}{2}}$$

This is **sub-linear** in $n$, achieving the goal.

---

## The Anytime Problem

There is a catch: the optimal $\beta = \sqrt{\frac{8 \ln K}{n}}$ requires knowing $n$ in advance. An algorithm that works without knowing the horizon is called an **anytime algorithm**. EWMA is **not** anytime.

**Fix:** Make $\beta$ decay with time, setting $\beta_t$ instead of a fixed $\beta$.

- Setting $\beta_t = \frac{1}{\sqrt{t}}$: the weight update at time $t$ uses $W_{t+1}[i] = W_t[i] \cdot e^{-\ell / \sqrt{t}}$.

The lower bound becomes:

$$W_{n+1} \geq \exp\!\left\{-\sum_{t=1}^n \beta_t \ell(X_t, Y_{i,t})\right\}$$

The upper bound telescopes similarly. Substituting $\beta_t = 1/\sqrt{t}$ and using the harmonic sum, one can still derive a sub-linear regret bound. The same approach works for $\beta_t = 1/t^2$ (with a different constant).
