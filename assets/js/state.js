export const data = window.glossaryData;

export const conceptMap = {};
export const allTerms = [];

// Shared mutable state — other modules import `state` and read/write its
// properties directly (ES module bindings keep everyone in sync).
export const state = {
  defMode: "technical",
  showAnalogies: false,
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

  if (state.showAnalogies) {
    return `<span class="panel-def">${defHtml}</span>
            <span class="analogy-text analogy-text--inline">${c.analogy}</span>`;
  }

  return `<span class="panel-def">${defHtml}</span>
          <button class="analogy-pill" data-analogy-for="${c.id}" type="button">Analogy</button>
          <span class="analogy-text" id="analogy-${c.id}" style="display:none">${c.analogy}</span>`;
}

// Call once at startup. Returns false if glossaryData never loaded.
export function initState() {
  if (!data) { console.error("Glossary data not loaded"); return false; }
  buildConceptMap();
  buildSearchIndex();
  return true;
}
