document.addEventListener("DOMContentLoaded", function () {

  const data = window.glossaryData;
  if (!data) { console.error("Glossary data not loaded"); return; }

  // ═══════════════════════════════════════════════════════════════════
  // ELEMENTS
  // ═══════════════════════════════════════════════════════════════════
  const steps       = document.querySelectorAll(".pipeline-step");
  const panel       = document.getElementById("detail-panel");
  const content     = document.getElementById("detail-content");
  const connector   = document.getElementById("connector");
  const searchInput = document.getElementById("search");
  const searchBtn   = document.getElementById("search-btn");
  const suggestions = document.getElementById("suggestions");
  const message     = document.getElementById("search-message");

  // ═══════════════════════════════════════════════════════════════════
  // CONCEPT MAP
  // ═══════════════════════════════════════════════════════════════════
  const conceptMap = {};
  data.skos.concepts.forEach(c => { conceptMap[c.id] = c; });

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
  // RENDER PIPELINE DETAIL PANEL
  // ═══════════════════════════════════════════════════════════════════
  function renderSection(section) {
    let html = `<p class="section-summary">${section.summary}</p>`;

    section.methods.forEach(m => {
      html += `<h3>${m.name}</h3>`;

      if (m.concepts && m.concepts.length) {
        m.concepts.forEach(cid => {
          const c = conceptMap[cid];
          if (!c) return;
          const tagHtml = (c.tags || [])
            .map(t => `<span class="tag-chip tag-chip--${t}">${t}</span>`)
            .join("");
          html += `
            <p class="panel-concept">
              <strong class="concept-link" data-id="${c.id}">${c.prefLabel}</strong>
              <span class="panel-tags">${tagHtml}</span>
              <span class="panel-def">${c.definition}</span>
            </p>`;
        });
      } else {
        (m.terms || []).forEach(t => {
          html += `<p><strong>${t.term}</strong>: ${t.definition}</p>`;
        });
      }
    });

    content.innerHTML = html;

    // Concept links in panel → jump to glossary
    content.querySelectorAll(".concept-link").forEach(el => {
      el.addEventListener("click", () =>
        selectGlossaryConcept(el.dataset.id, true)
      );
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // PIPELINE STEP CLICK
  // ═══════════════════════════════════════════════════════════════════
  steps.forEach(step => {
    step.addEventListener("click", () => {
      const id      = step.dataset.section;
      const section = data.sections.find(s => s.id === id);
      if (!section) return;

      steps.forEach(s => s.classList.remove("active"));
      step.classList.add("active");

      renderSection(section);
      panel.classList.add("open");

      const rect   = step.getBoundingClientRect();
      const parent = step.parentElement.getBoundingClientRect();
      connector.style.width     = rect.width + "px";
      connector.style.transform = `translateX(${rect.left - parent.left}px)`;
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
      const btn = document.querySelector(
        `.pipeline-step[data-section="${match.section}"]`
      );
      if (btn) btn.click();
      message.textContent = "";
      selectGlossaryConcept(match.id, false);
    } else {
      message.textContent = "No match found in glossary.";
    }
    btn.title = tag;
  }

  searchBtn.addEventListener("click", runSearch);
  searchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); runSearch(); }
  });

  // ═══════════════════════════════════════════════════════════════════
  // GLOSSARY LIST
  // ═══════════════════════════════════════════════════════════════════
  let activeFilter    = null;
  let activeConceptId = null;

  function getAllTags() {
    const tagSet = new Set();
    data.skos.concepts.forEach(c =>
      (c.tags || []).forEach(t => tagSet.add(t))
    );
    return [...tagSet].sort();
  }

  function renderTagFilters() {
    const tags      = getAllTags();
    const container = document.getElementById("tag-filters");

    let html = `<button class="tag-filter active" data-tag="">All</button>`;
    tags.forEach(t => {
      html += `<button class="tag-filter tag-filter--${t}" data-tag="${t}">${t}</button>`;
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
        .map(t => `<span class="tag-chip tag-chip--${t}">${t}</span>`)
        .join("");

      html += `<div class="glossary-term${isActive}" data-id="${c.id}">
                 <span class="term-label">${c.prefLabel}</span>
                 <span class="term-tags-inline">${tagHtml}</span>
               </div>`;
    });
    if (currentLetter) html += `</div>`;

    container.innerHTML = html;

    container.querySelectorAll(".glossary-term").forEach(el => {
      el.addEventListener("click", () => {
        activeConceptId = el.dataset.id;
        container.querySelectorAll(".glossary-term").forEach(t =>
          t.classList.remove("active")
        );
        el.classList.add("active");
        renderConceptGraph(el.dataset.id);
      });
    });
  }

  // Navigate to a concept: re-render list (to show active state), render graph,
  // optionally scroll the glossary section into view
  function selectGlossaryConcept(id, scrollIntoView) {
    activeConceptId = id;
    renderGlossaryList();
    renderConceptGraph(id);
    if (scrollIntoView) {
      document.querySelector(".glossary-section")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    // Scroll the term into view inside the list panel
    requestAnimationFrame(() => {
      document.querySelector(`.glossary-term[data-id="${id}"]`)
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // RENDER CONCEPT DETAIL + GRAPH
  // ═══════════════════════════════════════════════════════════════════
  function renderConceptGraph(conceptId) {
    const concept = conceptMap[conceptId];
    if (!concept) return;

    document.getElementById("graph-empty-state").style.display       = "none";
    document.getElementById("concept-graph-container").style.display = "block";

    // ── Detail card ─────────────────────────────────────────────────
    const makeLinks = (ids, type) =>
      ids.map(id => {
        const label = conceptMap[id]?.prefLabel || id;
        return `<span class="rel-link" data-id="${id}">${label}</span>`;
      }).join(", ");

    const relationRows = [];
    if (concept.broader?.length)  relationRows.push(`<span class="rel-label broader-label">Broader</span> ${makeLinks(concept.broader,  "broader")}`);
    if (concept.narrower?.length) relationRows.push(`<span class="rel-label narrower-label">Narrower</span> ${makeLinks(concept.narrower, "narrower")}`);
    if (concept.related?.length)  relationRows.push(`<span class="rel-label related-label">Related</span> ${makeLinks(concept.related,  "related")}`);

    const altHtml = (concept.altLabel || [])
      .map(a => `<span class="alt-label">${a}</span>`)
      .join("");

    const tagHtml = (concept.tags || [])
      .map(t => `<span class="tag-chip tag-chip--${t}">${t}</span>`)
      .join("");

    document.getElementById("concept-detail").innerHTML = `
      <div class="concept-detail-inner">
        <div class="concept-detail-header">
          <h3>${concept.prefLabel} ${altHtml}</h3>
        </div>
        <p class="concept-def">${concept.definition}</p>
        ${relationRows.length
          ? `<div class="concept-relations">
               ${relationRows.map(r => `<div class="relation-row">${r}</div>`).join("")}
             </div>`
          : ""}
        <div class="concept-tag-chips">${tagHtml}</div>
      </div>`;

    // Wire up relation links
    document.querySelectorAll(".rel-link").forEach(el => {
      el.addEventListener("click", () =>
        selectGlossaryConcept(el.dataset.id, false)
      );
    });

    // ── Build graph data ────────────────────────────────────────────
    const nodes = [{ id: conceptId, label: concept.prefLabel, type: "center" }];
    const links = [];

    const addNode = (id, type) => {
      const c = conceptMap[id];
      if (!c || nodes.find(n => n.id === id)) return;
      nodes.push({ id, label: c.prefLabel, type });
      links.push({ source: conceptId, target: id, type });
    };

    (concept.broader  || []).forEach(id => addNode(id, "broader"));
    (concept.narrower || []).forEach(id => addNode(id, "narrower"));
    (concept.related  || []).forEach(id => addNode(id, "related"));

    drawD3Graph(nodes, links);
  }

  // ═══════════════════════════════════════════════════════════════════
  // D3 FORCE GRAPH
  // ═══════════════════════════════════════════════════════════════════
  function drawD3Graph(nodes, links) {
    const svgEl = document.getElementById("concept-graph");
    const svg   = d3.select(svgEl);
    svg.selectAll("*").remove();

    const W = svgEl.clientWidth  || 560;
    const H = 280;
    svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);

    // Colour palette aligned with SCSS variables
    const palette = {
      center:   "#2a9d8f",
      broader:  "#e07b39",
      narrower: "#4a7fc1",
      related:  "#9b8ea8"
    };

    // Defs: arrowhead markers
    const defs = svg.append("defs");
    ["broader","narrower","related"].forEach(type => {
      defs.append("marker")
        .attr("id",         `arrow-${type}`)
        .attr("viewBox",    "0 -5 10 10")
        .attr("refX",       20)
        .attr("refY",       0)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient",     "auto")
        .append("path")
          .attr("d",    "M0,-5L10,0L0,5")
          .attr("fill", palette[type])
          .attr("opacity", 0.6);
    });

    const simulation = d3.forceSimulation(nodes)
      .force("link",      d3.forceLink(links).id(d => d.id).distance(110))
      .force("charge",    d3.forceManyBody().strength(-250))
      .force("center",    d3.forceCenter(W / 2, H / 2))
      .force("collision", d3.forceCollide(38));

    // Links
    const link = svg.append("g").attr("class", "links")
      .selectAll("line")
      .data(links)
      .join("line")
        .attr("stroke",          d => palette[d.type])
        .attr("stroke-width",    1.5)
        .attr("stroke-opacity",  0.45)
        .attr("marker-end",      d => `url(#arrow-${d.type})`);

    // Nodes
    const node = svg.append("g").attr("class", "nodes")
      .selectAll("g")
      .data(nodes)
      .join("g")
        .attr("class",  "graph-node")
        .style("cursor", d => d.type === "center" ? "default" : "pointer")
        .call(
          d3.drag()
            .on("start", (event, d) => {
              if (!event.active) simulation.alphaTarget(0.3).restart();
              d.fx = d.x; d.fy = d.y;
            })
            .on("drag",  (event, d) => { d.fx = event.x; d.fy = event.y; })
            .on("end",   (event, d) => {
              if (!event.active) simulation.alphaTarget(0);
              d.fx = null; d.fy = null;
            })
        );

    // Outer glow ring for center node
    node.filter(d => d.type === "center")
      .append("circle")
        .attr("r",            26)
        .attr("fill",         palette.center)
        .attr("fill-opacity", 0.12)
        .attr("stroke",       "none");

    node.append("circle")
      .attr("r",            d => d.type === "center" ? 19 : 13)
      .attr("fill",         d => palette[d.type])
      .attr("fill-opacity", d => d.type === "center" ? 1 : 0.7)
      .attr("stroke",       d => palette[d.type])
      .attr("stroke-width", d => d.type === "center" ? 0 : 1.5)
      .attr("stroke-opacity", 0.5);

    node.append("text")
      .text(d => d.label)
      .attr("text-anchor", "middle")
      .attr("dy",          d => d.type === "center" ? 32 : 26)
      .attr("font-size",   d => d.type === "center" ? "12px" : "11px")
      .attr("font-weight", d => d.type === "center" ? "600"  : "400")
      .attr("fill",        "#333")
      .style("pointer-events", "none")
      .style("user-select",    "none");

    // Click satellite nodes to navigate
    node.filter(d => d.type !== "center")
      .on("click", (event, d) => selectGlossaryConcept(d.id, false))
      .on("mouseenter", function (event, d) {
        d3.select(this).select("circle:last-of-type")
          .attr("fill-opacity", 1);
      })
      .on("mouseleave", function (event, d) {
        d3.select(this).select("circle:last-of-type")
          .attr("fill-opacity", 0.7);
      });

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y);
      node.attr("transform", d => `translate(${d.x},${d.y})`);
    });
  }

  // ═══════════════════════════════════════════════════════════════════
  // INIT
  // ═══════════════════════════════════════════════════════════════════
  function initGlossary() {
    renderTagFilters();
    renderGlossaryList();
  }

  requestAnimationFrame(initGlossary);

});