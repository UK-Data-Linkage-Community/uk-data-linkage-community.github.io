---
layout: page
title:
permalink: /resources/
classes: wide
---

<div class="jk-resources-page">

<div class="jk-resources-intro" markdown="1">

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

{% include materials_finder.html heading_level="h2" %}

</div>

<style>
.jk-resources-page {
  padding: 0 max(24px, 4vw);
  box-sizing: border-box;
}

.jk-resources-intro {
  max-width: 1200px;
  margin: 32px auto 40px;
  padding: 28px 32px;
  background: var(--jk-surface);
  border: 1px solid var(--jk-border);
  border-left: 4px solid #30CABF;
  border-radius: var(--jk-radius-lg);
  box-shadow: var(--jk-shadow-sm);
}

.jk-resources-intro h1 {
  margin-top: 0;
}
</style>