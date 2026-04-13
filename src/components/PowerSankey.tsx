import React, { useMemo, useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';

interface PowerSankeyProps {
  solarPower: number;
  batteryPower: number; // Positive = discharging, Negative = charging
  loadPower: number;
  width?: number;
  height?: number;
}

interface NodeData {
  name: string;
  id: string;
}

interface LinkData {
  source: string;
  target: string;
  value: number;
  color: string;
}

export const PowerSankey: React.FC<PowerSankeyProps> = ({
  solarPower,
  batteryPower,
  loadPower,
  width = 600,
  height = 300,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [containerWidth, setContainerWidth] = useState(width);

  useEffect(() => {
    if (!svgRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    observer.observe(svgRef.current.parentElement!);
    return () => observer.disconnect();
  }, []);

  const data = useMemo(() => {
    const nodes: NodeData[] = [
      { id: 'solar', name: 'Solar Array' },
      { id: 'battery', name: 'Battery Pack' },
      { id: 'load', name: 'Home Load' },
    ];

    const links: LinkData[] = [];

    // Logic: 
    // If batteryPower < 0 (charging): Solar -> Battery AND Solar -> Load
    // If batteryPower > 0 (discharging): Solar -> Load AND Battery -> Load
    
    if (batteryPower < 0) {
      // Charging
      const chargingPower = Math.abs(batteryPower);
      if (solarPower > 0) {
        links.push({
          source: 'solar',
          target: 'battery',
          value: chargingPower,
          color: 'url(#grad-solar-battery)',
        });
        links.push({
          source: 'solar',
          target: 'load',
          value: Math.max(0.1, solarPower - chargingPower),
          color: 'url(#grad-solar-load)',
        });
      }
    } else {
      // Discharging
      if (solarPower > 0) {
        links.push({
          source: 'solar',
          target: 'load',
          value: solarPower,
          color: 'url(#grad-solar-load)',
        });
      }
      if (batteryPower > 0) {
        links.push({
          source: 'battery',
          target: 'load',
          value: batteryPower,
          color: 'url(#grad-battery-load)',
        });
      }
    }

    // Ensure at least some value for d3-sankey to not crash if all are 0
    if (links.length === 0) {
      links.push({ source: 'solar', target: 'load', value: 0.001, color: 'transparent' });
    }

    return { nodes, links };
  }, [solarPower, batteryPower, loadPower]);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const margin = { top: 20, right: 80, bottom: 20, left: 80 };
    const innerWidth = containerWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const sankeyGenerator = sankey<NodeData, LinkData>()
      .nodeId((d) => d.id)
      .nodeWidth(15)
      .nodePadding(40)
      .extent([
        [0, 0],
        [innerWidth, innerHeight],
      ]);

    const { nodes, links } = sankeyGenerator({
      nodes: data.nodes.map((d) => ({ ...d })),
      links: data.links.map((d) => ({ ...d })),
    });

    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Gradients
    const defs = svg.append('defs');
    
    const solarLoadGrad = defs.append('linearGradient').attr('id', 'grad-solar-load');
    solarLoadGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fbbf24'); // Yellow
    solarLoadGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f97316'); // Orange

    const solarBatteryGrad = defs.append('linearGradient').attr('id', 'grad-solar-battery');
    solarBatteryGrad.append('stop').attr('offset', '0%').attr('stop-color', '#fbbf24');
    solarBatteryGrad.append('stop').attr('offset', '100%').attr('stop-color', '#10b981'); // Emerald

    const batteryLoadGrad = defs.append('linearGradient').attr('id', 'grad-battery-load');
    batteryLoadGrad.append('stop').attr('offset', '0%').attr('stop-color', '#10b981');
    batteryLoadGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f97316');

    // Links
    g.append('g')
      .attr('fill', 'none')
      .selectAll('path')
      .data(links)
      .enter()
      .append('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', (d) => d.color)
      .attr('stroke-width', (d) => Math.max(1, d.width || 0))
      .attr('opacity', 0.6)
      .on('mouseover', function() { d3.select(this).attr('opacity', 0.9); })
      .on('mouseout', function() { d3.select(this).attr('opacity', 0.6); });

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .enter()
      .append('g');

    node.append('rect')
      .attr('x', (d) => d.x0 || 0)
      .attr('y', (d) => d.y0 || 0)
      .attr('height', (d) => (d.y1 || 0) - (d.y0 || 0))
      .attr('width', (d) => (d.x1 || 0) - (d.x0 || 0))
      .attr('fill', (d) => {
        if (d.id === 'solar') return '#fbbf24';
        if (d.id === 'battery') return '#10b981';
        return '#f97316';
      })
      .attr('rx', 4);

    node.append('text')
      .attr('x', (d) => (d.x0 || 0) < innerWidth / 2 ? (d.x1 || 0) + 10 : (d.x0 || 0) - 10)
      .attr('y', (d) => ((d.y1 || 0) + (d.y0 || 0)) / 2)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => (d.x0 || 0) < innerWidth / 2 ? 'start' : 'end')
      .attr('fill', 'white')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-size', '12px')
      .text((d) => d.name);

    node.append('text')
      .attr('x', (d) => (d.x0 || 0) < innerWidth / 2 ? (d.x1 || 0) + 10 : (d.x0 || 0) - 10)
      .attr('y', (d) => ((d.y1 || 0) + (d.y0 || 0)) / 2 + 15)
      .attr('dy', '0.35em')
      .attr('text-anchor', (d) => (d.x0 || 0) < innerWidth / 2 ? 'start' : 'end')
      .attr('fill', 'rgba(255,255,255,0.5)')
      .attr('font-family', 'JetBrains Mono')
      .attr('font-size', '10px')
      .text((d) => `${Math.round(d.value || 0)}W`);

  }, [data, containerWidth, height]);

  return (
    <div className="w-full h-full min-h-[300px]">
      <svg
        ref={svgRef}
        width="100%"
        height={height}
        className="overflow-visible"
      />
    </div>
  );
};
