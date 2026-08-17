export const steps = document.querySelectorAll(".pipeline-step");

export function clearPipelineActive() {
  steps.forEach(s => s.classList.remove("active"));
}

// callbacks:
//   onStepSelect(sectionId) — a step was opened
//   onStepDeselect()        — the open step was clicked again to close it
export function initPipelinePanel({ onStepSelect, onStepDeselect }) {
  const pipelinePanel        = document.getElementById("pipeline-panel");
  const pipelinePanelToggle  = document.getElementById("pipeline-panel-toggle");
  const pipelinePanelAnchor  = document.getElementById("pipeline-panel-anchor");
  const sidebarPipelineMount = document.getElementById("sidebar-pipeline-mount");

  pipelinePanelToggle.addEventListener("click", () => {
    pipelinePanel.classList.toggle("open");
  });

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
