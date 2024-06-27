import { useCallback } from 'react';
import * as $rdf from 'rdflib';

export const useRDFParser = (baseUri) => {
    const loadRDF = useCallback((event, setGraph) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const data = e.target.result;
            const store = $rdf.graph();

            let contentType;
            if (file.name.endsWith('.ttl')) {
                contentType = 'text/turtle';
            } else if (file.name.endsWith('.rdf')) {
                contentType = 'application/rdf+xml';
            } else if (file.name.endsWith('.n3')) {
                contentType = 'text/n3';
            } else {
                console.error("Unsupported file type");
                return;
            }

            try {
                $rdf.parse(data, store, baseUri, contentType);

                const triples = store.statementsMatching(undefined, undefined, undefined, undefined);
                const nodes = new Set();
                const links = [];

                triples.forEach(triple => {
                    nodes.add(triple.subject.value);
                    nodes.add(triple.object.value);
                    links.push({
                        source: triple.subject.value,
                        target: triple.object.value,
                        label: triple.predicate.value.split('/').pop()
                    });
                });

                setGraph({
                    nodes: Array.from(nodes).map(node => ({ id: node, label: node.split('/').pop() })),
                    links: links
                });
            } catch (error) {
                console.error("Error parsing RDF:", error);
            }
        };
        reader.readAsText(file);
    }, [baseUri]);

    return { loadRDF };
};