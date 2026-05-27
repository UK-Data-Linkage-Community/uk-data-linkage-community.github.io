---
layout: post
title:  "UK DLC Workshop 1 Session 1 - Sharing Current Practices"
date:   2026-03-02 12:00:00 +0000
event_id: "ukdlc-workshop-1-data-linkers"
---

> This post is part of the outputs for the [UK DLC Workshop 1](/resources/materials/?event=ukdlc-workshop-1-data-linkers).

The first session of the day was focused on establishing the current practices and challenges amongst the attendees, starting with three short talks from key contributors to the community, namely Dr Mike Edwards from the Secure eResearch Platform (SeRP), who was a main organiser and chair for the workshop, this was followed by Josie Plachta from the Office of National Statistics (ONS), and finally {Andy} from the Ministry of Justice (MoJ).

{% assign event_videos = site.data.materials.items 
  | where: "event_id", "ukdlc-workshop-1-data-linkers"
  | where: "type", "video" %}
{% for item in event_videos %}
  {% include cards/material-card.html item=item display="embedded" %}
<br />
{% endfor %}

All slides are available [here](/resources/materials/?type=slides&event=ukdlc-workshop-1-data-linkers).

The talks were followed by an open discussion where the greater room was able to ask questions and share their own methodologies and thoughts on linkage. Below are the takeaways from the session.

### Interpretability matters more than algorithmic novelty

A clear matter of importance in the discussions was the rise of AI use throughout data science, in particular the use of LLMs. There was a general skepticism about opaque models being used for linkage, especially their accountability/auditability when dealing with sensitive real data. While some machine learning techniques like vector encoding and embedding methods are currently used in some contexts, deep methods remain a poor option for trust and reproducibility. It was argued that data linkage is not just a technical optimisation problem, but rather a governance and trust problem, and thus human-in-the-loop is always preferred.

### Existing pipelines survive because users trust them

A common frustration among the attending data linkers was that many clients/users prefer older deterministic systems over probabilistic methods, even when probabilistic systems have many strengths over deterministic ones. There is rationale behind this, deterministic systems offer greater stability, consistency, and explainability than probabilistic, no matter the latter's technical strengths. 

> "People would much rather the devil they know..."

This of course is only half of the story, but it is inevitable that organisations, especially public ones, will be risk-averse and prefer to stick to what they know works, even if 'better' results could be achieved with probabilistic options. The second workshop in this series will be focused on the perspective of data linkage users, aiming to ascertain the needs and understand among users of data linkage, and by extension, to identify the barriers to adopting the 'best' linkage model.

### Linkage quality is contextual

This naturally leads on to what is meant by the 'best' linkage model. It was generally agreed that linkage needs to be adapted to each use case, there is no 'one-size-fits-all'. Whilst many would see this question as being precision vs recall, it was argued that this is not the only element to consider in model choice. Other factors like considerations behind explainability, stability, temporal consistency, and operational latency vary between users and need to be well communicated in the consultation stage. 

