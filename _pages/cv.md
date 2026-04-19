---
layout: page
permalink: /cv/
title: CV
nav: true
nav_order: 4
---

<style>
  .cv-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 1rem 1rem 5rem;
  }

  /* ── Header ── */
  .cv-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 1rem;
    margin-bottom: 2.5rem;
    padding-bottom: 2rem;
    border-bottom: 2px solid var(--global-theme-color);
  }

  .cv-header-left h1 {
    font-size: 2rem;
    font-weight: 800;
    margin: 0 0 0.3rem;
    letter-spacing: -0.02em;
  }

  .cv-header-left p {
    color: var(--global-text-color-light);
    font-size: 1rem;
    margin: 0;
  }

  .cv-header-right {
    text-align: right;
    font-size: 0.88rem;
    color: var(--global-text-color-light);
    line-height: 1.9;
  }

  .cv-header-right a {
    color: var(--global-theme-color);
    text-decoration: none;
  }

  /* ── Section ── */
  .cv-section {
    margin-bottom: 2.5rem;
  }

  .cv-section-title {
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
    color: var(--global-theme-color);
    margin-bottom: 1rem;
    padding-bottom: 0.35rem;
    border-bottom: 1px solid var(--global-divider-color);
  }

  /* ── Entry ── */
  .cv-entry {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 0 1.5rem;
    margin-bottom: 1.4rem;
  }

  .cv-entry-year {
    font-size: 0.82rem;
    color: var(--global-text-color-light);
    padding-top: 0.18rem;
    line-height: 1.5;
  }

  .cv-entry-body {}

  .cv-entry-title {
    font-size: 1rem;
    font-weight: 700;
    margin: 0 0 0.1rem;
    color: var(--global-text-color);
    line-height: 1.3;
  }

  .cv-entry-sub {
    font-size: 0.88rem;
    color: var(--global-theme-color);
    margin: 0 0 0.4rem;
    font-style: italic;
  }

  .cv-entry-desc {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .cv-entry-desc li {
    font-size: 0.9rem;
    color: var(--global-text-color-light);
    line-height: 1.7;
    padding-left: 1rem;
    position: relative;
  }

  .cv-entry-desc li::before {
    content: "–";
    position: absolute;
    left: 0;
    color: var(--global-theme-color);
    opacity: 0.6;
  }

  /* ── Skills pills ── */
  .cv-pill-group {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 0.75rem;
  }

  .cv-pill-label {
    font-size: 0.78rem;
    font-weight: 700;
    color: var(--global-text-color-light);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 0.3rem;
    display: block;
  }

  .cv-pill {
    padding: 0.25rem 0.75rem;
    border: 1px solid var(--global-divider-color);
    border-radius: 999px;
    font-size: 0.82rem;
    color: var(--global-text-color);
    background: var(--global-card-bg-color);
  }

  /* ── Awards ── */
  .cv-award {
    display: grid;
    grid-template-columns: 120px 1fr;
    gap: 0 1.5rem;
    margin-bottom: 0.9rem;
    align-items: baseline;
  }

  .cv-award-year {
    font-size: 0.82rem;
    font-weight: 700;
    color: var(--global-theme-color);
  }

  .cv-award-text {
    font-size: 0.92rem;
    color: var(--global-text-color);
    line-height: 1.6;
  }

  /* ── PDF link ── */
  .cv-pdf-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    padding: 0.55rem 1.25rem;
    border: 1.5px solid var(--global-theme-color);
    border-radius: 6px;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--global-theme-color) !important;
    text-decoration: none !important;
    margin-bottom: 2.5rem;
    transition: background 0.15s ease, color 0.15s ease;
  }

  .cv-pdf-btn:hover {
    background: var(--global-theme-color);
    color: white !important;
  }

  @media (max-width: 600px) {
    .cv-entry, .cv-award { grid-template-columns: 1fr; }
    .cv-entry-year, .cv-award-year { margin-bottom: 0.2rem; }
    .cv-header { flex-direction: column; }
    .cv-header-right { text-align: left; }
  }
</style>

<div class="cv-wrap">

  <div class="cv-header">
    <div class="cv-header-left">
      <h1>Sakshi Pandey</h1>
      <p>M.S. by Research in Computer Science · IIT Bombay</p>
    </div>
    <div class="cv-header-right">
      <a href="mailto:sakshipandey@iitb.ac.in">sakshipandey@iitb.ac.in</a><br>
      <a href="https://linkedin.com/in/thesakshipandey" target="_blank">linkedin.com/in/thesakshipandey</a><br>
      <a href="https://github.com/thesakshipandey" target="_blank">github.com/thesakshipandey</a><br>
      Mumbai, India
    </div>
  </div>

  <a class="cv-pdf-btn" href="{{ '/assets/pdf/Sakshi_Pandey_CV.pdf' | relative_url }}" target="_blank">
    ↓ Download PDF
  </a>

  <!-- Education -->
  <div class="cv-section">
    <div class="cv-section-title">Education</div>

    <div class="cv-entry">
      <div class="cv-entry-year">2024 – Present</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">M.S. by Research in Computer Science (Intelligence Systems)</div>
        <div class="cv-entry-sub">Indian Institute of Technology Bombay · CPI 8.54 / 10.00 (Sem 3)</div>
        <ul class="cv-entry-desc">
          <li>Thesis: Multi-Expert Hybrid Retrieval with Learned Query Routing for Movie Recommendation</li>
          <li>Advisor: Prof. Arpit Agarwal</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">2019 – 2023</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">B.E. in Computer Engineering</div>
        <div class="cv-entry-sub">University of Mumbai (RGIT) · GPA 8.86 / 10.00</div>
      </div>
    </div>
  </div>

  <!-- Experience -->
  <div class="cv-section">
    <div class="cv-section-title">Experience</div>
    <div class="cv-entry">
      <div class="cv-entry-year">Sept – Oct 2021</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Cybersecurity Intern</div>
        <div class="cv-entry-sub">Bombay Stock Exchange Ltd. · Mumbai</div>
        <ul class="cv-entry-desc">
          <li>Conducted risk and vulnerability analysis of critical exchange systems</li>
          <li>Monitored and mitigated threats using IBM QRadar (SIEM) and IBM Watson</li>
          <li>Deployed Honeycomb trapping techniques as an active decoy mechanism</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Research -->
  <div class="cv-section">
    <div class="cv-section-title">Research Projects</div>

    <div class="cv-entry">
      <div class="cv-entry-year">Aug 2025 –<br>Present</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Multi-Expert Hybrid Retrieval for Movie Recommendation</div>
        <div class="cv-entry-sub">M.S. Thesis · Guide: Prof. Arpit Agarwal</div>
        <ul class="cv-entry-desc">
          <li>Designed a retrieval system combining semantic, lexical, collaborative, and emotion-aware experts</li>
          <li>Learned query router trained with BTL pairwise loss over 9,000 human-judged movie pairs</li>
          <li>Up to 4.5% higher pairwise agreement over BGE-Reranker, Qwen-1.5B, Kimi-K2 on MovieLens-100K</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">Aug 2024 –<br>May 2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Indian Multilingual Jailbreaking</div>
        <div class="cv-entry-sub">CS626 · Guide: Prof. Pushpak Bhattacharyya</div>
        <ul class="cv-entry-desc">
          <li>Built Indic-JailbreakBench: 1,668 multilingual malicious prompts across 12 harm categories</li>
          <li>Proposed four novel jailbreak techniques; up to 35% higher ASR in Indic languages vs. English</li>
          <li>Evaluated six state-of-the-art LLMs with a multi-judge ASR framework</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">Jan – May 2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Reinforcement Learning for Side-Channel CNN Design</div>
        <div class="cv-entry-sub">R&D · Guide: Prof. Shivaram K. & Sayandeep S.</div>
        <ul class="cv-entry-desc">
          <li>Q-learning agent auto-composing 1D-CNN architectures for profiling-based SCA</li>
          <li>Composite reward: guessing-entropy convergence + validation accuracy + model-size penalty</li>
          <li>Executed >2,700 trials on ASCAD, DPAContest v4, and CHES CTF datasets</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Course Projects -->
  <div class="cv-section">
    <div class="cv-section-title">Course Projects</div>

    <div class="cv-entry">
      <div class="cv-entry-year">Aug – Nov 2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Cross-Lingual Emotion Understanding for Indic Languages</div>
        <div class="cv-entry-sub">CS772 — Deep Learning for NLP</div>
        <ul class="cv-entry-desc">
          <li>Distilled RoBERTa-GoEmotions into IndicBERT across 5 languages via Procrustes + KL-divergence</li>
          <li>~3.3× improvement over zero-shot baselines; F1: 0.42–0.44 across Hindi, Bengali, Marathi, Gujarati, Tamil</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">Aug – Nov 2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Auction Design for Voluntary Carbon Markets</div>
        <div class="cv-entry-sub">CS6001 — Game Theory & Mechanism Design</div>
        <ul class="cv-entry-desc">
          <li>Proved cheating is the dominant strategy without a formal mechanism; designed a VCG auction for truthful bidding</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">Jan – May 2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Self-Driving Car Controller</div>
        <div class="cv-entry-sub">CS747 — Foundations of Intelligent & Learning Agents</div>
        <ul class="cv-entry-desc">
          <li>PID controller optimized with CMA-ES; benchmarked against A2C across 6 tracks × 3 seeds</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">Aug – Nov 2024</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Signboard OCR & Transliteration</div>
        <div class="cv-entry-sub">CS725 — Foundations of Machine Learning</div>
        <ul class="cv-entry-desc">
          <li>Faster R-CNN + EasyOCR + GRU Encoder-Decoder for Hindi→English; 92% detection, 89% transliteration accuracy</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Self Projects -->
  <div class="cv-section">
    <div class="cv-section-title">Self Projects</div>

    <div class="cv-entry">
      <div class="cv-entry-year">Sept – Oct 2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">NutritionRAG — Grounded Nutrition Chatbot</div>
        <ul class="cv-entry-desc">
          <li>Full RAG pipeline with web app; hybrid BM25 + ANN retrieval over textbook corpus in pgvector with inline citations</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">Jul – Aug 2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Direct Preference Optimization (DPO) from Scratch</div>
        <ul class="cv-entry-desc">
          <li>End-to-end PyTorch implementation of DPO to align LLM outputs with human preference data</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">RLHF Pipeline from Scratch</div>
        <ul class="cv-entry-desc">
          <li>VPG-based RLHF loop to steer GPT-2 toward positive story generation with KL penalty</li>
        </ul>
      </div>
    </div>

    <div class="cv-entry">
      <div class="cv-entry-year">2025</div>
      <div class="cv-entry-body">
        <div class="cv-entry-title">Transformer from Scratch</div>
        <ul class="cv-entry-desc">
          <li>Full Transformer architecture (multi-head attention, encoder-decoder) with beam search inference pipeline</li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Skills -->
  <div class="cv-section">
    <div class="cv-section-title">Technical Skills</div>

    <span class="cv-pill-label">Languages</span>
    <div class="cv-pill-group">
      <span class="cv-pill">Python</span>
      <span class="cv-pill">C/C++</span>
      <span class="cv-pill">Java</span>
      <span class="cv-pill">LaTeX</span>
      <span class="cv-pill">Bash</span>
      <span class="cv-pill">SQL</span>
      <span class="cv-pill">HTML/CSS</span>
    </div>

    <span class="cv-pill-label">Frameworks & Libraries</span>
    <div class="cv-pill-group">
      <span class="cv-pill">PyTorch</span>
      <span class="cv-pill">TensorFlow</span>
      <span class="cv-pill">Keras</span>
      <span class="cv-pill">Hugging Face</span>
      <span class="cv-pill">Scikit-learn</span>
      <span class="cv-pill">NumPy</span>
      <span class="cv-pill">Pandas</span>
      <span class="cv-pill">FAISS</span>
      <span class="cv-pill">BM25</span>
    </div>

    <span class="cv-pill-label">Concepts</span>
    <div class="cv-pill-group">
      <span class="cv-pill">Recommender Systems</span>
      <span class="cv-pill">Bandits</span>
      <span class="cv-pill">LLMs</span>
      <span class="cv-pill">RAG</span>
      <span class="cv-pill">RLHF</span>
      <span class="cv-pill">DPO</span>
      <span class="cv-pill">Transformers</span>
      <span class="cv-pill">NLP</span>
      <span class="cv-pill">Hybrid Retrieval</span>
      <span class="cv-pill">MoE</span>
    </div>
  </div>

  <!-- Courses -->
  <div class="cv-section">
    <div class="cv-section-title">Courses</div>
    <div class="cv-pill-group">
      <span class="cv-pill">Human-Centered AI</span>
      <span class="cv-pill">Foundations of Machine Learning</span>
      <span class="cv-pill">Online Learning and Optimization</span>
      <span class="cv-pill">Game Theory & Mechanism Design</span>
      <span class="cv-pill">Speech, NLP and the Web</span>
      <span class="cv-pill">Deep Learning for NLP</span>
      <span class="cv-pill">Foundations of Intelligent Agents</span>
      <span class="cv-pill">Organisation of Web Information</span>
      <span class="cv-pill">ML for Remote Sensing II</span>
      <span class="cv-pill">Software Lab</span>
      <span class="cv-pill">Implementation Security in Cryptography</span>
    </div>
  </div>

  <!-- Awards -->
  <div class="cv-section">
    <div class="cv-section-title">Honors & Awards</div>

    <div class="cv-award">
      <div class="cv-award-year">2025</div>
      <div class="cv-award-text"><strong>Reliance Foundation PG Scholar</strong> — one of 100 recipients nationwide for academic excellence and leadership</div>
    </div>
    <div class="cv-award">
      <div class="cv-award-year">2025</div>
      <div class="cv-award-text"><strong>Inter IIT Tech Meet 14.0</strong> — selected for IIT Bombay's official contingent (Bombay76) in the ObserveAI track</div>
    </div>
    <div class="cv-award">
      <div class="cv-award-year">2024</div>
      <div class="cv-award-text"><strong>GATE CS — 99.09 percentile</strong> (top 0.91%), outperforming 123,967 candidates nationwide</div>
    </div>
    <div class="cv-award">
      <div class="cv-award-year">2024</div>
      <div class="cv-award-text"><strong>1st place — Kaggle competitions, CS725</strong> — outperforming 198 students in both internal competitions at IIT Bombay</div>
    </div>
    <div class="cv-award">
      <div class="cv-award-year">2022</div>
      <div class="cv-award-text"><strong>Google DSC Lead</strong> — first-ever Developer Student Club Lead at institute; organized technical workshops and hackathons</div>
    </div>
  </div>

</div>
