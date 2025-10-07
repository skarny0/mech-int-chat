// Persona Vector Sunburst Visualization using D3.js

/**
 * Creates a beautiful sunburst chart for persona vector data
 * @param {Object} personaData - Object containing persona ratings (e.g., {openness: 1.5, conscientiousness: -0.5, ...})
 * @param {string} containerId - The ID of the container element (without #)
 * @param {Object} options - Configuration options
 */
function createPersonaSunburst(personaData, containerId, options = {}) {
    // Default configuration
    const config = {
        width: options.width || 600,
        height: options.height || 600,
        innerRadius: options.innerRadius || 80,
        colorScheme: options.colorScheme || 'interpolateRainbow',
        showLabels: options.showLabels !== false,
        showValues: options.showValues !== false,
        animate: options.animate !== false
    };

    // Clear any existing SVG in the container
    d3.select(`#${containerId}`).selectAll('*').remove();

    // Transform flat persona data into hierarchical structure for sunburst
    const hierarchyData = transformToHierarchy(personaData);

    // Set up dimensions
    const radius = Math.min(config.width, config.height) / 2;

    // Create SVG container
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', config.width)
        .attr('height', config.height)
        .attr('viewBox', `0 0 ${config.width} ${config.height}`)
        .attr('style', 'max-width: 100%; height: auto;');

    // Create a group for the sunburst, centered
    const g = svg.append('g')
        .attr('transform', `translate(${config.width / 2},${config.height / 2})`);

    // Create hierarchy from data
    const root = d3.hierarchy(hierarchyData)
        .sum(d => d.value)
        .sort((a, b) => b.value - a.value);

    // Create partition layout
    const partition = d3.partition()
        .size([2 * Math.PI, radius]);

    partition(root);

    // Create color scale
    const colorScale = d3.scaleSequential()
        .domain([-2, 2])
        .interpolator(d3.interpolateRdYlGn);

    // Create arc generator
    const arc = d3.arc()
        .startAngle(d => d.x0)
        .endAngle(d => d.x1)
        .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
        .padRadius(radius / 2)
        .innerRadius(d => d.y0)
        .outerRadius(d => d.y1 - 1);

    // Add tooltip div
    const tooltip = d3.select('body').append('div')
        .attr('class', 'persona-sunburst-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.8)')
        .style('color', 'white')
        .style('padding', '10px')
        .style('border-radius', '5px')
        .style('pointer-events', 'none')
        .style('font-size', '14px')
        .style('z-index', '10000');

    // Create the sunburst slices
    const path = g.selectAll('path')
        .data(root.descendants().filter(d => d.depth > 0))
        .join('path')
        .attr('fill', d => {
            if (d.depth === 1) {
                // Use color based on actual rating value
                return colorScale(d.data.rating);
            }
            // For nested elements (if any), inherit parent color
            return colorScale(d.parent.data.rating);
        })
        .attr('fill-opacity', d => d.depth === 1 ? 0.9 : 0.7)
        .attr('d', arc)
        .style('cursor', 'pointer')
        .style('stroke', '#fff')
        .style('stroke-width', '2px');

    // Add interactivity
    path.on('mouseenter', function(event, d) {
        // Highlight the slice
        d3.select(this)
            .transition()
            .duration(200)
            .attr('fill-opacity', 1)
            .attr('stroke-width', '3px');

        // Show tooltip
        const value = d.data.rating !== undefined ? d.data.rating.toFixed(3) : '';
        const displayValue = d.data.displayValue || d.data.name;
        
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
        
        tooltip.html(`
            <strong>${d.data.name}</strong><br/>
            ${value ? `Value: ${value}<br/>` : ''}
            ${displayValue !== d.data.name ? `(${displayValue})` : ''}
        `)
            .style('left', (event.pageX + 10) + 'px')
            .style('top', (event.pageY - 28) + 'px');
    })
    .on('mouseleave', function(event, d) {
        // Reset the slice
        d3.select(this)
            .transition()
            .duration(200)
            .attr('fill-opacity', d => d.depth === 1 ? 0.9 : 0.7)
            .attr('stroke-width', '2px');

        // Hide tooltip
        tooltip.transition()
            .duration(200)
            .style('opacity', 0);
    })
    .on('click', function(event, d) {
        // Optional: Add click behavior (zoom, etc.)
        console.log('Clicked:', d.data.name, d.data.rating);
    });

    // Add labels for outer ring
    const labels = g.selectAll('text')
        .data(root.descendants().filter(d => d.depth === 1))
        .join('text')
        .attr('transform', d => {
            const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
            const y = (d.y0 + d.y1) / 2;
            return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
        })
        .attr('dy', '0.35em')
        .attr('text-anchor', d => {
            const x = (d.x0 + d.x1) / 2;
            return x < Math.PI ? 'start' : 'end';
        })
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .style('pointer-events', 'none')
        .text(d => config.showLabels ? d.data.name : '');

    // Add center circle with title
    const centerGroup = g.append('g')
        .attr('class', 'center-label');

    centerGroup.append('circle')
        .attr('r', config.innerRadius)
        .attr('fill', '#f8f9fa')
        .attr('stroke', '#dee2e6')
        .attr('stroke-width', '2px');

    centerGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .style('font-size', '18px')
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text('Persona');

    centerGroup.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1em')
        .style('font-size', '16px')
        .style('fill', '#666')
        .text('Vector');

    // Add legend
    const legend = svg.append('g')
        .attr('transform', `translate(20, 20)`);

    const legendData = [
        { label: 'Very Positive', value: 2 },
        { label: 'Positive', value: 1 },
        { label: 'Neutral', value: 0 },
        { label: 'Negative', value: -1 },
        { label: 'Very Negative', value: -2 }
    ];

    const legendItems = legend.selectAll('.legend-item')
        .data(legendData)
        .join('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('rect')
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => colorScale(d.value));

    legendItems.append('text')
        .attr('x', 20)
        .attr('y', 12)
        .style('font-size', '12px')
        .style('fill', '#333')
        .text(d => d.label);

    // Animate on load
    if (config.animate) {
        path.attr('opacity', 0)
            .transition()
            .duration(800)
            .attr('opacity', 1);
    }

    // Return cleanup function
    return function cleanup() {
        tooltip.remove();
    };
}

/**
 * Transforms flat persona vector data into hierarchical structure for sunburst
 * @param {Object} personaData - Flat object with persona ratings
 * @returns {Object} - Hierarchical data structure
 */
function transformToHierarchy(personaData) {
    const children = [];

    // Convert each persona dimension into a child node
    for (const [key, value] of Object.entries(personaData)) {
        // Normalize the value from -2 to 2 scale to positive values for sizing
        // We'll use the absolute value for size, but keep the original for color
        const normalizedValue = Math.abs(value) + 0.5; // Add 0.5 to ensure all slices are visible

        // Create a readable label from the key
        const label = key.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        children.push({
            name: label,
            value: normalizedValue,
            rating: value,
            displayValue: value.toFixed(3)
        });
    }

    return {
        name: 'Persona Vector',
        children: children
    };
}

/**
 * Updates an existing sunburst with new data (with animation)
 * @param {Object} personaData - New persona data
 * @param {string} containerId - Container element ID
 * @param {Object} options - Configuration options
 */
function updatePersonaSunburst(personaData, containerId, options = {}) {
    // For now, just recreate the sunburst
    // TODO: Implement smooth transition animation
    createPersonaSunburst(personaData, containerId, options);
}

// Export functions for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        createPersonaSunburst,
        updatePersonaSunburst,
        transformToHierarchy
    };
}

