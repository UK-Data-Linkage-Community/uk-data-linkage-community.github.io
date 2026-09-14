// The right-hand rail hosts two tabs — Pipeline and Graph — instead of
// its own separate collapsed pill each. Only one is ever useful at a
// time, so sharing the rail lets the graph tab use the whole thing
// (wide + tall) rather than a flat strip squeezed under the definition.
//
// This is desktop/tablet-only: on mobile the rail gets re-parented into
// the sidebar's Pipeline tab by pipeline-panel.js, and the graph reverts
// to living inline under the term definition (see glossary.js) — so the
// tab bar itself is just hidden there via CSS.
export function initPanelTabs() {
  const panel       = document.getElementById("pipeline-panel");
  const tabButtons  = document.querySelectorAll("#panel-tabbar .panel-tab");
  const graphToggle = document.getElementById("graph-toggle");

  function isEmbedded() {
    return panel.classList.contains("pipeline-panel--embedded");
  }

  function setActiveTab(tab) {
    panel.dataset.activeTab = tab;
    tabButtons.forEach(b => b.classList.toggle("active", b.dataset.tab === tab));
  }

  function openTab(tab) {
    if (isEmbedded()) return; // mobile: tabs don't apply, see above

    const wasOpen    = panel.classList.contains("open");
    const currentTab = panel.dataset.activeTab || "pipeline";

    if (wasOpen && currentTab === tab) {
      panel.classList.remove("open");
      return;
    }

    panel.classList.add("open");
    setActiveTab(tab);

    // Graph needs its own lazy init/focus the first time it's opened —
    // reuse graph.js's existing toggle handler for that rather than
    // duplicating its logic here.
    if (tab === "graph" && !graphToggle.classList.contains("open")) {
      graphToggle.click();
    }
  }

  tabButtons.forEach(btn => {
    btn.addEventListener("click", () => openTab(btn.dataset.tab));
  });

  setActiveTab("pipeline");
}
