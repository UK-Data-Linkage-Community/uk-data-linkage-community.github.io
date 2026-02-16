---
layout: links_page
title: Useful Links
permalink: /materials/useful-links
---

<div class="links-page">
  <div class="page-header">
    <h1>Useful Links</h1>
    <p class="page-intro">Below is a list of various interesting and helpful resources. 
Please let us know if we've missed any, or if links are broken.</p>
  </div>

  {% for category in site.data.links.categories %}
  <div class="link-category">
    <h2 class="category-title">{{ category.name }}</h2>
    <p class="category-description">{{ category.description }}</p>
    
    <div class="links-grid">
      {% for link in category.links %}
      <a href="{{ link.url }}" class="link-card" target="_blank" rel="noopener noreferrer">
        <h3 class="link-title">{{ link.title }}</h3>
        <p class="link-description">{{ link.description }}</p>
        <span class="link-arrow">→</span>
      </a>
      {% endfor %}
    </div>
  </div>
  {% endfor %}
</div>

<style>
.links-page {
  max-width: 1400px;
  margin: 0 auto;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  margin-bottom: 60px;
  padding-bottom: 30px;
  border-bottom: 2px solid #e8e8e8;
}

.page-header h1 {
  font-size: 2.5rem;
  color: #111;
  margin-bottom: 1rem;
}

.page-intro {
  font-size: 1.2rem;
  color: #494951;
  max-width: 600px;
  margin: 0 auto;
}

.link-category {
  margin-bottom: 60px;
}

.category-title {
  font-size: 1.8rem;
  color: #111;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 3px solid #494951;
  display: inline-block;
}

.category-description {
  font-size: 1.1rem;
  color: #666;
  margin-bottom: 2rem;
  font-style: italic;
}

.links-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 40px;
}

.link-card {
  position: relative;
  display: block;
  padding: 25px;
  background: #fff;
  border: 2px solid #e8e8e8;
  border-radius: 8px;
  text-decoration: none;
  transition: all 0.3s ease;
  overflow: hidden;
}

.link-card:hover {
  border-color: #494951;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
  text-decoration: none;
}

.link-card:hover .link-arrow {
  transform: translateX(5px);
}

.link-title {
  font-size: 1.3rem;
  color: #111;
  margin: 0 0 0.5rem 0;
  font-weight: 600;
}

.link-description {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
  padding-right: 30px;
}

.link-arrow {
  position: absolute;
  right: 20px;
  bottom: 20px;
  font-size: 1.5rem;
  color: #494951;
  transition: transform 0.3s ease;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .links-grid {
    grid-template-columns: 1fr;
  }
  
  .page-header h1 {
    font-size: 2rem;
  }
  
  .page-intro {
    font-size: 1rem;
  }
  
  .category-title {
    font-size: 1.5rem;
  }
  
  .link-card {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .links-page {
    padding: 20px 15px;
  }
  
  .page-header h1 {
    font-size: 1.7rem;
  }
  
  .category-title {
    font-size: 1.3rem;
  }
}
</style>