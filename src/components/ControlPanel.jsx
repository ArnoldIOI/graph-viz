import React from 'react';
import { Trash2, Upload, ZoomIn, ZoomOut } from 'lucide-react';

const ControlPanel = ({ baseUri, setBaseUri, onFileUpload, onDelete, onZoom, isDeleteDisabled }) => {
    return (
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
                    onChange={onFileUpload}
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
                    onClick={onDelete}
                    className="flex items-center justify-center w-full bg-red-700 hover:bg-red-600 text-black font-semibold py-2 px-4 rounded transition duration-300 ease-in-out glow-button mb-2"
                    disabled={isDeleteDisabled}
                >
                    <Trash2 size={24} />
                    <span className="ml-2">Delete Selected</span>
                </button>
                <div className="flex justify-between">
                    <button
                        onClick={() => onZoom(1.2)}
                        className="flex items-center justify-center bg-blue-700 hover:bg-blue-600 text-black font-semibold py-2 px-4 rounded transition duration-300 ease-in-out glow-button"
                    >
                        <ZoomIn size={24} />
                    </button>
                    <button
                        onClick={() => onZoom(0.8)}
                        className="flex items-center justify-center bg-blue-700 hover:bg-blue-600 text-black font-semibold py-2 px-4 rounded transition duration-300 ease-in-out glow-button"
                    >
                        <ZoomOut size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ControlPanel;