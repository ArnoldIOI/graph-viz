import React, { useState } from 'react';
import { useRDFParser } from '../hooks/useRDFParser';
import { useForceSimulation } from '../hooks/useForceSimulation';
import { useZoom } from '../hooks/useZoom';
import ControlPanel from './ControlPanel';
import GraphVisualization from './GraphVisualization';

const RDFGraphVisualization = () => {
    const [baseUri, setBaseUri] = useState('http://example.org/');
    const [graph, setGraph] = useState({ nodes: [], links: [] });
    const { loadRDF } = useRDFParser(baseUri);
    const { simulationRef, handleNodeDrag } = useForceSimulation(graph, setGraph);
    const { svgRef, gRef, handleZoom } = useZoom();

    const [selectedNodes, setSelectedNodes] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState(null);

    const handleFileUpload = (event) => {
        loadRDF(event, setGraph);
    };

    const handleNodeClick = (nodeId) => {
        setSelectedNodes((prevSelected) => {
            if (prevSelected.includes(nodeId)) {
                return prevSelected.filter((id) => id !== nodeId);
            }
            return [...prevSelected.slice(-1), nodeId].slice(0, 2);
        });
        setSelectedConnection(null);
    };

    const handleConnectionClick = (connectionId) => {
        setSelectedConnection(connectionId);
        setSelectedNodes([]);
    };

    const deleteSelected = () => {
        setGraph(currentGraph => {
            if (selectedConnection !== null) {
                return {
                    ...currentGraph,
                    links: currentGraph.links.filter((_, index) => index !== selectedConnection)
                };
            } else if (selectedNodes.length > 0) {
                return {
                    nodes: currentGraph.nodes.filter(node => !selectedNodes.includes(node.id)),
                    links: currentGraph.links.filter(link =>
                        !selectedNodes.includes(link.source.id) && !selectedNodes.includes(link.target.id)
                    )
                };
            }
            return currentGraph;
        });
        setSelectedConnection(null);
        setSelectedNodes([]);
    };

    return (
        <div className="container mx-auto p-4 bg-black text-green-400 min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-center text-green-400 glow">RDF Graph Visualizer</h1>
            <div className="flex">
                <ControlPanel
                    baseUri={baseUri}
                    setBaseUri={setBaseUri}
                    onFileUpload={handleFileUpload}
                    onDelete={deleteSelected}
                    onZoom={handleZoom}
                    isDeleteDisabled={!selectedConnection && selectedNodes.length === 0}
                />
                <GraphVisualization
                    graph={graph}
                    svgRef={svgRef}
                    gRef={gRef}
                    simulationRef={simulationRef}
                    onNodeDrag={handleNodeDrag}
                    onNodeClick={handleNodeClick}
                    onConnectionClick={handleConnectionClick}
                    selectedNodes={selectedNodes}
                    selectedConnection={selectedConnection}
                />
            </div>
        </div>
    );
};

export default RDFGraphVisualization;