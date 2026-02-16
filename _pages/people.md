---
layout: page
title: "Co-Chairs"
permalink: /people/
headshot_width: "200px"
---

{% for person in site.data.people %}
<div class="person">
  <div class="person-info">
    <h2>{{ person.name }}</h2>
    <div class="affiliation">{{ person.affiliation }}</div>
    <div class="person-content">
      {{ person.content | markdownify }}
    </div>
  </div>
  <div class="person-image">
    <img src="{{ person.image }}" alt="{{ person.name }}">
  </div>
</div>
{% endfor %}
