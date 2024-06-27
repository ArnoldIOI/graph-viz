import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { Trash2, Upload, ZoomIn, ZoomOut } from 'lucide-react';
import * as $rdf from 'rdflib';
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force';
import { zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';
import { drag } from 'd3-drag';

const RDFGraphVisualization = () => {
    const [graph, setGraph] = useState({ nodes: [], links: [] });
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [baseUri, setBaseUri] = useState('http://example.org/');
    const simulationRef = useRef(null);
    const svgRef = useRef(null);
    const gRef = useRef(null);

    const loadRDF = useCallback((event) => {
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

    const dragBehavior = useMemo(() => {
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

    useEffect(() => {
        if (graph.nodes.length === 0) return;

        const width = 600;
        const height = 600;

        const simulation = forceSimulation(graph.nodes)
            .force('link', forceLink(graph.links).id(d => d.id).distance(100))
            .force('charge', forceManyBody().strength(-300))
            .force('center', forceCenter(width / 2, height / 2))
            .force('collide', forceCollide().radius(50))
            .force('bounds', () => {
                graph.nodes.forEach(node => {
                    node.x = Math.max(50, Math.min(width - 50, node.x));
                    node.y = Math.max(50, Math.min(height - 50, node.y));
                });
            });

        simulation.on('tick', () => {
            setGraph(currentGraph => ({
                nodes: [...currentGraph.nodes],
                links: [...currentGraph.links]
            }));
        });

        simulationRef.current = simulation;

        return () => simulation.stop();
    }, [graph.nodes, graph.links]);

    useEffect(() => {
        if (svgRef.current && gRef.current) {
            const svg = select(svgRef.current);
            const g = select(gRef.current);

            const zoomBehavior = zoom()
                .scaleExtent([0.1, 4])
                .on('zoom', (event) => {
                    g.attr('transform', event.transform);
                });

            svg.call(zoomBehavior);

            g.selectAll('.node').call(dragBehavior);
        }
    }, [graph, dragBehavior]);

    const handleNodeClick = useCallback((event, nodeId) => {
        event.stopPropagation();
        setSelectedNodes((prevSelected) => {
            if (prevSelected.includes(nodeId)) {
                return prevSelected.filter((id) => id !== nodeId);
            }
            return [...prevSelected.slice(-1), nodeId].slice(0, 2);
        });
        setSelectedConnection(null);
    }, []);

    const handleConnectionClick = useCallback((connectionId) => {
        setSelectedConnection(connectionId);
        setSelectedNodes([]);
    }, []);

    const deleteSelected = useCallback(() => {
        if (selectedConnection !== null) {
            setGraph(currentGraph => ({
                ...currentGraph,
                links: currentGraph.links.filter((_, index) => index !== selectedConnection)
            }));
            setSelectedConnection(null);
        } else if (selectedNodes.length > 0) {
            setGraph(currentGraph => ({
                nodes: currentGraph.nodes.filter(node => !selectedNodes.includes(node.id)),
                links: currentGraph.links.filter(link =>
                    !selectedNodes.includes(link.source.id) && !selectedNodes.includes(link.target.id)
                )
            }));
            setSelectedNodes([]);
        }
    }, [selectedConnection, selectedNodes]);

    const handleZoom = useCallback((scale) => {
        if (svgRef.current && gRef.current) {
            const svg = select(svgRef.current);
            const g = select(gRef.current);
            const currentTransform = zoomIdentity.scale(scale);
            svg.call(zoom().transform, currentTransform);
        }
    }, []);

    return (
        <div className="container mx-auto p-4 bg-black text-green-400 min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-center text-green-400 glow">RDF Graph Visualizer</h1>
            <div className="flex">
                <div className="w-60 pr-4">
                    <div className="border border-green-500 rounded-lg p-4 mb-4 bg-black bg-opacity-50 backdrop-blur-sm">
                        <input
                            type="text"
                            value={baseUri}
                            onChange={(e) => setBaseUri(e.target.value)}
                            placeholder="Base URI"
                            className="w-full p-2 border border-green-500 rounded mb-2 bg-black text-green-400 placeholder-green-700"
                        />
                        <input
                            type="file"
                            onChange={loadRDF}
                            accept=".ttl,.rdf,.n3"
                            className="hidden"
                            id="rdf-upload"
                        />
                        <label
                            htmlFor="rdf-upload"
                            className="flex items-center justify-center w-full bg-green-700 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded mb-2 transition duration-300 ease-in-out glow-button cursor-pointer"
                        >
                            <Upload size={24} />
                            <span className="ml-2">Load RDF</span>
                        </label>
                        <button
                            onClick={deleteSelected}
                            className="flex items-center justify-center w-full bg-red-700 hover:bg-red-600 text-black font-semibold py-2 px-4 rounded transition duration-300 ease-in-out glow-button mb-2"
                            disabled={!selectedConnection && selectedNodes.length === 0}
                        >
                            <Trash2 size={24} />
                            <span className="ml-2">Delete Selected</span>
                        </button>
                        <div className="flex justify-between">
                            <button
                                onClick={() => handleZoom(1.2)}
                                className="flex items-center justify-center bg-blue-700 hover:bg-blue-600 text-black font-semibold py-2 px-4 rounded transition duration-300 ease-in-out glow-button"
                            >
                                <ZoomIn size={24} />
                            </button>
                            <button
                                onClick={() => handleZoom(0.8)}
                                className="flex items-center justify-center bg-blue-700 hover:bg-blue-600 text-black font-semibold py-2 px-4 rounded transition duration-300 ease-in-out glow-button"
                            >
                                <ZoomOut size={24} />
                            </button>
                        </div>
                    </div>
                </div>
                <div className="flex-1 ml-4">
                    <div className="border border-green-500 rounded bg-black bg-opacity-50 backdrop-blur-sm shadow-lg shadow-green-500/50">
                        <svg ref={svgRef} width="600" height="600" className="bg-black">
                            <g ref={gRef}>
                                {graph.links.map((link, index) => (
                                    <g key={index}>
                                        <line
                                            x1={link.source.x}
                                            y1={link.source.y}
                                            x2={link.target.x}
                                            y2={link.target.y}
                                            stroke={selectedConnection === index ? "#f87171" : "#4ade80"}
                                            strokeWidth={selectedConnection === index ? "3" : "2"}
                                            onClick={() => handleConnectionClick(index)}
                                            className="cursor-pointer connection-line"
                                        />
                                        <text
                                            x={(link.source.x + link.target.x) / 2}
                                            y={(link.source.y + link.target.y) / 2}
                                            textAnchor="middle"
                                            fill="#4ade80"
                                            fontSize="12"
                                            fontWeight="500"
                                            pointerEvents="none"
                                            className="connection-text"
                                        >
                                            {link.label}
                                        </text>
                                    </g>
                                ))}
                                {graph.nodes.map((node) => (
                                    <g
                                        key={node.id}
                                        transform={`translate(${node.x || 0}, ${node.y || 0})`}
                                        className="node"
                                    >
                                        <circle
                                            r="30"
                                            fill={selectedNodes.includes(node.id) ? '#059669' : '#065f46'}
                                            stroke={selectedNodes.includes(node.id) ? '#4ade80' : '#34d399'}
                                            strokeWidth="2"
                                            onClick={(event) => handleNodeClick(event, node.id)}
                                            className="cursor-pointer node-circle"
                                        />
                                        <text
                                            textAnchor="middle"
                                            dy=".3em"
                                            fill="#4ade80"
                                            fontSize="14"
                                            fontWeight="500"
                                            pointerEvents="none"
                                            className="node-text"
                                        >
                                            {node.label}
                                        </text>
                                    </g>
                                ))}
                            </g>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RDFGraphVisualization;