import React from 'react';

const GraphVisualization = ({
                                graph,
                                svgRef,
                                gRef,
                                simulationRef,
                                onNodeDrag,
                                onNodeClick,
                                onConnectionClick,
                                selectedNodes,
                                selectedConnection,
                            }) => {
    return (
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
                                    onClick={() => onConnectionClick(index)}
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
                                    onClick={() => onNodeClick(node.id)}
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
    );
};

export default GraphVisualization;