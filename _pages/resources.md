---
layout: page
title:
permalink: /resources/
classes: wide
---

<div class="jk-resources-page" markdown="1">

<div class="jk-resources-text" markdown="1">

# Resources

One of the key targets of the community is to provide a range of publicly accessible and persistent materials related to data linkage, driven by community requirements.

Upcoming meetings and workshop events will help to identify common themes and needs from the community, and guide the development of the open resources.

Overarching themes for materials to be produced include:
* For data linkers:
  * Introduction to linking data and entity resolution
  * Explaining use cases for Deterministic, Fuzzy, and Probabilistic linkage models
  * Guidance on discussing and obtaining linkage requirements with vested parties
  * Advice and best practice for building linkage models
  * Approaches to quality review
* For linked data users: 
  * How to use linkage keys effectively
  * Common misconceptions around linked data
  * How linkage quality can be factored into your data analysis

If you have suggestions for materials that you would like to see, please submit a request [through github]({{ site.ukdlc_github_discussions }}) or by [email](mailto:{{ site.contact_email }}?subject=UK DLC: Suggestion for materials).

We also collate a list of [useful links](useful-links.html) around data linkage which may be of interest.

</div>

<hr style="border-top: 1px solid #cccccc;">

<details class="jk-resources-finder-toggle" id="jk-resources-finder-toggle">
  <summary>Browse Site Materials</summary>

{% include materials_finder.html heading_level="h2" %}

</details>

</div>

<style>
.jk-resources-page {
  padding: 0 max(24px, 4vw);
  box-sizing: border-box;
}

.jk-resources-text {
  max-width: 825px;
  margin: 0 auto;
}

.jk-resources-finder-toggle {
  scroll-margin-top: var(--jk-header-height, 70px);
}

.jk-resources-finder-toggle > summary {
  cursor: pointer;
  font-size: 1.3rem;
  font-weight: 700;
  padding: 12px 0;
  list-style: revert;
}

.jk-resources-finder-toggle[open] > summary {
  margin-bottom: 8px;
}
</style>

<script>
(function () {
  var details = document.getElementById('jk-resources-finder-toggle');
  if (!details) return;
  var params = new URLSearchParams(window.location.search);
  var filterKeys = ['search', 'type', 'author', 'event', 'tags', 'level'];
  var hasFilter = filterKeys.some(function (k) { return params.has(k); });
  if (hasFilter) {
    details.open = true;
    details.scrollIntoView({ block: 'start' });
  }
})();
</script>
