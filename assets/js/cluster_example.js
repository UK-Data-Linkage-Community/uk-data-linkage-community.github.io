document.addEventListener("DOMContentLoaded", () => {

  fetch('/assets/data/glossary.json')
    .then(res => res.json())
    .then(data => {

      console.log("DATA LOADED:", data);

      const elements = [];
      const nodeIds = new Set();

      // Create nodes
      data.forEach(term => {
        nodeIds.add(term.id);

        elements.push({
          data: {
            id: term.id,
            label: term.label,
            definition: term.definition
          }
        });
      });

      // Create edges (related)
      data.forEach(term => {
        (term.related || []).forEach(rel => {
          if (nodeIds.has(rel)) {
            elements.push({
              data: {
                id: `${term.id}-${rel}`,
                source: term.id,
                target: rel,
                type: "related"
              }
            });
          }
        });

        (term.conflicts || []).forEach(conf => {
          if (nodeIds.has(conf)) {
            elements.push({
              data: {
                id: `${term.id}-${conf}`,
                source: term.id,
                target: conf,
                type: "conflict"
              }
            });
          }
        });
      });

      console.log("ELEMENTS:", elements);

      const cy = cytoscape({
        container: document.getElementById('glossary-graph'),

        elements: elements,

        style: [
          {
            selector: 'node',
            style: {
              'label': 'data(label)',
              'background-color': 'var(--color-teal)',
              'color': '#fff',
              'text-valign': 'center',
              'text-halign': 'center',
              'font-size': '10px'
            }
          },
          {
            selector: 'edge[type="related"]',
            style: {
              'line-color': '#999',
              'width': 2
            }
          },
          {
            selector: 'edge[type="conflict"]',
            style: {
              'line-color': 'red',
              'width': 2,
              'line-style': 'dashed'
            }
          }
        ],

        layout: {
          name: 'cose',
          animate: true
        }
      });

      // Click interaction
      cy.on('tap', 'node', (evt) => {
        const node = evt.target.data();

        document.getElementById('term-detail').innerHTML = `
          <div class="term-card">
            <h2>${node.label}</h2>
            <p>${node.definition}</p>
          </div>
        `;
      });

    })
    .catch(err => {
      console.error("FAILED TO LOAD JSON:", err);
    });

});