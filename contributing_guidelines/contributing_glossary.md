### [Back to home](../README.md)

--- 
# Contributing Glossary Terms

The UK DLC site has an interactive glossary page for term discovery and disambiguation. There are three main components, the glossary term list with attached search and filter components, a concept graph showing relationships between terms, and an interactive pipeline. Similar to other components of the website, data is stored in a yaml file located in  `_data/glossary.yml`.

## Terminology

### Term list:

Located under `skos: concepts:`, terms are given an id, a preferred label, definition, and metadata. In the current build, terms are placed in loose tag-adjacent categories (commented), such as `# datatype`, based on the most relevant tag/category for the term. Although relevancy is subjective, we ask that contributors use their best judgement to stick to this organisation, as one objective of this system is to help in preventing duplication through easier searching.

Below is an example entry for the definition of graphs. The `id` should be a short unique reference to the term, multiple words are separated by underscores, but no other special characters should be used. The `prefLabel` is the preferred term being referenced in the entry, it should not be unnecessarily long or expansive, should only address one term or concept, and only in the singular if possible. With this glossary we are aiming to standardise terminology within the community, so divisive choices will be handled through respectful discussions. The definition should balance being accessible and being comprehensive. Within the definition you may use double braces (`{{id}}`) to link directly to any other term in the glossary. The `preLabel` will be inputted by the command, and as such will ideally be in the singular form, meaning you may need to put an _'s'_ outside the braces if the plural is needed. See below for an example.


``` yml
- id: graph
  prefLabel: Graph
  definition: A data structure or visual model representing relationships between entities ({{nodes}}) connected by {{edge}}s.
  tags: [datatype, visualisation]
  narrower: [node, edge]
  related: [chart, cluster, entity]
  conflicts: Graphs can be used to represent many concepts within data science, but they also see increasing use specifically within deep learning. As such, graphs may also refer to a deep, trainable network in some contexts.
      
- id: probabilistic_linkage
  prefLabel: Probabilistic Linkage
  altLabel: [Probabilistic Matching]
  definition: An evidence based approach to matching records. Takes data from across the entire dataset to determine matches based on using a threshold value instead of using concrete rules. Generally good for lower quality datasets where thresholds can be adjusted to account for errors or studies that don’t need to follow specific linkage requirements.
  tags: [method, probabilistic]
  narrower: [fellegi_sunter]
  related: [deterministic_linkage, comparisons, linkage_metrics, weight, splink]
```

`altLabel` is another category that can be used after `prefLabel`, contributors may place synonyms here. Generally these should be exact synonyms, being interchangable with the `prefLabel` to refer to the same concept.

The `conflicts` at this time are in the form of a description of how a term may be confused with concepts with the same (or very similar) name. This is not necessary for all terms, and again leans into the standardisation of terminology. This is not a space to criticise uses of other terms, and should be done respectfully.

### Concept graph:

The final two elements are `narrower` and `related`. Both of these are coded using term `id`, multiple may be place in square brackets and separated with commas. The latter of these elements, `realted`, is a space to state what ideas are similar in meaning, use case, field, etc. We would advise that contributors be selective with these, aiming to not exceed five related terms to prevent poor concept map generation. The former, `narrower`, is a space to describe hierarchy within terms. It works on a parent/child basis, and each term may have multiple of each. By stating a child term, the parent is automatically encoded. For instance, _'probabilistic linkage'_ can have the _'Fellegi-Sunter Model'_ as a child/narrower term as the Fellegi-Sunter model is an example of a probabilistic linkage model. Similarly, _'Entity Resolution'_ may have _'probabilistic linkage'_ as a narrower term, as probabilistic linkage is one broard/major approach to entity resolution. This automatically creates a path within the concept graph:

```
Entity Resolution -> Probabilistic Linkage -> Fellugi-Sunter Model
```



## Pipeline

The interactive pipeline is meant as a tool to familiarise linkage users with specific linkage processes. Similarly to other yamls, `id` should be a single unique word or phrase, using underscores to separate words. Both `title` and `summary` here are available to be made accessible for non-technical people, enabling them to understand the role of a particular step in the pipeline before looking more granularly.

The next step is to define substeps or `methods` within the pipeline step, again names should be made to be approachable whilst still being accurate. Each `method` can be given `tags` to help indicate greater detail and help with filtering. Finally, the `concepts` field is where we place glossary term `id`'s , separated by commas within square brackets. If the term does not exist yet in the term list then add it before you put it within the pipeline. The full term and description, with tags, will be inserted in the order that they are placed in the square brackets.

``` yml
- id: classification
  title: "Classification"
  summary: "Decide match, non-match, or possible-match status for each pair."
  methods:
    - name: "Rule-based"
      tags: ["model"]
      concepts: [deterministic_linkage, match_key]
    - name: "Probabilistic"
      tags: ["model"]
      concepts: [probabilistic_linkage, fellegi_sunter, weight, agreement_pattern]
```

## Tags:

Tags are used throughout the glossary and materials to signify relationships, help navigation, and generally simplify how users interact and understand with the website. 
We provide the following tags with short descriptions of there use:
- `probabilistic` - Probabilistic approaches to linkage, such as the Fellegi-Sunter model.
- `deterministic` - Deterministic approaches to linkage, for example, blocking rules.
- `method` - A methodology or approach to linkage.
- `tool` - A specific program, library, or assistant tool in performing linkage.
- `python` - A concept that is specific to the Python programming language.
- `datatype` - A term that directly refers to a datatype, structure, or format, both broadly such as 'graph' or more granularly, such as 'boolean' or 'edge'.
- `model` - Similar to `method`, but more focused on established set-ups, functions, and models.
- `comparison` - Relating to the comparison two or more entities, this can include similarity functions, 
- `evaluation` - Relating to the outputs of linkage, such as assessing or communicating quality or performance of a model.
- `visualisation` - Specifically terms connected to communicating information, possibly to end users.
- `privacy` - Methods and terms that contribute to privacy protection during linkage.

Using too many distinct tags mitigates their role in simplifying the glossary and helping navigation, and therefor we recommend that all tags should be broad in nature, and that adding new tags should be avoided when possible.