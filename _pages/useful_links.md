---
layout: links_page
title: Useful Links
permalink: /resources/useful-links
---

<div class="links-page">
  <div class="page-header">
    <h1>Useful Links</h1>
    <p class="page-intro">A curated collection of helpful resources and tools <br/>
    To add to this list, please submit <a href="mailto:{{ site.contact_email }}?subject=UK DLC: Useful links">via email</a> or through the <a href="{{ site.ukdlc_github_discussions }}">GitHub discussions</a></p>
  </div>

  {% for category in site.data.links.categories %}
  <div class="link-category">
    <h2 class="category-title">{{ category.name }}</h2>
    <p class="category-description">{{ category.description }}</p>
    
    <div class="links-grid">
      {% for link in category.links %}
      <a href="{{ link.url }}" class="link-card" target="_blank" rel="noopener noreferrer">
        <div class="link-header">
          <h3 class="link-title">{{ link.title }}</h3>    
          {% if link.icons %}
          <div class="link-icons">
            {% for icon in link.icons %}
            <i class="{{ icon }}"></i>
            {% endfor %}
          </div>
          {% endif %}
          
        </div>
        <p class="link-description">{{ link.description }}</p>
        <span class="link-arrow">→</span>
      </a>
      {% endfor %}
    </div>
  </div>
  {% endfor %}
</div>
