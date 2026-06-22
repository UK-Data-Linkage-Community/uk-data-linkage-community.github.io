### [Back to home](../README.md)

--- 
# Contributing Demos, Visualisations, and Exercises

Similar to other materials, items you wish to embed into posts or articles should be placed within `assets/materials/`. You may wish to place an exercise, a visualisation, or a downloadable exercise, each of these has its own dedicated folder: `/materials/demos/`, `/materials/visuals/`, and `/materials/exercises/`.

## Contributing visuals

`html` files are required for embedding static or interactive charts. To generate such files, we recommend using Python with the `plotly.express` library to create a baseline level of interactive encoding. Then writing as a `html` out. Below is an example of a basic scatter graph with interactive elements such as zoom options, information on hover, and animations:

```python
import plotly.express as px

df = ...

fig = px.scatter(
    df,
    x="sales",
    y="profit",
    color="region",
    animation_frame="year",
    hover_data=["region"],
    title="Sales vs Profit by Region"
)

# Saving the html:
fig.write_html(
    "my_chart.html",
    include_plotlyjs="cdn",
    full_html=False
)
```

Then 


{% assign demo = site.data.materials.items | where: "id", "example-demo" | first %}
{% include cards/material-card.html item=demo display="demo" %}