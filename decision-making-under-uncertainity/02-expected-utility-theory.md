---
layout: post
title: "2. Expected Utility Theory"
date: 2026-05-25
description: "Formal models for comparing decisions under uncertainty using lotteries and expected utility."
tags: [decision-making, uncertainty, expected-utility, risk, lotteries]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# 2. Expected Utility Theory

Source: [YouTube lecture](https://youtu.be/Atw5zB1ZL2Q?si=Xihf0ZZlNrJyd8yJ)

## Recap: Why Average Outcomes Are Not Enough

In the previous lecture, we compared two lotteries:

- a cake lottery where the loss is at most 100 rupees
- a house lottery where the loss is at most 1 crore rupees

Both lotteries had the same expected-value structure. With probability $2/3$, the reward was three times the original object, and with probability $1/3$, the reward was zero.

So the average outcome in both cases was:

$$
\frac{2}{3} \cdot 3 + \frac{1}{3} \cdot 0 = 2
$$

Using only average outcome, both lotteries look attractive. But intuitively, the house lottery is much riskier because losing 1 crore rupees is far more serious than losing 100 rupees.

The lesson is:

> Looking only at average outcomes does not adequately capture our attitude toward decision making under uncertainty.

Decision making under uncertainty needs a richer framework than simply comparing averages.

---

## The Need for a Formal Framework

The key question is: how should two lotteries be compared?

A lottery is a probability distribution over possible outcomes. So the broader question is:

> How do we compare probability distributions over outcomes?

Possible candidates include:

- comparing average outcomes
- comparing worst-case outcomes
- comparing best-case outcomes
- using higher moments such as variance

Expected utility theory provides a unified framework for this comparison.

---

## Formal Model for Decision Making Under Uncertainty

A formal model consists of the following objects.

### 1. Decision Alternatives

Let $D$ be the set of possible decisions.

A decision maker chooses one decision:

$$
d \in D
$$

### 2. States of the World

Let $\Omega$ be the set of possible **states of the world** or **states of nature**.

The realized state $\omega \in \Omega$ is chosen by nature, not by the decision maker. This is what captures the uncertainty in the problem.

The decision maker controls $d$, but does not control $\omega$.

### 3. Outcomes

Given a decision $d$ and a state of the world $\omega$, an outcome is produced:

$$
f(d,\omega)
$$

The outcome depends on both:

- the decision chosen by the decision maker
- the state of nature chosen exogenously

Let $O$ denote the set of all possible outcomes.

---

## Preferences over Outcomes

The model also needs a way to compare outcomes.

Let $\preceq$ denote a preference relation on $O$.

If:

$$
O_1 \preceq O_2
$$

then outcome $O_2$ is preferred to outcome $O_1$.

One way to represent such preferences is with a real-valued function:

$$
G: O \to \mathbb{R}
$$

If:

$$
G(O_1) \leq G(O_2)
$$

then $O_2$ is considered at least as good as $O_1$.

The difficulty is that the final outcome is not determined by the decision alone. It is determined by both $d$ and $\omega$.

---

## Approach 1: Average Outcome

If there is a probability distribution over $\Omega$, one possible approach is to evaluate each decision by the value of its average outcome:

$$
G\left(\mathbb{E}_{\omega}[f(d,\omega)]\right)
$$

Then choose:

$$
\arg\max_{d \in D} G\left(\mathbb{E}_{\omega}[f(d,\omega)]\right)
$$

This is the logic used in the cake and house lottery examples.

The problem is that it ignores risk. Two decisions can have the same average outcome but very different downside consequences.

---

## Approach 2: Worst-Case Outcome

Another approach is to ignore probabilities and focus only on the worst thing nature can do.

For each decision $d$, evaluate:

$$
\min_{\omega \in \Omega} G(f(d,\omega))
$$

Then choose:

$$
\arg\max_{d \in D} \min_{\omega \in \Omega} G(f(d,\omega))
$$

This is a conservative or robust decision rule.

It has one advantage: it does not require knowing a probability distribution over states of nature.

But it can be too pessimistic. It may reject good opportunities just because of a rare worst-case scenario.

---

## Approach 3: Best-Case Outcome

The opposite extreme is to be fully optimistic and focus on the best possible outcome.

For each decision $d$, evaluate:

$$
\max_{\omega \in \Omega} G(f(d,\omega))
$$

Then choose:

$$
\arg\max_{d \in D} \max_{\omega \in \Omega} G(f(d,\omega))
$$

This approach can also fail because it ignores bad outcomes. It only asks what could go best, not what is likely or what could go wrong.

---

## Why These Approaches Are Incomplete

Average-case, worst-case, and best-case decision rules each capture one aspect of uncertainty, but none gives a complete model of risky choice.

- Average outcome ignores risk and downside severity.
- Worst-case outcome can be overly conservative.
- Best-case outcome can be overly optimistic.

Expected utility theory gives a better way to compare lotteries because it evaluates outcomes through a utility function before taking expectations.

---

## From Decisions to Lotteries

Expected utility theory assumes that there is a probability distribution $P$ on the set of states of nature $\Omega$.

Each decision can lead to multiple outcomes depending on which state of the world is realized.

For a fixed decision $d$, the uncertainty over $\omega$ induces a probability distribution over outcomes. This induced distribution is denoted by $P_d$.

For an outcome $o \in O$:

$$
P_d(o) = P(\{\omega \in \Omega : f(d,\omega) = o\})
$$

So $P_d(o)$ is the probability of getting outcome $o$ after choosing decision $d$.

This is important:

> Each decision induces a lottery over outcomes.

Therefore, if we can compare lotteries, we can compare decisions.

---

## Lotteries as Probability Distributions

A lottery is simply a probability distribution on the set of outcomes.

In the earlier examples:

- outcome 1: receive 3 cakes, or receive a house with three times the area
- outcome 2: receive nothing
- probabilities: $2/3$ and $1/3$

So comparing decisions under uncertainty is equivalent to comparing the lotteries that those decisions induce.

This shift is powerful:

1. decision $d$ combines with state $\omega$
2. this produces an outcome $f(d,\omega)$
3. uncertainty over $\omega$ produces a distribution $P_d$ over outcomes
4. comparing decisions becomes comparing probability distributions over outcomes

---

## Expected Utility Theory

Expected utility theory says that there exists a utility function:

$$
u: O \to \mathbb{R}
$$

This function assigns a real number to each outcome.

The expected utility of decision $d$ is:

$$
\mathbb{E}_{\omega}[u(f(d,\omega))]
$$

Decision $d_2$ is preferred to decision $d_1$ if and only if:

$$
\mathbb{E}_{\omega}[u(f(d_1,\omega))]
\leq
\mathbb{E}_{\omega}[u(f(d_2,\omega))]
$$

So the rule becomes:

> Choose the decision that maximizes expected utility, not necessarily expected outcome.

Formally:

$$
d^* \in \arg\max_{d \in D} \mathbb{E}_{\omega}[u(f(d,\omega))]
$$

---

## Why Utility Matters

Expected utility theory separates two ideas:

- the numerical outcome itself
- the utility or value the decision maker assigns to that outcome

This matters because utility need not be linear. A loss of 1 crore rupees can hurt far more than 10,00,000 times the pain of losing 100 rupees in a simple linear scale.

The shape of the utility function captures the decision maker's attitude toward risk.

For example:

- a linear utility function corresponds to risk-neutral behavior
- a concave utility function corresponds to risk-averse behavior
- a convex utility function corresponds to risk-seeking behavior

The lecture points out that expected utility theory does more than assume such a function exists. Under certain axioms on preferences over lotteries, one can prove that a utility function exists.

---

## Takeaways

- Average outcome is not enough to model decision making under uncertainty.
- A formal model includes decisions $D$, states of nature $\Omega$, outcomes $O$, and an outcome map $f(d,\omega)$.
- A decision and a state of nature together determine an outcome.
- A probability distribution over states of nature induces a probability distribution over outcomes.
- A probability distribution over outcomes is a lottery.
- Comparing decisions can be reduced to comparing the lotteries they induce.
- Expected utility theory uses a utility function $u: O \to \mathbb{R}$.
- The best decision maximizes expected utility, not necessarily expected outcome.
- The shape of the utility function encodes the decision maker's attitude toward risk.
