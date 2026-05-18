---
layout: page
title: Events
permalink: /events/
---

The first phase of the UK Data Linkage Community is to set up a shared resource and space for linkage practitioners. 
This includes holding several workshops to identify community needs and guide resource development.

For more detail on planned events, please see below.

## Shared community calendar:
<iframe src="https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FLondon&showPrint=0&showCalendars=0&mode=AGENDA&src=YmU5NzBhNDBmZWNkOTNkZjE1NDY1M2Y3MmEwMWRjZWExNzZlMTU2YzkzZWI0ODRmODViMjE4YTZhNmMyMDJmZUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23ef6c00" style="border-width:0" width="100%" height="400" frameborder="0" scrolling="no"></iframe>
To help plan activities as a community, above is a publicly viewable calendar highlighting upcoming events of interest to data linkage.

If you have an event you would like to be added, please make a request [through github]({{ site.ukdlc_github_discussions }}) or via [email](mailto:{{ site.contact_email }}?subject=UK DLC: Suggestions for events).

<hr style="border-top: 1px solid {{ site.ukdlc_color_grey }};">

{% assign workshops = site.data.events.categories
  | where: "event_type", "workshops"
  | first %}

{% assign sorted_workshops = workshops.events
  | sort: "event_num" %}

## Workshops

<div class="events-section workshops-section">

{% for event in sorted_workshops %}
  <div class="event-card">
    <div class="event-card__header">
      <h3 class="event-card__title">
        {{ event.title }}
        {% case event.status %}
          {% when "upcoming" %}
            <span class="event-badge event-badge--upcoming">
              Upcoming
            </span>
          {% when "complete" %}
            <span class="event-badge event-badge--complete">
              Complete
            </span>
          {% when "materials" %}
            <a href="/resources/materials/?event={{ event.id }}"
               class="event-badge event-badge--materials">
              Materials Available →
            </a>
        {% endcase %}
      </h3>
    </div>
    <div class="event-description">
      {{ event.description }}
    </div>
    <div class="event-meta-box">
      {% if event.use_provisional_date %}
        <p>
          <strong>Provisional Date:</strong>
          {{ event.date }}
        </p>
      {% else %}
        <p>
          <strong>Date:</strong>
          {{ event.date }}
        </p>
      {% endif %}

      <p>
        <strong>Venue:</strong>
        {{ event.venue }}
      </p>

      {% if event.status == "upcoming" %}

        <p>
          <strong>Registration:</strong>

          {% if event.registration_link %}
            <a href="{{ event.registration_link }}">
              Click here
            </a>
          {% else %}
            To be confirmed
          {% endif %}
        </p>

      {% endif %}

    </div>

    <hr style="border-top: 1px solid {{ site.ukdlc_color_grey }};">

  </div>

{% endfor %}

</div>