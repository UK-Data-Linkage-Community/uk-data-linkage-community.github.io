document.addEventListener("DOMContentLoaded", function () {

  const data = window.glossaryData;
  if (!data) { console.error("Glossary data not loaded"); return; }

  // ═══════════════════════════════════════════════════════════════════
  // ELEMENTS
  // ═══════════════════════════════════════════════════════════════════
  const nodes          = document.querySelectorAll(".pipeline-node");
  const content        = document.getElementById("detail-content");
  const searchInput    = document.getElementById("search");
  const searchBtn      = document.getElementById("search-btn");
  const suggestions    = document.getElementById("suggestions");
  const message        = document.getElementById("search-message");

  const drawerTab      = document.getElementById("drawer-tab");
  const drawerClose    = document.getElementById("drawer-close");
  const drawer         = document.getElementById("side-drawer");
  const drawerBackdrop = document.getElementById("drawer-backdrop");
  const modeToggle     = document.getElementById("mode-toggle");

  const graphToggle    = document.getElementById("graph-toggle");
  const graphBody      = document.getElementById("graph-body");

  // ═══════════════════════════════════════════════════════════════════
  // EXPLANATION MODE (technical / plain language)
  // Falls back to the technical `definition` if a term has no
  // `plainDefinition` yet, so content can be backfilled gradually.
  // ═══════════════════════════════════════════════════════════════════
  let defMode = "technical"; // "technical" | "plain"

  function getDefinitionText(concept) {
    if (defMode === "plain" && concept.plainDefinition) {
      return concept.plainDefinition;
    }
    return concept.definition;
  }

  modeToggle.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (btn.dataset.mode === defMode) return;
      defMode = btn.dataset.mode;
      modeToggle.querySelectorAll(".mode-btn").forEach(b =>
        b.classList.toggle("active", b === btn)
      );
      // Re-render anything currently on screen so the switch is immediate
      if (activeSection)   renderSection(activeSection);
      if (activeConceptId) renderConceptDetail(activeConceptId);
    });
  });

  // ═══════════════════════════════════════════════════════════════════
  // SIDE DRAWER (search + explanation style)
  // ═══════════════════════════════════════════════════════════════════
  function openDrawer() {
    drawer.classList.add("open");
    drawerBackdrop.classList.add("visible");
    drawerTab.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
  }
  function closeDrawer() {
    drawer.classList.remove("open");
    drawerBackdrop.classList.remove("visible");
    drawerTab.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    suggestions.style.display = "none";
  }
  drawerTab.addEventListener("click", () =>
    drawer.classList.contains("open") ? closeDrawer() : openDrawer()
  );
  drawerClose.addEventListener("click", closeDrawer);
  drawerBackdrop.addEventListener("click", closeDrawer);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && drawer.classList.contains("open")) closeDrawer();
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

  // Renders a definition line plus, if the concept has one, an
  // expandable "analogy" pill that reveals a novice-friendly comparison.
  function renderDefinitionBlock(c) {
    const defHtml = linkifyDefinition(getDefinitionText(c));
    const pillHtml = c.analogy
      ? `<button class="analogy-pill" data-analogy-for="${c.id}" type="button" aria-expanded="false">
           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <circle cx="12" cy="12" r="10"/><path d="M9.5 9a2.5 2.5 0 0 1 5 0c0 1.5-2.5 2-2.5 3.5"/><circle cx="12" cy="17" r=".4" fill="currentColor"/>
           </svg>
           Analogy
         </button>
         <div class="analogy-text" id="analogy-${c.id}" hidden>${c.analogy}</div>`
      : "";
    return `<span class="panel-def">${defHtml}</span>${pillHtml}`;
  }

  // ═══════════════════════════════════════════════════════════════════
  // INFER BROADER FROM NARROWER DECLARATIONS
  // Only 'narrower' needs to be specified in the YAML data.
  // For each concept with narrower: [childId, ...], we automatically push
  // the parent's id into each child's .broader array.
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
  // RENDER PIPELINE DETAIL PANEL (right-hand side)
  // ═══════════════════════════════════════════════════════════════════
  let activeSection = null;

  function renderSection(section) {
    activeSection = section;
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

    content.querySelectorAll(".concept-link").forEach(el => {
      el.addEventListener("click", () =>
        selectGlossaryConcept(el.dataset.id, true)
      );
    });
    content.querySelectorAll(".def-link").forEach(el => {
      el.addEventListener("click", () =>
        selectGlossaryConcept(el.dataset.id, true)
      );
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // VERTICAL PIPELINE — each node is collapsible AND, on open,
  // pushes its full detail into the right-hand panel.
  // ═══════════════════════════════════════════════════════════════════
  nodes.forEach(node => {
    const header = node.querySelector(".pipeline-node-header");
    header.addEventListener("click", () => {
      const id      = node.dataset.section;
      const section = data.sections.find(s => s.id === id);
      if (!section) return;

      const wasOpen = node.classList.contains("expanded");

      nodes.forEach(n => n.classList.remove("expanded", "active"));

      if (!wasOpen) {
        node.classList.add("expanded", "active");
        renderSection(section);
      } else {
        activeSection = null;
        content.innerHTML = `<div class="detail-empty"><p>Select a stage on the left to see its methods and definitions here.</p></div>`;
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
      const header = document.querySelector(
        `.pipeline-node[data-section="${match.section}"] .pipeline-node-header`
      );
      if (header && !header.parentElement.classList.contains("expanded")) {
        header.click();
      }
      message.textContent = "";
      closeDrawer();
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
  // GLOSSARY LIST + TAG FILTERS
  // ═══════════════════════════════════════════════════════════════════
  let activeFilter    = null;
  let activeConceptId = null;

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

    container.querySelectorAll(".tag-filter").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".tag-filter").forEach(b =>
          b.classList.remove("active")
        );
        btn.classList.add("active");
        activeFilter = btn.dataset.tag || null;
        renderGlossaryList();
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
        activeConceptId = el.dataset.id;
        container.querySelectorAll(".glossary-term").forEach(t =>
          t.classList.remove("active")
        );
        el.classList.add("active");
        renderConceptGraph(el.dataset.id);
        expandGraphSection();
      });
    });
  }

  // Navigate to a concept: re-render list, update detail card + graph focus
  function selectGlossaryConcept(id, scrollIntoView) {
    activeConceptId = id;
    renderGlossaryList();
    renderConceptGraph(id);
    expandGraphSection();
    if (scrollIntoView) {
      document.querySelector(".glossary-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    requestAnimationFrame(() => {
      document.querySelector(`.glossary-term[data-id="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER CONCEPT DETAIL CARD
  // (graph update is now handled separately by ConceptGraphManager)
  // ═══════════════════════════════════════════════════════════════════
  function renderConceptDetail(conceptId) {
    const concept = conceptMap[conceptId];
    if (!concept) return;

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

    document.getElementById("concept-detail").innerHTML = `
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
        <div class="concept-tag-chips">${tagHtml}</div>
      </div>`;

    document.querySelectorAll(".rel-link").forEach(el => {
      el.addEventListener("click", () =>
        selectGlossaryConcept(el.dataset.id, false)
      );
    });
    document.querySelectorAll(".def-link").forEach(el => {
      el.addEventListener("click", () =>
        selectGlossaryConcept(el.dataset.id, false)
      );
    });
  }

  // Unified entry point: update detail card AND graph focus
  function renderConceptGraph(conceptId) {
    renderConceptDetail(conceptId);
    if (graphManager) graphManager.setFocus(conceptId);
  }

  // ═══════════════════════════════════════════════════════════════════
  // ANALOGY PILLS — global delegated toggle, works anywhere on the page
  // ═══════════════════════════════════════════════════════════════════
  document.addEventListener("click", e => {
    const pill = e.target.closest(".analogy-pill");
    if (!pill) return;
    const id   = pill.dataset.analogyFor;
    const text = document.getElementById(`analogy-${id}`);
    if (!text) return;
    const isOpen = !text.hidden;
    text.hidden = isOpen;
    pill.setAttribute("aria-expanded", String(!isOpen));
    pill.classList.toggle("open", !isOpen);
  });

  // ═══════════════════════════════════════════════════════════════════
  // CONCEPT GRAPH MANAGER
  // ─────────────────────────────────────────────────────────────────
  // Builds the full graph ONCE from all concepts. On every setFocus()
  // call it runs a BFS to compute hop-distance from the selected node
  // and transitions node/link visual weights accordingly — no DOM
  // teardown, no simulation restart, no redundant physics.
  //
  // Features:
  //   • Persistent D3 force simulation (runs → settles → stays)
  //   • BFS depth-fade: nodes dim/shrink with distance from focus
  //   • Smooth pan-to-node via d3.zoom.transform transition
  //   • Globe parallax: CSS 3D perspective tilt on mousemove
  //   • Draggable nodes (locally reheat simulation)
  //   • Zoom controls (in / out / fit-all)
  // ═══════════════════════════════════════════════════════════════════

  // Colour palette (mirrors SCSS variables)
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
      this._attachGlobe();
    }

    // ── Build all nodes + edges (called once) ───────────────────────
    _buildData() {
      this.nodes = Object.values(this.conceptMap).map(c => ({
        id: c.id, label: c.prefLabel, tags: c.tags || []
      }));

      // Undirected adjacency map for BFS
      this.adj = new Map(this.nodes.map(n => [n.id, new Set()]));

      const seen = new Set();
      this.links = [];

      const addEdge = (src, tgt, type) => {
        if (!this.adj.has(src) || !this.adj.has(tgt)) return;
        // Stable dedup key regardless of direction
        const key = src < tgt ? `${src}§${tgt}` : `${tgt}§${src}`;
        if (seen.has(key)) return;
        seen.add(key);
        this.links.push({ source: src, target: tgt, type });
        this.adj.get(src).add(tgt);
        this.adj.get(tgt).add(src);
      };

      // Process narrower + related; broader is already inferred above
      // and would produce duplicate edges — the dedup handles it safely,
      // but we skip it to avoid unnecessary type-shadowing.
      Object.values(this.conceptMap).forEach(c => {
        (c.narrower || []).forEach(t => addEdge(c.id, t, "narrower"));
        (c.related  || []).forEach(t => addEdge(c.id, t, "related"));
      });
    }

    // ── BFS: returns Map<id, hopDistance> from startId ─────────────
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

    // ── Determine the semantic relationship from focusId → neighborId
    _relType(focusId, neighborId) {
      const c  = this.conceptMap[focusId];
      const nb = this.conceptMap[neighborId];
      if ((c?.narrower || []).includes(neighborId)) return "narrower";
      if ((c?.broader  || []).includes(neighborId)) return "broader";
      if ((c?.related  || []).includes(neighborId)) return "related";
      // Inverse: if neighbor declared narrower→focus, focus is broader
      if ((nb?.narrower || []).includes(focusId))   return "broader";
      if ((nb?.broader  || []).includes(focusId))   return "narrower";
      return "related";
    }

    // ── Build SVG structure ─────────────────────────────────────────
    _initSVG() {
      const svg = d3.select(this.svgEl);
      svg.selectAll("*").remove();
      svg.attr("viewBox", `0 0 ${this.W} ${this.H}`)
         .attr("height",   this.H);

      // Arrow markers for typed depth-1 links
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

      // Root group that d3.zoom transforms
      this._g = svg.append("g").attr("class", "cgm-root");

      // Zoom behaviour (pan + scroll-to-zoom)
      this._zoom = d3.zoom()
        .scaleExtent([0.08, 6])
        .on("zoom", e => this._g.attr("transform", e.transform));
      svg.call(this._zoom);

      // ── Links layer ──────────────────────────────────────────────
      this._linkSel = this._g.append("g").attr("class", "cgm-links")
        .selectAll("line")
        .data(this.links)
        .join("line")
          .attr("stroke",         PALETTE.link)
          .attr("stroke-width",   0.8)
          .attr("stroke-opacity", 0.28);

      // ── Nodes layer ──────────────────────────────────────────────
      const nodeG = this._g.append("g").attr("class", "cgm-nodes")
        .selectAll("g")
        .data(this.nodes)
        .join("g")
          .attr("class",  "graph-node")
          .style("cursor", "pointer");

      // Glow ring (only visible on the focused center node)
      nodeG.append("circle")
        .attr("class",        "node-glow")
        .attr("r",            0)
        .attr("fill",         PALETTE.center)
        .attr("fill-opacity", 0.12)
        .attr("stroke",       "none");

      // Main circle
      nodeG.append("circle")
        .attr("class",          "node-circle")
        .attr("r",              5)
        .attr("fill",           PALETTE.ghost)
        .attr("fill-opacity",   0.55)
        .attr("stroke",         PALETTE.ghost)
        .attr("stroke-width",   1.2)
        .attr("stroke-opacity", 0.3);

      // Label
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

      // Hover highlight
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

      // Drag (locally reheats simulation)
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

    // ── Force simulation (runs once, settles naturally) ─────────────
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

    // ── Floating zoom controls ──────────────────────────────────────
    _attachControls() {
      const container = this.svgEl.parentElement;
      const ctrl = document.createElement("div");
      ctrl.className = "graph-controls";

      const makeBtn = (icon, title, fn) => {
        const b = document.createElement("button");
        b.className   = "graph-ctrl-btn";
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

    _attachGlobe() {
      const el = this.svgEl;
      el.style.transition = "transform 0.1s ease-out";
    }

    // ── Update all visuals for a new focus concept ──────────────────
    // This is the hot path — called on every concept selection.
    // It never rebuilds the DOM or restarts the simulation.
    setFocus(id) {
      this.focusId = id;
      const dist   = this._bfs(id);

      // ── Node visuals (circle size + opacity) ──────────────────────
      this._nodeG.each((d, i, nodes) => {
        const g    = d3.select(nodes[i]);
        const circ = g.select(".node-circle");
        const glow = g.select(".node-glow");
        const lbl  = g.select(".node-label");
        const dv   = dist.get(d.id) ?? 99;
        const isCenter = d.id === id;

        let r, fill, fillOp, strokeOp, glowR, fontSize, fontOp;

        if (isCenter) {
          // Focused node: full size + colour + glow ring
          r = 13; fill = PALETTE.center;
          fillOp = 1; strokeOp = 0.7;
          glowR = 22; fontSize = "13px"; fontOp = 1;

        } else if (dv === 1) {
          // Immediate neighbours: coloured by relationship type
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
          // Far nodes: tiny ghost dots, labels hidden
          r = 3; fill = PALETTE.ghost;
          fillOp = 0.09; strokeOp = 0.05;
          glowR = 0; fontSize = "0px"; fontOp = 0;
        }

        const T = 380; // ms transition
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

      // ── Link visuals (colour + opacity) ───────────────────────────
      this._linkSel.each((l, i, links) => {
        const srcId = typeof l.source === "object" ? l.source.id : l.source;
        const tgtId = typeof l.target === "object" ? l.target.id : l.target;
        const ds    = dist.get(srcId) ?? 99;
        const dt    = dist.get(tgtId) ?? 99;
        const minD  = Math.min(ds, dt);
        const maxD  = Math.max(ds, dt);

        const lk = d3.select(links[i]);

        if (minD === 0 && maxD === 1) {
          // Direct edge from focus: coloured + arrow
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

      // ── Smooth pan to the focused node ───────────────────────────
      const node = this.nodes.find(n => n.id === id);
      if (node?.x != null) {
        this._panTo(node.x, node.y);
      } else {
        // Simulation may not have placed it yet — retry briefly
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

    // Zoom out to show the whole graph
    fitAll() {
      d3.select(this.svgEl)
        .transition().duration(500).ease(d3.easeCubicOut)
        .call(this._zoom.transform, d3.zoomIdentity);
    }
  }

  // ═══════════════════════════════════════════════════════════════════
  // GRAPH SECTION — collapsible, graph is lazily built the first time
  // it's expanded so the page doesn't pay the simulation cost up front.
  // ═══════════════════════════════════════════════════════════════════
  let graphManager = null;

  function initConceptGraph() {
    const svgEl = document.getElementById("concept-graph");
    if (!svgEl || graphManager) return;

    const emptyState = document.getElementById("graph-empty-state");
    const container  = document.getElementById("concept-graph-container");
    if (emptyState) emptyState.style.display = "none";
    if (container)  container.style.display  = "block";

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
    if (graphBody.hidden) toggleGraphSection(true);
    const emptyState = document.getElementById("graph-empty-state");
    const container  = document.getElementById("concept-graph-container");
    if (emptyState) emptyState.style.display = "none";
    if (container)  container.style.display  = "block";
  }

  function toggleGraphSection(forceOpen) {
    const open = forceOpen !== undefined ? forceOpen : graphBody.hidden;
    graphBody.hidden = !open;
    graphToggle.setAttribute("aria-expanded", String(open));
    graphToggle.classList.toggle("open", open);
    if (open) initConceptGraph(); // no-op after the first call
  }

  graphToggle.addEventListener("click", () => toggleGraphSection());

  // ═══════════════════════════════════════════════════════════════════
  // GLOBAL TAG CLICK HANDLER (works everywhere)
  // ═══════════════════════════════════════════════════════════════════
  document.addEventListener("click", e => {
    const chip = e.target.closest(".tag-chip");
    if (!chip) return;

    const tag = chip.dataset.tag;
    if (!tag) return;

    e.stopPropagation();

    const filter = document.querySelector(`.tag-filter[data-tag="${tag}"]`);
    if (filter) filter.click();

    document.querySelector(".glossary-section")
      ?.scrollIntoView({ behavior: "smooth" });
  });

  // ═══════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════
  function initGlossary() {
    renderTagFilters();
    renderGlossaryList();
    // Concept graph builds lazily on first expand — see toggleGraphSection.
  }

  requestAnimationFrame(initGlossary);

});