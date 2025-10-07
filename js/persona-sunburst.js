// Persona Vector Sunburst Visualization using D3.js
// Two-ring design: inner ring shows categories, outer ring shows individual traits
//
// DATA FORMATS SUPPORTED:
//
// 1. Flat Format (automatically grouped by Positive/Negative semantic traits):
//    {
//      empathy: -0.107,        // Negative value → "Non-empathic" (negative trait)
//      sociality: 0.075,       // Positive value → "Sociality" (positive trait)
//      supportiveness: -0.037, // Negative value → "Unsupportive" (negative trait)
//      sycophancy: 0.137,      // Positive value → "Sycophancy" (negative trait)
//      toxicity: -0.288        // Negative value → "Non-toxic" (positive trait)
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
// TRAIT POLARITY LOGIC:
// - Positive traits (empathy, sociality) → negative values become antonyms (non-empathic, antisocial)
// - Negative traits (toxicity, sycophancy) → negative values become positive antonyms (non-toxic)
// - Categories: "Positive Traits" (green) vs "Negative Traits" (red)
//
// VISUALIZATION DETAILS:
// - Inner ring: Colored categories with curved labels (Green=Positive, Red=Negative)
// - Category sizing: Angular size is proportional to number of traits in each category
// - Outer ring: Individual traits extending outward based on normalized values (0-100%)
// - Hover-to-reveal: No static labels - details shown in tooltips on hover
// - Enhanced hover effects: Segments brighten, enlarge, and show detailed tooltips
// - Interactive: Smooth hover transitions and click handlers
// - Animated: Fade-in animation on load
// - Clean design: "Hover to explore" hint in center guides users

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
    const radius = Math.min(width, height) / 2 - 20;

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
    const maxOuterRadius = radius * 0.98;

    // Add tooltip div
    const tooltip = d3.select('body').append('div')
        .attr('class', 'persona-sunburst-tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '12px 16px')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('font-size', '14px')
        .style('font-family', 'system-ui, -apple-system, sans-serif')
        .style('line-height', '1.6')
        .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)')
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
                Average: ${avgValue.toFixed(2)}<br/>
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
        // const textRadius = (innerRadius + middleRadius) / 2;
        // const pathId = `category-path-${catIndex}`;
        // const midAngle = (category.startAngle + category.endAngle) / 2;
        // const needsReverse = midAngle > Math.PI / 2 && midAngle < (3 * Math.PI / 2);

        // const arcPath = d3.arc()
        //     .innerRadius(textRadius)
        //     .outerRadius(textRadius)
        //     .startAngle(needsReverse ? category.endAngle : category.startAngle)
        //     .endAngle(needsReverse ? category.startAngle : category.endAngle);

        // g.append('path')
        //     .attr('id', pathId)
        //     .attr('d', arcPath)
        //     .style('fill', 'none');

        // Category label on curved path
        // g.append('text')
        //     .append('textPath')
        //     .attr('href', `#${pathId}`)
        //     .attr('startOffset', '50%')
        //     .attr('text-anchor', 'middle')
        //     .style('font-size', `${Math.max(14, radius * 0.04)}px`)
        //     .style('font-weight', 'bold')
        //     .style('fill', 'white')
        //     .style('letter-spacing', '0.5px')
        //     .style('pointer-events', 'none')
        //     .text(category.name);
    });

    // Draw item arcs (outer ring)
    categories.forEach(category => {
        const angleRange = category.endAngle - category.startAngle;
        const itemAngle = angleRange / category.items.length;

        category.items.forEach((item, index) => {
            const itemStartAngle = category.startAngle + index * itemAngle;
            const itemEndAngle = itemStartAngle + itemAngle;
            // Use raw values (0-2 range) directly for extension
            const extension = (item.value / 2) * (maxOuterRadius - middleRadius);
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

            // Add hover effects to items with enhanced visual feedback
            itemArc.on('mouseenter', function(event) {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 1)
                    .attr('stroke-width', 4)
                    .style('filter', 'brightness(1.1)');
                
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 1);
                
                const originalTraitInfo = item.originalTrait ? 
                    `<br/>Original: ${formatTraitName(item.originalTrait)}` : '';
                
                tooltip.html(`
                    <strong style="font-size: 16px;">${item.name}</strong><br/>
                    <span style="opacity: 0.9;">Category: ${category.name}</span>${originalTraitInfo}
                `)
                    .style('left', (event.pageX + 10) + 'px')
                    .style('top', (event.pageY - 28) + 'px');
            })
            .on('mouseleave', function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .style('opacity', 0.9)
                    .attr('stroke-width', 2)
                    .style('filter', 'none');
                
                tooltip.transition()
                    .duration(200)
                    .style('opacity', 0);
            })
            .on('click', function() {
                console.log('Clicked:', item.name, 'Value:', item.value);
            });
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

    // Add hover instruction
    // g.append('text')
    //     .attr('text-anchor', 'lower')
    //     .attr('dy', '2.8em')
    //     .style('font-size', `${Math.max(11, radius * 0.028)}px`)
    //     .style('fill', '#999')
    //     .style('font-style', 'italic')
    //     .text('Hover to explore');

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
        const categories = personaData.categories.map((cat, idx) => ({
            name: cat.name,
            color: cat.color || getDefaultColor(idx),
            startAngle: cat.startAngle,
            endAngle: cat.endAngle,
            items: cat.items.map(item => {
                // Use raw values directly, no scaling
                return {
                    name: item.name,
                    value: Math.abs(item.value), // Just use absolute value of raw data
                    rawValue: item.value
                };
            })
        }));
        
        // If angles aren't provided, calculate proportionally based on item counts
        const needsAngleCalculation = categories.some(cat => cat.startAngle === undefined || cat.endAngle === undefined);
        if (needsAngleCalculation) {
            const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
            let currentAngle = 0;
            categories.forEach((category) => {
                const proportion = category.items.length / totalItems;
                const angleRange = proportion * 2 * Math.PI;
                
                category.startAngle = currentAngle;
                category.endAngle = currentAngle + angleRange;
                currentAngle += angleRange;
            });
        }
        
        return categories;
    }

    // Group traits by positive vs negative semantic valuation
    const categoryMap = new Map();
    
    // Initialize two categories
    categoryMap.set('Positive Traits', {
        // name: 'Positive Traits',
        color: '#4CAF50', // Green for positive
        items: []
    });
    
    categoryMap.set('Negative Traits', {
        // name: 'Negative Traits',
        color: '#F44336', // Red for negative
        items: []
    });

    // Process each trait
    for (const [key, value] of Object.entries(personaData)) {
        // Get effective trait (handles antonyms for negative values)
        const effectiveTrait = getEffectiveTrait(key, value);
        
        // Determine which category to place it in
        const categoryName = effectiveTrait.isPositive ? 'Positive Traits' : 'Negative Traits';
        
        console.log(`  ${effectiveTrait.name}: API=${value.toFixed(3)}`);
        
        categoryMap.get(categoryName).items.push({
            name: effectiveTrait.name,
            value: effectiveTrait.absValue, // Use raw absolute value directly
            rawValue: value,
            originalTrait: key
        });
    }

    // Convert map to array, filter out empty categories, and assign angles
    const categories = Array.from(categoryMap.entries()).map(([name, cat]) => ({
        ...cat,
        name: name
    })).filter(cat => cat.items.length > 0);
    
    // Calculate total number of items across all categories
    const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
    
    // Assign angles proportional to the number of items in each category
    let currentAngle = 0;
    categories.forEach((category) => {
        const proportion = category.items.length / totalItems;
        const angleRange = proportion * 2 * Math.PI;
        
        category.startAngle = currentAngle;
        category.endAngle = currentAngle + angleRange;
        currentAngle += angleRange;
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
 * Trait polarity mapping: defines which traits are inherently positive or negative
 * and their antonyms
 * Limited to traits actually returned by the persona-vector API
 */
const TRAIT_POLARITY = {
    // Inherently positive traits (having them is good)
    empathy: { 
        positive: true, 
        antonym: 'non-empathic',
        antonymPositive: false 
    },
    sociality: { 
        positive: true, 
        antonym: 'antisocial',
        antonymPositive: false 
    },
    supportiveness: { 
        positive: true, 
        antonym: 'unsupportive',
        antonymPositive: false 
    },
    humor: { 
        positive: true, 
        antonym: 'humorless',
        antonymPositive: false 
    },
    warmth: { 
        positive: true, 
        antonym: 'cold',
        antonymPositive: false 
    },
    
    // Inherently negative traits (having them is bad)
    toxicity: { 
        positive: false, 
        antonym: 'non-toxic',
        antonymPositive: true 
    },
    sycophancy: { 
        positive: false, 
        antonym: 'non-sycophantic',
        antonymPositive: true 
    },
    deceptiveness: { 
        positive: false, 
        antonym: 'truthful',
        antonymPositive: true 
    },
    hallucination: { 
        positive: false, 
        antonym: 'accurate',
        antonymPositive: true 
    }
};

/**
 * Gets the effective trait name and polarity based on the value
 * @param {string} traitName - Original trait name
 * @param {number} value - Trait value
 * @returns {Object} - { name, isPositive, absValue }
 */
function getEffectiveTrait(traitName, value) {
    const traitKey = traitName.toLowerCase().replace(/[^a-z]/g, '');
    const traitInfo = TRAIT_POLARITY[traitKey];
    
    // If trait not in mapping, use default behavior
    if (!traitInfo) {
        return {
            name: traitName,
            isPositive: value >= 0,
            absValue: Math.abs(value)
        };
    }
    
    // If value is positive, use original trait
    if (value >= 0) {
        return {
            name: formatTraitName(traitName),
            isPositive: traitInfo.positive,
            absValue: value
        };
    }
    
    // If value is negative, use antonym
    return {
        name: formatTraitName(traitInfo.antonym),
        isPositive: traitInfo.antonymPositive,
        absValue: Math.abs(value)
    };
}

/**
 * Formats a trait name to be display-friendly
 * @param {string} name - Trait name
 * @returns {string} - Formatted name
 */
function formatTraitName(name) {
    return name
        .replace(/_/g, ' ')
        .replace(/-/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
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
        getDefaultColor,
        getEffectiveTrait,
        formatTraitName,
        TRAIT_POLARITY
    };
}

