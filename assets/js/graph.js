import { conceptMap, state } from "./state.js";

// Colour is now only an accent for the focused node — relation type is
// carried by line style instead (solid+arrow for broader/narrower, dotted
// for related), so it doesn't compete with the tag-chip colour coding.
export const PALETTE = {
  center: "#2a9d8f",
  ink:    "#334155",
  ghost:  "#94a3b8",
  link:   "#c8d0da",
};

const RELATED_DASH = "3,3";

const PILL_FONT        = 10.5;
const PILL_LINE_HEIGHT = 13;
const PILL_PAD_X       = 18;
const PILL_PAD_Y       = 12;
const PILL_MIN_WIDTH   = 56;
const PILL_MAX_WIDTH   = 100;
const PILL_CHAR_WIDTH  = 5.6;
const PILL_MAX_LINES   = 2;

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

export class ConceptGraphManager {

  constructor(svgEl, conceptMap, onNodeClick) {
    this.svgEl       = svgEl;
    this.conceptMap  = conceptMap;
    this.onNodeClick = onNodeClick;
    this.focusId     = null;
    this.W = svgEl.clientWidth  || 560;
    this.H = svgEl.clientHeight || 280;

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
       .attr("preserveAspectRatio", "xMidYMid meet");

    const defs = svg.append("defs");
    const shadow = defs.append("filter")
      .attr("id", "cgm-pill-shadow")
      .attr("x", "-40%").attr("y", "-40%")
      .attr("width", "180%").attr("height", "180%");
    shadow.append("feDropShadow")
      .attr("dx", 0).attr("dy", 1)
      .attr("stdDeviation", 1.6)
      .attr("flood-color", "#1e293b")
      .attr("flood-opacity", 0.22);
    // One neutral arrow marker, reused for every broader/narrower edge.
    // Edges are built parent→child (see addEdge in _buildData), so the
    // arrow's direction alone shows which end is broader vs narrower —
    // no colour needed.
    defs.append("marker")
      .attr("id",           "cgm-arrow")
      .attr("viewBox",      "0 -5 10 10")
      .attr("refX",         6).attr("refY", 0)
      .attr("markerWidth",  6.5).attr("markerHeight", 6.5)
      .attr("orient",       "auto")
      .append("path")
        .attr("d",       "M0,-5L10,0L0,5")
        .attr("fill",    PALETTE.ink)
        .attr("opacity", 0.85);

    this._g = svg.append("g").attr("class", "cgm-root");

    this._zoom = d3.zoom()
      .scaleExtent([0.08, 6])
      .on("zoom", e => this._g.attr("transform", e.transform));
    svg.call(this._zoom);
    this._linkSel = this._g.append("g").attr("class", "cgm-links")
      .selectAll("path")
      .data(this.links)
      .join("path")
        .attr("fill",             "none")
        .attr("stroke",           PALETTE.link)
        .attr("stroke-width",     0.8)
        .attr("stroke-dasharray", d => d.type === "related" ? RELATED_DASH : null)
        .attr("stroke-opacity",   0.28);

    const nodeG = this._g.append("g").attr("class", "cgm-nodes")
      .selectAll("g")
      .data(this.nodes)
      .join("g")
        .attr("class",  "graph-node")
        .style("cursor", "pointer");
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
          .distance(70)
          .strength(1)
      )
      .force("charge",
        d3.forceManyBody()
          .strength(-100)
          .distanceMax(180)
      )
      .force("center", d3.forceCenter(W / 2, H / 2))
      .force("collide",
        d3.forceCollide(
          d => Math.hypot(d.pillW / 2, d.pillH / 2) + 16
        ).iterations(3)
      )
      .on("tick", () => this._updatePositions())
      .stop();
    for (let i = 0; i < 180; i++) this._sim.tick();
    this._updatePositions();

    this._sim.alphaTarget(0).restart();
  }

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

  // Reorder the SVG DOM so paint order matches relevance to the focused
  // term: farthest/"ghost" nodes and links are pushed to the back, and the
  // focused node plus its direct chain (dist <= 1) end up painted last, i.e.
  // visually on top, no matter what order they were created in.
  _raiseFocusChain(dist) {
    const byDistDesc = (a, b) => (dist.get(b.id) ?? 99) - (dist.get(a.id) ?? 99);
    this._nodeG = this._nodeG.sort(byDistDesc);

    const linkDist = l => {
      const srcId = typeof l.source === "object" ? l.source.id : l.source;
      const tgtId = typeof l.target === "object" ? l.target.id : l.target;
      return Math.max(dist.get(srcId) ?? 99, dist.get(tgtId) ?? 99);
    };
    this._linkSel = this._linkSel.sort((a, b) => linkDist(b) - linkDist(a));
  }

    setFocus(id, selected = true) {
      this.focusId = id;
      const dist = this._bfs(id);
      this._focusDist = dist;

    const T = 380;

    this._nodeG.each((d, i, nodes) => {
      const g     = d3.select(nodes[i]);
      const inner = g.select(".node-inner");
      const pill  = g.select(".node-pill");
      const glow  = g.select(".node-glow");
      const lbl   = g.select(".node-label");
      const dv    = dist.get(d.id) ?? 99;
      const isCenter = selected && d.id === id;
      let scale, border, fillOp, strokeOp, glowOp, fontOp;

      if (isCenter) {
        scale = 1.3; border = PALETTE.center;
        fillOp = 0.98; strokeOp = 0.9; glowOp = 0.16; fontOp = 1;
      } else if (dv === 0 || dv === 1) {
        border = dv === 1 ? PALETTE.ink : PALETTE.ghost;
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
        const neighborId = srcId === id ? tgtId : srcId;
        const relType     = this._relType(id, neighborId);
        const isRelated   = relType === "related";
        lk.transition().duration(380)
          .attr("stroke",           PALETTE.ink)
          .attr("stroke-width",     isRelated ? 1.7 : 2.4)
          .attr("stroke-dasharray", isRelated ? RELATED_DASH : null)
          .attr("stroke-opacity",   0.6)
          .attr("marker-mid",       isRelated ? null : "url(#cgm-arrow)");
      } else if (minD <= 1 && maxD === 2) {
        lk.transition().duration(380)
          .attr("stroke",           PALETTE.link)
          .attr("stroke-width",     1)
          .attr("stroke-dasharray", null)
          .attr("stroke-opacity",   0.18)
          .attr("marker-mid",       null);
      } else if (minD <= 2 && maxD <= 3) {
        lk.transition().duration(380)
          .attr("stroke",           PALETTE.link)
          .attr("stroke-width",     0.7)
          .attr("stroke-dasharray", null)
          .attr("stroke-opacity",   0.08)
          .attr("marker-mid",       null);
      } else {
        lk.transition().duration(380)
          .attr("stroke",           PALETTE.link)
          .attr("stroke-width",     0.5)
          .attr("stroke-dasharray", null)
          .attr("stroke-opacity",   0.03)
          .attr("marker-mid",       null);
      }
    });

    const node = this.nodes.find(n => n.id === id);
    if (node?.x != null) {
      this._focusView(id, dist);
    } else {
      const check = setInterval(() => {
        const n = this.nodes.find(n => n.id === id);
        if (n?.x != null) { this._focusView(id, dist); clearInterval(check); }
      }, 80);
      setTimeout(() => clearInterval(check), 3000);
    }
  }

  // Fit the view to the focused node plus its immediate (distance <= 1)
  // neighbours, rather than just centering on the single node — so the
  // "neighbourhood" the styling highlights is actually the bit in frame.
  _focusView(id, dist) {
    const included = this.nodes.filter(n => (dist.get(n.id) ?? 99) <= 1);
    if (!included.length) return;

    const pad = 30;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    included.forEach(n => {
      const hw = n.pillW / 2 + pad;
      const hh = n.pillH / 2 + pad;
      minX = Math.min(minX, n.x - hw); maxX = Math.max(maxX, n.x + hw);
      minY = Math.min(minY, n.y - hh); maxY = Math.max(maxY, n.y + hh);
    });

    const boxW = Math.max(1, maxX - minX);
    const boxH = Math.max(1, maxY - minY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;

    // Always zoom in at least a little (never settle back near the resting
    // scale of 1, or the pan reads as "nothing happened"), but don't let a
    // single isolated node zoom in absurdly far either.
    const fitScale = Math.min(this.W / boxW, this.H / boxH);
    const scale = Math.min(Math.max(fitScale, 1.15), 1.7);

    this._panTo(cx, cy, scale);
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

// --- Graph section mounting -------------------------------------------
// The graph section's DOM node is shared: it lives in an off-screen holder
// by default, and gets moved into the concept-detail view when a concept
// is open, or back to the holder (or wherever the panel toggle expects it).

let graphSection, graphSectionHolder;
let graphToggle, graphBody, graphEmptyState, graphContainer;

export function homeGraphSection() {
  if (graphSection.parentElement !== graphSectionHolder) {
    graphSectionHolder.appendChild(graphSection);
  }
}

export function mountGraphSectionInto(container) {
  if (container) container.appendChild(graphSection);
}

const DEFAULT_GRAPH_FOCUS_ID = "entity-resolution";

// Focus the graph on a concept, falling back to the default concept when
// none is given (e.g. on first expand with nothing selected yet).
export function focusGraph(conceptId) {
  if (!state.graphManager) return;
  if (conceptId) {
    state.graphManager.setFocus(conceptId);
  } else if (conceptMap[DEFAULT_GRAPH_FOCUS_ID]) {
    state.graphManager.setFocus(DEFAULT_GRAPH_FOCUS_ID, false);
  }
}

function initConceptGraph(onNodeClick) {
  const svgEl = document.getElementById("concept-graph");
  if (!svgEl || state.graphManager) return;

  graphBody.classList.add("graph-initialized");

  requestAnimationFrame(() => {
    state.graphManager = new ConceptGraphManager(svgEl, conceptMap, id => onNodeClick(id));
    focusGraph(state.activeConceptId);
  });
}

function expandGraphSection(onNodeClick) {
  graphToggle.classList.add("open");
  initConceptGraph(onNodeClick);
  focusGraph(state.activeConceptId);
}

// onNodeClick(conceptId) is called whenever a graph node is clicked
// (wired up to select that concept in the main glossary view).
export function initGraphSection(onNodeClick) {
  graphToggle     = document.getElementById("graph-toggle");
  graphBody       = document.getElementById("graph-body");
  graphEmptyState = document.getElementById("graph-empty-state");
  graphContainer  = document.getElementById("concept-graph-container");

  graphSection = graphToggle.closest(".graph-section") || graphBody.parentElement;

  graphSectionHolder = document.createElement("div");
  graphSectionHolder.style.display = "none";
  graphSectionHolder.appendChild(graphSection);
  document.body.appendChild(graphSectionHolder);

  graphToggle.addEventListener("click", () => {
    if (graphToggle.classList.contains("open")) {
      graphToggle.classList.remove("open");
      return;
    }
    expandGraphSection(onNodeClick);
  });
}