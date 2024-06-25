import React, { useState, useCallback } from 'react';
import Draggable from 'react-draggable';
import { PlusCircle, Link2, Trash2 } from 'lucide-react';

const GraphVisualization = () => {
    const [nodes, setNodes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [selectedNodes, setSelectedNodes] = useState([]);
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [nodeName, setNodeName] = useState('');
    const [connectionName, setConnectionName] = useState('');

    const addNode = useCallback(() => {
        if (nodeName.trim()) {
            const newNode = {
                id: Date.now(),
                x: Math.random() * 500,
                y: Math.random() * 300,
                label: nodeName.trim(),
            };
            setNodes((prevNodes) => [...prevNodes, newNode]);
            setNodeName('');
        }
    }, [nodeName]);

    const connectNodes = useCallback(() => {
        if (selectedNodes.length === 2 && connectionName.trim()) {
            const [source, target] = selectedNodes;
            const newConnection = { id: Date.now(), source, target, label: connectionName.trim() };
            setConnections((prevConnections) => [...prevConnections, newConnection]);
            setSelectedNodes([]);
            setConnectionName('');
        }
    }, [selectedNodes, connectionName]);

    const deleteSelected = useCallback(() => {
        if (selectedConnection) {
            setConnections((prevConnections) =>
                prevConnections.filter((conn) => conn.id !== selectedConnection)
            );
            setSelectedConnection(null);
        } else if (selectedNodes.length === 1) {
            const nodeToDelete = selectedNodes[0];
            setNodes((prevNodes) => prevNodes.filter((node) => node.id !== nodeToDelete));
            setConnections((prevConnections) =>
                prevConnections.filter((conn) => conn.source !== nodeToDelete && conn.target !== nodeToDelete)
            );
            setSelectedNodes([]);
        } else if (selectedNodes.length === 2) {
            const [node1, node2] = selectedNodes;
            setConnections((prevConnections) =>
                prevConnections.filter(
                    (conn) => !((conn.source === node1 && conn.target === node2) || (conn.source === node2 && conn.target === node1))
                )
            );
            setSelectedNodes([]);
        }
    }, [selectedConnection, selectedNodes]);

    const handleNodeClick = useCallback((nodeId) => {
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

    const handleDrag = useCallback((nodeId, e, data) => {
        setNodes((prevNodes) =>
            prevNodes.map((node) =>
                node.id === nodeId ? { ...node, x: data.x, y: data.y } : node
            )
        );
    }, []);

    return (
        <div className="container mx-auto p-4 bg-black text-green-400 min-h-screen">
            <h1 className="text-4xl font-bold mb-6 text-center text-green-400 glow">Graph Visualizer</h1>
            <div className="flex">
                <div className="w-60 pr-4">
                    <div className="border border-green-500 rounded-lg p-4 mb-4 bg-black bg-opacity-50 backdrop-blur-sm">
                        <button
                            onClick={addNode}
                            className="flex items-center justify-center w-full bg-green-700 hover:bg-green-600 text-black font-semibold py-2 px-4 rounded mb-2 transition duration-300 ease-in-out glow-button"
                        >
                            <PlusCircle size={24} />
                        </button>
                        <input
                            type="text"
                            value={nodeName}
                            onChange={(e) => setNodeName(e.target.value)}
                            placeholder="Node name"
                            className="w-full p-2 border border-green-500 rounded mb-2 bg-black text-green-400 placeholder-green-700"
                        />
                        <button
                            onClick={connectNodes}
                            className="flex items-center justify-center w-full bg-blue-700 hover:bg-blue-600 text-black font-semibold py-2 px-4 rounded mb-2 transition duration-300 ease-in-out glow-button"
                            disabled={selectedNodes.length !== 2}
                        >
                            <Link2 size={24} />
                        </button>
                        <input
                            type="text"
                            value={connectionName}
                            onChange={(e) => setConnectionName(e.target.value)}
                            placeholder="Connection name"
                            className="w-full p-2 border border-green-500 rounded mb-2 bg-black text-green-400 placeholder-green-700"
                        />
                        <button
                            onClick={deleteSelected}
                            className="flex items-center justify-center w-full bg-red-700 hover:bg-red-600 text-black font-semibold py-2 px-4 rounded transition duration-300 ease-in-out glow-button"
                            disabled={!selectedConnection && selectedNodes.length !== 1 && selectedNodes.length !== 2}
                        >
                            <Trash2 size={24} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 ml-4">
                    <div className="border border-green-500 rounded bg-black bg-opacity-50 backdrop-blur-sm shadow-lg shadow-green-500/50">
                        <svg width="100%" height="600" className="bg-black">
                            {connections.map((connection) => {
                                const sourceNode = nodes.find((node) => node.id === connection.source);
                                const targetNode = nodes.find((node) => node.id === connection.target);
                                if (sourceNode && targetNode) {
                                    const midX = (sourceNode.x + targetNode.x) / 2;
                                    const midY = (sourceNode.y + targetNode.y) / 2;
                                    return (
                                        <g key={connection.id}>
                                            <line
                                                x1={sourceNode.x}
                                                y1={sourceNode.y}
                                                x2={targetNode.x}
                                                y2={targetNode.y}
                                                stroke={selectedConnection === connection.id ? "#f87171" : "#4ade80"}
                                                strokeWidth={selectedConnection === connection.id ? "3" : "2"}
                                                onClick={() => handleConnectionClick(connection.id)}
                                                className="cursor-pointer connection-line"
                                            />
                                            <text
                                                x={midX}
                                                y={midY}
                                                textAnchor="middle"
                                                fill="#4ade80"
                                                fontSize="12"
                                                fontWeight="500"
                                                pointerEvents="none"
                                                className="connection-text"
                                            >
                                                {connection.label}
                                            </text>
                                        </g>
                                    );
                                }
                                return null;
                            })}
                            {nodes.map((node) => (
                                <Draggable
                                    key={node.id}
                                    position={{ x: node.x, y: node.y }}
                                    onDrag={(e, data) => handleDrag(node.id, e, data)}
                                >
                                    <g>
                                        <circle
                                            r="30"
                                            fill={selectedNodes.includes(node.id) ? '#059669' : '#065f46'}
                                            stroke={selectedNodes.includes(node.id) ? '#4ade80' : '#34d399'}
                                            strokeWidth="2"
                                            onClick={() => handleNodeClick(node.id)}
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
                                </Draggable>
                            ))}
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GraphVisualization;