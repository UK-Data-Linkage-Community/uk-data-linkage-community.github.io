---
layout: post
title:  "UK DLC Workshop 1 Session 1 - Data Linkage in the UK: Current approaches and future directions"
date:   2026-03-02 12:00:00 +0000
event_id: "ukdlc-workshop-1-data-linkers"
---

> This post is part of the outputs for the UK DLC Workshop 1. {linked here}

The first session of the day was focused on highlighting the current landscape of data linkage in the UK, starting with three short talks from key contributors to the community, namely {Dr Mike Edwards} from the Secure eResearch Platform (SeRP), who was a main organiser and chair for the workshop, this was followed by {Josie Plachta} from the Office of National Statistics (ONS), and finally {Andy} from the Ministry of Justice (MoJ).

## {% include material-ref.html id="ukdlc-w1s1-mike-video" show="title" inline=true %}
{% include material-ref.html id="ukdlc-w1s1-mike-video" show="src, author" %}

## {% include material-ref.html id="ukdlc-w1s1-josie-video" show="title" inline=true %}
{% include material-ref.html id="ukdlc-w1s1-josie-video" show="src, author" %}

## {% include material-ref.html id="ukdlc-w1s1-andy-video" show="title" inline=true %}
{% include material-ref.html id="ukdlc-w1s1-andy-video" show="src, author" %}


All slides are availabe {here}

The talks followed an open discussion where the greater room was able to ask questions and share their own methodologies and thoughts on linkage. Below are the takeaways from the session.

### Interpretability matters more than algorithmic novelty

A clear matter of importance in the discussions was the rise of AI use throughout data science, in particular the use of LLMs. There was a general skepticism about opaque models being used for linkage, especially their accountability/auditability when dealing with sensitive real data. While some machine learning techniques like vector encoding and embedding methods are currently used in some contexts, deep methods remain a poor option for trust and reproducibility. It was argued that data linkage is not just a technical optimisation problem, but rather a governance and trust problem, and thus human-in-the-loop is always preferred.

### Existing pipelines survive because users trust them

A common frustration among the attending data linkers was that many clients/users prefer older deterministic systems over probabilistic methods, even when probabilistic systems have many strengths over deterministic ones. There is rationale behind this, deterministic systems offer greater stability, consistency, and explainability than probabilistic, no matter the latter's technical strengths. 

> "People would much rather the devil they know..."

This of course is only half of the story, but it is inevitable that organisations, especially public ones, will be risk-averse and prefer to stick to what they know works, even if 'better' results could be achieved with probabilistic options. The second workshop in this series will be focused on the perspective of data linkage users, with an aim to ascertain the needs and current understand of data linkage among users, and by extension, to identify the barriers to adopting the 'best' linkage model.

### Linkage quality is contextual

This naturally leads on to what is meant by the 'best' linkage model. It was generally agreed that linkage needs to be adapted to each use case.
