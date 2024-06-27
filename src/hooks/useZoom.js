import { useRef, useEffect, useCallback } from 'react';
import { zoom, zoomIdentity } from 'd3-zoom';
import { select } from 'd3-selection';

export const useZoom = () => {
    const svgRef = useRef(null);
    const gRef = useRef(null);

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
        }
    }, []);

    const handleZoom = useCallback((scale) => {
        if (svgRef.current && gRef.current) {
            const svg = select(svgRef.current);
            const currentTransform = zoomIdentity.scale(scale);
            svg.call(zoom().transform, currentTransform);
        }
    }, []);

    return { svgRef, gRef, handleZoom };
};