---
layout: page
title: Multi-Expert Hybrid Retrieval for Movie Recommendation
description: M.S. Thesis — Learned query routing over semantic, lexical, collaborative, and emotion-aware experts for prompt-conditioned recommendation.
img: assets/img/projects/thesis.png
importance: 1
category: research
---

**M.S. Thesis** · IIT Bombay · Guide: Prof. Arpit Agarwal · Aug 2025 – Present

---

### Overview

Standard recommender systems rely on a single retrieval signal. This thesis argues for a **mixture-of-experts** approach where four complementary retrieval experts — semantic, lexical, collaborative, and emotion-aware — are dynamically combined based on the query.

### Key Contributions

- **Multi-expert architecture**: four independent retrieval experts, each capturing a distinct user intent signal
- **Learned query router**: trained with a **Bradley–Terry–Luce pairwise loss** over 9,000 human-judged movie preference pairs; outputs a soft mixture weight per expert per query
- **Evaluation**: up to **4.5% higher pairwise agreement** over strong single-expert and reranker baselines (BGE-Reranker, Qwen-1.5B, Kimi-K2) on MovieLens-100K

### Stack

PyTorch · Hugging Face Transformers · MovieLens-100K · BM25 · FAISS · BTL Ranking Loss
