---
layout: page
title: Events
permalink: /events/
---

The first phase of the UK Data Linkage Community is to set up a shared resource and space for linkage practitioners. 
It also includes holding several workshops to identify community needs and guide resource development.
There is also a showcase event planned for the end of the current funding round, to demonstrate current developments in the field.

For more detail on planned events, please see below:

---

## Workshops:
<ul>
  {% for event in site.events %}
    {% if event.category == "workshop" %}
        <li>
            <h3><u>{{ event.title }}</u></h3>
            {{ event.content }}
            {% if event.provisional_date %}
                Provisional date: {{ event.provisional_date }}<br>
            {% else %}
                Date: {{ event.date | date: "%Y-%m-%d" }}<br>
            {% endif %}
            {% if event.venue %}
                Venue: {{ event.venue }}<br>
            {% endif %}
            {% if event.registration_link %}
                Registration link: {{ event.registration_link }}<br>
            {% endif %}
        </li>
        <br>
    {% endif %}
  {% endfor %}
</ul>

---

## Showcase event:
<ul>
  {% for event in site.events %}
    {% if event.category == "showcase" %}
        <li>
            <h3><u>{{ event.title }}</u></h3>
            {{ event.content }}
            {% if event.provisional_date %}
                Provisional date: {{ event.provisional_date }}<br>
            {% else %}
                Date: {{ event.date | date: "%Y-%m-%d" }}<br>
            {% endif %}
            {% if event.venue %}
                Venue: {{ event.venue }}<br>
            {% endif %}
            {% if event.registration_link %}
                Registration link: {{ event.registration_link }}<br>
            {% endif %}
        </li>
        <br>
    {% endif %}
  {% endfor %}
</ul>

