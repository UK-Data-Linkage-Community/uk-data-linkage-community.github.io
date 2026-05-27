---
layout: post
title:  "UK DLC Workshop 1 Session 2 - Tricky Attributes and Edge Cases"
date:   2026-03-02 12:00:00 +0000
event_id: "ukdlc-workshop-1-data-linkers"
---

> This post is part of the outputs for the [UK DLC Workshop 1](/resources/materials/?event=ukdlc-workshop-1-data-linkers).

After establishing the current practices of the attendees in the [first session](/blog/2026/03/02/Workshop_1_session_1/), the second session of our first workshop was aimed at looking at the challenges practitioners face, what tricky or edge cases come up, and how the group approach them. Edge cases are not rare, but rather structurally embedded in real datasets, and lead to ambiguity, inconsistency, and fundamentally mistrust in linkage. 

In an open discussion, the group identified a number of tricky cases that they see come up not infrequently in their work. Included in these were:

- twins / multi-birth families
- shared households with identical names
- compound or changing names
- missing or deliberately falsified names
- nickname variation / aliasing
- inconsistent address reporting
- homeless or transient populations
- traveller communities without fixed postcodes
- institutional housing (e.g., universities) 

### Postcodes can be a weak identifier

Multiple people, especially the ONS, emphasized that postcodes were far from stable. Besides being semantically overloaded, they can represent a variety of states, including real addresses, placeholder values (e.g. "ZZ" codes), and missingness, mistakenly being encoded as defaults. The latter of these was considered as a critical issue within the ONS.

> $\text{Null postcodes} \neq \text{default "unknown" postcodes}$

This becomes a source of false clustering, misleading deduplication, and inflated clusters (especially for homelessness and communal living).

### Clustering Failure Modes

On the topic of clustering, members point out the structural challenges of over-clustering when large groups are formed incorrectly (e.g. students, homeless populations), and under-clustering when a single person is split across multiple identities due to variation (e.g. "John" vs "Johnathan"). An important point, and a fundamental constraint of all linkage systems was said to be the asymmetry between splitting and merging clusters.

> Merging clusters is easy, splitting them later is extremely hard and costly

### Methodological Discussions

Being that [Splink](https://moj-analytical-services.github.io/splink/index.html) was developed by the MoJ, who had attendees at this workshop, and which is a tool used by others attending, Splink's use as a tool for dealing with edge cases was highlighted. Splink was used by practitioners for probabilistic matching, clustering, threshold tuning, and linkage scoring, all in aid of dealing with edge cases. The [Unlinkables Chart](https://moj-analytical-services.github.io/splink/charts/unlinkables_chart.html) was also mentioned as a key tool for some for diagnosing matchability limits.

Participants discussed **running multiple thresholds** and comparing the downstream impacts. The idea being that linkage doesn't have to be a single model output, but rather it can be expressed as a spectrum of possible datasets.

A subtle but important point was made about the use of missingness as a design variable, in that missing data in not neutral, but instead, encodes behaviour, policy, and data collection bias.

### Governance and Organisational Constraints

**Lack of formal governance is a major bottleneck.**

A strong sentiment emerged in discussions around systems failing not due to modelling, but rather to organisational misalignment. Specifically, siloed departments, inconsistent standards, and inability to enforce system-wide linkage rules were identified as key issues.

> "... does it work? Well, my answer to that is probably not at the moment, but it really could work if we had the right support, the right governance."

A participant raised the point that reputational risks can sit on the analysts, not the system owners, and that there can be unclear accountability for linkage errors, which can lead to real downstream harm. In these cases, it may not be clear who should be held responsible, making it harder to address and prevent, as well as causing stress to all parties. This issue is compounded by the ambiguity caused if the users are unsure how to clearly define what "good" linkage means to them, and analysts are left to infer requirements. 

### Human-in-the-Loop Issues

Despite being one of the most important steps to dealing with edge cases, clerical review still has multiple limitations. Attendees expressed concerns that clerical review lacks a formalised "gold standard truth" and that by its nature, can never escape subjectivity, fatigue, and inconsistency when humans are involved. Reviewers may rush decisions or drift in judgement slightly, which can accumulate over time into significant noise and errors that reduce the final linkage quality. Attendees reiterated that LLMs are far from a complete solution to this, as they are subject to hallucinations and can be even harder to audit. There may be a place in the future for AI to be used for explainabilty, for surface level metadata interpretation, or for assisting clerical reviews, but no one believes AI could, or should replace humans in this area.
