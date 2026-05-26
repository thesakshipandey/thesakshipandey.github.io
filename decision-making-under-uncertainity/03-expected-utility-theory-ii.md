---
layout: post
title: "3. Expected Utility Theory II"
date: 2026-05-26
description: "Investment allocation example, utility maximization, risk attitude, and the expected utility theorem."
tags: [decision-making, uncertainty, expected-utility, risk, lotteries]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# 3. Expected Utility Theory II

Source: [YouTube lecture](https://youtu.be/NnIHpPb79ZY?si=EJHUMRoFFddu_c6N)

## Recap

Expected utility theory gives a way to compare lotteries, or probability distributions over outcomes.

The main idea is that a decision should be evaluated by the **expected utility** of the outcome it induces:

$$
\mathbb{E}_{\omega}[u(f(d,\omega))]
$$

The decision maker then chooses the decision that maximizes expected utility.

This lecture makes the idea concrete through an investment example, then states the theorem that guarantees the existence of a utility function under suitable preference axioms.

---

## Investment Example

Suppose we have capital of one dollar and two investment alternatives: $A$ and $B$.

### Alternative A

Investment $A$ gives a guaranteed return:

$$
1 \text{ dollar invested in A} \mapsto 1.5 \text{ dollars}
$$

So $A$ gives 1.5 dollars with certainty.

### Alternative B

Investment $B$ is uncertain:

$$
B =
\begin{cases}
3 \text{ dollars}, & \text{with probability } 1/2,\\
1 \text{ dollar}, & \text{with probability } 1/2.
\end{cases}
$$

So $B$ either triples the investment or simply returns the original investment.

---

## Decision Variable

Let:

$$
d \in [0,1]
$$

be the fraction of the one dollar invested in $A$.

Then:

- $d$ is invested in $A$
- $1-d$ is invested in $B$

The decision set is:

$$
D = [0,1]
$$

---

## States and Outcomes

There are two states of nature:

$$
\Omega = \{\omega_1,\omega_2\}
$$

where:

- $\omega_1$: investment $B$ gives 3 dollars per dollar invested
- $\omega_2$: investment $B$ gives 1 dollar per dollar invested

Both states occur with probability $1/2$.

The outcome depends on both the decision $d$ and the state $\omega$:

$$
f(d,\omega) =
\begin{cases}
1.5d + 3(1-d), & \omega = \omega_1,\\
1.5d + (1-d), & \omega = \omega_2.
\end{cases}
$$

The outcome space is:

$$
O = [1,3]
$$

---

## Average Outcome Logic

Investment $A$ gives 1.5 dollars for sure.

Investment $B$ gives:

$$
\frac{1}{2}\cdot 3 + \frac{1}{2}\cdot 1 = 2
$$

So if we look only at average outcome, $B$ looks better than $A$.

This logic says:

> Invest everything in $B$.

In terms of the decision variable:

$$
d^* = 0
$$

But this ignores the risk of the lower outcome.

---

## Worst-Case Logic

If we look only at the worst case, then for a fixed $d$ we evaluate:

$$
\min_{\omega \in \Omega} f(d,\omega)
$$

Here:

$$
\min\{1.5d + 3(1-d),\; 1.5d + (1-d)\}
= 1.5d + (1-d)
$$

So the worst-case decision problem is:

$$
\max_{d \in [0,1]} \left(1.5d + (1-d)\right)
$$

This is maximized at:

$$
d^* = 1
$$

So worst-case logic says:

> Invest everything in $A$.

This is conservative, but it may miss the upside from $B$.

---

## Expected Utility Logic

Expected utility theory says we should not maximize the average outcome or the worst-case outcome directly.

Instead, choose $d$ to maximize:

$$
\mathbb{E}_{\omega}[u(f(d,\omega))]
$$

Since the two states have probability $1/2$, this becomes:

$$
\max_{d \in [0,1]}
\left[
\frac{1}{2}u(1.5d + 3(1-d))
+
\frac{1}{2}u(1.5d + (1-d))
\right]
$$

This decision rule depends on the utility function $u$.

The central contribution of expected utility theory is that if preferences over lotteries satisfy certain axioms, then such a utility function exists and represents those preferences.

---

## Example Utility Function

Consider the utility function:

$$
u(o) = \alpha o - o^2
$$

where $\alpha$ is a scalar.

To ensure that utility is increasing on the outcome interval $[1,3]$, assume:

$$
\alpha > 6
$$

This means that more money gives more utility throughout the relevant outcome range.

---

## Optimal Allocation

Plugging this utility into the expected utility expression and maximizing over $d$ gives:

$$
d^* =
\begin{cases}
0, & \alpha \geq 8,\\
\dfrac{8-\alpha}{5}, & 6 < \alpha < 8.
\end{cases}
$$

Interpretation:

- If $\alpha \geq 8$, invest everything in $B$.
- If $6 < \alpha < 8$, split the investment between $A$ and $B$.

For $6 < \alpha < 8$, the optimal decision is neither $d=0$ nor $d=1$. This matches the intuition that one may want some guaranteed return from $A$ and some possible upside from $B$.

---

## Risk Attitude and the Shape of Utility

The shape of the utility function encodes the decision maker's attitude toward risk.

For:

$$
u(o) = \alpha o - o^2
$$

larger $\alpha$ makes the utility function behave more like a linear function on $[1,3]$.

When utility is close to linear, the decision maker behaves more like someone who only cares about the expected outcome. That is why for $\alpha \geq 8$, the optimal decision becomes $d^*=0$, meaning everything is invested in $B$.

For smaller $\alpha$ in the range $(6,8)$, curvature matters more, and the decision maker chooses a mix of $A$ and $B$.

---

## Moments of the Outcome

Looking only at the average outcome corresponds to caring only about the first moment.

This happens when utility is linear:

$$
u(o) = ao + b
$$

For nonlinear utility functions, other moments also matter.

For the quadratic utility:

$$
u(o) = \alpha o - o^2
$$

both the first and second moments of the outcome affect expected utility.

For a more general concave differentiable utility function, all moments of the outcome may matter.

For example:

$$
u(o) = 1 - e^{-\lambda o}
$$

Expanding the exponential gives a power series involving powers of $o$:

$$
e^{-\lambda o}
= 1 - \lambda o + \frac{\lambda^2 o^2}{2!}
- \frac{\lambda^3 o^3}{3!} + \cdots
$$

So expected utility may depend on:

- the mean
- the second moment
- the third moment
- higher-order moments

This explains why expected utility theory is richer than simply comparing averages.

---

## Lotteries and Mixtures

Let $\mathcal{P}$ denote the set of all lotteries, equivalently the set of all probability distributions on outcomes.

Suppose the finite outcome set is:

$$
O = \{o_1,o_2,\ldots,o_n\}
$$

For two lotteries $p_1,p_2 \in \mathcal{P}$ and $\alpha \in [0,1]$, the mixture:

$$
\alpha p_1 + (1-\alpha)p_2
$$

is also a lottery.

For each outcome $o_j$, this mixed lottery assigns probability:

$$
(\alpha p_1 + (1-\alpha)p_2)(o_j)
= \alpha p_1(o_j) + (1-\alpha)p_2(o_j)
$$

This can be interpreted in two equivalent ways:

- first choose lottery $p_1$ with probability $\alpha$ and $p_2$ with probability $1-\alpha$
- or directly form a new probability distribution by mixing the probabilities outcome-wise

---

## Preference Axioms

Expected utility theory relies on a preference relation over lotteries.

Let $\preceq$ represent weak preference, where:

$$
p_1 \preceq p_2
$$

means lottery $p_2$ is at least as preferred as lottery $p_1$.

Also define:

- $p_1 \sim p_2$: $p_1$ and $p_2$ are equivalent
- $p_1 \prec p_2$: $p_2$ is strictly preferred to $p_1$

The theorem assumes four axioms.

### Axiom 1: Completeness and Transitivity

There exists a complete and transitive preference relation on $\mathcal{P}$.

Completeness means that for any $p_1,p_2 \in \mathcal{P}$:

$$
p_1 \preceq p_2
\quad \text{or} \quad
p_2 \preceq p_1
$$

Transitivity means the preference ordering is logically consistent.

### Axiom 2: Mixture Preserves Equivalence

If:

$$
p_1 \sim p_2
$$

then for all $\alpha \in [0,1]$ and all $p \in \mathcal{P}$:

$$
\alpha p_1 + (1-\alpha)p
\sim
\alpha p_2 + (1-\alpha)p
$$

Equivalent lotteries remain equivalent when mixed in the same proportion with a third lottery.

### Axiom 3: Mixture Preserves Strict Preference

If:

$$
p_1 \prec p_2
$$

then for all $\alpha \in [0,1]$ and all $p \in \mathcal{P}$:

$$
\alpha p_1 + (1-\alpha)p
\prec
\alpha p_2 + (1-\alpha)p
$$

Strict preference is preserved under common mixing.

### Axiom 4: Continuity

If:

$$
p_1 \prec p_2 \prec p_3
$$

then there exists $\alpha \in [0,1]$ such that:

$$
\alpha p_1 + (1-\alpha)p_3 \sim p_2
$$

So an intermediate lottery can be matched by a suitable mixture of a worse and a better lottery.

---

## Expected Utility Theorem

Under Axioms 1 to 4, there exists a real-valued utility function:

$$
u: O \to \mathbb{R}
$$

such that for all lotteries $p_1,p_2 \in \mathcal{P}$:

$$
p_1 \preceq p_2
\quad \Longleftrightarrow \quad
\mathbb{E}_{p_1}[u(O)]
\leq
\mathbb{E}_{p_2}[u(O)]
$$

In words:

> Comparing lotteries is equivalent to comparing their expected utilities.

This is powerful because it turns a complicated preference comparison over lotteries into an optimization problem over real numbers.

---

## Why the Theorem Matters

The theorem says that if a person's preferences over lotteries satisfy the axioms, then they are implicitly maximizing expected utility.

The utility function captures:

- how the decision maker values outcomes
- how they trade off risk and reward
- why two people may make different choices under the same probabilities and outcomes

This makes expected utility theory a cornerstone for decision making under uncertainty.

---

## Takeaways

- Expected utility theory evaluates decisions by the expected utility of outcomes.
- In the investment example, average outcome says invest fully in $B$, while worst-case logic says invest fully in $A$.
- Expected utility can recommend an interior allocation between $A$ and $B$.
- The shape of the utility function encodes risk attitude.
- Linear utility makes only the mean matter.
- Nonlinear utility can make higher moments matter.
- Lotteries can be mixed using convex combinations.
- Under reasonable preference axioms, a utility function exists.
- Comparing lotteries then becomes equivalent to comparing expected utilities.
