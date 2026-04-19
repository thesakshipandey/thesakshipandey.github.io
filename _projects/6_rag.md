---
layout: page
title: NutritionRAG — Grounded Nutrition Chatbot
description: Full RAG pipeline with a web app — hybrid BM25 + ANN retrieval over a textbook corpus stored in pgvector, with inline citations.
img: assets/img/projects/rag.png
importance: 6
category: self
---

**Self Project** · Sept – Oct 2025

---

### Overview

A grounded nutrition Q&A chatbot that answers questions using a real textbook corpus rather than relying on parametric LLM knowledge — reducing hallucination and adding source traceability.

### System Design

1. **Ingestion**: nutrition textbook chapters semantically chunked into passages; embeddings stored in **pgvector**
2. **Retrieval**: **hybrid BM25 + ANN** search over the corpus — BM25 for keyword precision, ANN for semantic recall; scores fused with Reciprocal Rank Fusion
3. **Generation**: retrieved passages passed as context to an LLM; answers generated with **inline citations and source snippets**
4. **Web App**: clean interface for asking nutrition questions and viewing sourced answers

### Why Hybrid Retrieval

Pure dense retrieval misses exact-match keywords (nutrients, dosage values). Pure BM25 misses semantic paraphrases. Hybrid gets both — this is the core motivation behind my thesis work on multi-expert retrieval too.

### Stack

Python · pgvector · PostgreSQL · BM25 · FAISS · Hugging Face · Flask
