---
layout: post
title: "4. Expected Utility Theory III"
date: 2026-05-26
description: "Utility theorem refinements, concavity, risk aversion, certainty equivalents, and the Arrow-Pratt measure."
tags: [decision-making, uncertainty, expected-utility, risk-aversion, arrow-pratt]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# 4. Expected Utility Theory III

Source: [YouTube lecture](https://youtu.be/S0T92GBszHw?si=rhO_Zj30UGLHkq7L)

## Recap: The Expected Utility Theorem

The previous lecture ended with the central theorem of expected utility theory.

If preferences over lotteries satisfy a certain set of axioms, then there exists a utility function $u$ such that comparing lotteries is equivalent to comparing their expected utilities.

For two lotteries $p_1$ and $p_2$:

$$
p_1 \preceq p_2
\quad \Longleftrightarrow \quad
\mathbb{E}_{p_1}[u(O)]
\leq
\mathbb{E}_{p_2}[u(O)]
$$

This turns a preference comparison over probability distributions into a numerical comparison over real numbers.

---

## The Four Preference Axioms

The theorem rests on four assumptions about the preference relation over lotteries.

### Axiom 1: Completeness and Transitivity

The preference relation must be complete and transitive.

Completeness means any two lotteries can be compared:

$$
p_1 \preceq p_2
\quad \text{or} \quad
p_2 \preceq p_1
$$

Transitivity means preferences are logically consistent. If:

$$
p_1 \preceq p_2
\quad \text{and} \quad
p_2 \preceq p_3
$$

then:

$$
p_1 \preceq p_3
$$

So if $p_3$ is preferred to $p_2$, and $p_2$ is preferred to $p_1$, then $p_3$ must also be preferred to $p_1$.

### Axiom 2: Mixing Preserves Equivalence

If two lotteries are equivalent:

$$
p_1 \sim p_2
$$

then mixing each of them with a third lottery $p$ in the same proportion should preserve equivalence:

$$
\alpha p_1 + (1-\alpha)p
\sim
\alpha p_2 + (1-\alpha)p
$$

The interpretation is that if $p_1$ and $p_2$ are equally preferred, then replacing $p_1$ by $p_2$ inside a larger mixed lottery should not matter.

### Axiom 3: Mixing Preserves Strict Preference

If:

$$
p_1 \prec p_2
$$

then mixing both with the same third lottery $p$ in the same proportion should preserve the strict order:

$$
\alpha p_1 + (1-\alpha)p
\prec
\alpha p_2 + (1-\alpha)p
$$

So the preference order should not be reversed merely because both lotteries are mixed with the same outside lottery.

### Axiom 4: Continuity

If:

$$
p_1 \prec p_2 \prec p_3
$$

then there exists $\alpha \in [0,1]$ such that:

$$
\alpha p_1 + (1-\alpha)p_3 \sim p_2
$$

This says that an intermediate lottery can be replicated, in preference terms, by a suitable mixture of a worse lottery and a better lottery.

---

## From Lotteries to Decisions

A decision induces a lottery over outcomes.

So if decision $d_2$ is preferred to decision $d_1$, this means the lottery induced by $d_2$ is preferred to the lottery induced by $d_1$.

By the expected utility theorem:

$$
d_1 \preceq d_2
\quad \Longleftrightarrow \quad
\mathbb{E}_{\omega}[u(f(d_1,\omega))]
\leq
\mathbb{E}_{\omega}[u(f(d_2,\omega))]
$$

Therefore, finding the best decision becomes:

$$
d^* \in \arg\max_d \mathbb{E}_{\omega}[u(f(d,\omega))]
$$

Expected utility theory gives a principled reason for maximizing expected utility rather than expected outcome.

---

## Uniqueness of the Utility Function

The utility function is essentially unique.

If $\tilde{u}$ is another utility function that represents the same preference relation, then it must be related to $u$ by a positive affine transformation:

$$
u = s_1 \tilde{u} + s_2
$$

where:

$$
s_1 > 0
$$

So the utility function is unique up to:

- positive scaling
- shifting by a constant

These transformations do not change the maximizing decision. If $u$ and $\tilde{u}$ differ only by positive scaling and shifting, then:

$$
\arg\max_d \mathbb{E}[u(f(d,\omega))]
=
\arg\max_d \mathbb{E}[\tilde{u}(f(d,\omega))]
$$

The ranking of decisions remains the same.

---

## Typical Shape of Utility Functions

Utility functions are typically:

- increasing
- concave

If $u$ is differentiable, this means:

$$
u'(x) > 0
$$

and:

$$
u''(x) < 0
$$

Increasing utility means more of the outcome is preferred to less.

Concavity means marginal utility decreases as the outcome grows. Each additional unit of outcome gives positive utility, but the extra utility becomes smaller and smaller.

The exact form of $u$ depends on the underlying preference relation over lotteries. It could be quadratic, exponential, logarithmic, or another concave increasing function.

---

## Why More Than the Mean Matters

If utility is nonlinear, expected utility generally depends on more than the mean of the uncertainty.

Suppose $u$ can be expanded as a power series:

$$
u(x) = a_0 + a_1x + a_2x^2 + a_3x^3 + \cdots
$$

Then expected utility contains terms such as:

$$
\mathbb{E}[u(X)]
= a_0 + a_1\mathbb{E}[X] + a_2\mathbb{E}[X^2] + a_3\mathbb{E}[X^3] + \cdots
$$

In general, all moments can matter:

- the mean
- the second moment
- the third moment
- higher-order moments

The earlier mistake in the cake and house lottery examples was forcing the decision rule to depend only on the first moment, the average outcome.

---

## Cake vs. House Lottery Revisited

The cake and house lottery puzzle becomes clearer through concave utility.

In the cake lottery:

- cost of entry: 100 rupees
- outcome: 3 cakes with probability $2/3$, 0 cakes with probability $1/3$

The expected utility is:

$$
\frac{2}{3}u(3 \text{ cakes}) + \frac{1}{3}u(0 \text{ cakes})
$$

If $u(0)=0$, this becomes:

$$
\frac{2}{3}u(3 \text{ cakes})
$$

For small stakes, this expected utility can exceed the utility cost of entering the lottery.

But in the house lottery, the stakes are much larger:

- cost of entry: 1 crore rupees
- outcome: a house with three times the area with probability $2/3$, no house with probability $1/3$

Because $u$ is concave, utility increases at a decreasing rate. The utility of a house three times as large is not necessarily three times the utility of the original house.

So as stakes increase, the cost of entering the lottery grows in a way that can exceed the expected utility gain from the lottery.

This explains why a person may accept the cake lottery but reject the house lottery.

---

## Risk Aversion

A decision maker is **risk averse** if, for any random outcome $X$:

$$
\mathbb{E}[u(X)] \leq u(\mathbb{E}[X])
$$

The left side is the utility of participating in the lottery.

The right side is the utility of receiving the average outcome with certainty.

So risk aversion means:

> The decision maker weakly prefers the certain average outcome to the risky lottery with the same average outcome.

This inequality is Jensen's inequality. It holds whenever $u$ is concave.

Thus, concave utility functions naturally model risk-averse behavior.

---

## Risk Seeking

Some decision makers may be risk seeking or risk loving.

For such decision makers, the inequality reverses:

$$
\mathbb{E}[u(X)] \geq u(\mathbb{E}[X])
$$

This means the lottery is preferred to receiving the average outcome with certainty.

The lecture notes that the course will mainly focus on risk-averse settings.

---

## Insurance and the Risk Premium

Risk aversion motivates the idea of paying to avoid uncertainty.

Suppose $X$ is a random outcome. Let:

$$
\mu = \mathbb{E}[X]
$$

If the decision maker can pay an amount $y$ to receive the average outcome with certainty, then the certain outcome becomes:

$$
\mu - y
$$

The maximum amount $y$ the decision maker is willing to pay is determined by:

$$
u(\mathbb{E}[X] - y) = \mathbb{E}[u(X)]
$$

Equivalently:

$$
u(\mu - y) = \mathbb{E}[u(X)]
$$

This $y$ is a measure of how much the decision maker dislikes the uncertainty in $X$.

---

## Taylor Approximation for the Risk Premium

We can approximate $y$ using Taylor expansions around $\mu = \mathbb{E}[X]$.

For the left side:

$$
u(\mu-y) \approx u(\mu) - y u'(\mu)
$$

For the right side:

$$
\mathbb{E}[u(X)]
\approx
u(\mu)
+ \frac{1}{2}\mathbb{E}[(X-\mu)^2]u''(\mu)
$$

Since:

$$
\sigma^2 = \mathrm{Var}(X) = \mathbb{E}[(X-\mu)^2]
$$

equating both sides gives:

$$
u(\mu) - y u'(\mu)
\approx
u(\mu) + \frac{1}{2}\sigma^2 u''(\mu)
$$

Therefore:

$$
y \approx
-\frac{1}{2}\sigma^2
\frac{u''(\mu)}{u'(\mu)}
$$

For a concave utility function, $u''(\mu)<0$, so $y$ is positive.

---

## Arrow-Pratt Measure of Risk Aversion

The quantity:

$$
r(x) =
-\frac{u''(x)}{u'(x)}
$$

is called the **Arrow-Pratt measure of absolute risk aversion**.

Using this notation, the risk premium approximation becomes:

$$
y \approx \frac{1}{2}\sigma^2 r(\mu)
$$

This says the amount a decision maker is willing to pay to remove uncertainty scales with:

- the variance of the random outcome
- the curvature of the utility function
- the Arrow-Pratt measure of risk aversion

The more curved the utility function is, the more risk averse the decision maker is.

---

## Wealth and Risk Aversion

The lecture notes that this measure often decreases as wealth increases.

Intuitively:

- a poorer person may be highly sensitive to uncertainty
- a wealthier person may tolerate the same uncertainty more easily

In utility terms, this is captured by how $r(x)$ changes with $x$.

---

## Takeaways

- The expected utility theorem converts preference ordering over lotteries into expected utility maximization.
- The utility function is unique up to positive affine transformations.
- Utility functions are typically increasing and concave.
- Nonlinear utility means higher moments of uncertainty can matter.
- Concave utility explains why the cake lottery and house lottery need not be treated the same way.
- Risk aversion means preferring the certain average outcome to the lottery.
- Jensen's inequality gives $\mathbb{E}[u(X)] \leq u(\mathbb{E}[X])$ for concave $u$.
- The risk premium is the amount a decision maker would pay to avoid uncertainty.
- The Arrow-Pratt measure $r(x)=-u''(x)/u'(x)$ quantifies local risk aversion.
