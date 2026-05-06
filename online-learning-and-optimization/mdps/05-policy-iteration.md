---
layout: post
title: "Policy Iteration"
date: 2026-04-03
description: "Greedy policy improvement, the Policy Improvement Theorem, and the machine replacement example."
tags: [mdp, policy-iteration, dynamic-programming]
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

# Policy Iteration

## The Idea: Improve Directly on the Policy

Value Iteration works on the value function space. Policy Iteration works directly in policy space: start with any policy, evaluate it, improve it greedily, and repeat. Each iteration produces a strictly better policy until convergence.

---

## Greedy Policy Improvement

Given a stationary policy $f$, define the **one-step improvement** $f^*$:

$$f^*(x) = \begin{cases} \arg\min_{a \in A}\!\left[c_i(a) + \alpha \sum_{j \in S} p_{i,j}(a) V_f(j)\right] & \text{if } x = i \\ f(x) & \text{otherwise} \end{cases}$$

The policy $f^*$ applies the optimal action at state $i$ (for a single chosen state) and follows $f$ everywhere else.

**Lemma 5.6.** $V_{f^*} \leq V_f$ (component-wise).

**Proof.** Apply the Bellman operator $B_{f^*}$:

$$(B_{f^*}(V_f))(i) = c_i(f^*(i)) + \alpha \sum_j p_{ij}(f^*(i)) V_f(j)$$

By definition of $f^*$, the action $f^*(i)$ minimizes $[c_i(a) + \alpha\sum_j p_{ij}(a) V_f(j)]$, so:

$$\leq c_i(f(i)) + \alpha\sum_j p_{ij}(f(i)) V_f(j) = (B_f(V_f))(i) = V_f(i)$$

So $B_{f^*}(V_f) \leq V_f$. Since $B_{f^*}$ is a contraction:

$$V_{f^*} = \lim_{n \to \infty} B_{f^*}^n(V_f) \leq V_f \quad \square$$

The core insight: improving the policy myopically at a single state always results in a globally better policy.

---

## Algorithm 16: Policy Iteration (PI)

**Require:** MDP $M = (S, A, P, C, \alpha)$, initial policy $\pi_0$

Define:
- $\text{IS}(\pi_0) = \{s \in S : Q_{\pi_0}(s, \pi_0(s)) > \min_{a \in A} Q_{\pi_0}(s, a)\}$ (improvable states)
- $\text{IA}(\pi_0, s) = \{a \in A : Q_{\pi_0}(s, a) < V_{\pi_0}(s)\}$ (improvable actions at state $s$)

**While** $\text{IS} \neq \emptyset$ **do:**
- **For** $s \in \text{IS}(\pi_0)$:
  - Pick action $a' \in \text{IA}(\pi_0, s)$
  - $\pi_0(s) = a'$
- Re-calculate $\text{IS}(\pi_0)$ and $\text{IA}(\pi_0, s)$ for all $s \in S$

**End while**

**Return** $\pi_0$

At each round, the algorithm identifies states where the current policy is suboptimal (IS set) and updates the policy to take a better action at those states.

---

## Policy Improvement Theorem

**Theorem 5.7.** *Consider MDP $M = (S, A, P, C, \alpha)$ and let $\Pi$ be the set of all stationary policies. Then:*

1. *If $\text{IS}(\pi) = \emptyset$, then $\pi$ is the optimal policy for $M$.*
2. *If $\pi'$ is obtained after one round of PI on $\pi$, then $V_{\pi'} \leq V_\pi$ (component-wise, with strict inequality if $\pi$ is not optimal).*

**Proof of Part 1.** If $\text{IS}(\pi) = \emptyset$, then for all $s \in S$, $\pi(s)$ is already minimizing the Q-function. So:

$$\forall \pi' \in \Pi, \quad V^\pi \preceq B^{\pi'}[V^\pi]$$

Applying $B^{\pi'}$ repeatedly:

$$V^\pi \preceq B^{\pi'}[V^\pi] \preceq (B^{\pi'})^2[V^\pi] \preceq \ldots \preceq \lim_{l \to \infty} (B^{\pi'})^l [V^\pi] = V^{\pi'}$$

So $V^\pi \leq V^{\pi'}$ for all $\pi'$, meaning $\pi$ is optimal. $\square$

**Proof of Part 2.** After one PI round, we have $\pi'$ with $B^{\pi'}[V^\pi] \preceq V^\pi$ (from Lemma 5.6 applied to each improved state). Then:

$$V^{\pi'} = \lim_{l \to \infty} (B^{\pi'})^l[V^\pi] \preceq V^\pi \quad \square$$

---

## Convergence of Policy Iteration

Since the state space $S$ and action space $A$ are finite, there are finitely many deterministic stationary policies ($|A|^{|S|}$ total). Each PI round produces a strictly better policy (unless we have already reached the optimum). Therefore, PI terminates in at most $|A|^{|S|}$ steps.

In practice, PI converges much faster: often in $O(|S|)$ iterations.

---

## Variants of Policy Iteration

**Howard's Policy Iteration:** Improves every improvable state simultaneously. Each round may change many states' actions at once.

**Simple Policy Iteration:** Changes only one improvable state per round. Slower in practice but easier to analyze.

**Modified Policy Improvement (M.S. Random PI):** Randomly selects which improvable state to update. Useful for theoretical analysis.

---

## Practical Example: Machine Replacement

Consider a machine with degradation states $S = \{0, 1, 2, \ldots\}$. At each state $i$:
- **Keep the machine (action 0):** incur maintenance cost $L(i)$, transition to the next degradation state probabilistically.
- **Replace the machine (action 1):** incur cost $R + L(0)$ (purchase price plus maintenance at state 0), and restart at state 0.

The cost structure:
$$C(i, 1) = R + L(0) \quad \text{(replace)} \quad C(i, 0) = L(i) \quad \text{(keep)}$$

The Bellman equation is:

$$V^*(i) = \min\!\left\{L(i) + \alpha \sum_j P_{ij} V^*(j), \; R + L(0) + \sum_j P_{0j} V^*(j)\right\}$$

**Claim 5.8.** *For an increasing function $h(\cdot)$, $\sum_{j=k}^\infty P_{ij} h(j)$ is increasing in $i$.*

**Lemma 5.9.** *The optimal value function $V^*(i)$ is increasing in $i$.*

Proof by induction using Value Iteration: $V_1(i) = \min(R + L(0), L(i))$ is increasing (since $L$ is increasing). The Bellman update preserves monotonicity at each step, so $V^*$ is increasing.

**Optimal policy structure:** Since $L(i)$ increases and $R + L(0) + \sum_j P_{0j} V^*(j)$ is constant in $i$, there exists a threshold $i^*$ such that:

$$i^* = \max\!\left\{i : L(i) + \alpha \sum_j P_{ij} V^*(j) \leq R + L(0) + \sum_j P_{0j} V^*(j)\right\}$$

The optimal policy is: keep if $i \leq i^*$, replace if $i > i^*$. This is a **threshold policy**: once degradation crosses the threshold, replacement is optimal.
