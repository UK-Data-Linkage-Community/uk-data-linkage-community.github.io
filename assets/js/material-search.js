const searchInput = document.getElementById("materials-search");
const items = document.querySelectorAll(".filter-item");

searchInput.addEventListener("input", () => {
  const q = searchInput.value.toLowerCase();

  items.forEach(item => {
    const title = item.dataset.title;

    item.style.display =
      title.includes(q)
        ? ""
        : "none";
  });
});