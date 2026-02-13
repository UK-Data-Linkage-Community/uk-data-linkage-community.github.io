---
layout: page
title: People
permalink: /people/
headshot_width: "200px"
---

## <u>Community Co-Chairs</u>
{% for person in site.data.people %}
<div class="person">
  <div class="person-info">
    <h3>{{ person.name }}</h3>
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

---
## <u>Public Interest Representative</u>
\# TODO

---
## <u>Members</u>


[splink]: https://moj-analytical-services.github.io/splink/
