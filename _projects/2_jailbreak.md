---
layout: page
title: Indian Multilingual Jailbreaking
description: Built Indic-JailbreakBench and proposed four jailbreak techniques achieving up to 35% higher ASR in Indic languages than English.
img: assets/img/projects/jailbreak.png
importance: 2
category: research
---

**CS626 — Speech, NLP, and the Web** · IIT Bombay · Guide: Prof. Pushpak Bhattacharyya · Aug 2024 – May 2025

GitHub: [JailbreakinLLMs](https://github.com/thesakshipandey/JailbreakinLLMs)

---

### Overview

LLM safety research has overwhelmingly focused on English. This project asked: **how much weaker are safety filters in Indic languages?** The answer — significantly weaker.

### Key Contributions

- **Indic-JailbreakBench**: a new dataset of 1,668 multilingual malicious prompts across 12 harm categories, covering major Indic languages
- **Four novel jailbreak techniques** specifically designed for Indic language morphology and code-switching patterns
- **Up to 35% higher Attack Success Rate (ASR)** in Indic languages compared to equivalent English prompts
- **Multi-judge ASR framework** evaluated across six state-of-the-art LLMs for robust cross-lingual safety assessment

### Stack

Python · Hugging Face Transformers · Multilingual LLMs · Prompt Engineering · ASR Evaluation Framework
