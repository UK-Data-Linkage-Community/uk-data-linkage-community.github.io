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
## Unpublished materials

An item can be added before its file or link exists — set `src: ""`. It still appears in the materials finder and can be referenced from posts; embeds show a "coming soon" panel. Fill in `src` when the file is committed or the video is on YouTube (any YouTube link form works, e.g. `https://youtu.be/VIDEO_ID`).

## Embedding materials in posts

Reference any item from `_data/materials.yml` by its `id`:

```liquid
{% include material.html id="ukdlc-w1s1-mike-video" display="window" %}
```

| `display` | Result |
|-----------|--------|
| `button` (default) | Pill with type icon + title; opens the details modal |
| `link` | Inline text link for mid-sentence use; opens the details modal |
| `card` | Full card, as on the materials page |
| `small` | Compact card |
| `window` | Inline player/viewer with a title bar |
| `full` | Full-width player/viewer with authors, description and actions |

Optional `text="..."` sets the label for `button` and `link` modes.
