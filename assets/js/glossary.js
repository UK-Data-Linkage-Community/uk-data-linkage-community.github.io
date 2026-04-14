document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".glossary-toggle").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      item.classList.toggle("open");
    });
  });

  // Open item if URL has hash
  const hash = window.location.hash.substring(1);
  if (hash) {
    const el = document.getElementById(hash);
    if (el) {
      el.classList.add("open");
      el.scrollIntoView();
    }
  }
});