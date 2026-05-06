---
layout: post
title: "Information-Theoretic Lower Bounds for MABs"
date: 2026-02-11
description: "BH inequality, divergence decomposition, minimax and instance-dependent lower bounds."
tags: [bandits, lower-bounds, information-theory]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Information-Theoretic Lower Bounds for MABs

## Why Lower Bounds Matter

Upper bounds tell us what algorithms can achieve. Lower bounds tell us what no algorithm can do. When the two match (up to constants), we have a complete picture of the problem's difficulty.

For stochastic MABs, we want to know: is logarithmic regret truly optimal, or can clever algorithms do better?

---

## The B-H Inequality

The central tool for proving bandit lower bounds is the Bretagnolle-Huber (B-H) inequality, which relates how distinguishable two probability measures are to how different events can look under them.

**Theorem 4.1 (B-H Inequality).** *Let $\mathbb{P}$ and $\mathbb{Q}$ be probability measures on $(\Omega, \mathcal{F})$, absolutely continuous with respect to each other. For any event $A \in \mathcal{F}$:*

$$\mathbb{P}(A) + \mathbb{Q}(A^C) \geq \frac{1}{2}\exp\!\left\{-\min[\text{KL}(\mathbb{P}, \mathbb{Q}), \text{KL}(\mathbb{Q}, \mathbb{P})]\right\}$$

**Intuition:** If two measures are close (small KL divergence), then for any event $A$, it cannot simultaneously be rare under $\mathbb{P}$ and rare under $\mathbb{Q}$. One of $\mathbb{P}(A)$ or $\mathbb{Q}(A^C)$ must be non-negligible.

**Why useful:** In lower bound proofs, we construct two instances $\mu$ and $\mu'$ such that: a good algorithm must behave differently on them, but the instances are hard to distinguish. BH formalizes this tension.

**Proof sketch (3 steps):**

**Step 1:** Show $\mathbb{P}(A) + \mathbb{Q}(A^C) \geq \sum_i \min(p_i, q_i)$ (for finite $\Omega$ with $p_i = \mathbb{P}(\{x_i\}), q_i = \mathbb{Q}(\{x_i\})$).

**Step 2:** Show $\left(\sum_i \sqrt{p_i q_i}\right)^2 \leq 2\sum_i \min(p_i, q_i)$ via Cauchy-Schwarz.

**Step 3:** Show $\left(\sum_i \sqrt{p_i q_i}\right)^2 \geq \exp\{-\text{KL}(\mathbb{P}, \mathbb{Q})\}$ via Jensen's inequality applied to $\log$. $\square$

---

## Divergence-Decomposition Lemma

**Lemma 4.2.** *Let $\mathbb{P}_\mu$ and $\mathbb{P}_{\mu'}$ be the distributions induced by running a fixed policy $\Pi$ on instances $\mu$ and $\mu'$. Then:*

$$\text{KL}(\mathbb{P}_\mu, \mathbb{P}_{\mu'}) = \sum_{i=1}^K \mathbb{E}_\mu[T_i(n)] \cdot \text{KL}(\mu_i, \mu'_i)$$

**Intuition:** The total information divergence between two instances, as seen by the policy, decomposes into the divergences of each arm weighted by how often that arm is pulled. Arms that are pulled rarely contribute little to the KL divergence, making the two instances harder to distinguish.

---

## Minimax Lower Bound

**Theorem 4.3.** *Let $K > 1$ and $n > K - 1$. For any policy $\Pi$, there exists an instance $\mu \in \mathcal{E}_{\mathcal{N}}(1)$ (unit-variance Gaussian arms with means in $[0,1]$) such that:*

$$R_n(\Pi, \mu) \geq \frac{1}{27}\sqrt{n(K-1)}$$

**Proof.** Fix any policy $\Pi$. Construct two instances:

$$\mu = [\Delta, 0, 0, \ldots, 0] \quad \text{(arm 1 is optimal)}$$

$$\mu' = [\Delta, 0, \ldots, 0, 2\Delta, 0, \ldots, 0] \quad \text{(arm }i\text{ has mean }2\Delta\text{, making it optimal)}$$

where $i = \arg\min_{j \neq 1} \mathbb{E}_\mu[T_j(n)]$ is the arm pulled least often under $\mu$. Choose $\Delta \in (0, 1/2)$.

Define the event $A = \{T_1(n) \leq n/2\}$.

- Under $\mu$: $A^C$ means $T_1(n) > n/2$, which is bad since arm 1 is optimal under $\mu$. So $R_n(\Pi, \mu) \geq \mathbb{P}_\mu(A) \cdot n\Delta/2$.
- Under $\mu'$: arm 1 is sub-optimal (mean $\Delta$, vs arm $i$ with mean $2\Delta$). $A$ means $T_1(n) \leq n/2$, which is bad. So $R_n(\Pi, \mu') \geq \mathbb{P}_{\mu'}(A^C) \cdot n\Delta/2$.

Therefore:

$$R_n(\Pi, \mu) + R_n(\Pi, \mu') \geq \frac{n\Delta}{2}\left(\mathbb{P}_\mu(A) + \mathbb{P}_{\mu'}(A^C)\right) \geq \frac{n\Delta}{4}\exp\{-\text{KL}(\mathbb{P}_\mu, \mathbb{P}_{\mu'})\}$$

By divergence decomposition:

$$\text{KL}(\mathbb{P}_\mu, \mathbb{P}_{\mu'}) = \mathbb{E}_\mu[T_i(n)] \cdot \text{KL}(\mu_i, \mu'_i) = \mathbb{E}_\mu[T_i(n)] \cdot \frac{(2\Delta)^2}{2} = 2\Delta^2 \mathbb{E}_\mu[T_i(n)]$$

Since $i$ is the least-pulled arm under $\mu$, and all $K-1$ sub-optimal arms together sum to at most $n$:

$$\mathbb{E}_\mu[T_i(n)] \leq \frac{n}{K-1}$$

Substituting:

$$R_n(\Pi, \mu) + R_n(\Pi, \mu') \geq \frac{n\Delta}{4}\exp\!\left\{\frac{-2n\Delta^2}{K-1}\right\}$$

Taking $\max$ and optimizing over $\Delta$ by setting $\Delta = \sqrt{(K-1)/(4n)}$:

$$\max\{R_n(\Pi, \mu), R_n(\Pi, \mu')\} \geq \frac{\sqrt{n(K-1)}}{8\sqrt{e}} \geq \frac{\sqrt{n(K-1)}}{27} \quad \square$$

---

## Instance-Dependent Lower Bound

The minimax bound applies to the worst case. What about a specific instance?

**Consistent policy:** A policy $\Pi$ is consistent on family $\mathcal{E}^K$ if for all $\nu \in \mathcal{E}^K$, the regret $R_n(\Pi, \nu) = o(n^a)$ for all $a > 0$. UCB is consistent (it has logarithmic regret).

**Definition:** For arm $i$ with distribution $\nu_i$ and optimal mean $\mu^*$:

$$d_{\inf}(\nu_i, \mu^*, \mathcal{E}) = \inf\!\left\{\text{KL}(\nu_i, \nu'_i) : \nu'_i \in \mathcal{E}, \mu(\nu'_i) > \mu^*\right\}$$

This is the smallest KL-divergence perturbation needed to make arm $i$ optimal.

**Theorem 4.4 (Lai-Robbins Lower Bound).** *For any consistent policy $\Pi$ over $\mathcal{E}^K$ and any instance $\nu \in \mathcal{E}^K$:*

$$\liminf_{n \to \infty} \frac{R_n(\Pi, \nu)}{\ln n} \geq \sum_{i: \Delta_i > 0} \frac{\Delta_i}{d_{\inf}(\nu_i, \mu^*, \mathcal{E})}$$

**For Gaussian arms** ($\mathcal{E} = \mathcal{E}_{\mathcal{N}}(1)$): $d_{\inf}(\nu_i, \mu^*, \mathcal{E}) = \Delta_i^2/2$, giving:

$$\liminf_{n \to \infty} \frac{R_n(\Pi, \nu)}{\ln n} \geq \sum_{i:\Delta_i>0} \frac{2}{\Delta_i}$$

The UCB upper bound (Theorem 3.3) gives $16\ln n / \Delta_i$ per arm, matching the lower bound's $2/\Delta_i$ up to a constant factor of 8. UCB is nearly optimal.

---

## When Logarithmic Regret is Impossible

For some distribution families $\mathcal{E}$, $d_{\inf} = 0$ for all sub-optimal arms. This means:

$$\liminf_{n \to \infty} \frac{R_n}{\ln n} \geq \infty$$

implying logarithmic regret is **impossible**. This occurs for families like $\mathcal{E} = \bigcup_{\sigma > 0} \sigma\text{-subGaussian}$ where the sub-Gaussian parameter is not fixed. In such cases, UCB-type algorithms cannot be consistent.
