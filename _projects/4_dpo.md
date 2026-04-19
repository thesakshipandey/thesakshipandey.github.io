---
layout: page
title: Direct Preference Optimization (DPO) from Scratch
description: End-to-end PyTorch implementation of the DPO algorithm to align LLM outputs with human preference data.
img: assets/img/projects/dpo.png
importance: 4
category: self
---

**Self Project** · Jul – Aug 2025

---

### Overview

DPO (Rafailov et al., 2023) reframes RLHF as a supervised learning problem — no reward model, no PPO, just a clever reparameterization. This project implements it from scratch to deeply understand how preference learning works in practice.

### What Was Built

- Full **DPO training loop** in PyTorch from scratch — no HuggingFace Trainer abstraction
- **Preference dataset handling**: chosen/rejected response pairs with proper tokenization and batching
- **Loss implementation**: the DPO objective using the log-ratio between policy and reference model probabilities
- Verified alignment behavior by comparing policy outputs on preference pairs before and after training

### Why

Understanding preference optimization at the implementation level — not just the paper — is essential for anyone working on LLM alignment, reward modeling, or recommender systems with human feedback.

### Stack

Python · PyTorch · Hugging Face Tokenizers · Human Preference Datasets
