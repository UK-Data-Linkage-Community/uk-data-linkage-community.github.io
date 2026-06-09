---
layout: post
title:  "UK DLC Workshop 1 Session 4 - Reviewing Linkage Quality"
date:   2026-03-02 12:00:00 +0000
event_id: "ukdlc-workshop-1-data-linkers"
---

For the final main session of the data linkers workshop, the focus was on how linkage can be analysed and communicated, including where and how we can trust our linkage, and importantly, the value in a standardised method for measuring quality. We again conducted a group exercise, this time to design a "minimum reporting standard" for linkage quality. The participants were asked to consider the following:  
<!--more-->

- Core required metrics
- Optional advanced metrics 
- Suggested visualisations
- Caveats and limitations
- Equality/bias checks  

Other important questions naturally came out of the discussions, such as if the linkage is fit for the intended purpose and what level of uncertainly is acceptable for the downstream use case? Immediately it became clear that a minimal report standard is just that, minimal, and that continuing to tailor ones quality review to the use case is still vital. 

### Minimum Metrics

The group broadly agreed that some form of baseline quality reporting should always exist, and that a selection of already widely used metrics and terms in the field are a suitable starting point. Namely:

- **Precision** - proportion of declared matches that are correct.
- **Recall** - proportion of true matches successfully identified.
- **Match rate** - percentage of records linked.
- **False positives / false negatives**

These alone were seen to be insufficient, and that stratified reporting is often necessary to fully explain the linkage quality. Reporting by demographic group, linkage threshold, match key, data source, or time period were all seen as candidate groupings to report on.

### Cluster-Based Linkage Metrics

Clustering and graph-based methods were seen as being modern and increasingly essential methodologies in the field and subsequently, cluster-based metrics were seen as being required to gain a more complete idea for the linkage.

- **Cluster completeness** - how well records belonging together are grouped
- **Cluster diversity/stability** - how clusters change under threshold adjustments
- **Bridge clusters** - records acting as connectors between clusters
- **“Funky clusters”** - internally inconsistent clusters, e.g. conflicting sex, impossible ages, multiple DOBs

The group, however, agreed that cluster evaluation methodology is still an evolving field, and as a consequence, there are a lack of, or somewhat open-ended definitions around the matter.

### Data Quality Before Linkage

In this session the group reaffirmed the impact of poor source data quality on the quality of the linkage, emphasising the value of profiling datasets _before_ linkage. Attendees highlighted missingness, uniqueness, duplicate records, and invalid or illogical values being common possible pre-linkage checks. One group focused heavily on metadata governance and interoperability, arguing that:  

> Without standardised metadata and semantic consistency, downstream linkage quality becomes unreliable.

Some of the mentioned standardisation ideas mentioned were the following:

- [FAIR principles](https://www.go-fair.org/fair-principles/)
- controlled vocabularies
- [SKOS vocabularies](https://csiro-enviro-informatics.github.io/info-engineering/skos-bp.html)
- semantic layers
- ontologies
- persistent identifiers (PIDs)
- lineage tracking

### Bias and Representativeness

One key discussion during this session was the difficulties in assessing bias in the context of linkage quality. For instance, among unlinked records there may be true negatives or there may be false negatives caused by linkage failure, as a result, simple "unlinked distribution" analysis can be misleading. Comparing linked distributions against known population distributions, stratified clerical reviews (by age, demographic, etc.), and sensitivity analysis were seen as appropriate directions to combating these issues. Participants did note however, that demographic stratification scales poorly due to the already high expense of clerical review.

### Visualisation and Reporting Interfaces

There was particular interest in ensuring linkage quality is made more understandable to non-specialists and in how to best achieve this. Visualisations were seen as a key method, and ideal visualisations were said to include:

- Waterfall charts
- Match-weight distributions
- Threshold histograms
- Cluster graphs
- Blocking diagnostics
- Flowcharts of linkage logic
- Error matrices

There was much debate about whether outputs should be static, dashboards, portals, or interactive "talk-to-data" interfaces. One attendee saw an ideal architecture consisting of semantic-layer-driven dashboards, natural language querying, and dynamic visualisation generation.

### Reporting Constraints and Realities

Several practical tensions emerged from discussions. Participants noted that the reality is that users can frequently ignore linkage documentation, assume linkage is perfect, or only revisit quality issues after publication. 

> People tend not to read the fine print, and standard reporting needs to address that reality. 

Funding was another important issue behind what a standard report might include. Not all organisations can perform clerical reviews, estimate recall robustly, or produce extensive diagnostics. The suggested solution to this was a tiered reporting framework, which would address distinct data quality tiers.

### Takeaway - Linkage Quality Reporting Standards
> #### A. Technical Performance Metrics
>
> Measure core system performance using standard evaluation metrics:
>
> - **Precision** — Accuracy of identified matches
> - **Recall** — Completeness of identified matches
> - **Match Rates** — Proportion of records successfully matched
> - **Error Matrices** — Analysis of false positives and false negatives
>
> ---
>
> #### B. Data Quality Assessment
>
> Evaluate the integrity and fitness of source data:
>
> - **Missingness** — Extent and patterns of missing data
> - **Duplicate Detection** — Identification of duplicate records
> - **Validation Checks** — Conformance to business and data rules
> - **Coverage & Timeliness** — Completeness and currency of available data
>
> ---
>
> #### C. Cluster & Graph Diagnostics
>
> Assess the behavior and stability of entity relationships:
>
> - **Cluster Consistency** — Internal coherence of clustered entities
> - **Threshold Sensitivity** — Impact of matching threshold changes
> - **Bridge Effects** — Detection of unintended links connecting clusters
>
> ---
>
> #### D. Bias & Fairness Assessment
>
> Where feasible, evaluate potential sources of bias:
>
> - **Stratified Analyses** — Performance across relevant subgroups
> - **Population Comparisons** — Comparison against expected population distributions
> - **Sensitivity Analyses** — Robustness of findings under alternative assumptions
>
> ---
>
> #### E. Limitations & Transparency
>
> Clearly communicate constraints and appropriate interpretation:
>
> - **Uncertainty** — Known sources of ambiguity or error
> - **Assumptions** — Key assumptions underlying methods and results
> - **Intended Use** — Appropriate use cases and decision contexts
> - **Validation Boundaries** — What cannot be verified or validated with available evidence