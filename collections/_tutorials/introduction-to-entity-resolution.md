---
# ═══════════════════════════════════════════════════════════════════════════
# TUTORIAL FRONT MATTER — every field below is used somewhere (card grid,
# filters, or the tutorial page header). Copy this file to start a new one.
# ═══════════════════════════════════════════════════════════════════════════
layout: tutorial
type: tutorial               # keep this — used by the card grid/filters to tell tutorials apart from slides/video/etc.
title: "Introduction to Entity Resolution"
description: >
  A short teaser sentence shown on the card and at the top of the page —
  what this tutorial covers and who it's for.
tags:                        # free-text, lowercase-kebab-case — same tag
  - entity-resolution        # vocabulary as materials.yml, so filtering works
  - getting-started          # across both
audience_level: intro        # one of: intro | practitioner | advanced
authors:                     # ids from _data/people.yml
  - mike-edwards
date: 2026-09-15             # YYYY-MM-DD, shown on the card
# No permalink needed — the filename becomes the URL automatically:
# this file -> /resources/tutorials/introduction-to-entity-resolution/
---

<!--
  EXAMPLE / PLACEHOLDER CONTENT — replace everything below with the real
  tutorial. Ordinary markdown works here (headings, lists, code blocks,
  images); this file just demonstrates the front matter contributors need
  to fill in for a new tutorial to show up correctly on /resources/materials/.
-->

Entity resolution is the process of deciding which records — across one
dataset or many — refer to the same real-world entity: the same person,
organisation, or event, even when they're recorded slightly differently
each time.

## Why it's hard

Real-world data is messy. Names are misspelled, addresses change, dates get
mistyped, and the same person can appear under several different identifiers
across systems that were never designed to talk to each other.

## Where to go next

- Browse [Site Materials](/resources/materials/?tags=entity-resolution) tagged `entity-resolution` for slides and recordings from UK DLC workshops.
- See the [Useful Links](/resources/useful-links) page for tools and further reading.
