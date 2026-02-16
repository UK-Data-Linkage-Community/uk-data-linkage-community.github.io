---
layout: page
title: Blog
permalink: /blog/
---

## Recent Posts
<dl>
  {% for post in site.posts limit:2 %}
    <dt>
      <a href="{{ post.url }}">{{ post.date | date: "%Y-%m-%d" }}: {{ post.title }}</a> 
    </dt>
    <dd>
    {{ post.content }} 
    </dd>
    <hr style="border-top: 1px solid {{ site.ukdlc_color_grey }};"> 
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
