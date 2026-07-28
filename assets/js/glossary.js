document.addEventListener("DOMContentLoaded", function () {

  const data = window.glossaryData;
  if (!data) { console.error("Glossary data not loaded"); return; }

  // ═══════════════════════════════════════════════════════════════════
  // GENERIC POPOVER  (small floating card anchored near its trigger
  // button — used for the "Search & view" card and the tag-filter
  // dropdown. Closes on outside click, Escape, or its own close button.)
  // ═══════════════════════════════════════════════════════════════════
  function makePopover(triggerEl, cardEl, closeEl) {
    function open() {
      // Close any other open popovers first so only one shows at a time.
      document.querySelectorAll(".popover-open").forEach(el => {
        if (el !== cardEl) el.classList.remove("popover-open");
      });
      cardEl.classList.add("popover-open");
      triggerEl.classList.add("active");
    }
    function close() {
      cardEl.classList.remove("popover-open");
      triggerEl.classList.remove("active");
    }
    const isOpen = () => cardEl.classList.contains("popover-open");

    triggerEl.addEventListener("click", e => {
      e.stopPropagation();
      isOpen() ? close() : open();
    });
    if (closeEl) closeEl.addEventListener("click", close);
    cardEl.addEventListener("click", e => e.stopPropagation());
    document.addEventListener("click", e => {
      if (isOpen() && !cardEl.contains(e.target) && e.target !== triggerEl) close();
    });

    return { open, close, isOpen };
  }

  const viewSettingsPopover = makePopover(
    document.getElementById("view-settings-btn"),
    document.getElementById("view-settings-card"),
    document.getElementById("view-settings-close")
  );

  const filterPopover = makePopover(
    document.getElementById("filter-toggle"),
    document.getElementById("filter-popover"),
    null
  );

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (viewSettingsPopover.isOpen()) viewSettingsPopover.close();
    if (filterPopover.isOpen()) filterPopover.close();
  });

  // ═══════════════════════════════════════════════════════════════════
  // SIDEBAR (mobile) — the term browser is always visible on desktop;
  // on narrow screens it collapses behind a toggle so it doesn't push
  // the pipeline below the fold.
  // ═══════════════════════════════════════════════════════════════════
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarBody    = document.getElementById("sidebar-body");
  sidebarToggle.addEventListener("click", () => {
    sidebarToggle.classList.toggle("open");
    sidebarBody.classList.toggle("open");
  });

  // ═══════════════════════════════════════════════════════════════════
  // SIDEBAR TABS (mobile) — Terms / Pipeline switcher. On tablet and
  // desktop this is hidden and both panels sit in their normal spots,
  // so this wiring is inert there.
  // ═══════════════════════════════════════════════════════════════════
  const sidebarTabs   = document.querySelectorAll(".sidebar-tab");
  const sidebarPanels = document.querySelectorAll(".sidebar-tab-panel");

  function setSidebarTab(tab) {
    sidebarTabs.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
    sidebarPanels.forEach(panel =>
      panel.classList.toggle("active", panel.dataset.tabPanel === tab)
    );
    // Lets CSS drop the 70vh scroll cap for the Pipeline tab — that cap
    // exists so a long, searchable term list doesn't take over the page,
    // but it was also clipping the much shorter pipeline accordion into
    // its own little scrollbox instead of letting the page scroll normally.
    sidebarBody.classList.toggle("showing-pipeline", tab === "pipeline");
  }

  sidebarTabs.forEach(btn => {
    btn.addEventListener("click", () => setSidebarTab(btn.dataset.tab));
  });

  // ═══════════════════════════════════════════════════════════════════
  // PIPELINE PANEL — a collapsible right-hand rail on tablet/desktop,
  // kept out of the way of the definition + term list. On mobile there's
  // no room for a rail beside anything, so instead of stacking it as its
  // own accordion (which used to sit awkwardly between an often-empty
  // detail panel and the graph section), it's reparented into the
  // sidebar as a second "Pipeline" tab alongside "Terms" — one nav
  // surface instead of two competing ones. Same DOM node, same
  // listeners; only its position and an --embedded modifier change.
  // ═══════════════════════════════════════════════════════════════════
  const pipelinePanel        = document.getElementById("pipeline-panel");
  const pipelinePanelToggle  = document.getElementById("pipeline-panel-toggle");
  const pipelinePanelAnchor  = document.getElementById("pipeline-panel-anchor");
  const sidebarPipelineMount = document.getElementById("sidebar-pipeline-mount");

  pipelinePanelToggle.addEventListener("click", () => {
    pipelinePanel.classList.toggle("open");
  });

  // Reads the real layout cutover point from CSS (--bp-stack, ultimately
  // $bp-nav in abstracts/_variables) rather than duplicating a pixel
  // value here, so this can't drift out of sync with the CSS breakpoint
  // that switches the sidebar/pipeline into their stacked, tabbed form
  // — both need to agree, or the panel gets reparented into the sidebar
  // tab before (or after) the surrounding layout has actually stacked.
  const bpStack = getComputedStyle(document.querySelector(".glossary-page"))
    .getPropertyValue("--bp-stack").trim() || "1200px";
  const stackQuery = window.matchMedia(`(max-width: ${bpStack})`);

  function placePipelinePanel(isCompact) {
    if (isCompact && pipelinePanel.parentElement !== sidebarPipelineMount) {
      sidebarPipelineMount.appendChild(pipelinePanel);
      pipelinePanel.classList.add("pipeline-panel--embedded", "open");
    } else if (!isCompact && pipelinePanel.parentElement === sidebarPipelineMount) {
      pipelinePanelAnchor.after(pipelinePanel);
      // Undo the forced-open state from embedding — otherwise the rail
      // reappears already expanded the first time the viewport widens
      // back out, instead of collapsed like a fresh wide-mode load.
      pipelinePanel.classList.remove("pipeline-panel--embedded", "open");
    }
  }

  placePipelinePanel(stackQuery.matches);
  stackQuery.addEventListener("change", e => placePipelinePanel(e.matches));

  // ═══════════════════════════════════════════════════════════════════
  // ELEMENTS
  // ═══════════════════════════════════════════════════════════════════
  const steps           = document.querySelectorAll(".pipeline-step");
  const content          = document.getElementById("detail-content");
  const searchInput      = document.getElementById("search");
  const searchBtn        = document.getElementById("search-btn");
  const suggestions      = document.getElementById("suggestions");
  const message          = document.getElementById("search-message");
  const modeToggle       = document.getElementById("mode-toggle");
  const prefShowAnalogies = document.getElementById("pref-show-analogies");

  const graphToggle      = document.getElementById("graph-toggle");
  const graphBody        = document.getElementById("graph-body");
  const graphEmptyState  = document.getElementById("graph-empty-state");
  const graphContainer   = document.getElementById("concept-graph-container");

  // Graph starts collapsed and its inner container hidden — controlled
  // directly with inline styles so this doesn't depend on external CSS.
  graphBody.style.display      = "none";
  graphContainer.style.display = "none";

  // ═══════════════════════════════════════════════════════════════════
  // CONCEPT GRAPH — lives at the bottom of whichever term is currently
  // open, rather than as its own always-visible section. It's a single
  // DOM node (so the D3 graph inside it is only ever built once); we
  // move that same node into and out of the detail panel as the person
  // navigates, the same reparenting trick used for the pipeline panel
  // above. It's always moved OUT before content.innerHTML runs (which
  // would otherwise destroy it) and back IN afterward if a concept is
  // showing.
  // ═══════════════════════════════════════════════════════════════════
  const graphSection = graphToggle.closest(".graph-section") || graphBody.parentElement;

  // Unlike the pipeline panel, the graph has no legitimate "page" home —
  // it only ever makes sense attached to one specific term. So instead of
  // parking it back at its original spot in the markup (which made it
  // appear as a standalone, term-less section whenever no concept was
  // active), it's parked in a detached, hidden holder whenever it isn't
  // mounted inside a concept's own detail view.
  const graphSectionHolder = document.createElement("div");
  graphSectionHolder.style.display = "none";
  graphSectionHolder.appendChild(graphSection);
  document.body.appendChild(graphSectionHolder);

  function homeGraphSection() {
    if (graphSection.parentElement !== graphSectionHolder) {
      graphSectionHolder.appendChild(graphSection);
    }
  }

  function mountGraphSectionInto(container) {
    if (container) container.appendChild(graphSection);
  }

  // ═══════════════════════════════════════════════════════════════════
  // DISPLAY PREFERENCES
  // ═══════════════════════════════════════════════════════════════════
  let defMode      = "technical"; // "technical" | "plain"
  let showAnalogies = false;      // always-expanded analogy text vs. click-to-reveal pill

  function getDefinitionText(concept) {
    if (defMode === "plain" && concept.plainDefinition) {
      return concept.plainDefinition;
    }
    return concept.definition;
  }

  function rerenderActiveView() {
    if (activeConceptId)      renderConceptDetail(activeConceptId);
    else if (activeSection)   renderSection(activeSection);
  }

  modeToggle.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.mode === defMode) return;
      defMode = btn.dataset.mode;
      modeToggle.querySelectorAll(".mode-btn").forEach(b =>
        b.classList.toggle("active", b === btn)
      );
      rerenderActiveView();
    });
  });

  prefShowAnalogies.addEventListener("change", () => {
    showAnalogies = prefShowAnalogies.checked;
    rerenderActiveView();
  });

  // ═══════════════════════════════════════════════════════════════════
  // CONCEPT MAP
  // ═══════════════════════════════════════════════════════════════════
  const conceptMap = {};
  data.skos.concepts.forEach(c => { conceptMap[c.id] = c; });

  function linkifyDefinition(text) {
    return text.replace(/\{\{(.*?)\}\}(\w*)/g, (_, term, suffix) => {
      const concept = Object.values(conceptMap)
        .find(c => c.prefLabel.toLowerCase() === term.toLowerCase());

      if (!concept) return term + suffix;

      const fullWord = term + suffix;

      return `<span class="def-link" data-id="${concept.id}">${fullWord}</span>`;
    });
  }

  // Definition text + an analogy, shown inline or as an expandable pill
  // depending on the "Show analogies inline" preference. Pass
  // allowAnalogy=false to suppress the analogy entirely (used for the
  // pipeline section overview, where the term list is dense and the
  // analogy pill is reserved for the fuller concept-detail view).
  function renderDefinitionBlock(c, allowAnalogy = true) {
    const defHtml = linkifyDefinition(getDefinitionText(c));

    if (!allowAnalogy || !c.analogy) {
      return `<span class="panel-def">${defHtml}</span>`;
    }

    if (showAnalogies) {
      return `<span class="panel-def">${defHtml}</span>
              <span class="analogy-text analogy-text--inline">${c.analogy}</span>`;
    }

    return `<span class="panel-def">${defHtml}</span>
            <button class="analogy-pill" data-analogy-for="${c.id}" type="button">Analogy</button>
            <span class="analogy-text" id="analogy-${c.id}" style="display:none">${c.analogy}</span>`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // INFER BROADER FROM NARROWER DECLARATIONS
  // ═══════════════════════════════════════════════════════════════════
  Object.values(conceptMap).forEach(concept => {
    (concept.narrower || []).forEach(childId => {
      const child = conceptMap[childId];
      if (!child) return;
      if (!child.broader) child.broader = [];
      if (!child.broader.includes(concept.id)) child.broader.push(concept.id);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // SEARCH INDEX  (built from pipeline → concept refs + altLabels)
  // ═══════════════════════════════════════════════════════════════════
  const allTerms = [];
  data.sections.forEach(section => {
    section.methods.forEach(method => {
      (method.concepts || []).forEach(cid => {
        const c = conceptMap[cid];
        if (!c) return;
        allTerms.push({ term: c.prefLabel, section: section.id, id: c.id });
        (c.altLabel || []).forEach(alt =>
          allTerms.push({ term: alt, section: section.id, id: c.id })
        );
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // CENTRAL PANEL — renders EITHER a pipeline section overview OR a
  // single concept's full detail. Both pipeline clicks and term/search
  // selection write into the same #detail-content element.
  // ═══════════════════════════════════════════════════════════════════
  let activeSection    = null;
  let activeConceptId  = null;

  function clearPipelineActive() {
    steps.forEach(s => s.classList.remove("active"));
  }

  function renderSection(section) {
    // Not a single-term view — the graph dropdown only belongs at the
    // bottom of a concept's own detail, so park it back at its home
    // spot in the page rather than leaving it orphaned mid-innerHTML-swap.
    homeGraphSection();

    activeSection   = section;
    activeConceptId = null;

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

    // Detach the graph section BEFORE wiping content — it may currently
    // be sitting inside content (from the previously-viewed concept),
    // and innerHTML would silently destroy it otherwise.
    homeGraphSection();

    activeConceptId = conceptId;
    activeSection    = null;

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

    // The graph section (with its own toggle header) is reparented in
    // here, at the very bottom, so it reads as this term's own
    // "concept graph" dropdown rather than a separate page section.
    mountGraphSectionInto(content.querySelector(".concept-detail-inner"));

    attachContentLinkHandlers();
  }

  function showEmptyDetail() {
    homeGraphSection();

    activeSection   = null;
    activeConceptId = null;
    content.innerHTML = `<p class="detail-empty">Select a stage from the pipeline panel, or a term from the browse list, to see its definition here.</p>`;
  }

  // Delegated-style (re-)attachment for links rendered into #detail-content
  function attachContentLinkHandlers() {
    content.querySelectorAll(".concept-link, .def-link, .rel-link").forEach(el => {
      el.addEventListener("click", () => selectGlossaryConcept(el.dataset.id, false));
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // PIPELINE STEPS — vertical list in the collapsible right panel,
  // each step toggles open/closed independently
  // ═══════════════════════════════════════════════════════════════════
  steps.forEach(step => {
    const header = step.querySelector(".pipeline-step-header");
    header.addEventListener("click", () => {
      const id      = step.dataset.section;
      const section = data.sections.find(s => s.id === id);
      if (!section) return;

      const wasActive = step.classList.contains("active");
      clearPipelineActive();

      if (!wasActive) {
        step.classList.add("active");
        renderSection(section);
      } else {
        showEmptyDetail();
      }
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // AUTOCOMPLETE
  // ═══════════════════════════════════════════════════════════════════
  searchInput.addEventListener("input", () => {
    const q = searchInput.value.toLowerCase();
    suggestions.innerHTML = "";
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
    if (e.key === "Enter") { e.preventDefault(); runSearch(); }
  });

  // ═══════════════════════════════════════════════════════════════════
  // BROWSE DRAWER — tag filters + term list
  // ═══════════════════════════════════════════════════════════════════
  let activeFilter = null;

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
        activeFilter = btn.dataset.tag || null;
        filterLabel.textContent = activeFilter ? `${activeFilter} (${counts.get(activeFilter)})` : "All terms";
        renderGlossaryList();
        filterPopover.close();
      });
    });
  }

  function renderGlossaryList() {
    const concepts = data.skos.concepts
      .filter(c => !activeFilter || (c.tags || []).includes(activeFilter))
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

      const isActive = c.id === activeConceptId ? " active" : "";
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

  // Navigate to a concept: update central panel, list highlight, graph focus
  function selectGlossaryConcept(id, scrollToTop) {
    activeConceptId = id;
    renderConceptDetail(id);
    renderGlossaryList(); // re-render so the matching list row highlights

    // The concept graph is opt-in only — never auto-expand it. If the
    // user already has it open, just re-focus it on the new selection.
    if (graphManager) graphManager.setFocus(id);

    if (scrollToTop) {
      document.querySelector("#detail-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // ANALOGY PILLS — global delegated toggle
  // ═══════════════════════════════════════════════════════════════════
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

  // ═══════════════════════════════════════════════════════════════════
  // CONCEPT GRAPH MANAGER
  // ─────────────────────────────────────────────────────────────────
  // Builds the full graph ONCE from all concepts. On every setFocus()
  // call it runs a BFS to compute hop-distance from the selected node
  // and transitions node/link visual weights accordingly.
  // ═══════════════════════════════════════════════════════════════════

  const PALETTE = {
    center:   "#2a9d8f",
    broader:  "#e07b39",
    narrower: "#4a7fc1",
    related:  "#9b8ea8",
    ghost:    "#94a3b8",
    link:     "#c8d0da",
  };

  // ─── Pill-node sizing ─────────────────────────────────────────────
  // Nodes render as rounded "pills" with the label wrapped inside
  // rather than a dot with text underneath. Sizes below are approximate
  // (based on an average character width for the label font) rather
  // than measured, which is fine here since it only needs to be close
  // enough for the pill to visually contain its text.
  const PILL_FONT        = 10.5;   // px, label font-size at rest
  const PILL_LINE_HEIGHT = 13;     // px, distance between wrapped lines
  const PILL_PAD_X       = 18;     // px, total horizontal padding
  const PILL_PAD_Y       = 12;     // px, total vertical padding
  const PILL_MIN_WIDTH   = 56;     // px
  const PILL_MAX_WIDTH   = 100;    // px, wrap threshold
  const PILL_CHAR_WIDTH  = 5.6;    // px, rough average glyph width at PILL_FONT
  const PILL_MAX_LINES   = 2;

  // Greedily wraps `label` into at most PILL_MAX_LINES lines that each
  // fit within PILL_MAX_WIDTH, ellipsizing whatever's left over.
  function wrapPillLabel(label) {
    const maxChars = Math.max(4, Math.floor((PILL_MAX_WIDTH - PILL_PAD_X) / PILL_CHAR_WIDTH));
    const words = label.split(/\s+/);
    const lines = [];
    let current = "";

    words.forEach(word => {
      const candidate = current ? `${current} ${word}` : word;
      if (candidate.length <= maxChars || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    });
    if (current) lines.push(current);

    if (lines.length > PILL_MAX_LINES) {
      const kept = lines.slice(0, PILL_MAX_LINES);
      let last = kept[PILL_MAX_LINES - 1];
      while (last.length > maxChars - 1 && last.length > 1) last = last.slice(0, -1);
      kept[PILL_MAX_LINES - 1] = last.replace(/\s+$/, "") + "…";
      return kept;
    }
    return lines;
  }

  // Given a node with x/y/pillW/pillH (and current _scale), returns the
  // point where a straight line toward (tx, ty) crosses the pill's
  // rounded-rect boundary — so links touch the edge of the pill nearest
  // the node it's connecting to, rather than all converging on one
  // center point.
  function pillEdgePoint(node, tx, ty) {
    const dx = tx - node.x;
    const dy = ty - node.y;
    if (!dx && !dy) return { x: node.x, y: node.y };
    const scale = node._scale || 1;
    const hw = (node.pillW * scale) / 2;
    const hh = (node.pillH * scale) / 2;
    const sx = dx !== 0 ? hw / Math.abs(dx) : Infinity;
    const sy = dy !== 0 ? hh / Math.abs(dy) : Infinity;
    const t  = Math.min(sx, sy);
    return { x: node.x + dx * t, y: node.y + dy * t };
  }

  class ConceptGraphManager {

    constructor(svgEl, conceptMap, onNodeClick) {
      this.svgEl       = svgEl;
      this.conceptMap  = conceptMap;
      this.onNodeClick = onNodeClick;
      this.focusId     = null;
      this.W = svgEl.clientWidth  || 560;
      this.H = 420;

      this._buildData();
      this._initSVG();
      this._startSimulation();
      this._attachControls();
    }

    _buildData() {
      this.nodes = Object.values(this.conceptMap).map(c => {
        const lines   = wrapPillLabel(c.prefLabel);
        const longest = Math.max(...lines.map(l => l.length));
        const pillW   = Math.max(PILL_MIN_WIDTH, Math.min(PILL_MAX_WIDTH, longest * PILL_CHAR_WIDTH + PILL_PAD_X));
        const pillH   = lines.length * PILL_LINE_HEIGHT + PILL_PAD_Y;
        return {
          id: c.id, label: c.prefLabel, tags: c.tags || [],
          lines, pillW, pillH, _scale: 1
        };
      });

      this.adj = new Map(this.nodes.map(n => [n.id, new Set()]));

      const seen = new Set();
      this.links = [];

      const addEdge = (src, tgt, type) => {
        if (!this.adj.has(src) || !this.adj.has(tgt)) return;
        const key = src < tgt ? `${src}§${tgt}` : `${tgt}§${src}`;
        if (seen.has(key)) return;
        seen.add(key);
        this.links.push({ source: src, target: tgt, type });
        this.adj.get(src).add(tgt);
        this.adj.get(tgt).add(src);
      };

      Object.values(this.conceptMap).forEach(c => {
        (c.narrower || []).forEach(t => addEdge(c.id, t, "narrower"));
        (c.related  || []).forEach(t => addEdge(c.id, t, "related"));
      });
    }

    _bfs(startId) {
      const dist = new Map([[startId, 0]]);
      const q    = [startId];
      while (q.length) {
        const cur = q.shift();
        const d   = dist.get(cur);
        this.adj.get(cur)?.forEach(nb => {
          if (!dist.has(nb)) { dist.set(nb, d + 1); q.push(nb); }
        });
      }
      return dist;
    }

    _relType(focusId, neighborId) {
      const c  = this.conceptMap[focusId];
      const nb = this.conceptMap[neighborId];
      if ((c?.narrower || []).includes(neighborId)) return "narrower";
      if ((c?.broader  || []).includes(neighborId)) return "broader";
      if ((c?.related  || []).includes(neighborId)) return "related";
      if ((nb?.narrower || []).includes(focusId))   return "broader";
      if ((nb?.broader  || []).includes(focusId))   return "narrower";
      return "related";
    }

    _initSVG() {
      const svg = d3.select(this.svgEl);
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${this.W} ${this.H}`)
         .attr("height",   this.H);

      const defs = svg.append("defs");

      // Soft, tight drop-shadow so pills read as small floating cards
      // rather than flat translucent blobs — this is what actually sells
      // the "pill" silhouette at a glance, more than the border-radius does.
      const shadow = defs.append("filter")
        .attr("id", "cgm-pill-shadow")
        .attr("x", "-40%").attr("y", "-40%")
        .attr("width", "180%").attr("height", "180%");
      shadow.append("feDropShadow")
        .attr("dx", 0).attr("dy", 1)
        .attr("stdDeviation", 1.6)
        .attr("flood-color", "#1e293b")
        .attr("flood-opacity", 0.22);

      // refX is centered (5, not 6) since these sit at the midpoint of
      // a path via marker-mid rather than at a line's end via marker-end.
      ["broader", "narrower", "related"].forEach(t => {
        defs.append("marker")
          .attr("id",           `cgm-arrow-${t}`)
          .attr("viewBox",      "0 -5 10 10")
          .attr("refX",         5).attr("refY", 0)
          .attr("markerWidth",  5).attr("markerHeight", 5)
          .attr("orient",       "auto")
          .append("path")
            .attr("d",       "M0,-5L10,0L0,5")
            .attr("fill",    PALETTE[t])
            .attr("opacity", 0.55);
      });

      this._g = svg.append("g").attr("class", "cgm-root");

      this._zoom = d3.zoom()
        .scaleExtent([0.08, 6])
        .on("zoom", e => this._g.attr("transform", e.transform));
      svg.call(this._zoom);

      // Links are <path> elements (not <line>) purely so a marker-mid
      // arrowhead has a real interior vertex to anchor to — the path is
      // still just two straight segments through the same start/mid/end
      // points a line would use.
      this._linkSel = this._g.append("g").attr("class", "cgm-links")
        .selectAll("path")
        .data(this.links)
        .join("path")
          .attr("fill",           "none")
          .attr("stroke",         PALETTE.link)
          .attr("stroke-width",   0.8)
          .attr("stroke-opacity", 0.28);

      const nodeG = this._g.append("g").attr("class", "cgm-nodes")
        .selectAll("g")
        .data(this.nodes)
        .join("g")
          .attr("class",  "graph-node")
          .style("cursor", "pointer");

      // Everything visual (glow, pill, label) lives in a nested group so
      // setFocus() can scale it with a simple transform instead of having
      // to resize/re-wrap the pill and text individually.
      const nodeInner = nodeG.append("g").attr("class", "node-inner");

      nodeInner.append("rect")
        .attr("class",        "node-glow")
        .attr("x",            d => -d.pillW / 2 - 6)
        .attr("y",            d => -d.pillH / 2 - 6)
        .attr("width",        d => d.pillW + 12)
        .attr("height",       d => d.pillH + 12)
        .attr("rx",           d => (d.pillH + 12) / 2)
        .attr("fill",         PALETTE.center)
        .attr("fill-opacity", 0)
        .attr("stroke",       "none");

      nodeInner.append("rect")
        .attr("class",          "node-pill")
        .attr("x",              d => -d.pillW / 2)
        .attr("y",              d => -d.pillH / 2)
        .attr("width",          d => d.pillW)
        .attr("height",         d => d.pillH)
        .attr("rx",             d => d.pillH / 2)
        .attr("fill",           "#fff")
        .attr("fill-opacity",   0.96)
        .attr("stroke",         PALETTE.ghost)
        .attr("stroke-width",   1.4)
        .attr("stroke-opacity", 0.5)
        .attr("filter",         "url(#cgm-pill-shadow)");

      nodeInner.each(function (d) {
        const label = d3.select(this).append("text")
          .attr("class",        "node-label")
          .attr("text-anchor",  "middle")
          .attr("font-size",    `${PILL_FONT}px`)
          .attr("font-weight",  600)
          .attr("fill",         "#1e293b")
          .attr("fill-opacity", 0.88)
          .style("pointer-events", "none")
          .style("user-select",    "none");

        const startY = -((d.lines.length - 1) * PILL_LINE_HEIGHT) / 2;
        d.lines.forEach((line, i) => {
          label.append("tspan")
            .attr("x",  0)
            .attr("y",  startY + i * PILL_LINE_HEIGHT)
            .attr("dy", "0.32em")
            .text(line);
        });
      });

      nodeG
        .on("mouseenter", function () {
          d3.select(this).select(".node-pill").attr("stroke-width", 2.4);
        })
        .on("mouseleave", function () {
          d3.select(this).select(".node-pill").attr("stroke-width", 1.2);
        })
        .on("click", (e, d) => {
          e.stopPropagation();
          this.onNodeClick(d.id);
        });

      nodeG.call(
        d3.drag()
          .on("start", (e, d) => {
            if (!e.active) this._sim.alphaTarget(0.3).restart();
            d.fx = d.x; d.fy = d.y;
          })
          .on("drag",  (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on("end",   (e, d) => {
            if (!e.active) this._sim.alphaTarget(0);
            d.fx = null; d.fy = null;
          })
      );

      this._nodeG     = nodeG;
      this._nodeInner = nodeInner;
    }

    _startSimulation() {
      const { W, H } = this;

      this._sim = d3.forceSimulation(this.nodes)
        .force("link",
          d3.forceLink(this.links)
            .id(d => d.id)
            .distance(90)
            .strength(0.55)
        )
        // distanceMax keeps far-apart nodes from exerting a long-range
        // shove on each other, which is what caused the initial layout
        // to feel erratic — repulsion now only acts locally, so neighbor
        // spacing settles evenly instead of a few nodes flying outward.
        .force("charge", d3.forceManyBody().strength(-200).distanceMax(260))
        .force("center", d3.forceCenter(W / 2, H / 2))
        // Weak, constant pull toward the center on both axes so the
        // whole layout stays put instead of slowly drifting off-frame
        // once alpha cools — this is what makes it feel "stable" at rest.
        .force("x", d3.forceX(W / 2).strength(0.045))
        .force("y", d3.forceY(H / 2).strength(0.045))
        // Collision radius uses each pill's half-diagonal instead of a
        // fixed dot radius, since pills vary in width/height with label
        // length — otherwise longer labels would overlap their neighbors.
        // A couple of extra iterations spread neighbors more evenly
        // around each node rather than settling for the first
        // non-overlapping arrangement it finds.
        .force("collide", d3.forceCollide(d => Math.hypot(d.pillW / 2, d.pillH / 2) + 6).iterations(3))
        .on("tick", () => this._updatePositions())
        .stop();

      // Warm-start: run the simulation to a near-settled state silently
      // before it's ever painted, so the graph opens calm and in place
      // instead of visibly flinging nodes around for the first second.
      for (let i = 0; i < 300; i++) this._sim.tick();
      this._updatePositions();

      this._sim.alphaTarget(0).restart();
    }

    // Positions node groups and draws links so they touch each pill's
    // edge (in the direction of the node at the other end) rather than
    // its center. Called on every simulation tick, and also once after
    // setFocus() finishes resizing pills, since a settled simulation
    // won't otherwise re-tick to reflect the new sizes.
    _updatePositions() {
      this._nodeG.attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`);
      this._linkSel.attr("d", d => {
        const p1 = pillEdgePoint(d.source, d.target.x, d.target.y);
        const p2 = pillEdgePoint(d.target, d.source.x, d.source.y);
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;
        return `M${p1.x},${p1.y}L${mx},${my}L${p2.x},${p2.y}`;
      });
    }

    _attachControls() {
      const container = this.svgEl.parentElement;
      const ctrl = document.createElement("div");
      ctrl.className = "graph-controls";

      const makeBtn = (icon, title, fn) => {
        const b = document.createElement("button");
        b.className   = "graph-ctrl-btn";
        b.type        = "button";
        b.title       = title;
        b.textContent = icon;
        b.addEventListener("click", e => { e.stopPropagation(); fn(); });
        ctrl.appendChild(b);
      };

      makeBtn("＋", "Zoom in",  () => d3.select(this.svgEl).transition().duration(220).call(this._zoom.scaleBy, 1.5));
      makeBtn("－", "Zoom out", () => d3.select(this.svgEl).transition().duration(220).call(this._zoom.scaleBy, 0.67));
      makeBtn("⤢",  "Fit all",  () => this.fitAll());

      container.appendChild(ctrl);
    }

    // `selected` controls whether the focus node renders as the teal
    // "Selected" pill. Pass false for an ambient/default focus (e.g.
    // panning near a starting concept when the graph is opened without
    // an explicit term choice) so the view centers there without
    // claiming anything is actually selected.
    setFocus(id, selected = true) {
      this.focusId = id;
      const dist   = this._bfs(id);

      const T = 380;

      this._nodeG.each((d, i, nodes) => {
        const g     = d3.select(nodes[i]);
        const inner = g.select(".node-inner");
        const pill  = g.select(".node-pill");
        const glow  = g.select(".node-glow");
        const lbl   = g.select(".node-label");
        const dv    = dist.get(d.id) ?? 99;
        const isCenter = selected && d.id === id;

        // `border` is the relation-tinted ring color; the pill's own
        // fill stays a constant white card and only its opacity fades
        // with distance, so hue no longer has to do double duty for
        // both "what kind of relation" and "how far away" at once.
        let scale, border, fillOp, strokeOp, glowOp, fontOp;

        if (isCenter) {
          scale = 1.3; border = PALETTE.center;
          fillOp = 0.98; strokeOp = 0.9; glowOp = 0.16; fontOp = 1;
        } else if (dv === 0 || dv === 1) {
          // dv === 0 here only happens when selected=false (the focus
          // node itself, rendered like a near neighbor rather than the
          // highlighted center).
          border = dv === 1 ? (PALETTE[this._relType(id, d.id)] || PALETTE.ghost) : PALETTE.ghost;
          scale = 1.05; fillOp = 0.94; strokeOp = 0.65; glowOp = 0; fontOp = 0.92;
        } else if (dv === 2) {
          scale = 0.85; border = PALETTE.ghost;
          fillOp = 0.6; strokeOp = 0.3; glowOp = 0; fontOp = 0.5;
        } else if (dv === 3) {
          scale = 0.7; border = PALETTE.ghost;
          fillOp = 0.32; strokeOp = 0.15; glowOp = 0; fontOp = 0.25;
        } else {
          scale = 0.6; border = PALETTE.ghost;
          fillOp = 0.12; strokeOp = 0.06; glowOp = 0; fontOp = 0;
        }

        // Link endpoints are recalculated from d._scale once the
        // transitions below finish (see the setTimeout after this loop),
        // so keep it in sync with whatever scale we're animating to.
        d._scale = scale;

        inner.transition().duration(T).attr("transform", `scale(${scale})`);

        pill.transition().duration(T)
          .attr("fill",           "#fff")
          .attr("fill-opacity",   fillOp)
          .attr("stroke",         border)
          .attr("stroke-width",   isCenter ? 2 : 1.4)
          .attr("stroke-opacity", strokeOp);

        glow.transition().duration(T)
          .attr("fill",         isCenter ? PALETTE.center : border)
          .attr("fill-opacity", glowOp);

        lbl.transition().duration(T).attr("fill-opacity", fontOp);
      });

      // Pills resizing doesn't itself re-tick the (possibly settled)
      // simulation, so nudge link endpoints to follow along over the
      // same transition duration instead of jumping once at the end.
      const start = performance.now();
      const animateLinks = (now) => {
        this._updatePositions();
        if (now - start < T) requestAnimationFrame(animateLinks);
      };
      requestAnimationFrame(animateLinks);

      this._linkSel.each((l, i, links) => {
        const srcId = typeof l.source === "object" ? l.source.id : l.source;
        const tgtId = typeof l.target === "object" ? l.target.id : l.target;
        const ds    = dist.get(srcId) ?? 99;
        const dt    = dist.get(tgtId) ?? 99;
        const minD  = Math.min(ds, dt);
        const maxD  = Math.max(ds, dt);

        const lk = d3.select(links[i]);

        if (minD === 0 && maxD === 1) {
          // Color (and arrow) from the FOCUSED node's point of view, not
          // the edge's stored/absolute type — otherwise a link up to a
          // broader term shows blue instead of matching that term's
          // orange border whenever the focus is the narrower side.
          const neighborId = srcId === id ? tgtId : srcId;
          const relType     = this._relType(id, neighborId);
          lk.transition().duration(380)
            .attr("stroke",       PALETTE[relType] || PALETTE.related)
            .attr("stroke-width", 1.9)
            .attr("stroke-opacity", 0.62)
            .attr("marker-mid",   `url(#cgm-arrow-${relType})`);
        } else if (minD <= 1 && maxD === 2) {
          lk.transition().duration(380)
            .attr("stroke",         PALETTE.link)
            .attr("stroke-width",   1)
            .attr("stroke-opacity", 0.18)
            .attr("marker-mid",     null);
        } else if (minD <= 2 && maxD <= 3) {
          lk.transition().duration(380)
            .attr("stroke",         PALETTE.link)
            .attr("stroke-width",   0.7)
            .attr("stroke-opacity", 0.08)
            .attr("marker-mid",     null);
        } else {
          lk.transition().duration(380)
            .attr("stroke",         PALETTE.link)
            .attr("stroke-width",   0.5)
            .attr("stroke-opacity", 0.03)
            .attr("marker-mid",     null);
        }
      });

      const node = this.nodes.find(n => n.id === id);
      if (node?.x != null) {
        this._panTo(node.x, node.y);
      } else {
        const check = setInterval(() => {
          const n = this.nodes.find(n => n.id === id);
          if (n?.x != null) { this._panTo(n.x, n.y); clearInterval(check); }
        }, 80);
        setTimeout(() => clearInterval(check), 3000);
      }
    }

    _panTo(nx, ny, scale = 1.35) {
      const { W, H } = this;
      d3.select(this.svgEl)
        .transition().duration(600).ease(d3.easeCubicInOut)
        .call(
          this._zoom.transform,
          d3.zoomIdentity
            .translate(W / 2 - nx * scale, H / 2 - ny * scale)
            .scale(scale)
        );
    }

    fitAll() {
      d3.select(this.svgEl)
        .transition().duration(500).ease(d3.easeCubicOut)
        .call(this._zoom.transform, d3.zoomIdentity);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // GRAPH SECTION — collapsible, built lazily on first expand.
  // Visibility is set directly with inline styles, not just classes,
  // so showing/hiding never depends on external CSS being present.
  // ═══════════════════════════════════════════════════════════════════
  let graphManager = null;

  // When the graph is opened cold (no term already selected), pan it
  // near this concept as an ambient starting point rather than leaving
  // it centered on nothing — but don't mark anything as "Selected".
  const DEFAULT_GRAPH_FOCUS_ID = "entity-resolution";

  function focusGraphOnCurrentOrDefault() {
    if (!graphManager) return;
    if (activeConceptId) {
      graphManager.setFocus(activeConceptId);
    } else if (conceptMap[DEFAULT_GRAPH_FOCUS_ID]) {
      graphManager.setFocus(DEFAULT_GRAPH_FOCUS_ID, false);
    }
  }

  function initConceptGraph() {
    const svgEl = document.getElementById("concept-graph");
    if (!svgEl || graphManager) return;

    graphEmptyState.style.display = "none";
    graphContainer.style.display  = "block";

    requestAnimationFrame(() => {
      graphManager = new ConceptGraphManager(
        svgEl,
        conceptMap,
        id => selectGlossaryConcept(id, false)
      );
      focusGraphOnCurrentOrDefault();
    });
  }

  function expandGraphSection() {
    const isOpen = graphBody.style.display === "block";
    if (!isOpen) {
      graphBody.style.display = "block";
      graphToggle.classList.add("open");
    }
    initConceptGraph(); // no-op after the first call; always (re-)focuses below
    focusGraphOnCurrentOrDefault();
  }

  graphToggle.addEventListener("click", () => {
    const isOpen = graphBody.style.display === "block";
    if (isOpen) {
      graphBody.style.display = "none";
      graphToggle.classList.remove("open");
      return;
    }
    expandGraphSection();
  });

  // ═══════════════════════════════════════════════════════════════════
  // GLOBAL TAG CLICK HANDLER (works everywhere — filters the always-
  // visible sidebar list to that tag and scrolls/expands it into view)
  // ═══════════════════════════════════════════════════════════════════
  document.addEventListener("click", e => {
    const chip = e.target.closest(".tag-chip");
    if (!chip) return;

    const tag = chip.dataset.tag;
    if (!tag) return;

    e.stopPropagation();

    const filter = document.querySelector(`.tag-filter[data-tag="${tag}"]`);
    if (filter) filter.click();

    sidebarToggle.classList.add("open");
    sidebarBody.classList.add("open");
    document.getElementById("glossary-sidebar")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  // ═══════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════
  function initGlossary() {
    renderTagFilters();
    renderGlossaryList();
    // Concept graph builds lazily on first expand — see graphToggle handler.
  }

  requestAnimationFrame(initGlossary);

});