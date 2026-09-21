export const data = window.glossaryData;

export const conceptMap = {};
export const allTerms = [];

// Shared mutable state — other modules import `state` and read/write its
// properties directly (ES module bindings keep everyone in sync).
export const state = {
  defMode: "technical",
  // Replaces the old `showAnalogies` boolean. Three states:
  //   "expanded" (default) — analogy text always shown, no pill needed
  //   "pill"               — collapsed to a small clickable pill
  //   "hidden"             — analogy is not rendered at all
  analogyDisplay: "pill",
  activeSection: null,
  activeConceptId: null,
  activeFilter: null,
  graphManager: null,
};

function buildConceptMap() {
  data.skos.concepts.forEach(c => { conceptMap[c.id] = c; });

  // Backfill "broader" from the inverse "narrower" relations.
  Object.values(conceptMap).forEach(concept => {
    (concept.narrower || []).forEach(childId => {
      const child = conceptMap[childId];
      if (!child) return;
      if (!child.broader) child.broader = [];
      if (!child.broader.includes(concept.id)) child.broader.push(concept.id);
    });
  });
}

function buildSearchIndex() {
  data.skos.concepts.forEach(c => {
    allTerms.push({ term: c.prefLabel, id: c.id });
    (c.altLabel || []).forEach(alt => allTerms.push({ term: alt, id: c.id }));
  });
}

export function getDefinitionText(concept) {
  if (state.defMode === "plain" && concept.plainDefinition) {
    return concept.plainDefinition;
  }
  return concept.definition;
}

export function linkifyDefinition(text) {
  return text.replace(/\{\{(.*?)\}\}(\w*)/g, (_, term, suffix) => {
    const concept = Object.values(conceptMap)
      .find(c => c.prefLabel.toLowerCase() === term.toLowerCase());

    if (!concept) return term + suffix;

    const fullWord = term + suffix;
    return `<span class="def-link" data-id="${concept.id}">${fullWord}</span>`;
  });
}

export function renderDefinitionBlock(c, allowAnalogy = true) {
  const defHtml = linkifyDefinition(getDefinitionText(c));

  if (!allowAnalogy || !c.analogy) {
    return `<span class="panel-def">${defHtml}</span>`;
  }

  if (state.analogyDisplay === "hidden") {
    return `<span class="panel-def">${defHtml}</span>`;
  }

  if (state.analogyDisplay === "expanded") {
    return `<span class="panel-def">${defHtml}</span>
            <span class="analogy-block">
              <span class="analogy-label">Analogy</span>
              <span class="analogy-text">${c.analogy}</span>
            </span>`;
  }

  // "pill" — collapsed by default, click-to-expand.
  return `<span class="panel-def">${defHtml}</span>
          <span class="analogy-block" data-analogy-for="${c.id}">
            <button class="analogy-pill" type="button">
              Analogy<span class="analogy-pill-caret">&#9662;</span>
            </button>
            <span class="analogy-text" id="analogy-${c.id}" style="display:none">${c.analogy}</span>
          </span>`;
}

// Call once at startup. Returns false if glossaryData never loaded.
export function initState() {
  if (!data) { console.error("Glossary data not loaded"); return false; }
  buildConceptMap();
  buildSearchIndex();
  return true;
}