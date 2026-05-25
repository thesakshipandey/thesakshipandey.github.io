---
layout: default
permalink: /notes/
title: Notes
nav: true
nav_order: 2
---

<style>
  .sp-notes-wrap {
    max-width: 860px;
    margin: 0 auto;
    padding: 2.5rem 1rem 4rem;
  }

  .sp-notes-wrap h1 {
    font-size: 2.2rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
  }

  .sp-notes-wrap .sp-lede {
    color: var(--global-text-color-light);
    font-size: 1.05rem;
    line-height: 1.75;
    margin-bottom: 3rem;
    max-width: 680px;
  }

  .sp-section {
    margin-bottom: 3rem;
  }

  .sp-section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 0.4rem;
  }

  .sp-section-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
  }

  .sp-section-desc {
    color: var(--global-text-color-light);
    font-size: 0.93rem;
    margin-bottom: 1rem;
    line-height: 1.65;
  }

  .sp-divider {
    border: none;
    border-top: 1px solid var(--global-divider-color);
    margin-bottom: 1rem;
  }

  .sp-note-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sp-note-item {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 0.9rem 0;
    border-bottom: 1px solid var(--global-divider-color);
    text-decoration: none;
  }

  .sp-note-item:last-child {
    border-bottom: none;
  }

  .sp-note-date {
    font-size: 0.82rem;
    color: var(--global-text-color-light);
    white-space: nowrap;
    min-width: 80px;
  }

  .sp-note-title {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--global-text-color);
    text-decoration: none;
    line-height: 1.4;
    flex: 1;
  }

  .sp-note-title:hover {
    color: var(--global-theme-color);
    text-decoration: none;
  }

  .sp-empty {
    padding: 1.2rem 1.25rem;
    border: 1px dashed var(--global-divider-color);
    border-radius: 8px;
    color: var(--global-text-color-light);
    font-size: 0.93rem;
    line-height: 1.7;
  }
</style>

<div class="sp-notes-wrap">
  <h1>Notes</h1>
  <p class="sp-lede">
    Structured notes from courses I've taken, explanations of famous papers, and deep-dives into
    topics or math concepts I wish someone had explained clearly when I first encountered them.
  </p>

  <!-- ── Course Notes ─────────────────────────────── -->
  <div class="sp-section">
    <div class="sp-section-header">
      <h2>📓 Course Notes</h2>
    </div>
    <p class="sp-section-desc">
      Notes from courses at IIT Bombay and beyond — condensed, annotated, and made useful for revision.
    </p>
    <hr class="sp-divider">
    {% assign course_notes = site.posts | where: "category", "course-notes" %}
    {% if course_notes.size > 0 %}
      <ul class="sp-note-list">
        {% for note in course_notes %}
          <li>
            <a class="sp-note-item" href="{{ note.url | relative_url }}">
              <span class="sp-note-date">{{ note.date | date: "%b %Y" }}</span>
              <span class="sp-note-title">{{ note.title }}</span>
            </a>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <div class="sp-empty">Coming soon — notes from Foundations of ML, Deep Learning for NLP, Game Theory, and more.</div>
    {% endif %}
  </div>

  <!-- ── Famous Papers ─────────────────────────────── -->
  <div class="sp-section">
    <div class="sp-section-header">
      <h2>📄 Famous Papers, Explained</h2>
    </div>
    <p class="sp-section-desc">
      Careful walkthroughs of landmark papers — what they actually claim, why it matters, and what people get wrong about them.
    </p>
    <hr class="sp-divider">
    {% assign paper_notes = site.posts | where: "category", "paper-explained" %}
    {% if paper_notes.size > 0 %}
      <ul class="sp-note-list">
        {% for note in paper_notes %}
          <li>
            <a class="sp-note-item" href="{{ note.url | relative_url }}">
              <span class="sp-note-date">{{ note.date | date: "%b %Y" }}</span>
              <span class="sp-note-title">{{ note.title }}</span>
            </a>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <div class="sp-empty">Coming soon — Attention Is All You Need, DPO, bandit algorithms, and recommendation system classics.</div>
    {% endif %}
  </div>

  <!-- ── Concepts & Math ─────────────────────────────── -->
  <div class="sp-section">
    <div class="sp-section-header">
      <h2>🧮 Concepts & Math, Made Clear</h2>
    </div>
    <p class="sp-section-desc">
      Topics and math ideas explained the way I wish they'd been explained to me — from first principles, with intuition before formulas.
    </p>
    <hr class="sp-divider">
    {% assign concept_notes = site.posts | where: "category", "concept" %}
    {% if concept_notes.size > 0 %}
      <ul class="sp-note-list">
        {% for note in concept_notes %}
          <li>
            <a class="sp-note-item" href="{{ note.url | relative_url }}">
              <span class="sp-note-date">{{ note.date | date: "%b %Y" }}</span>
              <span class="sp-note-title">{{ note.title }}</span>
            </a>
          </li>
        {% endfor %}
      </ul>
    {% else %}
      <div class="sp-empty">Coming soon — KL divergence, exploration vs. exploitation, preference learning, and transformer internals.</div>
    {% endif %}
  </div>

</div>
