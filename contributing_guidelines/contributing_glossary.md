### [Back to home](../README.md)

--- 
# Contributing Glossary Terms

The UK DLC site has an interactive glossary page for term discovery and disambiguation. There are three main components, the glossary list with attached search and filter abilities, a concept graph showing relations, and an interactive pipeline. Similar to other components of the website, data is stored in a yaml file located in  `_data/glossary.yml`.

## Pipeline

``` yml
- id: classification
    title: "Classification"
    summary: "Decide match, non-match, or possible-match status for each pair."
    methods:
      - name: "Rule-based"
        tags: ["model"]
        concepts: [deterministic_linkage, match_key]
        terms:
          - term: "Threshold"
            definition: "Cutoff for classification."
            tags: ["core"]
      - name: "Probabilistic"
        tags: ["model"]
        concepts: [probabilistic_linkage, fellegi_sunter, weight, agreement_pattern]
        terms:
          - term: "Fellegi-Sunter Model"
            definition: "Probabilistic linkage framework."
            tags: ["probabilistic", "model"]
```


```yaml
items:
  - id: "ukdlc-w1s1-mike-slides"
    title: "SeRP's current practices"
    event_id: "ukdlc-workshop-1-data-linkers"
    type: "slides"
    authors:
      - "mike-edwards"
    tags:
      - entity-resolution
      - probabilistic-matching
    src: "/assets/materials/slides/UKDLC_W1S1_SeRP.pdf"
    caption: >
      Mike Edwards's slides on the current practices within SERP on data linkage.
```