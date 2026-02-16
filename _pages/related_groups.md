---
layout: page
title: Related Groups
permalink: /related-groups/
---

The field of data linkage is a varied landscape, and we support the ongoing work in these areas. 
Below are some links to related groups in the data linkage field, including, and we encourage those interested to reach out to these groups.

We also encourage those working in related topics to reach out to UK DLC to see how we can offer support to reach wider audiences.

---

<div class="community-groups">

{% for group in site.data.groups %}
  <div class="group-card">
    <h2>
      {% if group.link %}
        <a href="{{ group.link }}" target="_blank">{{ group.name }}</a>
      {% else %}
        {{ group.name }}
      {% endif %}
    </h2>
    
    <p class="group-description">{{ group.description }}</p>
    
    {% if group.link %}
      <p class="group-link">
        <a href="{{ group.link }}" target="_blank">Learn more →</a>
      </p>
    {% endif %}
  </div>
{% endfor %}

</div>

---
