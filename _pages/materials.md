---
layout: page
title:
permalink: /resources/materials/
---
 
<style>
/* Page-specific layout overrides — adjust to fit your theme */
.jk-materials-page-wrap {
  padding: 32px 0 64px;
}
.jk-materials-page-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 6px;
  color: var(--jk-text, #1c1a17);
}
.jk-materials-page-subtitle {
  font-size: 1rem;
  color: var(--jk-text-muted, #6b6558);
  margin: 0 0 28px;
}
</style>
 
<div class="jk-materials-page-wrap">
  <h1 class="jk-materials-page-title">Site Materials</h1>
  <p class="jk-materials-page-subtitle">
    Slides, recordings, notebooks, and documents from all our events.
  </p>
 
  <div class="jk-materials-page" id="jk-materials-page">
 
    <!-- ═══ FILTER PANEL ═══════════════════════════════════════════════ -->
    <aside class="jk-filter-panel" aria-label="Filter materials">
      <p class="jk-filter-panel__title">Filter</p>
 
      <div class="jk-filter-group">
        <div class="jk-filter-group__label">Search</div>
        <input type="search"
               class="jk-filter-search"
               id="jk-filter-search"
               placeholder="Title, description…"
               aria-label="Search materials">
      </div>
 
      <div class="jk-filter-group">
        <div class="jk-filter-group__label">Type</div>
        <div class="jk-filter-options" id="jk-filter-types" role="group" aria-label="Filter by type">
          <!-- populated by JS -->
        </div>
      </div>
 
      <div class="jk-filter-group">
        <div class="jk-filter-group__label">Author</div>
        <div class="jk-filter-options" id="jk-filter-authors" role="group" aria-label="Filter by author">
          <!-- populated by JS -->
        </div>
      </div>
 
      <div class="jk-filter-group">
        <div class="jk-filter-group__label">Event</div>
        <div class="jk-filter-options" id="jk-filter-events" role="group" aria-label="Filter by event">
          <!-- populated by JS -->
        </div>
      </div>
 
      <div class="jk-filter-group">
        <div class="jk-filter-group__label">Tags</div>
        <div class="jk-filter-options" id="jk-filter-tags" role="group" aria-label="Filter by tag">
          <!-- populated by JS -->
        </div>
      </div>
 
      <button class="jk-filter-reset" id="jk-filter-reset">Clear all filters</button>
    </aside>
 
    <!-- ═══ RESULTS ════════════════════════════════════════════════════ -->
    <div class="jk-materials-results">
 
      <!-- Active filter chips -->
      <div class="jk-active-filters" id="jk-active-filters" aria-label="Active filters" aria-live="polite"></div>
 
      <!-- Result count + layout toggle -->
      <div class="jk-materials-header" style="margin-top:12px">
        <p class="jk-results-count" id="jk-results-count" aria-live="polite">
          {{ site.data.materials.items | size }} results
        </p>
      </div>
 
      <!-- Card grid -->
      <div class="jk-card-grid" id="jk-card-grid">
 
        {% for item in site.data.materials.items %}
          {% comment %} Build searchable text for JS {% endcomment %}
          {% capture search_text %}{{ item.title }} {{ item.description }} {{ item.tags | join: " " }} {{ item.authors | join: " " }}{% endcapture %}
          {% capture author_ids %}{% for a in item.authors %}{{ a }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
          {% capture tag_list %}{% for t in item.tags %}{{ t }}{% unless forloop.last %},{% endunless %}{% endfor %}{% endcapture %}
 
          <div class="jk-mat-item"
               data-type="{{ item.type }}"
               data-authors="{{ author_ids }}"
               data-event="{{ item.event_id }}"
               data-tags="{{ tag_list }}"
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