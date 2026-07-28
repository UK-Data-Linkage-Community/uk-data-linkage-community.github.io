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
  // depending on the "Show analogies inline" preference.
  function renderDefinitionBlock(c) {
    const defHtml = linkifyDefinition(getDefinitionText(c));

    if (!c.analogy) {
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
              ${renderDefinitionBlock(c)}
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
          <button class="graph-link" type="button" data-graph-for="${concept.id}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
              <circle cx="5" cy="12" r="2"/><circle cx="19" cy="5" r="2"/><circle cx="19" cy="19" r="2"/>
              <line x1="7" y1="11" x2="17" y2="6"/><line x1="7" y1="13" x2="17" y2="18"/>
            </svg>
            View in concept graph
          </button>
        </div>
      </div>`;

    attachContentLinkHandlers();
  }

  function showEmptyDetail() {
    activeSection   = null;
    activeConceptId = null;
    content.innerHTML = `<p class="detail-empty">Select a stage from the pipeline panel, or a term from the browse list, to see its definition here.</p>`;
  }

  // Delegated-style (re-)attachment for links rendered into #detail-content
  function attachContentLinkHandlers() {
    content.querySelectorAll(".concept-link, .def-link, .rel-link").forEach(el => {
      el.addEventListener("click", () => selectGlossaryConcept(el.dataset.id, false));
    });
    content.querySelectorAll(".graph-link").forEach(el => {
      el.addEventListener("click", () => {
        expandGraphSection();
        document.querySelector(".graph-section")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
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
      this.nodes = Object.values(this.conceptMap).map(c => ({
        id: c.id, label: c.prefLabel, tags: c.tags || []
      }));

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
      ["broader", "narrower", "related"].forEach(t => {
        defs.append("marker")
          .attr("id",           `cgm-arrow-${t}`)
          .attr("viewBox",      "0 -5 10 10")
          .attr("refX",         18).attr("refY", 0)
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

      this._linkSel = this._g.append("g").attr("class", "cgm-links")
        .selectAll("line")
        .data(this.links)
        .join("line")
          .attr("stroke",         PALETTE.link)
          .attr("stroke-width",   0.8)
          .attr("stroke-opacity", 0.28);

      const nodeG = this._g.append("g").attr("class", "cgm-nodes")
        .selectAll("g")
        .data(this.nodes)
        .join("g")
          .attr("class",  "graph-node")
          .style("cursor", "pointer");

      nodeG.append("circle")
        .attr("class",        "node-glow")
        .attr("r",            0)
        .attr("fill",         PALETTE.center)
        .attr("fill-opacity", 0.12)
        .attr("stroke",       "none");

      nodeG.append("circle")
        .attr("class",          "node-circle")
        .attr("r",              5)
        .attr("fill",           PALETTE.ghost)
        .attr("fill-opacity",   0.55)
        .attr("stroke",         PALETTE.ghost)
        .attr("stroke-width",   1.2)
        .attr("stroke-opacity", 0.3);

      nodeG.append("text")
        .attr("class",        "node-label")
        .text(d => d.label.length > 20 ? d.label.slice(0, 18) + "…" : d.label)
        .attr("text-anchor",  "middle")
        .attr("dy",           15)
        .attr("font-size",    "10.5px")
        .attr("fill",         "#222")
        .attr("fill-opacity", 0.75)
        .style("pointer-events", "none")
        .style("user-select",    "none");

      nodeG
        .on("mouseenter", function () {
          d3.select(this).select(".node-circle").attr("stroke-width", 2.4);
        })
        .on("mouseleave", function () {
          d3.select(this).select(".node-circle").attr("stroke-width", 1.2);
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

      this._nodeG = nodeG;
    }

    _startSimulation() {
      const { W, H } = this;

      this._sim = d3.forceSimulation(this.nodes)
        .force("link",
          d3.forceLink(this.links)
            .id(d => d.id)
            .distance(110)
            .strength(0.35)
        )
        .force("charge",  d3.forceManyBody().strength(-220))
        .force("center",  d3.forceCenter(W / 2, H / 2))
        .force("collide", d3.forceCollide(20))
        .on("tick", () => {
          this._linkSel
            .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
            .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
          this._nodeG.attr("transform", d => `translate(${d.x ?? 0},${d.y ?? 0})`);
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

    setFocus(id) {
      this.focusId = id;
      const dist   = this._bfs(id);

      this._nodeG.each((d, i, nodes) => {
        const g    = d3.select(nodes[i]);
        const circ = g.select(".node-circle");
        const glow = g.select(".node-glow");
        const lbl  = g.select(".node-label");
        const dv   = dist.get(d.id) ?? 99;
        const isCenter = d.id === id;

        let r, fill, fillOp, strokeOp, glowR, fontSize, fontOp;

        if (isCenter) {
          r = 13; fill = PALETTE.center;
          fillOp = 1; strokeOp = 0.7;
          glowR = 22; fontSize = "13px"; fontOp = 1;
        } else if (dv === 1) {
          const t = this._relType(id, d.id);
          r = 8.5; fill = PALETTE[t] || PALETTE.ghost;
          fillOp = 0.85; strokeOp = 0.55;
          glowR = 0; fontSize = "11px"; fontOp = 0.92;
        } else if (dv === 2) {
          r = 6; fill = PALETTE.ghost;
          fillOp = 0.42; strokeOp = 0.22;
          glowR = 0; fontSize = "9.5px"; fontOp = 0.5;
        } else if (dv === 3) {
          r = 4.5; fill = PALETTE.ghost;
          fillOp = 0.22; strokeOp = 0.1;
          glowR = 0; fontSize = "7.5px"; fontOp = 0.25;
        } else {
          r = 3; fill = PALETTE.ghost;
          fillOp = 0.09; strokeOp = 0.05;
          glowR = 0; fontSize = "0px"; fontOp = 0;
        }

        const T = 380;
        circ.transition().duration(T)
          .attr("r",              r)
          .attr("fill",           fill)
          .attr("fill-opacity",   fillOp)
          .attr("stroke",         fill)
          .attr("stroke-opacity", strokeOp);

        glow.transition().duration(T)
          .attr("r",    glowR)
          .attr("fill", isCenter ? PALETTE.center : fill);

        lbl.transition().duration(T)
          .attr("dy",           r + 8)
          .attr("font-size",    fontSize)
          .attr("fill-opacity", fontOp);
      });

      this._linkSel.each((l, i, links) => {
        const srcId = typeof l.source === "object" ? l.source.id : l.source;
        const tgtId = typeof l.target === "object" ? l.target.id : l.target;
        const ds    = dist.get(srcId) ?? 99;
        const dt    = dist.get(tgtId) ?? 99;
        const minD  = Math.min(ds, dt);
        const maxD  = Math.max(ds, dt);

        const lk = d3.select(links[i]);

        if (minD === 0 && maxD === 1) {
          lk.transition().duration(380)
            .attr("stroke",       PALETTE[l.type] || PALETTE.related)
            .attr("stroke-width", 1.9)
            .attr("stroke-opacity", 0.62)
            .attr("marker-end",   `url(#cgm-arrow-${l.type})`);
        } else if (minD <= 1 && maxD === 2) {
          lk.transition().duration(380)
            .attr("stroke",         PALETTE.link)
            .attr("stroke-width",   1)
            .attr("stroke-opacity", 0.18)
            .attr("marker-end",     null);
        } else if (minD <= 2 && maxD <= 3) {
          lk.transition().duration(380)
            .attr("stroke",         PALETTE.link)
            .attr("stroke-width",   0.7)
            .attr("stroke-opacity", 0.08)
            .attr("marker-end",     null);
        } else {
          lk.transition().duration(380)
            .attr("stroke",         PALETTE.link)
            .attr("stroke-width",   0.5)
            .attr("stroke-opacity", 0.03)
            .attr("marker-end",     null);
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
      if (activeConceptId) graphManager.setFocus(activeConceptId);
    });
  }

  function expandGraphSection() {
    const isOpen = graphBody.style.display === "block";
    if (!isOpen) {
      graphBody.style.display = "block";
      graphToggle.classList.add("open");
    }
    initConceptGraph(); // no-op after the first call; always (re-)focuses below
    if (graphManager && activeConceptId) graphManager.setFocus(activeConceptId);
  }

  graphToggle.addEventListener("click", () => {
    const isOpen = graphBody.style.display === "block";
    graphBody.style.display = isOpen ? "none" : "block";
    graphToggle.classList.toggle("open", !isOpen);
    if (!isOpen) initConceptGraph(); // no-op after the first call
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