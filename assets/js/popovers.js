function makePopover(triggerEl, cardEl, closeEl) {
  function open() {
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

// Populated by initPopovers(); exported so other modules (search, tag
// filters) can close them programmatically.
export let viewSettingsPopover;
export let filterPopover;

export function initPopovers() {
  viewSettingsPopover = makePopover(
    document.getElementById("view-settings-btn"),
    document.getElementById("view-settings-card"),
    document.getElementById("view-settings-close")
  );

  filterPopover = makePopover(
    document.getElementById("filter-toggle"),
    document.getElementById("filter-popover"),
    null
  );

  document.addEventListener("keydown", e => {
    if (e.key !== "Escape") return;
    if (viewSettingsPopover.isOpen()) viewSettingsPopover.close();
    if (filterPopover.isOpen()) filterPopover.close();
  });
}
