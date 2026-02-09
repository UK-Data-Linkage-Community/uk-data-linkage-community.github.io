---
layout: page
title: People
permalink: /people/
headshot_width: "200px"
---

## <u>Community Co-Chairs</u>
{% for person in site.data.people %}
  ![{{ person.name }}]({{ person.image}}){: style="float: right; width: {{ page.headshot_width }}"}
  <h3>{{ person.name }}</h3>{{ person.affiliation | markdownify }}
  <p>{{ person.content | markdownify }}</p>
  <br>
{% endfor %}

---
## <u>Public Interest Representative</u>
\# TODO

---
## <u>Members</u>


[splink]: https://moj-analytical-services.github.io/splink/
