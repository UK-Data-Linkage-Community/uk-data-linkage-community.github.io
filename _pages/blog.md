---
layout: page
title: Blog
permalink: /blog/
---

## Recent Posts
<dl>
    {% for post in site.posts limit:3 %}
    <article style="margin-bottom: 1.5em; padding: 1.2em; border-left: 3px solid {{ site.ukdlc_color_grey }}; background: #fafafa;">
      <h3 style="margin: 0 0 0.3em;">
        <a href="{{ post.url }}">{{ post.title }}</a>
      </h3>
      <small style="color: #888;">{{ post.date | date: "%B %-d, %Y" }}</small>
      <p style="margin: 0.8em 0 0.5em;">{{ post.excerpt | strip_html | truncate: 300 }}</p>
      <a href="{{ post.url }}">Read more →</a><br>
      <small>{{ post.content | number_of_words | divided_by: 200 | plus: 1 }} min read</small>
    </article>
    {% endfor %}
</dl>


## Historical Posts
<ul>
  {% for post in site.posts %}
    <li>
      <a href="{{ post.url }}">{{ post.date | date: "%Y-%m-%d" }}: {{ post.title }}</a>
    </li>
  {% endfor %}
</ul>
