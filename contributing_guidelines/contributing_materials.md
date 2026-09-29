### [Back to home](../README.md)

--- 
# Contributing Materials

Contributing materials is currenly a work in progress. Below is basic details for allowing locally hosted materials to be incorporated in testing.

## Videos

The aim will be to have all videos hosted through YouTube. For the time being, we are using locally hosted videos that are trimmed and onverted to webm. We recommend ffmpeg for processing videos. Below is an example conversion command: 

```bash
ffmpeg -i original_video.mp4 -c:v libvpx-vp9 -crf 32 -b:v 0 -row-mt 1 -threads 8 -c:a libopus smoother_video.webm
```

## Schema

Below is the current schema for writing material metadata, this is subject to change.

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