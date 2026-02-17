# Useful Links
Useful links are stored in a single file: in `_data/links.yml`. 

Find the appropriate category in the file and add your link to its `links` list. If no suitable category exists, see [Adding a New Category](#adding-a-new-category) below.

```yaml
categories:
  - name: "Category Name"
    description: "A short description of what this category contains."
    links:
      - title: "Resource Title"
        url: "https://example.com"
        description: "One sentence about the resource and who it helps."
        icons: "fa-solid fa-icon-name"
```


## Fields

| Field         | Required | Type   | Description                                                           |
|---------------|----------|--------|-----------------------------------------------------------------------|
| `title`       | ✅       | string | Display name of the resource                                          |
| `url`         | ✅       | string | Full URL including `https://`                                         |
| `description` | ✅       | string | One sentence explaining what the resource is and who it's useful for  |
| `icons`       | ✅       | string | A [Font Awesome](https://fontawesome.com/icons) icon class string     |


## Choosing an Icon

Icons use Font Awesome class strings. Browse available icons at [fontawesome.com/icons](https://fontawesome.com/icons) and copy the class shown for your chosen icon. Some useful examples:

```
fa-solid fa-book     → a book for reading materials
fab fa-github        → the GitHub logo for code and dataset repositories
fab fa-python        → the python logo for python libraries and resources
fab fa-r-project     → the R language logo for R libraries and resources
```

## Adding a New Category

If your link doesn't belong in any existing category, add a new block at the end of the `categories` list:

```yaml
  - name: "Your New Category"
    description: "A short description of what belongs here."
    links:
      - title: ...
```

Open an issue first to discuss whether a new category is the right approach — it's often better to add to an existing one.