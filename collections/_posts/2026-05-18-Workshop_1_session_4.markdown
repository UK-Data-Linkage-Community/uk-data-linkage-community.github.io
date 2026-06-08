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
- **Cluster error counts** - though participants noted definitions remain unresolved
