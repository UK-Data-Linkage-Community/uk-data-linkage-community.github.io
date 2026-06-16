/**
 * JEKYLL CARD SYSTEM — cards.js  (fixed)
 */
(function () {
  "use strict";

  // ── 1. LOAD SITE DATA ────────────────────────────────────────────────────
  let SITE = { people: [], events: [], materials: [] };
  const dataEl = document.getElementById("jk-site-data");
  if (dataEl) { try { SITE = JSON.parse(dataEl.textContent); } catch (e) { console.warn("[jk-cards] bad JSON", e); } }

  const personById   = id => SITE.people.find(p => String(p.id) === String(id)) || null;
  const eventById    = id => SITE.events.find(e => String(e.id) === String(id)) || null;
  const materialById = id => SITE.materials.find(m => String(m.id) === String(id)) || null;

  const MATERIALS_PAGE = "/resources/materials/";

  // ── 2. MODAL ─────────────────────────────────────────────────────────────
  const modalOverlay = document.getElementById("jk-modal");
  const modalContent = document.getElementById("jk-modal-content");
  const modalClose   = document.getElementById("jk-modal-close");

  function openModal(html) {
    if (!modalOverlay || !modalContent) return;
    modalContent.innerHTML = html;
    modalOverlay.hidden = false;
    document.body.style.overflow = "hidden";
    bindTagsInContainer(modalContent);
  }
  function closeModal() {
    if (!modalOverlay) return;
    modalOverlay.hidden = true;
    modalContent.innerHTML = "";
    document.body.style.overflow = "";
  }
  if (modalClose)   modalClose.addEventListener("click", closeModal);
  if (modalOverlay) modalOverlay.addEventListener("click", e => { if (e.target === modalOverlay) closeModal(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") closeModal(); });

  // If already on the materials page, apply filters in-place
  // instead of navigating away.
  document.addEventListener("click", e => {
    const link = e.target.closest(`a[href*="${MATERIALS_PAGE}"]`);

    if (!link || !document.getElementById("jk-materials-page")) return;

    const url = new URL(link.href, window.location.href);

    // Only intercept if same page
    if (
      url.pathname.replace(/\/$/, "") !==
      window.location.pathname.replace(/\/$/, "")
    ) return;

    e.preventDefault();

    hideTooltip();
    closeModal();

    applyURLParams(url.searchParams);
  });

function applyURLParams(params) {
  const f = window._jkFilters;
  if (!f) return;

  // Mutate in place — preserves closure references held by buildGroup handlers
  if (params.get("search")) f.search = params.get("search");

  const apply = (arr, key) => {
    arr.length = 0;
    (params.get(key)?.split(",").filter(Boolean) || []).forEach(v => arr.push(v));
  };

  apply(f.types,   "type");
  apply(f.authors, "author");
  apply(f.events,  "event");
  apply(f.tags,    "tags");

  if (window._jkApplyFilters) {
    window._jkApplyFilters();
    // Sync checkboxes to reflect the new state
    document.querySelectorAll(".jk-filter-options input[type=checkbox]").forEach(cb => {
      const id = cb.closest(".jk-filter-options")?.id;
      const map = {
        "jk-filter-types":   f.types,
        "jk-filter-authors": f.authors,
        "jk-filter-events":  f.events,
        "jk-filter-tags":    f.tags,
      };
      if (map[id]) cb.checked = map[id].includes(cb.value);
    });
  }
}

  // ── Modal HTML: material ──────────────────────────────────────────────────
  function materialModalHTML(item) {
    if (!item) return "<p>Not found.</p>";
    const authors = (item.authors || []).map(personById).filter(Boolean);
    const event   = item.event_id ? eventById(item.event_id) : null;
    const embeddable = ["video","slides","notebook"].includes(item.type) && item.src;

    const hero = embeddable
      ? `<div class="jk-modal__embed"><iframe src="${esc(item.src)}" frameborder="0" allowfullscreen title="${esc(item.title)}"></iframe></div>`
      : `<div class="jk-modal__hero jk-modal__hero--placeholder jk-card--type-${esc(item.type)}">
           <span class="jk-card__type-icon-lg">${typeIcon(item.type)}</span>
           <span class="jk-card__type-badge jk-card--type-${esc(item.type)}">${typeIcon(item.type)} ${typeName(item.type)}</span>
         </div>`;

    const metaRow = (label, content) => content
      ? `<div class="jk-modal__meta-row"><span class="jk-modal__meta-label">${label}</span><div class="jk-modal__meta-value">${content}</div></div>` : "";

    const authorTags = authors.map(p => personTag(p)).join(" ");
    const eventTag   = event ? `<span class="jk-tag jk-tag--event" data-tag-type="event" data-event-id="${esc(event.id)}" tabindex="0" role="button">${esc(event.title)}</span>` : "";
    const topicTags  = (item.tags||[]).map(t => `<span class="jk-tag jk-tag--topic" data-tag-type="topic" data-tag-value="${esc(t)}" tabindex="0" role="button">${esc(t)}</span>`).join("");

    return `${hero}
      <h2 class="jk-modal__title">${esc(item.title)}</h2>
      <div class="jk-modal__meta">
        ${metaRow("Authors", authorTags)}
        ${metaRow("Event",   eventTag)}
        ${metaRow("Tags",    topicTags)}
        ${metaRow("Date",    item.date ? formatDate(item.date) : "")}
      </div>
      ${item.description ? `<p class="jk-modal__desc">${esc(item.description)}</p>` : ""}
      ${item.caption     ? `<p class="jk-modal__desc" style="font-style:italic">${esc(item.caption)}</p>` : ""}
      ${item.src ? `<div class="jk-modal__actions">
        <a class="jk-btn jk-btn--primary" href="${esc(item.src)}" target="_blank" rel="noopener">Open ${typeName(item.type)} ↗</a>
        ${event ? `<a class="jk-btn jk-btn--secondary" href="${MATERIALS_PAGE}?event=${esc(event.id)}">More from this event</a>` : ""}
      </div>` : ""}`;
  }

  // ── Modal HTML: person ────────────────────────────────────────────────────
  function personModalHTML(person) {
    if (!person) return "<p>Not found.</p>";
    const initials  = getInitials(person.name);
    const avatar    = person.image
      ? `<img src="${esc(person.image)}" alt="${esc(person.name)}">`
      : `<span class="jk-avatar__initials">${esc(initials)}</span>`;
    const links = person.links || {};
    const linkBtns = [
      links.website && `<a class="jk-btn jk-btn--ghost" href="${esc(links.website)}" target="_blank" rel="noopener">🌐 Website</a>`,
      links.email   && `<a class="jk-btn jk-btn--ghost" href="mailto:${esc(links.email)}">✉ Email</a>`,
      links.github  && `<a class="jk-btn jk-btn--ghost" href="https://github.com/${esc(links.github)}" target="_blank" rel="noopener">⌥ GitHub</a>`,
    ].filter(Boolean).join("");
    const theirMats = SITE.materials.filter(m => (m.authors||[]).includes(person.id));

    return `<div class="jk-modal__hero jk-modal__hero--person">
        <div class="jk-avatar jk-avatar--xl">${avatar}</div>
      </div>
      <h2 class="jk-modal__title">${esc(person.name)}</h2>
      ${person.role        ? `<p style="margin:2px 0 0;font-weight:600;font-size:.9rem;color:var(--jk-accent)">${esc(person.role)}</p>` : ""}
      ${person.affiliation ? `<p style="margin:2px 0 0;font-size:.85rem;color:var(--jk-text-muted)">${esc(person.affiliation)}</p>` : ""}
      ${person.content     ? `<p class="jk-modal__desc" style="margin-top:12px">${esc(person.content)}</p>` : ""}
      ${linkBtns ? `<div class="jk-modal__links" style="margin-top:10px;display:flex;gap:6px;flex-wrap:wrap">${linkBtns}</div>` : ""}
      ${theirMats.length ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--jk-border)">
        <p style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--jk-text-faint);margin:0 0 10px">${theirMats.length} Material${theirMats.length>1?"s":""}</p>
        ${theirMats.map(m=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--jk-surface);border-radius:var(--jk-radius-sm);cursor:pointer;margin-bottom:4px" data-card-trigger="material" data-material-id="${esc(m.id)}">
          <span>${typeIcon(m.type)}</span><span style="font-size:.85rem;font-weight:500;flex:1">${esc(m.title)}</span>
        </div>`).join("")}
        <div class="jk-modal__actions"><a class="jk-btn jk-btn--secondary" href="${MATERIALS_PAGE}?author=${esc(person.id)}">All materials by ${esc(person.name)} ↗</a></div>
      </div>` : ""}`;
  }

  // ── Modal HTML: event ─────────────────────────────────────────────────────
  function eventModalHTML(event) {
    if (!event) return "<p>Not found.</p>";
    const statusLabels = { completed:"✓ Completed", upcoming:"◷ Upcoming", ongoing:"● Ongoing", materials:"● Materials available" };
    const relMats = SITE.materials.filter(m => m.event_id === event.id);

    return `<div class="jk-modal__hero jk-modal__hero--placeholder" style="height:80px;background:var(--jk-surface)">
        <span style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--jk-text-faint)">${esc(event.event_type_label||event.event_type)}</span>
      </div>
      <h2 class="jk-modal__title">${esc(event.title)}</h2>
      <div class="jk-modal__meta">
        ${event.date   ? `<div class="jk-modal__meta-row"><span class="jk-modal__meta-label">Date</span><div class="jk-modal__meta-value">${formatDate(event.date)}</div></div>` : ""}
        ${event.status ? `<div class="jk-modal__meta-row"><span class="jk-modal__meta-label">Status</span><div class="jk-modal__meta-value">${esc(statusLabels[event.status]||event.status)}</div></div>` : ""}
        ${event.venue  ? `<div class="jk-modal__meta-row"><span class="jk-modal__meta-label">Venue</span><div class="jk-modal__meta-value">${esc(event.venue)}</div></div>` : ""}
      </div>
      ${event.description ? `<p class="jk-modal__desc">${esc(event.description)}</p>` : ""}
      ${relMats.length ? `<div style="margin-top:20px;padding-top:16px;border-top:1px solid var(--jk-border)">
        <p style="font-size:.78rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--jk-text-faint);margin:0 0 10px">${relMats.length} Material${relMats.length>1?"s":""}</p>
        ${relMats.map(m=>`<div style="display:flex;align-items:center;gap:8px;padding:6px 8px;background:var(--jk-surface);border-radius:var(--jk-radius-sm);cursor:pointer;margin-bottom:4px" data-card-trigger="material" data-material-id="${esc(m.id)}">
          <span>${typeIcon(m.type)}</span><span style="font-size:.85rem;font-weight:500;flex:1">${esc(m.title)}</span>
        </div>`).join("")}
      </div>` : ""}
      <div class="jk-modal__actions">
        <a class="jk-btn jk-btn--secondary" href="${MATERIALS_PAGE}?event=${esc(event.id)}">Browse materials ↗</a>
        ${event.registration_link ? `<a class="jk-btn jk-btn--primary" href="${esc(event.registration_link)}" target="_blank" rel="noopener">Register ↗</a>` : ""}
      </div>`;
  }

  // ── 3. TAG TOOLTIP ────────────────────────────────────────────────────────
  const tooltip      = document.getElementById("jk-tag-tooltip");
  const tooltipInner = document.getElementById("jk-tag-tooltip-inner");
  let currentTag     = null;
  let hideTimer      = null;

  function showTooltip(el) {
    if (!tooltip || !tooltipInner) return;
    clearTimeout(hideTimer);
    const type     = el.dataset.tagType;
    const personId = el.dataset.personId;
    const tagVal   = el.dataset.tagValue;
    const eventId  = el.dataset.eventId;
    let html = "";

    if (type === "person" && personId) {
      const p = personById(personId);
      if (!p) return;
      const av = p.image ? `<img src="${esc(p.image)}" alt="" style="width:100%;height:100%;object-fit:cover">` : `<span class="jk-avatar__initials">${getInitials(p.name)}</span>`;
      html = `<div class="jk-tag-tooltip__person">
          <div class="jk-avatar jk-avatar--md">${av}</div>
          <div class="jk-tag-tooltip__person-info">
            <div class="jk-tag-tooltip__name">${esc(p.name)}</div>
            ${p.role        ? `<div class="jk-tag-tooltip__sub" style="font-weight:600;color:var(--jk-accent)">${esc(p.role)}</div>` : ""}
            ${p.affiliation ? `<div class="jk-tag-tooltip__sub">${esc(p.affiliation)}</div>` : ""}
          </div>
        </div>
        <div class="jk-tag-tooltip__divider"></div>
        <div class="jk-tag-tooltip__actions">
          <button class="jk-tag-tooltip__action" data-action="open-person" data-person-id="${esc(p.id)}">👤 View profile</button>
          <a class="jk-tag-tooltip__action" href="${MATERIALS_PAGE}?author=${esc(p.id)}">◻ Browse their materials</a>
        </div>`;
    } else if (type === "topic" && tagVal) {
      html = `<div style="font-size:.85rem;font-weight:600;margin-bottom:6px">#${esc(tagVal)}</div>
        <div class="jk-tag-tooltip__actions">
          <a class="jk-tag-tooltip__action" href="${MATERIALS_PAGE}?tags=${esc(tagVal)}">🔍 Browse "${esc(tagVal)}" materials</a>
        </div>`;
    } else if (type === "event" && eventId) {
      const ev = eventById(eventId);
      if (!ev) return;
      html = `<div style="font-size:.75rem;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--jk-text-faint)">${esc(ev.event_type_label||ev.event_type)}</div>
        <div style="font-size:.88rem;font-weight:600;margin:2px 0">${esc(ev.title)}</div>
        ${ev.date ? `<div style="font-size:.78rem;color:var(--jk-text-muted)">${formatDate(ev.date)}</div>` : ""}
        <div class="jk-tag-tooltip__divider"></div>
        <div class="jk-tag-tooltip__actions">
          <button class="jk-tag-tooltip__action" data-action="open-event" data-event-id="${esc(ev.id)}">📅 View event details</button>
          <a class="jk-tag-tooltip__action" href="${MATERIALS_PAGE}?event=${esc(ev.id)}">◻ Browse event materials</a>
        </div>`;
    } else { return; }

    tooltipInner.innerHTML = html;
    currentTag = el;

    tooltip.style.visibility = "hidden";
    tooltip.hidden = false;

    positionTooltip(el);

    tooltip.style.visibility = "";

    // Bind inner actions
    tooltipInner.querySelectorAll("[data-action='open-person']").forEach(btn =>
      btn.addEventListener("click", () => { hideTooltip(0); openModal(personModalHTML(personById(btn.dataset.personId))); }));
    tooltipInner.querySelectorAll("[data-action='open-event']").forEach(btn =>
      btn.addEventListener("click", () => { hideTooltip(0); openModal(eventModalHTML(eventById(btn.dataset.eventId))); }));
  }

  function positionTooltip(el) {
    if (!tooltip) return;

    const rect = el.getBoundingClientRect();

    const tipW = 280;
    const tipH = 240;
    const gap  = 6;

    const vw = window.innerWidth;
    const vh = window.innerHeight;

    // Horizontal
    let left = Math.max(gap, Math.min(rect.left, vw - tipW - gap));

    // Vertical
    let top = rect.bottom + gap;

    // Flip above if needed
    if (top + tipH > vh - gap) {
      top = rect.top - tipH - gap;
    }

    // Final clamp
    if (top < gap) top = gap;

    tooltip.style.left = left + "px";
    tooltip.style.top  = top + "px";
  }

  function hideTooltip(delay = 180) {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => { if (tooltip) tooltip.hidden = true; currentTag = null; }, delay);
  }

  if (tooltip) {
    tooltip.addEventListener("mouseenter", () => clearTimeout(hideTimer));
    tooltip.addEventListener("mouseleave", () => hideTooltip());
  }

  // ── 4. UNIFIED CLICK HANDLER (fixes stopPropagation across two listeners) ─
  document.addEventListener("click", e => {
    // Tags take priority
    const tagEl = e.target.closest(".jk-tag[data-tag-type]");

    if (tagEl) {
      e.preventDefault();
      e.stopPropagation();

      if (currentTag === tagEl && !tooltip.hidden) {
        hideTooltip(0);
      } else {
        showTooltip(tagEl);
      }

      return;
    }

    // --------------------------------------------------
    // OPEN PERSON MODAL FROM NORMAL LINKS
    // --------------------------------------------------

    const personLink = e.target.closest("[data-open-person]");

    if (personLink) {
      e.preventDefault();
      const id = personLink.dataset.openPerson;
      const person = personById(id);
      if (person) {
        openModal(personModalHTML(person));
      } else {
        console.warn("personById returned nothing for id:", id);
      }
      return;
    }

    // --------------------------------------------------
    // OPEN EVENT MODAL FROM NORMAL LINKS
    // --------------------------------------------------

    const eventLink = e.target.closest("[data-open-event]");
    if (eventLink) {
      e.preventDefault();
      const event = eventById(eventLink.dataset.openEvent);
      if (event) {
        openModal(eventModalHTML(event));
      }
      return;
    }

    // --------------------------------------------------

    // Close tooltip on outside click
    if (tooltip && !tooltip.hidden) hideTooltip(0);

    // Card triggers
    const cardTrigger = e.target.closest("[data-card-trigger]");
    if (cardTrigger) {
      const type = cardTrigger.dataset.cardTrigger;
      if (type === "material") {
        const m = materialById(cardTrigger.dataset.materialId);
        if (m) openModal(materialModalHTML(m));
      } else if (type === "person") {
        const p = personById(cardTrigger.dataset.personId);
        if (p) openModal(personModalHTML(p));
      }
    }
  });

  document.addEventListener("keydown", e => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const el = document.activeElement;
    if (!el) return;
    if (el.matches(".jk-tag[data-tag-type]")) {
      e.preventDefault();
      e.stopPropagation();
      showTooltip(el);
    }
    else if (el.matches("[data-card-trigger]")) { e.preventDefault(); el.click(); }
  });

  // ── 5. MATERIALS PAGE ────────────────────────────────────────────────────
  function _tryInitMaterialsPage() {
    if (!document.getElementById("jk-materials-page")) return;
    try {
      initMaterialsPage();
    } catch (err) {
      console.error("[jk-cards] Materials page init failed:", err);
    }
  }

  // Safe regardless of where cards.js is loaded in the document
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", _tryInitMaterialsPage);
  } else {
    _tryInitMaterialsPage();
  }

function initMaterialsPage() {
  const filters = window._jkFilters = { search: "", types: [], authors: [], events: [], tags: [] };

  const params = new URLSearchParams(window.location.search);
  if (params.get("search")) filters.search  = params.get("search");
  if (params.get("type"))   filters.types   = params.get("type").split(",");
  if (params.get("author")) filters.authors = params.get("author").split(",");
  if (params.get("event"))  filters.events  = params.get("event").split(",");
  if (params.get("tags"))   filters.tags    = params.get("tags").split(",");

  const cardEls = Array.from(document.querySelectorAll(".jk-mat-item"));

  // Collect available options directly from data attributes
  const allTypes   = unique(cardEls.map(el => el.dataset.type).filter(Boolean));
  const allAuthors = (() => {
    const fromDOM = unique(
      [].concat(...cardEls.map(el =>
        (el.dataset.authors || "").split(",").filter(Boolean)
      ))
    );
    if (fromDOM.length) return fromDOM;
    // Fallback: collect from the embedded JSON data
    return unique(
      [].concat(...SITE.materials.map(m => (m.authors || []).map(String)))
    );
  })();

  const allEvents = unique(
    [].concat(...cardEls.map(el =>
      [el.dataset.event].filter(Boolean)
    ))
  );

  const allTags = unique(
    [].concat(...cardEls.map(el =>
      (el.dataset.tags || "").split(",").filter(Boolean)
    ))
  );
  // Search
  const searchEl = document.getElementById("jk-filter-search");
  if (searchEl) {
    searchEl.value = filters.search;
    searchEl.addEventListener("input", () => { filters.search = searchEl.value; applyFilters(); });
  }

  // Build checkbox groups — dataAttr is the card element's dataset key
  function buildGroup(containerId, options, activeVals, labelFn, dataAttr) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = "";
    options.forEach(opt => {
      const count = cardEls.filter(el =>
        (el.dataset[dataAttr] || "").split(",").includes(opt)
      ).length;
      const lbl = document.createElement("label");
      lbl.className = "jk-filter-option";
      const cb = document.createElement("input");
      cb.type = "checkbox";
      cb.value = opt;
      cb.checked = activeVals.includes(opt);
      cb.addEventListener("change", () => {
        const checked = Array.from(container.querySelectorAll("input:checked")).map(i => i.value);
        activeVals.length = 0;
        checked.forEach(v => activeVals.push(v));
        applyFilters();
      });
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(" " + labelFn(opt)));
      const cnt = document.createElement("span");
      cnt.className = "jk-filter-option__count";
      cnt.textContent = count;
      lbl.appendChild(cnt);
      container.appendChild(lbl);
    });
  }

  buildGroup("jk-filter-types",   allTypes,   filters.types,   t => typeName(t),                    "type");
  buildGroup("jk-filter-authors", allAuthors, filters.authors, id => (personById(id) && personById(id).name) || id, "authors");
  buildGroup("jk-filter-events",  allEvents,  filters.events,  id => (eventById(id) && eventById(id).title) || id, "event");
  buildGroup("jk-filter-tags",    allTags,    filters.tags,    t => t,                               "tags");

  document.getElementById("jk-filter-reset")?.addEventListener("click", () => {
    filters.search = ""; filters.types.length = 0; filters.authors.length = 0;
    filters.events.length = 0; filters.tags.length = 0;
    if (searchEl) searchEl.value = "";
    // Uncheck all boxes
    document.querySelectorAll(".jk-filter-options input[type=checkbox]")
      .forEach(cb => cb.checked = false);
    applyFilters();
  });

  window._jkApplyFilters = applyFilters;
  applyFilters();

  function applyFilters() {
    const q = filters.search.toLowerCase().trim();
    let visible = 0;
    cardEls.forEach(el => {
      const type    = el.dataset.type    || "";
      const authors = (el.dataset.authors || "").split(",").filter(Boolean);
      const event   = el.dataset.event   || "";
      const tags    = (el.dataset.tags   || "").split(",").filter(Boolean);
      const text    = (el.dataset.searchtext || el.textContent || "").toLowerCase();

      const ok =
        (!q                    || text.toLowerCase().includes(q))                                 &&
        (!filters.types.length   || filters.types.includes(type))                  &&
        (!filters.authors.length || filters.authors.some(a => authors.includes(a))) &&
        (!filters.events.length  || filters.events.includes(event))                &&
        (!filters.tags.length    || filters.tags.every(t => tags.includes(t)));

      el.classList.toggle("jk-hidden", !ok);
      if (ok) visible++;
    });

    const countEl = document.getElementById("jk-results-count");
    if (countEl) countEl.textContent = `${visible} result${visible !== 1 ? "s" : ""}`;

    document.getElementById("jk-materials-empty")
      ?.classList.toggle("jk-hidden", visible > 0);

    updateActiveChips();
    syncURL();
  }

  function updateActiveChips() {
    const container = document.getElementById("jk-active-filters");
    if (!container) return;
    container.innerHTML = "";
    const addChip = (label, remove) => {
      const chip = document.createElement("span");
      chip.className = "jk-filter-chip";
      chip.innerHTML = `${esc(label)} <button class="jk-filter-chip__remove">×</button>`;
      chip.querySelector("button").addEventListener("click", () => { remove(); applyFilters(); });
      container.appendChild(chip);
    };
    filters.types.slice().forEach(t   => addChip(`Type: ${typeName(t)}`, () => filters.types.splice(filters.types.indexOf(t), 1)));
    filters.authors.slice().forEach(a => addChip(personById(a)?.name || a, () => filters.authors.splice(filters.authors.indexOf(a), 1)));
    filters.events.slice().forEach(e  => addChip(eventById(e)?.title || e,  () => filters.events.splice(filters.events.indexOf(e), 1)));
    filters.tags.slice().forEach(t    => addChip(`#${t}`,                   () => filters.tags.splice(filters.tags.indexOf(t), 1)));
    if (filters.search) addChip(`"${filters.search}"`, () => { filters.search = ""; if (searchEl) searchEl.value = ""; });
    // Sync checkboxes to match chip removals
    syncCheckboxes();
  }

  function syncCheckboxes() {
    document.querySelectorAll(".jk-filter-options input[type=checkbox]").forEach(cb => {
      const container = cb.closest(".jk-filter-options");
      const id = container?.id;
      if (!id) return;
      const arr = { "jk-filter-types": filters.types, "jk-filter-authors": filters.authors,
                    "jk-filter-events": filters.events, "jk-filter-tags": filters.tags }[id];
      if (arr) cb.checked = arr.includes(cb.value);
    });
  }

  function syncURL() {
    const p = new URLSearchParams();
    if (filters.search)         p.set("search", filters.search);
    if (filters.types.length)   p.set("type",   filters.types.join(","));
    if (filters.authors.length) p.set("author", filters.authors.join(","));
    if (filters.events.length)  p.set("event",  filters.events.join(","));
    if (filters.tags.length)    p.set("tags",   filters.tags.join(","));
    const qs = p.toString();
    history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }
}

  // ── HELPERS ───────────────────────────────────────────────────────────────
  function esc(s) {
    return String(s??"")
      .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
      .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  }
  function getInitials(n) {
    const p = (n||"").trim().split(/\s+/);
    return (p[0][0]+(p[p.length-1][0]||"")).toUpperCase();
  }
  function formatDate(s) {
    try { return new Date(s).toLocaleDateString("en-GB",{year:"numeric",month:"long",day:"numeric"}); }
    catch { return s; }
  }
  function typeIcon(t) { return {slides:"▤",video:"▶",document:"◻",notebook:"◈",code:"⌥"}[t]||"◆"; }
  function typeName(t) { return {slides:"Slides",video:"Video",document:"Document",notebook:"Notebook",code:"Code"}[t]||(t||"Material"); }
  function personTag(p) {
    return `<span class="jk-tag jk-tag--person" data-tag-type="person" data-person-id="${esc(p.id)}" tabindex="0" role="button">${esc(p.name)}</span>`;
  }
  function bindTagsInContainer(c) {
    // Tags in dynamic content (modals) — already handled by unified delegation
    // This just ensures any newly injected card-triggers inside modals also work
    c.querySelectorAll("[data-card-trigger]").forEach(el => {
      // delegation from document handles these automatically, no rebind needed
    });
  }
  function unique(arr) {
    return [...new Set(arr)];
  }
})();