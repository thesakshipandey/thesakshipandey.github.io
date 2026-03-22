---
layout: default
permalink: /blog/
title: Blog
nav: true
nav_order: 1
---

<style>
  .blog-home {
    max-width: 820px;
    margin: 0 auto;
    padding-bottom: 3rem;
  }

  .blog-home .blog-hero {
    padding: 2rem 0 2.5rem;
    border-bottom: 1px solid var(--global-divider-color);
    margin-bottom: 2rem;
  }

  .blog-home .blog-kicker {
    margin-bottom: 0.75rem;
    color: var(--global-theme-color);
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .blog-home h1 {
    margin-bottom: 0.85rem;
    font-size: clamp(2.2rem, 4vw, 3.4rem);
    line-height: 1.06;
  }

  .blog-home .blog-lede {
    max-width: 700px;
    margin-bottom: 1rem;
    color: var(--global-text-color-light);
    font-size: 1.08rem;
    line-height: 1.8;
  }

  .blog-home .blog-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    color: var(--global-text-color-light);
    font-size: 0.95rem;
  }

  .blog-home .blog-chip {
    padding: 0.28rem 0.65rem;
    border: 1px solid var(--global-divider-color);
    border-radius: 999px;
    background: var(--global-card-bg-color);
  }

  .blog-home .blog-section {
    margin: 2rem 0;
  }

  .blog-home .blog-section h2 {
    margin-bottom: 0.8rem;
    font-size: 1.15rem;
    letter-spacing: 0.01em;
  }

  .blog-home .blog-section p {
    color: var(--global-text-color-light);
    line-height: 1.85;
  }

  .blog-home .blog-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 1rem;
    margin-top: 1rem;
  }

  .blog-home .blog-card {
    display: block;
    padding: 1.4rem 1.5rem;
    border: 1px solid var(--global-divider-color);
    border-radius: 16px;
    background: var(--global-card-bg-color);
    text-decoration: none;
    transition: transform 0.18s ease, border-color 0.18s ease;
  }

  .blog-home .blog-card:hover {
    transform: translateY(-2px);
    border-color: var(--global-theme-color);
    text-decoration: none;
  }

  .blog-home .blog-card-title {
    margin-bottom: 0.5rem;
    color: var(--global-text-color);
    font-size: 1.45rem;
    line-height: 1.25;
  }

  .blog-home .blog-card-copy {
    margin-bottom: 0.75rem;
    color: var(--global-text-color-light);
  }

  .blog-home .blog-card-meta {
    color: var(--global-text-color-light);
    font-size: 0.92rem;
  }

  .blog-home .blog-list {
    padding-left: 1.1rem;
    color: var(--global-text-color-light);
  }

  .blog-home .blog-list li {
    margin-bottom: 0.5rem;
    line-height: 1.7;
  }
</style>

<div class="post blog-home">
  <section class="blog-hero">
    <div class="blog-kicker">Sakshi Pandey</div>
    <h1>Research Notes and Technical Writing</h1>
    <p class="blog-lede">
      I am an M.S. Research Scholar in Computer Science at IIT Bombay working on trustworthy machine learning, reinforcement learning,
      LLM alignment, and AI security. This page collects paper notes, technical explainers, and research writing shaped by those interests.
    </p>
    <div class="blog-meta">
      <span class="blog-chip">IIT Bombay</span>
      <span class="blog-chip">Trustworthy ML</span>
      <span class="blog-chip">Reinforcement Learning</span>
      <span class="blog-chip">AI Security</span>
      <span class="blog-chip">Multimodal Systems</span>
    </div>
  </section>

  <section class="blog-section">
    <h2>About This Blog</h2>
    <p>
      Most of the writing here will revolve around the questions I keep returning to in research:
      how to make machine learning systems more reliable, how to reason clearly about model behavior,
      and how to connect theory with practical system building.
    </p>
  </section>

  <section class="blog-section">
    <h2>Featured</h2>
    <div class="blog-grid">
      <a class="blog-card" href="{{ '/blog/find-me-this-but-different/' | relative_url }}">
        <div class="blog-card-title">"Find Me This, But Different": A Blog on Composed Image Retrieval</div>
        <div class="blog-card-copy">
          A detailed walkthrough of TIRG and composed image retrieval, focusing on how image and text can work together
          when one acts as the reference and the other acts as the modification.
        </div>
        <div class="blog-card-meta">Computer Vision · Multimodal AI · Paper Notes</div>
      </a>
    </div>
  </section>

  <section class="blog-section">
    <h2>Coming Soon</h2>
    <ul class="blog-list">
      <li>Notes on reinforcement learning for side-channel analysis and neural architecture search.</li>
      <li>Writing on multilingual red-teaming, jailbreak behavior, and safety gaps in LLMs.</li>
      <li>Short technical essays on evaluation, robustness, and applied ML research practice.</li>
    </ul>
  </section>
</div>
