---
layout: post
title: "Online Learning and Optimization (EE6106)"
date: 2026-01-07 10:00:00
description: "Course notes covering Prediction via Expert Advice, Multi-Armed Bandits, and Markov Decision Processes."
tags: [online-learning, bandits, mdp, reinforcement-learning]
category: course-notes
giscus_comments: false
related_posts: false
toc:
  sidebar: left
---

Notes from EE6106 by Sarvesh Shashidhar. The course ran every Wednesday and Friday from January to April 2026.

The central question throughout: can a learning agent compete with the best fixed strategy in hindsight, and how quickly? The answer depends on what the agent observes and what the adversary knows.

---

## Part 1: Prediction via Expert Advice

The agent observes $K$ experts at each step and must predict a sequence against an adversary. The challenge is combining expert advice optimally without knowing which expert is best.

| Lecture | Topic | Date |
|---|---|---|
| 1 | [Majority Algorithm](/online-learning-and-optimization/prediction-via-expert-advice/01-majority-algorithm/) | 7 Jan 2026 |
| 2 | [Weighted Majority Algorithm](/online-learning-and-optimization/prediction-via-expert-advice/02-weighted-majority-algorithm/) | 9 Jan 2026 |
| 3 | [Exponential WMA](/online-learning-and-optimization/prediction-via-expert-advice/03-exponential-wma/) | 14 Jan 2026 |
| 4 | [Randomized Exponential WMA](/online-learning-and-optimization/prediction-via-expert-advice/04-randomized-exponential-wma/) | 16 Jan 2026 |

**Key result:** Sub-linear regret $O(\sqrt{n \ln K})$ is achievable with convex loss or a randomized algorithm. A deterministic algorithm against a fully adaptive adversary with $0$-$1$ loss cannot escape linear regret.

---

## Part 2: Multi-Armed Bandits

The agent pulls one arm per step and observes only its reward. Partial feedback forces a genuine exploration-exploitation tradeoff.

### Adversarial Bandits

| Lecture | Topic | Date |
|---|---|---|
| 5 | [EXP3: Adversarial Bandits](/online-learning-and-optimization/multi-armed-bandits/01-exp3-adversarial-bandits/) | 21 Jan 2026 |

### Stochastic Bandits

| Lecture | Topic | Date |
|---|---|---|
| 6 | [Setup and Full-Info Setting](/online-learning-and-optimization/multi-armed-bandits/02-stochastic-setup-and-full-info/) | 23 Jan 2026 |
| 7 | [Explore-then-Commit (ETC)](/online-learning-and-optimization/multi-armed-bandits/03-explore-then-commit/) | 28 Jan 2026 |
| 8 | [Upper Confidence Bound (UCB)](/online-learning-and-optimization/multi-armed-bandits/04-upper-confidence-bound/) | 30 Jan 2026 |
| 9 | [Anytime UCB](/online-learning-and-optimization/multi-armed-bandits/05-anytime-ucb/) | 4 Feb 2026 |
| 10 | [Epsilon-Greedy](/online-learning-and-optimization/multi-armed-bandits/06-epsilon-greedy/) | 6 Feb 2026 |

### Lower Bounds and Pure Exploration

| Lecture | Topic | Date |
|---|---|---|
| 11 | [Information-Theoretic Lower Bounds](/online-learning-and-optimization/multi-armed-bandits/07-information-theoretic-lower-bounds/) | 11 Feb 2026 |
| 12 | [Pure Exploration: Fixed Budget](/online-learning-and-optimization/multi-armed-bandits/08-pure-exploration-fixed-budget/) | 13 Feb 2026 |
| 13 | [Pure Exploration: Fixed Confidence](/online-learning-and-optimization/multi-armed-bandits/09-pure-exploration-fixed-confidence/) | 18 Feb 2026 |

**Key results:** Logarithmic regret $O(\ln n / \Delta)$ is achievable and optimal for stochastic MABs. Adversarial bandits pay an extra $\sqrt{K}$ factor. Minimax regret is $\Omega(\sqrt{nK})$.

---

## Part 3: Markov Decision Processes

Actions affect future states. The agent must plan, not just react. When the model is unknown, this becomes reinforcement learning.

| Lecture | Topic | Date |
|---|---|---|
| 14 | [MDP Basics and Value Functions](/online-learning-and-optimization/mdps/01-mdp-basics-and-value-functions/) | 20 Feb 2026 |
| 15 | [Bellman Equations](/online-learning-and-optimization/mdps/02-bellman-equations/) | 25 Feb 2026 |
| 16 | [Bellman Operators and Value Iteration](/online-learning-and-optimization/mdps/03-bellman-operators-and-value-iteration/) | 27 Feb 2026 |
| 17 | [LP Approach and Q-Functions](/online-learning-and-optimization/mdps/04-lp-and-q-function/) | 4 Mar 2026 |
| 18 | [Policy Iteration](/online-learning-and-optimization/mdps/05-policy-iteration/) | 6 Mar 2026 |
| 19 | [Expected Time-Average MDPs](/online-learning-and-optimization/mdps/06-expected-time-average-mdps/) | 11 Mar 2026 |
| 20 | [Reinforcement Learning](/online-learning-and-optimization/mdps/07-reinforcement-learning/) | 13 Mar 2026 |

**Key results:** Discounted MDPs always have an optimal stationary deterministic policy. Value Iteration and Policy Iteration converge via the Bellman contraction. The undiscounted (ETA) case requires additional structural conditions (irreducibility, bounded hitting times).

---

## Course Arc

| Setting | Feedback | Adversary | Best achievable regret |
|---|---|---|---|
| Expert Advice | Full | Oblivious | $O(\sqrt{n \ln K})$ |
| Adversarial MAB | Partial | Oblivious | $O(\sqrt{nK \ln K})$ |
| Stochastic MAB | Partial | Stochastic | $O(\ln n / \Delta)$ |
| MDP | Full state | Stochastic | Planning (Value/Policy Iteration) |
| RL | Full state | Stochastic, unknown | Exploration + planning |
