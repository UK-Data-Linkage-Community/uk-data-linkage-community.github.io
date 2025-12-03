---
layout: page
title: Related Groups
permalink: /related-groups/
---

The field of data linkage is a varied landscape, and we support the ongoing work in these areas. 
Below are some links to related groups in the data linkage field, including, and we encourage those interested to reach out to these groups.

We also encourage those working in related topics to reach out to UK DLC to see how we can offer support to reach wider audiences.

---
{% for i_group in site.groups %}
<h2> {{ i_group.name }} </h2>
<p> {{ i_group.content | markdownify }} </p>
{% endfor %}