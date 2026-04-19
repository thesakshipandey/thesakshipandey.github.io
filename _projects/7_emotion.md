---
layout: page
title: Cross-Lingual Emotion Understanding for Indic Languages
description: Teacher-student distillation of RoBERTa-GoEmotions into IndicBERT across 5 Indic languages — ~3.3× improvement over zero-shot baselines.
img: assets/img/projects/emotion.png
importance: 7
category: course
---

**CS772 — Deep Learning for NLP** · IIT Bombay · Aug – Nov 2025

---

### Overview

Emotion recognition datasets are almost entirely English. This project bridges that gap for Indic languages using a translation + distillation pipeline.

### Pipeline

1. **Dataset Construction**: translation + LLM-based quality scoring pipeline maps GoEmotions (58K English Reddit comments) into 5 Indic languages; only high-quality pairs (score ≥ 95) are retained
2. **Teacher Model**: RoBERTa-GoEmotions fine-tuned on English emotion labels
3. **Student Model**: IndicBERT trained with knowledge distillation using:
   - Embedding alignment via **Procrustes Analysis**
   - Cross-entropy on label predictions
   - Temperature-scaled **KL-divergence** between teacher and student logits

### Results

- **~0.42–0.44 macro-F1** on Hindi, Bengali, Marathi, Gujarati, and Tamil
- **~3.3× improvement** over zero-shot baselines across all five languages
- Sensitivity analysis over temperature and training data size

### Stack

Python · PyTorch · Hugging Face Transformers · RoBERTa · IndicBERT · Procrustes Analysis · GoEmotions
