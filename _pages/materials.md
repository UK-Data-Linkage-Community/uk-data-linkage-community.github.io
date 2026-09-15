---
layout: page
title:
permalink: /resources/materials/
classes: wide
---
 
<style>
/* Page-specific layout overrides — adjust to fit your theme */
.jk-materials-page-wrap {
  padding: 32px 0 64px;
}
</style>
 
<div class="jk-materials-page-wrap">
  <div class="jk-materials-page" id="jk-materials-page">
 
    <!-- ═══ FILTER PANEL ═══════════════════════════════════════════════ -->
    <aside class="jk-filter-panel" aria-label="Filter materials">
      <div class="jk-filter-panel__page-title">
        <h1>Site Materials</h1>
      </div>
      <div class="jk-filter-panel__header">
        <p class="jk-filter-panel__title">Filter</p>
    
        <p class="jk-results-count" id="jk-results-count" aria-live="polite">
          {{ site.data.materials.items | size | plus: site.tutorials.size }} results
        </p>
      </div>

      <!-- Active filter chips -->
      <div class="jk-active-filters" id="jk-active-filters" aria-label="Active filters" aria-live="polite"></div>
 
 
      <div class="jk-filter-group" style="position:relative">
        <div class="jk-filter-group__label">Search</div>
        <input type="search"
               class="jk-filter-search"
               id="jk-filter-search"
               placeholder="Title, description…"
               aria-label="Search materials"
               autocomplete="off"
               role="combobox"
               aria-expanded="false"
               aria-controls="jk-search-suggestions">
        <ul class="jk-search-suggestions" id="jk-search-suggestions" role="listbox" hidden></ul>
      </div>

      <details class="jk-filter-group jk-filter-group--dropdown">
        <summary class="jk-filter-group__label">
          Material Type
        </summary>
    
        <div class="jk-filter-options" id="jk-filter-types" role="group" aria-label="Filter by type">
          <!-- populated by JS -->
        </div>
      </details>

      <details class="jk-filter-group jk-filter-group--dropdown">
        <summary class="jk-filter-group__label">
          Authors
        </summary>
        
        <div class="jk-filter-options" id="jk-filter-authors" role="group" aria-label="Filter by author">
          <!-- populated by JS -->
        </div>
      </details>

      <details class="jk-filter-group jk-filter-group--dropdown">
        <summary class="jk-filter-group__label">
          Events
        </summary>
    
        <div class="jk-filter-options" id="jk-filter-events" role="group" aria-label="Filter by event">
          <!-- populated by JS -->
        </div>
      </details>
 
      <details class="jk-filter-group jk-filter-group--dropdown">
          <summary class="jk-filter-group__label">
            Tags
          </summary>
        
          <div class="jk-filter-options" id="jk-filter-tags" role="group" aria-label="Filter by tag">
            <!-- populated by JS -->
          </div>
        </details>

      <details class="jk-filter-group jk-filter-group--dropdown">
          <summary class="jk-filter-group__label">
            Audience Level
          </summary>

          <div class="jk-filter-options" id="jk-filter-levels" role="group" aria-label="Filter by audience level">
            <!-- populated by JS -->
          </div>
        </details>
 
      <button class="jk-filter-reset" id="jk-filter-reset">Clear all filters</button>
    </aside>
 
    <!-- ═══ RESULTS ════════════════════════════════════════════════════ -->
    <div class="jk-materials-results">
 
      
      
 
      <!-- Card grid -->
      <div class="jk-card-grid" id="jk-card-grid">

        {% comment %}
          Two sources feed this grid: uploaded materials (_data/materials.yml —
          slides/video/document/notebook/code) and full tutorial pages (the
          collections/_tutorials collection — type "tutorial"). Both render
          through the same cards/material-card.html include so they're
          indistinguishable to the filter/search JS.
        {% endcomment %}
        {% assign all_materials = site.data.materials.items | concat: site.tutorials %}

        {% for item in all_materials %}
          {% comment %} Build searchable text for JS {% endcomment %}
          {% capture search_text %}{{ item.title }} {{ item.description }} {{ item.tags | join: " " }} {{ item.authors | join: " " }}{% endcapture %}
          {% capture author_ids %}{% for a in item.authors %}{{ a }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
          {% capture tag_list %}{% for t in item.tags %}{{ t }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
 
          <div class="jk-mat-item"
               data-type="{{ item.type }}"
               data-authors="{{ author_ids }}"
               data-event="{{ item.event_id }}"
               data-tags="{{ tag_list }}"
               data-level="{{ item.audience_level }}"
               data-searchtext="{{ search_text | downcase | strip_newlines }}">
            {% include cards/material-card.html item=item display="card" %}
          </div>
        {% endfor %}
 
        <!-- Empty state (hidden by default) -->
        <div class="jk-materials-empty jk-hidden" id="jk-materials-empty" role="status">
          <h3>No materials found</h3>
          <p>Try adjusting your filters or <button class="jk-filter-reset" onclick="document.getElementById('jk-filter-reset').click()" style="background:none;border:none;cursor:pointer;color:var(--jk-accent);font-size:inherit;padding:0;text-decoration:underline">clearing all filters</button>.</p>
        </div>
 
      </div>
    </div>
 
  </div>
</div>
 
{% comment %} Include mode system and data blob {% endcomment %}
{% include cards/card-modes.html %}