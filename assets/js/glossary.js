import { data, state, initState, conceptMap, allTerms, renderDefinitionBlock } from "./state.js";
import { initPopovers, viewSettingsPopover, filterPopover } from "./popovers.js";
import { initSidebar } from "./sidebar.js";
import { initPipelinePanel, clearPipelineActive } from "./pipeline-panel.js";
import { initGraphSection, homeGraphSection, mountGraphSectionInto, focusGraph } from "./graph.js";

document.addEventListener("DOMContentLoaded", function () {
  if (!initState()) return;

  const content           = document.getElementById("detail-content");
  const searchInput       = document.getElementById("search");
  const searchBtn         = document.getElementById("search-btn");
  const suggestions       = document.getElementById("suggestions");
  const message            = document.getElementById("search-message");
  const modeToggle         = document.getElementById("mode-toggle");
  const prefShowAnalogies  = document.getElementById("pref-show-analogies");

  initPopovers();
  initSidebar();
  initGraphSection(id => selectGlossaryConcept(id, false));

  function rerenderActiveView() {
    if (state.activeConceptId)    renderConceptDetail(state.activeConceptId);
    else if (state.activeSection) renderSection(state.activeSection);
  }

  function isCompactMode() {
    return getComputedStyle(document.getElementById("sidebar-tabs")).display !== "none";
  }

  modeToggle.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.mode === state.defMode) return;
      state.defMode = btn.dataset.mode;
      modeToggle.querySelectorAll(".mode-btn").forEach(b =>
        b.classList.toggle("active", b === btn)
      );
      rerenderActiveView();
    });
  });

  document.querySelectorAll(".analogy-display-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      state.analogyDisplay = btn.dataset.analogyDisplay;

      document.querySelectorAll(".analogy-display-btn").forEach(b => {
        b.classList.toggle("active", b === btn);
      });

      rerenderActiveView();
    });
  });

  // --- Content rendering --------------------------------------------

  function renderSection(section) {
    homeGraphSection();
    state.activeSection   = section;
    state.activeConceptId = null;

    let html = `<p class="section-summary">${section.summary}</p>`;

    section.methods.forEach(m => {
      html += `<h3>${m.name}</h3>`;

      if (m.concepts && m.concepts.length) {
        m.concepts.forEach(cid => {
          const c = conceptMap[cid];
          if (!c) return;
          const tagHtml = (c.tags || [])
            .map(t => `<span class="tag-chip tag-chip--${t}" data-tag="${t}">${t}</span>`)
            .join("");
          html += `
            <p class="panel-concept">
              <strong class="concept-link" data-id="${c.id}">${c.prefLabel}</strong>
              <span class="panel-tags">${tagHtml}</span>
              ${renderDefinitionBlock(c, false)}
            </p>`;
        });
      } else {
        (m.terms || []).forEach(t => {
          html += `<p><strong>${t.term}</strong>: ${t.definition}</p>`;
        });
      }
    });

    content.innerHTML = html;
    attachContentLinkHandlers();
  }

  function renderConceptDetail(conceptId) {
    const concept = conceptMap[conceptId];
    if (!concept) return;
    homeGraphSection();

    state.activeConceptId = conceptId;
    state.activeSection    = null;

    const makeLinks = ids =>
      ids.map(id => {
        const label = conceptMap[id]?.prefLabel || id;
        return `<span class="rel-link" data-id="${id}">${label}</span>`;
      }).join(", ");

    const relationRows = [];
    if (concept.broader?.length)  relationRows.push(`<span class="rel-label broader-label">Broader</span> ${makeLinks(concept.broader)}`);
    if (concept.narrower?.length) relationRows.push(`<span class="rel-label narrower-label">Narrower</span> ${makeLinks(concept.narrower)}`);
    if (concept.related?.length)  relationRows.push(`<span class="rel-label related-label">Related</span> ${makeLinks(concept.related)}`);

    const altHtml = (concept.altLabel || [])
      .map(a => `<span class="alt-label">${a}</span>`)
      .join("");

    const tagHtml = (concept.tags || [])
      .map(t => `<span class="tag-chip tag-chip--${t}" data-tag="${t}">${t}</span>`)
      .join("");

    content.innerHTML = `
      <div class="concept-detail-inner">
        <div class="concept-detail-header">
          <h3>${concept.prefLabel} ${altHtml}</h3>
        </div>
        <p class="concept-def">${renderDefinitionBlock(concept)}</p>
        ${relationRows.length
          ? `<div class="concept-relations">
               ${relationRows.map(r => `<div class="relation-row">${r}</div>`).join("")}
             </div>`
          : ""}
        <div class="concept-detail-footer">
          <div class="concept-tag-chips">${tagHtml}</div>
        </div>
      </div>`;
    mountGraphSectionInto(content.querySelector(".concept-detail-inner"));

    attachContentLinkHandlers();
  }

  function showEmptyDetail() {
    homeGraphSection();
    state.activeSection   = null;
    state.activeConceptId = null;
    content.innerHTML = `<p class="detail-empty">Select a stage from the pipeline panel, or a term from the browse list, to see its definition here.</p>`;
  }

  function attachContentLinkHandlers() {
    content.querySelectorAll(".concept-link, .def-link, .rel-link").forEach(el => {
      el.addEventListener("click", () => selectGlossaryConcept(el.dataset.id, false));
    });
  }

  initPipelinePanel({
    onStepSelect: sectionId => {
      const section = data.sections.find(s => s.id === sectionId);
      if (section) renderSection(section);
    },
    onStepDeselect: showEmptyDetail,
  });

  // --- Search ---------------------------------------------------------

  let activeSuggestionIndex = -1;

  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    suggestions.innerHTML = "";
    activeSuggestionIndex = -1;
    if (!q) { suggestions.style.display = "none"; return; }

    const matches = allTerms
      .filter(t => t.term.toLowerCase().includes(q))
      .slice(0, 6);

    matches.forEach(m => {
      const div = document.createElement("div");
      div.className = "suggestion";
      div.textContent = m.term;
      div.addEventListener("click", () => {
        searchInput.value = m.term;
        suggestions.style.display = "none";
        runSearch();
      });
      suggestions.appendChild(div);
    });
    suggestions.style.display = matches.length ? "block" : "none";
  });

  function getSuggestionEls() {
    return [...suggestions.querySelectorAll(".suggestion")];
  }

  function setActiveSuggestion(index) {
    const items = getSuggestionEls();
    if (!items.length) return;
    // wrap around in both directions
    activeSuggestionIndex = (index + items.length) % items.length;
    items.forEach((el, i) => el.classList.toggle("active", i === activeSuggestionIndex));
    items[activeSuggestionIndex].scrollIntoView({ block: "nearest" });
  }

  function runSearch() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) return;

    const match =
      allTerms.find(t => t.term.toLowerCase() === q) ||
      allTerms.find(t => t.term.toLowerCase().includes(q));

    if (match) {
      message.textContent = "";
      viewSettingsPopover.close();
      selectGlossaryConcept(match.id, true);
    } else {
      message.textContent = "No match found in glossary.";
    }
  }

  searchBtn.addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", e => {
    const items = getSuggestionEls();
    const suggestionsOpen = suggestions.style.display === "block" && items.length;

    if (e.key === "ArrowDown" && suggestionsOpen) {
      e.preventDefault();
      setActiveSuggestion(activeSuggestionIndex + 1);
    } else if (e.key === "ArrowUp" && suggestionsOpen) {
      e.preventDefault();
      setActiveSuggestion(activeSuggestionIndex - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (suggestionsOpen && activeSuggestionIndex >= 0) items[activeSuggestionIndex].click();
      else runSearch();
    } else if (e.key === "Escape") {
      suggestions.style.display = "none";
      activeSuggestionIndex = -1;
    }
  });

  // --- Tag filters + glossary list ------------------------------------

  function getTagCounts() {
    const counts = new Map();
    data.skos.concepts.forEach(c =>
      (c.tags || []).forEach(t => counts.set(t, (counts.get(t) || 0) + 1))
    );
    return counts;
  }

  function renderTagFilters() {
    const counts = getTagCounts();
    const tags   = [...counts.keys()].sort();
    const total  = data.skos.concepts.length;

    const container = document.getElementById("tag-filters");

    let html = `<button class="tag-filter active" data-tag="">All <span class="tag-count">${total}</span></button>`;
    tags.forEach(t => {
      html += `<button class="tag-filter tag-filter--${t}" data-tag="${t}">${t} <span class="tag-count">${counts.get(t)}</span></button>`;
    });
    container.innerHTML = html;

    const filterLabel = document.getElementById("filter-toggle-label");

    container.querySelectorAll(".tag-filter").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".tag-filter").forEach(b =>
          b.classList.remove("active")
        );
        btn.classList.add("active");
        state.activeFilter = btn.dataset.tag || null;
        filterLabel.textContent = state.activeFilter
          ? `${state.activeFilter} (${counts.get(state.activeFilter)})`
          : "All terms";
        renderGlossaryList();
        filterPopover.close();
      });
    });
  }

  function renderGlossaryList() {
    const concepts = data.skos.concepts
      .filter(c => !state.activeFilter || (c.tags || []).includes(state.activeFilter))
      .sort((a, b) => a.prefLabel.localeCompare(b.prefLabel));

    const container = document.getElementById("glossary-list");
    let html = "";
    let currentLetter = "";

    concepts.forEach(c => {
      const letter = c.prefLabel[0].toUpperCase();
      if (letter !== currentLetter) {
        if (currentLetter) html += `</div>`;
        html += `<div class="alpha-group">
                   <div class="alpha-label">${letter}</div>`;
        currentLetter = letter;
      }

      const isActive = c.id === state.activeConceptId ? " active" : "";
      const tagHtml  = (c.tags || [])
        .map(t => `<span class="tag-chip tag-chip--${t}" data-tag="${t}">${t}</span>`)
        .join("");

      html += `<div class="glossary-term${isActive}" data-id="${c.id}">
                 <span class="term-label">${c.prefLabel}</span>
                 <span class="term-tags-inline">${tagHtml}</span>
               </div>`;
    });
    if (currentLetter) html += `</div>`;

    container.innerHTML = html || `<p class="glossary-list-empty">No terms match this filter.</p>`;

    container.querySelectorAll(".glossary-term").forEach(el => {
      el.addEventListener("click", () => {
        clearPipelineActive();
        selectGlossaryConcept(el.dataset.id, false);
      });
    });
  }

  function selectGlossaryConcept(id, scrollToTop) {
    state.activeConceptId = id;
    renderConceptDetail(id);
    renderGlossaryList();
    focusGraph(id);

    if (scrollToTop && isCompactMode()) {
      document.querySelector("#detail-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // Analogy pill expand/collapse (delegated — pills are re-rendered often)
  document.addEventListener("click", e => {
    const pill = e.target.closest(".analogy-pill");
    if (!pill) return;
    const id   = pill.dataset.analogyFor;
    const text = document.getElementById(`analogy-${id}`);
    if (!text) return;
    const isOpen = text.style.display !== "none";
    text.style.display = isOpen ? "none" : "block";
    pill.classList.toggle("open", !isOpen);
  });

  function initGlossary() {
    renderTagFilters();
    renderGlossaryList();
  }

  requestAnimationFrame(initGlossary);
});
