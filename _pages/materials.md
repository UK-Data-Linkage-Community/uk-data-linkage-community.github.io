---
layout: page
title: Materials
permalink: /resources/materials/
---

{% assign materials = site.data.materials_metadata.materials %}
{% assign events = site.data.events.categories %}

<div class="materials-page">

  <div class="materials-hero">

    <h1 class="materials-title">
      Materials Library
    </h1>

    <p class="materials-subtitle">
      Browse workshop slides, recordings, and supporting resources.
    </p>

    <div class="materials-toolbar">

      <input
        type="text"
        id="materials-search"
        class="materials-search"
        placeholder="Search materials, authors, tags..."
      >

      <select id="filter-event">
        <option value="">All events</option>

        {% for category in events %}
          {% for event in category.events %}
            <option value="{{ event.id }}">
              {{ event.title }}
            </option>
          {% endfor %}
        {% endfor %}
      </select>

      <select id="filter-type">
        <option value="">All types</option>
        <option value="video">Video</option>
        <option value="slides">Slides</option>
      </select>

      <button id="clear-filters" class="materials-clear">
        Clear
      </button>

    </div>

  </div>

  <p class="materials-count" id="materials-count"></p>

  <div class="materials-grid" id="materials-grid">

    {% for material in materials %}

      {% assign event = nil %}

      {% for category in events %}
        {% assign found_event = category.events
          | where: "id", material.event_id
          | first %}

        {% if found_event %}
          {% assign event = found_event %}
        {% endif %}
      {% endfor %}

      <article
        class="material-card"
        data-title="{{ material.title | downcase }}"
        data-event="{{ material.event_id }}"
        data-type="{{ material.type }}"
        data-authors="{{ material.authors | join: ',' | downcase }}"
        data-tags="{{ material.tags | join: ',' | downcase }}"
        data-caption="{{ material.caption | downcase }}"
      >

        <div class="material-card__top">

          <span class="material-type material-type--{{ material.type }}">
            {{ material.type }}
          </span>

          {% if event %}
            <span class="material-event">
              {{ event.title }}
            </span>
          {% endif %}

        </div>

        <h2 class="material-title">
          {{ material.title }}
        </h2>

        {% if material.authors %}
          <p class="material-authors">
            {{ material.authors | join: ", " }}
          </p>
        {% endif %}

        <p class="material-caption">
          {{ material.caption }}
        </p>

        {% if material.tags %}
          <div class="material-tags">

            {% for tag in material.tags %}
              <span class="material-tag">
                {{ tag }}
              </span>
            {% endfor %}

          </div>
        {% endif %}

        <div class="material-footer">

          <a
            href="{{ material.src }}"
            class="material-link"
            target="_blank"
            rel="noopener"
          >

            {% if material.type == "video" %}
              Watch Video →
            {% elsif material.type == "slides" %}
              Open Slides →
            {% else %}
              Open Resource →
            {% endif %}

          </a>

        </div>

      </article>

    {% endfor %}

  </div>

  <p
    class="materials-empty"
    id="materials-empty"
    style="display:none;"
  >
    No materials match the selected filters.
  </p>

</div>

<script>
(function () {

  const searchInput = document.getElementById('materials-search');
  const filterEvent = document.getElementById('filter-event');
  const filterType  = document.getElementById('filter-type');
  const clearBtn    = document.getElementById('clear-filters');

  const countEl     = document.getElementById('materials-count');
  const emptyEl     = document.getElementById('materials-empty');

  const cards = Array.from(
    document.querySelectorAll('.material-card')
  );

  function applyFilters() {

    const q  = searchInput.value.toLowerCase().trim();
    const ev = filterEvent.value;
    const ty = filterType.value;

    let visible = 0;

    cards.forEach(card => {

      const text =
          card.dataset.title + ' '
        + card.dataset.authors + ' '
        + card.dataset.tags + ' '
        + card.dataset.caption;

      const matchesSearch =
        !q || text.includes(q);

      const matchesEvent =
        !ev || card.dataset.event === ev;

      const matchesType =
        !ty || card.dataset.type === ty;

      const show =
        matchesSearch &&
        matchesEvent &&
        matchesType;

      card.style.display = show ? '' : 'none';

      if (show) visible++;

    });

    countEl.textContent =
      visible + ' material'
      + (visible !== 1 ? 's' : '');

    emptyEl.style.display =
      visible === 0 ? 'block' : 'none';
  }

  searchInput.addEventListener('input', applyFilters);
  filterEvent.addEventListener('change', applyFilters);
  filterType.addEventListener('change', applyFilters);

  clearBtn.addEventListener('click', function () {

    searchInput.value = '';
    filterEvent.value = '';
    filterType.value  = '';

    applyFilters();

  });

  applyFilters();

})();
</script>