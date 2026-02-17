# Contributing Blog Posts

Blog posts live in `collections/_posts/` as individual Markdown files.

## File Naming

```
YYYY-MM-DD-short_title.md
```
Use the post's publish date as the prefix, and use  lowercase letters and hyphens only (no spaces or special characters). For the short title, select a single, unique, and meaningful word for your post. This may be as simple as the first word of your full title, if it does not conflict with any same-day posts. The permalink generated for your post will be in the form of:

```
/blog/year/month/day/short_title/
```

## Frontmatter
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