import { useRef, useEffect, useMemo } from 'react';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { drag } from 'd3-drag';

export const useForceSimulation = (graph, setGraph) => {
    const simulationRef = useRef(null);

    useEffect(() => {
        if (graph.nodes.length === 0) return;

        const width = 600;
        const height = 600;

        const simulation = forceSimulation(graph.nodes)
            .force('link', forceLink(graph.links).id(d => d.id).distance(100))
            .force('charge', forceManyBody().strength(-300))
            .force('center', forceCenter(width / 2, height / 2))
            .force('collide', forceCollide().radius(50));

        simulation.on('tick', () => {
            setGraph(currentGraph => ({
                nodes: currentGraph.nodes.map(node => ({
                    ...node,
                    x: Math.max(50, Math.min(width - 50, node.x)),
                    y: Math.max(50, Math.min(height - 50, node.y))
                })),
                links: [...currentGraph.links]
            }));
        });

        simulationRef.current = simulation;

        return () => simulation.stop();
    }, [graph, setGraph]);

    const handleNodeDrag = useMemo(() => {
        const dragStarted = (event, d) => {
            if (!event.active) simulationRef.current?.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        };

        const dragged = (event, d) => {
            d.fx = event.x;
            d.fy = event.y;
        };

        const dragEnded = (event, d) => {
            if (!event.active) simulationRef.current?.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        };

        return drag()
            .subject(function(event, d) {
                return d;
            })
            .on('start', dragStarted)
            .on('drag', dragged)
            .on('end', dragEnded);
    }, []);

    return { simulationRef, handleNodeDrag };
};