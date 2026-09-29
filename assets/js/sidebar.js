export function initSidebar() {
  const sidebarToggle = document.getElementById("sidebar-toggle");
  const sidebarBody    = document.getElementById("sidebar-body");

  sidebarToggle.addEventListener("click", () => {
    sidebarToggle.classList.toggle("open");
    sidebarBody.classList.toggle("open");
  });

  const sidebarTabs   = document.querySelectorAll(".sidebar-tab");
  const sidebarPanels = document.querySelectorAll(".sidebar-tab-panel");

  function setSidebarTab(tab) {
    sidebarTabs.forEach(btn => btn.classList.toggle("active", btn.dataset.tab === tab));
    sidebarPanels.forEach(panel =>
      panel.classList.toggle("active", panel.dataset.tabPanel === tab)
    );
    sidebarBody.classList.toggle("showing-pipeline", tab === "pipeline");
  }

  sidebarTabs.forEach(btn => {
    btn.addEventListener("click", () => setSidebarTab(btn.dataset.tab));
  });

  // Clicking any tag chip (in the detail panel, glossary list, etc.) opens
  // the sidebar, jumps to the matching tag filter, and scrolls it into view.
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
}
