document.addEventListener("DOMContentLoaded", () => {
  const progressBar = document.querySelector(".reading-progress");

  if (!progressBar) return;

  const updateProgress = () => {
    const scrollTop =
      document.documentElement.scrollTop || document.body.scrollTop;

    const scrollHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;

    const progress = (scrollTop / scrollHeight) * 100;

    progressBar.style.width = `${progress}%`;
  };

  window.addEventListener("scroll", updateProgress);

  updateProgress();
});