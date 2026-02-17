


## Contributing Blog Posts

Blog posts live in `collections/_posts/` as individual Markdown files.

### File Naming

```
YYYY-MM-DD-short_title.md
```
Use the post's publish date as the prefix, and use  lowercase letters and hyphens only (no spaces or special characters). For the short title, select a single, unique, and meaningful word for your post. This may be as simple as the first word of your full title, if it does not conflict with any same-day posts. The permalink generated for your post will be in the form of:

```
/blog/year/month/day/short_title/
```

### Frontmatter
Every post must begin with the following frontmatter block:

```yaml
---
layout: post
title:  "Your Post Title"
date:   YYYY-MM-DD HH:MM:SS +0000
categories: main
---
```
Where +0000 suffex refers to timezone. 


---

## Contributing Events

Events are stored in a single file: `_data/events.yml`.


Open this file and add your event under the correct `event_type` category. At this moment we have `workshops` and `showcases` as selectable categories.

### Structure Overview

The file is organised by event type. Each type contains a list of events:

```yaml
categories:
  - event_type: "workshops"  
    events:  
        - event_num:   
            title:  
            date:  
            use_provisional_date: true  
            registration_link:  
            venue:  
            description: >  
            Lorum ipsum  
```
### Fields

| Field                  | Required | Type    | Description                                                                                                                                                                                       |
|------------------------|----------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `event_num`            | ✅       | key     | A unique identifier for the event (e.g. `1`, `2`). Must be unique within its `event_type`.                                                                                                        |
| `title`                | ✅       | string  | Full name of the event                                                                                                                                                                            |
| `date`                 | ✅       | string  | Date in `YYYY-MM-DD` format is used for final dates, if provisional dates are being provided then provide the details you have (e.g. Q1 2027) and ensure `use_provisional_dates` is set to `true` |
| `use_provisional_date` | ✅       | boolean | `true` if the date is not yet confirmed; `false` if the date is confirmed                                                                                                                         |
| `registration_link`    | ✅       | string  | Full URL to the event registration or details page                                                                                                                                                |
| `venue`                | ✅       | string  | Venue name and location, or `"Online"` for virtual events                                                                                                                                         |
| `description`          | ✅       | string  | A short summary of the event. Use the `>` block scalar for multi-line text                                                                                                                        |

## Useful Links
Located in _data/links.yml

```yaml
categories:
  - name: "Tutorials and books"
    description: "Guides and tutorials for various topics in data linkage"
    links:
      - title:  
        url:  
        description:  
        icons: "fa-solid fa-book"

```
