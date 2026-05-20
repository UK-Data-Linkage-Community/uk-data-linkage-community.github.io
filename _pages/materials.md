---
layout: page
title: Site Materials
permalink: /resources/materials/
---

<div class="materials-page">

  <div class="materials-controls">
    <input
      type="text"
      id="materials-search"
      placeholder="Search materials..."
    />

    <div id="tag-filters">
      {% assign all_tags = site.data.materials.items | map: "tags" | uniq %}
    </div>
  </div>

  <div class="card-grid" id="materials-grid">

    {% for item in site.data.materials.items %}

      <div
        class="filter-item"
        data-tags="{{ item.tags | join: ',' }}"
        data-title="{{ item.title | downcase }}"
      >

        {% include card.html
          type="material"
          id=item.id
          render="grid"
        %}

      </div>

    {% endfor %}

  </div>

</div>

<script src="/assets/js/material-search.js"></script>