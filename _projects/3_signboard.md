---
layout: page
title: Signboard OCR & Transliteration
description: Multilingual OCR pipeline using Faster R-CNN and an attention-based GRU encoder-decoder for Hindi-to-English transliteration. 92% detection, 89% transliteration accuracy.
img: assets/img/projects/ocr.png
importance: 3
category: course
---

**CS725 — Foundations of Machine Learning** · IIT Bombay · Aug – Nov 2024

GitHub: [IITB_CS725](https://github.com/thesakshipandey/IITB_CS725)

---

### Overview

Reading signboards in regional Indian languages and translating them into English — a real-world OCR and NLP challenge that involves detection, recognition, and transliteration in one pipeline.

### Pipeline

1. **Text Detection**: Faster R-CNN for precise bounding-box localization of text regions in signboard images
2. **Text Recognition**: EasyOCR for extracting text from detected regions across diverse regional scripts
3. **Transliteration**: Attention-based GRU Encoder-Decoder model for Hindi → English, preserving phonetic and contextual meaning
4. **Preprocessing**: binarization and noise reduction pipeline to improve OCR accuracy on real-world signboard photos

### Results

- **92% detection accuracy** on the evaluation dataset
- **89% transliteration accuracy** on Hindi → English pairs

### Stack

Python · PyTorch · Faster R-CNN · EasyOCR · GRU Encoder-Decoder · OpenCV
