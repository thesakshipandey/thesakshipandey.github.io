---
layout: post
title: "Pure Exploration: Fixed Confidence"
date: 2026-02-18
description: "Delta-PC algorithms, lower bounds on stopping time, Action Elimination and LUCB."
tags: [bandits, pure-exploration, best-arm]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Pure Exploration: Fixed Confidence

## A Different Trade-off

In the fixed budget setting, the metric was error probability given a fixed pull count. The **fixed confidence** setting flips this: given a target confidence level, the algorithm decides adaptively when to stop and what the metric is **expected stopping time** $\mathbb{E}[\tau]$.

The algorithm outputs a triple: a sampling rule (which arm to pull), a stopping rule ($\tau$: when to stop), and a decision rule ($\hat{a}$: which arm to return at stopping).

---

## Delta-Probably Correct

**Definition.** An algorithm is $\delta$-**probably correct** ($\delta$-PC) if:

$$\mathbb{P}\{\tau < \infty, \hat{a} \neq a^*\} \leq \delta$$

That is, if the algorithm ever stops, the probability it returns the wrong arm is at most $\delta$.

Note: an algorithm that never stops is trivially $\delta$-PC (the probability of stopping and being wrong is 0). So the goal is to find a $\delta$-PC algorithm with small $\mathbb{E}[\tau]$.

---

## Lower Bound on Stopping Time

**Theorem 4.5.** *For a 1-Gaussian instance with means $\mu_1 \geq \mu_2 \geq \ldots \geq \mu_K$ (arm 1 optimal), any $\delta$-PC algorithm must satisfy:*

$$\mathbb{E}[\tau] \geq 2\ln\!\left(\frac{1}{4\delta}\right) \sum_{i=1}^K \frac{1}{\Delta_i^2}$$

where $\Delta_1 = \Delta_2 = \mu_1 - \mu_2$.

**Proof sketch.** For each arm $a \neq 1$, construct a perturbed instance $\mu^{[a]}$ where arm $a$ becomes optimal:

$$\mu_i^{[1]} = \begin{cases} \mu_2 - \epsilon & i = 1 \\ \mu_i & i \neq 1 \end{cases} \quad \mu_i^{[a]} = \begin{cases} \mu_a + \Delta_a + \epsilon & i = a \\ \mu_i & i \neq a \end{cases}$$

For each $a$, define event $A = \{\tau < \infty, \hat{a} \neq a^*_{\mu^{[a]}}\}$.

Since the algorithm is $\delta$-PC, $\mathbb{P}_{\mu^{[a]}}(A) \leq \delta$.

Also, $\mathbb{P}_\mu(A^C) \leq \delta$ because in the original instance, returning arm $a$ as optimal would be wrong.

Applying BH inequality:

$$4\delta \geq \mathbb{P}_\mu(A^C) + \mathbb{P}_{\mu^{[a]}}(A) \geq \frac{1}{2}\exp\!\left\{-\mathbb{E}_\mu[N_a(\tau)] \cdot \text{KL}(\mu, \mu^{[a]})\right\}$$

For 1-Gaussian arms with perturbation by $\epsilon \to 0$: $\text{KL}(\mu, \mu^{[a]}) \approx \Delta_a^2/2$.

So $\mathbb{E}_\mu[N_a(\tau)] \geq \frac{2\ln(1/(4\delta))}{\Delta_a^2}$.

Summing over all arms: $\mathbb{E}[\tau] = \sum_a \mathbb{E}[N_a(\tau)] \geq 2\ln\!\left(\frac{1}{4\delta}\right)\sum_a \frac{1}{\Delta_a^2}$. $\square$

---

## Algorithm 13: Action Elimination

Action Elimination samples arms in round-robin and eliminates arms whose UCB falls below the LCB of another arm.

**Require:** $K$, $\delta$, $\mu = \{\mu_i\}$

**Initialize:** Active set $A = [K]$, $t = 0$

**For** $t = 1, 2, \ldots$ **do:**
- Pull each arm in $A$ once
- **For** arm $a = 1$ to $K$: compute
  - $\text{UCB}_a(t) = \hat{\mu}_a^t + \sqrt{\dfrac{2}{t}\ln\!\left(\dfrac{2Kt^2C}{\delta}\right)}$
  - $\text{LCB}_a(t) = \hat{\mu}_a^t - \sqrt{\dfrac{2}{t}\ln\!\left(\dfrac{2Kt^2C}{\delta}\right)}$
- Elimination set $E = \{i \in A : \exists\, j \in A \text{ s.t. } \text{UCB}_i(t) \leq \text{LCB}_j(t)\}$
- $A \leftarrow A \setminus E$
- **If** $|A| = 1$: **return** the sole arm and **STOP**
- **Else** $t \leftarrow t + 1$

**End for**

### Algorithm 13 is $\delta$-PC

**Claim 4.6.** *Algorithm 13 is $\delta$-PC.*

**Proof.** Define the bad event $B_i(t) = \{|\hat{\mu}_i(t) - \mu_i| > \alpha_t\}$ where $\alpha_t = \sqrt{\frac{2}{t}\ln\frac{2Kt^2C}{\delta}}$.

$$\mathbb{P}(B_i(t)) \leq 2\exp\!\left\{\frac{-t\alpha_t^2}{2}\right\} = \frac{\delta}{Kt^2C}$$

Taking a union bound over all arms and all time steps:

$$\mathbb{P}(B) = \mathbb{P}\!\left(\bigcup_{i \in [K]} \bigcup_{t=1}^\infty B_i(t)\right) \leq \frac{\delta}{C}\sum_{t=1}^\infty \frac{1}{t^2} \leq \delta \quad \text{for } C \geq \pi^2/6$$

On $B^C$ (good event), all confidence intervals are valid. No correct arm gets eliminated since its LCB is above the UCB of no other arm. $\square$

### Stopping Time Analysis

Arm $i$ gets eliminated when $\text{UCB}_i(t) \leq \text{LCB}_j(t)$ for some arm $j$. We know $\text{UCB}_i(t) - \text{LCB}_i(t) = 2\alpha_t$.

Once $\alpha_t \leq \Delta_i/4$, arm $i$ is guaranteed to be eliminated. This requires $T_i \sim O(1/\Delta_i^2)$ pulls. Total stopping time:

$$\tau \leq \sum_{i=1}^K T_i = O\!\left(\sum_i \frac{1}{\Delta_i^2} \ln\!\left[\frac{K}{\delta \Delta_i}\right]\right)$$

**Problem with Action Elimination:** If multiple sub-optimal arms have the same distribution, their confidence intervals always overlap. The arm that knocked out the optimal arm might get eliminated, leaving only arms that cannot be distinguished from each other, and the algorithm never terminates. This is why LUCB is preferred.

---

## Algorithm 14: LUCB

LUCB (Lower and Upper Confidence Bounds) addresses the termination problem by comparing only the **top-two arms** rather than all arms.

**Define arm-dependent confidence width:** $\alpha_{i,t} = \sqrt{\frac{1}{2N_i(t-1)}\ln\!\left(\frac{cKt^4}{\delta}\right)}$

**Require:** $K$, $\delta$

**Initialize:** Active set $A = [K]$

**For** $t = 1, 2, \ldots$ **do:**
- Pull each arm once
- **Define** top arm: $a_{\text{top}} = \arg\max_{i \in [K]} \hat{\mu}_i(t)$
- **Define** competitor: $a_{\text{comp}} = \arg\max_{i \in [K], i \neq a_{\text{top}}} \hat{\mu}_i(t) + \alpha_{i,t}$
- Pull $a_{\text{top}}$ and $a_{\text{comp}}$ once each
- **If** $\text{LCB}_{a_{\text{top}}} > \text{UCB}_{a_{\text{comp}}}$: **return** $a_{\text{top}}$ and **STOP**

**End for**

**Claims (Algorithm 14):**
- **Claim 4.7:** Algorithm 14 stops with probability 1 (no termination failure).
- **Claim 4.7:** Algorithm 14 is $\delta$-PC.

### Why LUCB Solves the Termination Problem

LUCB never eliminates arms. Instead, it identifies the best arm by asking: is the LCB of the top arm above the UCB of all competitors? If two arms have identical distributions, the top arm fluctuates between them, but eventually one will separate enough to stop the algorithm with probability 1.

### Stopping Time Bound

**Claim 4.8.** For a variation of LUCB with $\alpha_{i,t} = \sqrt{\frac{2}{N_i(t-1)}\ln\!\left(\frac{2KN_i^2(t-1)c}{\delta}\right)}$, arm $i$ is BAD if its confidence interval misbehaves. The algorithm stops when no arm is BAD:

$$\tau \leq \sum_{t=1}^\infty \sum_{i=1}^K \mathbf{1}\!\left\{(a_{\text{top}} = i \text{ or } a_{\text{comp}} = i) \text{ and } i \text{ is BAD}\right\} = \sum_{i=1}^K \tilde{T}_i$$

Each $\tilde{T}_i$ is bounded by the number of pulls needed for arm $i$'s confidence interval to be valid with high probability.

---

## Comparison of Fixed-Confidence Algorithms

| Algorithm | Termination guarantee | $\delta$-PC | Stopping time |
|---|---|---|---|
| Action Elimination | May not terminate (duplicate sub-optimal arms) | Yes | $O(\sum_i \frac{1}{\Delta_i^2} \ln \frac{K}{\delta\Delta_i})$ |
| LUCB | Always stops (w.p. 1) | Yes | Comparable to lower bound |

**Lower bound:** $\mathbb{E}[\tau] \geq 2\ln(1/(4\delta)) \sum_i 1/\Delta_i^2$

LUCB is near-optimal (matching the lower bound up to log factors), terminates with probability 1, and avoids the degenerate cases that trap Action Elimination.
