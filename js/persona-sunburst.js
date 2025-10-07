// Persona Vector Sunburst Visualization using D3.js
// Two-ring design: inner ring shows categories, outer ring shows individual traits
//
// DATA FORMATS SUPPORTED:
//
// 1. Flat Format (automatically grouped by Big Five):
//    {
//      openness: 1.5,
//      conscientiousness: -0.5,
//      extraversion: 0.8,
//      agreeableness: 0.2,
//      neuroticism: -0.6
//    }
//
// 2. Custom Categories Format:
//    {
//      categories: [
//        {
//          name: "Category Name",
//          color: "#66BB6A",  // optional
//          startAngle: 0,     // optional
//          endAngle: 2.094,   // optional
//          scale: { min: -2, max: 2 },  // optional
//          items: [
//            { name: "Trait 1", value: 1.5 },
//            { name: "Trait 2", value: -0.3 }
//          ]
//        }
//      ]
//    }
//
// VISUALIZATION DETAILS:
// - Inner ring: Colored categories with curved labels
// - Outer ring: Individual traits extending outward based on normalized values (0-100%)
// - Tooltips: Show details on hover
// - Interactive: Hover effects and click handlers
// - Animated: Fade-in animation on load

/**
 * Creates a beautiful two-ring sunburst chart for persona vector data
 * @param {Object} personaData - Object containing categorized persona ratings or flat ratings
 * @param {string} containerId - The ID of the container element (without #)
 * @param {Object} options - Configuration options
 * @param {number} [options.width=900] - Width of the visualization
 * @param {number} [options.height=900] - Height of the visualization
 * @param {string} [options.centerLabel='Persona'] - Main center label
 * @param {string} [options.centerSubLabel='Vector'] - Sub-label in center
 * @param {boolean} [options.animate=true] - Whether to animate on load
 * @param {boolean} [options.showPercentages=true] - Whether to show percentages in labels
 * @returns {Function} Cleanup function to remove tooltip
 */
function createPersonaSunburst(personaData, containerId, options = {}) {
    // Default configuration
    const config = {
        width: options.width || 900,
        height: options.height || 900,
        centerLabel: options.centerLabel || 'Persona',
        centerSubLabel: options.centerSubLabel || 'Vector',
        animate: options.animate !== false,
        showPercentages: options.showPercentages !== false
    };

    // Clear any existing SVG in the container
    d3.select(`#${containerId}`).selectAll('*').remove();

    // Transform data into categories structure
    const categories = transformToCategories(personaData);

    // Set up dimensions
    const width = config.width;
    const height = config.height;
    // Use more of the available space - only leave small margin for labels
    const radius = Math.min(width, height) / 2 - 40;

    // Create SVG container that fills its container
    const svg = d3.select(`#${containerId}`)
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewBox', `0 0 ${width} ${height}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .attr('style', 'max-width: 100%; max-height: 100%;');

    // Create a group for the sunburst, offset to reduce top margin and increase bottom margin
    // Move center up in viewBox coordinates (reduces top space, increases bottom space)
    const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height * 0.42})`);

    // Define ring radii with better proportions
    const innerRadius = radius * 0.25;
    const middleRadius = radius * 0.50;
    const maxOuterRadius = radius * 0.95;

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

    // Draw category arcs (inner ring)
    categories.forEach((category, catIndex) => {
        const categoryArc = g.append('path')
            .attr('d', d3.arc()
                .innerRadius(innerRadius)
                .outerRadius(middleRadius)
                .startAngle(category.startAngle)
                .endAngle(category.endAngle)
            )
            .attr('fill', category.color)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('opacity', 0.9)
            .style('cursor', 'pointer');

        // Add hover effects to category
        categoryArc.on('mouseenter', function(event) {
            d3.select(this)
                .transition()
                .duration(200)
                .style('opacity', 1)
                .attr('stroke-width', 3);
            
            // Calculate average value for category
            const avgValue = category.items.reduce((sum, item) => sum + item.value, 0) / category.items.length;
            
            tooltip.transition()
                .duration(200)
                .style('opacity', 1);
            
            tooltip.html(`
                <strong>${category.name}</strong><br/>
                Average: ${avgValue.toFixed(1)}%<br/>
                Items: ${category.items.length}
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseleave', function() {
            d3.select(this)
                .transition()
                .duration(200)
                .style('opacity', 0.9)
                .attr('stroke-width', 2);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', 0);
        });

        // Create curved path for category label
        const textRadius = (innerRadius + middleRadius) / 2;
        const pathId = `category-path-${catIndex}`;
        const midAngle = (category.startAngle + category.endAngle) / 2;
        const needsReverse = midAngle > Math.PI / 2 && midAngle < (3 * Math.PI / 2);

        const arcPath = d3.arc()
            .innerRadius(textRadius)
            .outerRadius(textRadius)
            .startAngle(needsReverse ? category.endAngle : category.startAngle)
            .endAngle(needsReverse ? category.startAngle : category.endAngle);

        g.append('path')
            .attr('id', pathId)
            .attr('d', arcPath)
            .style('fill', 'none');

        // Category label on curved path
        g.append('text')
            .append('textPath')
            .attr('href', `#${pathId}`)
            .attr('startOffset', '50%')
            .attr('text-anchor', 'middle')
            .style('font-size', `${Math.max(14, radius * 0.04)}px`)
            .style('font-weight', 'bold')
            .style('fill', 'white')
            .style('letter-spacing', '0.5px')
            .style('pointer-events', 'none')
            .text(category.name);
    });

    // Draw item arcs (outer ring)
    categories.forEach(category => {
        const angleRange = category.endAngle - category.startAngle;
        const itemAngle = angleRange / category.items.length;

        category.items.forEach((item, index) => {
            const itemStartAngle = category.startAngle + index * itemAngle;
            const itemEndAngle = itemStartAngle + itemAngle;
            const extension = (item.value / 100) * (maxOuterRadius - middleRadius);
            const outerRadius = middleRadius + extension;

            // Item arc
            const itemArc = g.append('path')
                .attr('d', d3.arc()
                    .innerRadius(middleRadius)
                    .outerRadius(outerRadius)
                    .startAngle(itemStartAngle)
                    .endAngle(itemEndAngle)
                )
                .attr('fill', d3.color(category.color).brighter(index * 0.15))
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .style('opacity', 0.9)
                .style('cursor', 'pointer');

            // Add hover effects to items
            itemArc.on('mouseenter', function(event) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 1)
                    .attr('stroke-width', 3);
                
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);
                
                tooltip.html(`
                    <strong>${item.name}</strong><br/>
                    Category: ${category.name}<br/>
                    Value: ${item.value.toFixed(1)}%<br/>
                    ${item.rawValue !== undefined ? `Raw: ${item.rawValue.toFixed(3)}` : ''}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseleave', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9)
                    .attr('stroke-width', 2);
                
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0);
            })
            .on('click', function() {
                console.log('Clicked:', item.name, 'Value:', item.value);
            });

            // Item label
            const labelAngle = (itemStartAngle + itemEndAngle) / 2;
            const labelRadius = middleRadius + extension / 2;
            const labelText = config.showPercentages ? 
                `${item.name} (${Math.round(item.value)}%)` : 
                item.name;

            g.append('text')
                .attr('transform', `rotate(${labelAngle * 180 / Math.PI - 90}) translate(${labelRadius},0) rotate(${labelAngle < Math.PI ? 0 : 180})`)
                .attr('text-anchor', 'middle')
                .attr('dy', '0.35em')
                .style('font-size', `${Math.max(10, radius * 0.025)}px`)
                .style('fill', '#222')
                .style('pointer-events', 'none')
                .text(labelText);
        });
    });

    // Center circle
    g.append('circle')
        .attr('r', innerRadius)
        .attr('fill', 'white')
        .attr('stroke', '#ccc')
        .attr('stroke-width', Math.max(3, radius * 0.01));

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '-0.5em')
        .style('font-size', `${Math.max(16, radius * 0.045)}px`)
        .style('font-weight', 'bold')
        .style('fill', '#333')
        .text(config.centerLabel);

    g.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '1.2em')
        .style('font-size', `${Math.max(14, radius * 0.038)}px`)
        .style('fill', '#666')
        .text(config.centerSubLabel);

    // Animate on load
    if (config.animate) {
        g.selectAll('path')
            .attr('opacity', 0)
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
 * Transforms persona vector data into categories structure for two-ring sunburst
 * @param {Object} personaData - Object with categorized persona ratings or flat ratings
 * @returns {Array} - Array of category objects with items
 */
function transformToCategories(personaData) {
    // Check if data is already in categories format
    if (personaData.categories && Array.isArray(personaData.categories)) {
        return personaData.categories.map((cat, idx) => ({
            name: cat.name,
            color: cat.color || getDefaultColor(idx),
            startAngle: cat.startAngle || (idx * 2 * Math.PI / personaData.categories.length),
            endAngle: cat.endAngle || ((idx + 1) * 2 * Math.PI / personaData.categories.length),
            items: cat.items.map(item => ({
                name: item.name,
                value: normalizeValue(item.value, cat.scale || { min: -2, max: 2 }),
                rawValue: item.value
            }))
        }));
    }

    // If flat data, group into default Big Five categories
    const bigFiveMapping = {
        openness: { category: 'Openness', color: '#9C27B0' },
        conscientiousness: { category: 'Conscientiousness', color: '#2196F3' },
        extraversion: { category: 'Extraversion', color: '#FF9800' },
        agreeableness: { category: 'Agreeableness', color: '#4CAF50' },
        neuroticism: { category: 'Neuroticism', color: '#F44336' }
    };

    const categoryMap = new Map();

    // Group items by category
    for (const [key, value] of Object.entries(personaData)) {
        const keyLower = key.toLowerCase();
        let categoryInfo = null;

        // Try to match to Big Five
        for (const [trait, info] of Object.entries(bigFiveMapping)) {
            if (keyLower.includes(trait)) {
                categoryInfo = info;
                break;
            }
        }

        // Default to "Other Traits" if no match
        if (!categoryInfo) {
            categoryInfo = { category: 'Other Traits', color: '#757575' };
        }

        if (!categoryMap.has(categoryInfo.category)) {
            categoryMap.set(categoryInfo.category, {
                name: categoryInfo.category,
                color: categoryInfo.color,
                items: []
            });
        }

        const label = key.replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        categoryMap.get(categoryInfo.category).items.push({
            name: label,
            value: normalizeValue(value, { min: -2, max: 2 }),
            rawValue: value
        });
    }

    // Convert map to array and assign angles
    const categories = Array.from(categoryMap.values());
    const anglePerCategory = (2 * Math.PI) / categories.length;

    categories.forEach((category, idx) => {
        category.startAngle = idx * anglePerCategory;
        category.endAngle = (idx + 1) * anglePerCategory;
    });

    return categories;
}

/**
 * Normalizes a value from a given scale to 0-100 percentage
 * @param {number} value - The value to normalize
 * @param {Object} scale - Object with min and max properties
 * @returns {number} - Normalized value (0-100)
 */
function normalizeValue(value, scale = { min: -2, max: 2 }) {
    // Clamp value to scale
    const clampedValue = Math.max(scale.min, Math.min(scale.max, value));
    // Normalize to 0-100
    return ((clampedValue - scale.min) / (scale.max - scale.min)) * 100;
}

/**
 * Gets a default color for a category by index
 * @param {number} index - Category index
 * @returns {string} - Hex color code
 */
function getDefaultColor(index) {
    const colors = ['#9C27B0', '#2196F3', '#FF9800', '#4CAF50', '#F44336', '#757575'];
    return colors[index % colors.length];
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
        transformToCategories,
        normalizeValue,
        getDefaultColor
    };
}

