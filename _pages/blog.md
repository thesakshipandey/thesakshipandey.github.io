---
layout: default
permalink: /blog/
title: Blog
nav: true
nav_order: 1
---

<style>
  .sp-blog-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 2.5rem 1rem 4rem;
  }

  .sp-blog-wrap h1 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .sp-blog-wrap .sp-lede {
    color: var(--global-text-color-light);
    font-size: 1.05rem;
    line-height: 1.75;
    margin-bottom: 1.5rem;
    max-width: 680px;
  }

  .sp-tag-row {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-bottom: 2.5rem;
  }

  .sp-tag {
    padding: 0.3rem 0.85rem;
    border: 1px solid var(--global-divider-color);
    border-radius: 999px;
    font-size: 0.82rem;
    color: var(--global-text-color-light);
    background: var(--global-card-bg-color);
  }

  .sp-post-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .sp-post-card {
    display: block;
    padding: 1.4rem 1.6rem;
    border: 1.5px solid var(--global-divider-color);
    border-radius: 10px;
    text-decoration: none !important;
    background: var(--global-card-bg-color);
    transition: border-color 0.18s ease, transform 0.15s ease, box-shadow 0.18s ease;
  }

  .sp-post-card:hover {
    border-color: var(--global-theme-color);
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0,0,0,0.08);
    text-decoration: none !important;
  }

  .sp-post-card-meta {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
  }

  .sp-post-date {
    font-size: 0.78rem;
    color: var(--global-text-color-light);
  }

  .sp-post-dot {
    width: 3px;
    height: 3px;
    border-radius: 50%;
    background: var(--global-divider-color);
  }

  .sp-post-tag {
    font-size: 0.72rem;
    color: var(--global-theme-color);
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    padding: 0.2rem 0.6rem;
    border: 1px solid var(--global-theme-color);
    border-radius: 4px;
    opacity: 0.85;
  }

  .sp-post-title {
    font-size: 1.1rem;
    font-weight: 700;
    color: var(--global-text-color);
    line-height: 1.35;
    margin: 0;
  }

  .sp-post-desc {
    margin-top: 0.4rem;
    font-size: 0.93rem;
    color: var(--global-text-color-light);
    line-height: 1.6;
  }

  .sp-read-more {
    display: inline-block;
    margin-top: 0.8rem;
    font-size: 0.82rem;
    font-weight: 600;
    color: var(--global-theme-color);
    letter-spacing: 0.03em;
  }
</style>

<div class="sp-blog-wrap">
  <h1>Blog</h1>
  <p class="sp-lede">
    Weekly writing on ML, math, LLMs, and GenAI — paper summaries, topic deep-dives, roadmap series,
    reviews, and things I find genuinely useful or interesting along the way.
  </p>

  <div class="sp-tag-row">
    <span class="sp-tag">Paper Summary</span>
    <span class="sp-tag">Topic Deep-Dive</span>
    <span class="sp-tag">Roadmap</span>
    <span class="sp-tag">Review</span>
    <span class="sp-tag">ML / Math</span>
    <span class="sp-tag">LLMs / GenAI</span>
    <span class="sp-tag">Bandits</span>
    <span class="sp-tag">Journey</span>
  </div>

  <ul class="sp-post-list">
    <li>
      <a class="sp-post-card" href="{{ '/blog/find-me-this-but-different/' | relative_url }}">
        <div class="sp-post-card-meta">
          <span class="sp-post-date">Apr 2025</span>
          <span class="sp-post-dot"></span>
          <span class="sp-post-tag">Paper Summary</span>
        </div>
        <div class="sp-post-title">"Find Me This, But Different": A Blog on Composed Image Retrieval</div>
        <div class="sp-post-desc">A deep dive into TIRG and composed image retrieval — how image and text combine when one is the reference and the other is the modification.</div>
        <span class="sp-read-more">Read post →</span>
      </a>
    </li>
  </ul>
</div>
