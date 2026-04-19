---
layout: page
title: RLHF Pipeline from Scratch
description: Implemented a full RLHF pipeline using Vanilla Policy Gradient (VPG) to steer a GPT-2 SLM to generate positive tiny stories.
img: assets/img/projects/rlhf.png
importance: 5
category: self
---

**Self Project** · 2025

---

### Overview

RLHF (Reinforcement Learning from Human Feedback) is the technique behind ChatGPT's alignment. This project builds the full pipeline from scratch — reward model, policy, and RL training loop — using GPT-2 as the base model.

### Pipeline Components

1. **Base Model**: GPT-2 fine-tuned on a small story dataset
2. **Reward Model**: trained on human preference labels over story pairs (positive vs. negative sentiment)
3. **RL Loop**: Vanilla Policy Gradient (VPG) to update the language model guided by reward signal
4. **Evaluation**: qualitative comparison of generated stories before and after RLHF alignment

### Key Learning

Building RLHF from scratch reveals why it's unstable — reward hacking, KL divergence blowup, and mode collapse are real failure modes. This implementation handles them with a frozen reference policy and KL penalty term.

### Stack

Python · PyTorch · GPT-2 · Hugging Face Transformers · Vanilla Policy Gradient
