export const steps = document.querySelectorAll(".pipeline-step");

export function clearPipelineActive() {
  steps.forEach(s => s.classList.remove("active"));
}

// The old standalone collapse/expand toggle button is gone — opening and
// closing the shared rail is now driven by panel-tabs.js instead. This
// module just keeps the pipeline steps themselves working, plus the
// mobile re-parenting into the sidebar's Pipeline tab.
//
// callbacks:
//   onStepSelect(sectionId) — a step was opened
//   onStepDeselect()        — the open step was clicked again to close it
export function initPipelinePanel({ onStepSelect, onStepDeselect }) {
  const pipelinePanel        = document.getElementById("pipeline-panel");
  const pipelinePanelAnchor  = document.getElementById("pipeline-panel-anchor");
  const sidebarPipelineMount = document.getElementById("sidebar-pipeline-mount");

  // --bp-stack (set in SCSS) is the single source of truth for the
  // wide/mobile breakpoint — read it rather than hardcoding a pixel value.
  const bpStack = getComputedStyle(document.querySelector(".glossary-page"))
    .getPropertyValue("--bp-stack").trim() || "1200px";
  const stackQuery = window.matchMedia(`(max-width: ${bpStack})`);

  function placePipelinePanel(isCompact) {
    if (isCompact && pipelinePanel.parentElement !== sidebarPipelineMount) {
      sidebarPipelineMount.appendChild(pipelinePanel);
      pipelinePanel.classList.add("pipeline-panel--embedded", "open");
    } else if (!isCompact && pipelinePanel.parentElement === sidebarPipelineMount) {
      pipelinePanelAnchor.after(pipelinePanel);
      pipelinePanel.classList.remove("pipeline-panel--embedded", "open");
    }
  }

  placePipelinePanel(stackQuery.matches);
  stackQuery.addEventListener("change", e => placePipelinePanel(e.matches));

  steps.forEach(step => {
    const header = step.querySelector(".pipeline-step-header");
    header.addEventListener("click", () => {
      const wasActive = step.classList.contains("active");
      clearPipelineActive();

      if (!wasActive) {
        step.classList.add("active");
        onStepSelect(step.dataset.section);
      } else {
        onStepDeselect();
      }
    });
  });
}
