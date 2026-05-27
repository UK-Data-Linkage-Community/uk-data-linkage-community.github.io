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

#### Clustering Failure Modes

On the topic of clustering, members point out the structual challenges of over-clustering when large groups are formed incorrectly (e.g. students, homeless populations), and under-clustering when a single person is split across multiple identities due to variation (e.g. "John" vs "Johnathan"). An important point, and a fundamental constraint of all linkage systems was said to be the asymmetry between splitting and merging clusters.

> Merging clusters is easy, splitting them later is extremely hard and costly


