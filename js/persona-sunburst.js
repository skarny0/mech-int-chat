// Persona Vector Sunburst Visualization using D3.js
// Two-ring design: inner ring shows categories, outer ring shows individual traits
//
// DATA FORMATS SUPPORTED:
//
// 1. API Format (hierarchical with trait pairs where one trait is active, other is 0):
//    {
//      empathy: {
//        empathetic: 0.803,   // Active trait (0-1 range)
//        unempathetic: 0      // Inactive trait (always 0)
//      },
//      encouraging: {
//        encouraging: 0.672,  // Active trait
//        discouraging: 0      // Inactive trait (always 0)
//      },
//      toxicity: {
//        toxic: 0,            // Inactive trait (always 0)
//        respectful: 0.895    // Active trait
//      }
//    }
//    Note: Only the non-zero trait from each pair is displayed
//
// 2. Custom Categories Format:
//    {
//      categories: [
//        {
//          name: "Category Name",
//          color: "#66BB6A",  // optional
//          startAngle: 0,     // optional
//          endAngle: 2.094,   // optional
//          items: [
//            { name: "Trait 1", value: 0.8 },
//            { name: "Trait 2", value: 0.3 }
//          ]
//        }
//      ]
//    }
//
// TRAIT CLASSIFICATION:
// - Positive traits (empathetic, encouraging, social, honest, etc.) → Green category
// - Negative traits (toxic, sycophantic, hallucinatory, etc.) → Red category
// - Values range from 0-1 (inactive traits marked with -1.0 are filtered out)
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
 * @param {number} [options.growthMultiplier=1.25] - Multiplier for bar extension (1.25 = bars grow 1.25x faster)
 * @param {boolean} [options.showLabels=true] - Whether to show perpendicular labels
 * @param {boolean} [options.oppositeLayout=true] - true = opposite traits π radians apart, false = mirrored along vertical
 * @returns {Function} Cleanup function to remove tooltip
 */
function createPersonaSunburst(personaData, containerId, options = {}) {
    console.log('🎨 createPersonaSunburst called for:', containerId);
    console.log('🎨 Received personaData:', personaData);
    console.log('🎨 Data type:', typeof personaData);
    console.log('🎨 Data keys:', personaData ? Object.keys(personaData) : 'null/undefined');
    console.log('🎨 First 3 entries:', personaData ? Object.entries(personaData).slice(0, 3) : 'none');
    
    // Default configuration
    const config = {
        width: options.width || 900,
        height: options.height || 900,
        centerLabel: options.centerLabel || 'Persona',
        centerSubLabel: options.centerSubLabel || 'Vector',
        animate: options.animate !== false,
        showPercentages: options.showPercentages !== false,
        growthMultiplier: options.growthMultiplier !== undefined ? options.growthMultiplier : 1.25,
        showLabels: options.showLabels !== false,
        oppositeLayout: options.oppositeLayout !== false // true = π radians apart, false = mirrored along vertical
    };

    // Clear any existing SVG in the container
    d3.select(`#${containerId}`).selectAll('*').remove();
    console.log('🧹 Cleared existing sunburst content');

    // Transform data into categories structure
    console.log('🔄 About to transform data to categories...');
    const categories = transformToCategories(personaData, config);
    console.log('✅ Transformed categories:', categories);

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

    // Create a group for the sunburst, positioned for visual centering
    // Account for labels extending outward and visual weight distribution
    const g = svg.append('g')
        .attr('transform', `translate(${width / 2},${height * 0.44})`);

    // Define ring radii with better proportions
    // Smaller inner circles give bars more room to grow and show activation differences
    const innerRadius = radius * 0.18;
    const middleRadius = radius * 0.35;
    const maxOuterRadius = radius * 0.85; // Maximum extent for arc growth

    // Get container position to calculate tooltip placement
    const container = document.getElementById(containerId);
    const containerRect = container.getBoundingClientRect();
    
    // Add tooltip div - positioned just to the right of the visualization
    const tooltip = d3.select('body').append('div')
        .attr('class', 'persona-sunburst-tooltip')
        .style('opacity', 0)
        .style('position', 'fixed')
        .style('top', `${containerRect.top + 20}px`)
        .style('left', `${containerRect.right + 20}px`)
        .style('background-color', 'rgba(0, 0, 0, 0.9)')
        .style('color', 'white')
        .style('padding', '12px 16px')
        .style('border-radius', '8px')
        .style('pointer-events', 'none')
        .style('font-size', '14px')
        .style('font-family', 'system-ui, -apple-system, sans-serif')
        .style('line-height', '1.6')
        .style('box-shadow', '0 4px 12px rgba(0, 0, 0, 0.3)')
        .style('z-index', '10000')
        .style('max-width', '250px');

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
            `);
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
        
        // Check if this is a hierarchical category with mirrored items
        const isHierarchical = category.isHierarchical && category.items.length === 2;
        
        if (isHierarchical) {
            // Mirrored layout: split the category angle in half
            // Positive trait (left half) | Negative trait (right half)
            // They extend outward in complementary/opposing positions
            const halfAngle = angleRange / 2;
            const midAngle = category.startAngle + halfAngle;
            
            category.items.forEach((item, index) => {
                // Index 0 (positive): left half of category (from start to mid)
                // Index 1 (negative): right half of category (from mid to end)
                const itemStartAngle = index === 0 ? category.startAngle : midAngle;
                const itemEndAngle = index === 0 ? midAngle : category.endAngle;
                
                // Color based on trait polarity
                const baseColor = item.isPositive ? '#4CAF50' : '#F44336';
                
                drawItemArc(g, item, itemStartAngle, itemEndAngle, middleRadius, maxOuterRadius, radius, config, category, tooltip, index, baseColor);
            });
        } else {
            // Standard layout: divide angle equally among items
            const itemAngle = angleRange / category.items.length;
            
            category.items.forEach((item, index) => {
                const itemStartAngle = category.startAngle + index * itemAngle;
                const itemEndAngle = itemStartAngle + itemAngle;
                
                drawItemArc(g, item, itemStartAngle, itemEndAngle, middleRadius, maxOuterRadius, radius, config, category, tooltip, index);
            });
        }
    });

    console.log('🎯 About to render center circle and avatar');
    
    // Center circle
    g.append('circle')
        .attr('r', innerRadius)
        .attr('fill', 'white')
        .attr('stroke', '#ccc')
        .attr('stroke-width', Math.max(3, radius * 0.01));

    // Add avatar image in center if available
    const selectedAvatar = localStorage.getItem('selectedAvatar') || window.selectedAvatar;
    console.log('🎭 Sunburst: Checking for avatar...', selectedAvatar);
    
    if (selectedAvatar) {
        console.log('✅ Sunburst: Avatar found, rendering:', selectedAvatar);
        // Create a circular clipping path for the avatar (relative to g's coordinate system)
        const clipId = `avatar-clip-${containerId}`;
        svg.append('defs')
            .append('clipPath')
            .attr('id', clipId)
            .append('circle')
            .attr('cx', 0)
            .attr('cy', 0)
            .attr('r', innerRadius * 0.85);
        
        // Add the avatar image (positioned relative to g's center which is at 0,0)
        g.append('image')
            .attr('href', selectedAvatar)
            .attr('x', -innerRadius * 0.85)
            .attr('y', -innerRadius * 0.85)
            .attr('width', innerRadius * 1.7)
            .attr('height', innerRadius * 1.7)
            .attr('clip-path', `url(#${clipId})`)
            .attr('preserveAspectRatio', 'xMidYMid slice')
            .style('pointer-events', 'none')
            .attr('transform', `translate(0, 0)`);
        
        console.log('✅ Sunburst: Avatar image added and centered at (0,0)');
    } else {
        console.log('⚠️ Sunburst: No avatar found, using text fallback');
        // Fallback to text if no avatar is selected
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
    }

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
 * Draws a single item arc with all its interactions and labels
 * @param {Object} g - D3 group element
 * @param {Object} item - Item data
 * @param {number} itemStartAngle - Start angle
 * @param {number} itemEndAngle - End angle
 * @param {number} middleRadius - Middle radius
 * @param {number} maxOuterRadius - Maximum outer radius
 * @param {number} radius - Base radius
 * @param {Object} config - Configuration object
 * @param {Object} category - Parent category
 * @param {Object} tooltip - D3 tooltip element
 * @param {number} index - Item index within category
 * @param {string} baseColor - Optional override for item color (for mirrored traits)
 */
function drawItemArc(g, item, itemStartAngle, itemEndAngle, middleRadius, maxOuterRadius, radius, config, category, tooltip, index, baseColor) {
    
    // Use raw values with a growth multiplier to make bars extend further
    // No transformation, just amplify the extension
    const growthMultiplier = config.growthMultiplier || 1.25; // Default 1.25x growth
    const extension = item.value * growthMultiplier * (maxOuterRadius - middleRadius);
    const outerRadius = middleRadius + extension;
    
    console.log(`  ${item.name}: value=${item.value.toFixed(3)}, multiplier=${growthMultiplier}x, extension=${extension.toFixed(1)}px`);

    // Determine fill color based on activation value
    // Higher activation = darker/more saturated, lower activation = lighter/less saturated
    // If baseColor provided (for mirrored traits), use it as base; otherwise use category color
    const baseColorToUse = baseColor ? baseColor : category.color;
    
    // Convert to HSL for better color control
    const baseHSL = d3.hsl(baseColorToUse);
    
    // Adjust lightness based on value: higher value = matches inner ring color, lower value = much lighter
    // Extreme range for very dramatic color differences
    const minLightness = 0.92; // Almost white at 0% activation
    const maxLightness = baseHSL.l; // Use the lightness of the inner ring color at 100% activation
    const lightness = minLightness - (item.value * (minLightness - maxLightness));
    
    const fillColor = d3.hsl(baseHSL.h, baseHSL.s, lightness);
    
    // Item arc
    const itemArc = g.append('path')
        .attr('d', d3.arc()
            .innerRadius(middleRadius)
            .outerRadius(outerRadius)
            .startAngle(itemStartAngle)
            .endAngle(itemEndAngle)
        )
        .attr('fill', fillColor)
        .attr('stroke', 'white')
        .attr('stroke-width', 2)
        .style('opacity', 0.9)
        .style('cursor', 'pointer');

    // Store reference for sister trait highlighting
    itemArc.attr('data-trait-name', item.name);
    if (item.oppositeTrait) {
        itemArc.attr('data-opposite-trait', item.oppositeTrait);
    }
    
    // Add hover effects to items with enhanced visual feedback
    itemArc.on('mouseenter', function(event) {
        d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 1)
            .attr('stroke-width', 4)
            .style('filter', 'brightness(1.1)');
        
        // Highlight the opposite trait if it exists
        if (item.oppositeTrait) {
            g.selectAll('path[data-trait-name]')
                .filter(function() {
                    return d3.select(this).attr('data-trait-name') === item.oppositeTrait;
                })
                .transition()
                .duration(200)
                .attr('stroke', '#2196F3')
                .attr('stroke-width', 4)
                .style('opacity', 0.5);
        }
        
        tooltip.transition()
            .duration(200)
            .style('opacity', 1);
        
        // Show activation percentage and opposite trait
        const activationPercent = (item.value * 100).toFixed(0);
        const oppositeTraitInfo = item.oppositeTrait ? 
            `<br/><span style="opacity: 0.8;">Opposite trait: ${item.oppositeTrait}</span>` : '';
        
        tooltip.html(`
            <strong style="font-size: 16px;">${item.name}</strong><br/>
            <span style="opacity: 0.9;">Activation: ${activationPercent}%</span>${oppositeTraitInfo}
        `);
    })
    .on('mouseleave', function() {
        d3.select(this)
            .transition()
            .duration(200)
            .style('opacity', 0.9)
            .attr('stroke-width', 2)
            .style('filter', 'none');
        
        // Reset ALL item arcs to white stroke (clears any lingering highlights)
        g.selectAll('path[data-trait-name]')
            .transition()
            .duration(200)
            .attr('stroke', 'white')
            .attr('stroke-width', 2)
            .style('opacity', 0.9);
        
        tooltip.transition()
            .duration(200)
            .style('opacity', 0);
    })
    .on('click', function() {
        console.log('Clicked:', item.name, 'Value:', item.value);
    });
    
    // Add label for this trait (if enabled)
    if (config.showLabels) {
        const midAngle = (itemStartAngle + itemEndAngle) / 2;
        
        // Position labels at a fixed distance from center (just beyond the middle ring)
        // This keeps them from extending too far out and exiting the container
        const labelRadius = middleRadius + (radius * 0.08);
        
        const labelX = Math.sin(midAngle) * labelRadius;
        const labelY = -Math.cos(midAngle) * labelRadius;
        
        // Calculate rotation to keep text radially oriented (pointing outward from center like spokes)
        // Convert angle to degrees and adjust so text reads outward from center
        let rotation = (midAngle * 180 / Math.PI) - 90;
        let textAnchor = 'start';
        
        // Check if label would be upside down (left half of circle: 90° to 270°)
        // After the -90 adjustment, check if the adjusted rotation makes text upside down
        if (rotation > 90 && rotation < 270) {
            // Flip the text 180° to keep it readable
            rotation += 180;
            textAnchor = 'end';
        }
        
        // Create text element with trait name and activation value
        const labelGroup = g.append('g')
            .attr('transform', `translate(${labelX}, ${labelY}) rotate(${rotation})`)
            .style('cursor', 'pointer')
            .style('pointer-events', 'all'); // Enable pointer events for hover
        
        const textElement = labelGroup.append('text')
            .attr('x', 0)
            .attr('y', 0)
            .attr('text-anchor', textAnchor)
            .attr('dominant-baseline', 'middle')
            .style('user-select', 'none');
        
        // Add trait name in black
        textElement.append('tspan')
            .style('font-size', `${Math.max(10, radius * 0.028)}px`)
            .style('font-weight', '500')
            .style('fill', '#333')
            .text(item.name);
        
        // Add activation value in smaller font
        textElement.append('tspan')
            .style('font-size', `${Math.max(8, radius * 0.022)}px`)
            .style('font-weight', '500')
            .style('fill', '#222')
            .text(` ${(item.value * 100).toFixed(0)}%`);
        
        // Add hover effects to label group that mirror the arc hover effects
        labelGroup.on('mouseenter', function(event) {
            // Trigger the arc hover effect
            itemArc.transition()
                .duration(200)
                .style('opacity', 1)
                .attr('stroke-width', 4)
                .style('filter', 'brightness(1.1)');
            
            // Highlight the opposite trait if it exists
            if (item.oppositeTrait) {
                g.selectAll('path[data-trait-name]')
                    .filter(function() {
                        return d3.select(this).attr('data-trait-name') === item.oppositeTrait;
                    })
                    .transition()
                    .duration(200)
                    .attr('stroke', '#2196F3')
                    .attr('stroke-width', 4)
                    .style('opacity', 0.5);
            }
            
            // Show tooltip
            tooltip.transition()
                .duration(200)
                .style('opacity', 1);
            
            // Show activation percentage and opposite trait
            const activationPercent = (item.value * 100).toFixed(0);
            const oppositeTraitInfo = item.oppositeTrait ? 
                `<br/><span style="opacity: 0.8;">Opposite trait: ${item.oppositeTrait}</span>` : '';
            
            tooltip.html(`
                <strong style="font-size: 16px;">${item.name}</strong><br/>
                <span style="opacity: 0.9;">Activation: ${activationPercent}%</span>${oppositeTraitInfo}
            `);
        })
        .on('mouseleave', function() {
            // Reset the arc
            itemArc.transition()
                .duration(200)
                .style('opacity', 0.9)
                .attr('stroke-width', 2)
                .style('filter', 'none');
            
            // Reset ALL item arcs to white stroke (clears any lingering highlights)
            g.selectAll('path[data-trait-name]')
                .transition()
                .duration(200)
                .attr('stroke', 'white')
                .attr('stroke-width', 2)
                .style('opacity', 0.9);
            
            // Hide tooltip
            tooltip.transition()
                .duration(200)
                .style('opacity', 0);
        });
    }
}

/**
 * Transforms persona vector data into categories structure for two-ring sunburst
 * @param {Object} personaData - Object with categorized persona ratings or flat ratings
 * @param {Object} config - Configuration object with layout options
 * @returns {Array} - Array of category objects with items
 */
function transformToCategories(personaData, config = {}) {
    console.log('🔍 transformToCategories called with:', personaData);
    
    // Check if data is in new hierarchical format (categories with sub-traits)
    if (isHierarchicalFormat(personaData)) {
        console.log('✅ Data is in hierarchical format (categories with sub-traits)');
        return transformHierarchicalData(personaData, config);
    }
    
    // Check if data is already in categories format
    if (personaData.categories && Array.isArray(personaData.categories)) {
        console.log('✅ Data already in categories format');
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

    // First, filter to keep only dominant traits from each pair
    console.log('🔄 Filtering dominant traits from:', personaData);
    const { filteredData, oppositeTraits } = filterDominantTraits(personaData);
    console.log('✅ Filtered dominant traits:', filteredData);
    console.log('✅ Number of filtered traits:', Object.keys(filteredData).length);
    
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
    for (const [key, value] of Object.entries(filteredData)) {
        // Get effective trait classification
        const effectiveTrait = getEffectiveTrait(key, value);
        
        // Determine which category to place it in
        const categoryName = effectiveTrait.isPositive ? 'Positive Traits' : 'Negative Traits';
        
        console.log(`  ${effectiveTrait.name}: ${value.toFixed(3)} (${categoryName})`);
        
        categoryMap.get(categoryName).items.push({
            name: effectiveTrait.name,
            value: effectiveTrait.absValue, // Use raw value directly (0-1 range)
            rawValue: value,
            originalTrait: key,
            oppositeTrait: oppositeTraits[key] ? formatTraitName(oppositeTraits[key]) : null
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
 * Checks if data is in hierarchical format (categories with sub-traits)
 * New API format: { empathy: { empathetic: 0.5, unempathetic: 0.3 }, ... }
 * @param {Object} data - Persona data
 * @returns {boolean} - True if hierarchical format
 */
function isHierarchicalFormat(data) {
    if (!data || typeof data !== 'object') return false;
    
    // Check if first-level values are objects (not numbers)
    const firstValue = Object.values(data)[0];
    return firstValue && typeof firstValue === 'object' && !Array.isArray(firstValue);
}

/**
 * Transforms hierarchical data into two super-categories: Positive and Negative
 * All positive traits on one side, all negative traits on the other
 * @param {Object} hierarchicalData - Data in format { category: { trait1: val1, trait2: val2 } }
 * @param {Object} config - Configuration object with layout options
 * @returns {Array} - Array with 2 super-categories (Positive and Negative)
 */
function transformHierarchicalData(hierarchicalData, config = {}) {
    console.log('🔄 Transforming hierarchical data...');
    const useOppositeLayout = config.oppositeLayout !== false; // default true
    
    const traitPairs = [];
    
    // Collect trait pairs with their complementary traits
    for (const [categoryName, traits] of Object.entries(hierarchicalData)) {
        const traitEntries = Object.entries(traits);
        
        if (traitEntries.length !== 2) {
            console.warn(`⚠️ Category "${categoryName}" doesn't have exactly 2 traits, skipping`);
            continue;
        }
        
        const [trait1Name, trait1Value] = traitEntries[0];
        const [trait2Name, trait2Value] = traitEntries[1];
        
        // Classify traits
        const trait1IsPositive = classifyTrait(trait1Name);
        const trait2IsPositive = classifyTrait(trait2Name);
        
        // Store as a pair
        const positiveTrait = trait1IsPositive ? 
            { name: formatTraitName(trait1Name), value: trait1Value, originalTrait: trait1Name } :
            { name: formatTraitName(trait2Name), value: trait2Value, originalTrait: trait2Name };
        
        const negativeTrait = !trait1IsPositive ? 
            { name: formatTraitName(trait1Name), value: trait1Value, originalTrait: trait1Name } :
            { name: formatTraitName(trait2Name), value: trait2Value, originalTrait: trait2Name };
        
        traitPairs.push({
            category: formatTraitName(categoryName),
            positive: positiveTrait,
            negative: negativeTrait
        });
        
        console.log(`  📁 ${categoryName}: ${positiveTrait.name}=${positiveTrait.value.toFixed(3)} (✅) ↔ ${negativeTrait.name}=${negativeTrait.value.toFixed(3)} (❌)`);
    }
    
    // Separate positive and negative items with configurable positioning
    const positiveItems = [];
    const negativeItems = [];
    
    const totalPairs = traitPairs.length;
    
    if (useOppositeLayout) {
        // OPPOSITE LAYOUT: Traits positioned π radians (180°) apart
        // - Positive traits: right semicircle (0° to 180°), evenly distributed
        // - Negative traits: left semicircle (180° to 360°), each exactly opposite its pair
        //
        // Example with 8 pairs:
        //   - Positive at ~11°, ~34°, ~56°, ~79°, ~101°, ~124°, ~146°, ~169°
        //   - Negative at ~191°, ~214°, ~236°, ~259°, ~281°, ~304°, ~326°, ~349°
        
        const angleStep = Math.PI / totalPairs;
        
        traitPairs.forEach((pair, index) => {
            // Positive trait: evenly distributed on right side (0° to 180°)
            const positiveAngle = angleStep * (index + 0.5);
            
            // Negative trait: exactly π radians opposite (180° away)
            const negativeAngle = positiveAngle + Math.PI;
        
        positiveItems.push({
            name: pair.positive.name,
            value: pair.positive.value,
            rawValue: pair.positive.value,
            originalTrait: pair.positive.originalTrait,
            oppositeTrait: pair.negative.name,  // Store opposite trait
            category: pair.category,
            isPositive: true,
            pairIndex: index,
            angle: positiveAngle
        });
        
        negativeItems.push({
            name: pair.negative.name,
            value: pair.negative.value,
            rawValue: pair.negative.value,
            originalTrait: pair.negative.originalTrait,
            oppositeTrait: pair.positive.name,  // Store opposite trait
            category: pair.category,
            isPositive: false,
            pairIndex: index,
            angle: negativeAngle
        });
        
            console.log(`  🔄 Pair ${index + 1}: ${pair.positive.name} at ${(positiveAngle * 180 / Math.PI).toFixed(1)}° ↔ ${pair.negative.name} at ${(negativeAngle * 180 / Math.PI).toFixed(1)}° (180° apart)`);
        });
    } else {
        // MIRRORED LAYOUT: Traits mirrored along 90° vertical axis
        // - Positive traits: right side of vertical (mirrored from 90°)
        // - Negative traits: left side of vertical (mirrored from 90°)
        //
        // Example: if pair has 15° offset:
        //   - Positive at 90° - 15° = 75° (right side)
        //   - Negative at 90° + 15° = 105° (left side)
        
        const mirrorAxis = Math.PI / 2; // 90° vertical axis
        const maxOffset = Math.PI / 2; // Maximum 90° offset from vertical
        const offsetStep = maxOffset / (totalPairs + 1);
        
        traitPairs.forEach((pair, index) => {
            const offset = offsetStep * (index + 1);
            
            // Positive trait: right side of 90° (clockwise, so subtract)
            const positiveAngle = mirrorAxis - offset;
            
            // Negative trait: left side of 90° (counter-clockwise, so add)
            const negativeAngle = mirrorAxis + offset;
            
            positiveItems.push({
                name: pair.positive.name,
                value: pair.positive.value,
                rawValue: pair.positive.value,
                originalTrait: pair.positive.originalTrait,
                oppositeTrait: pair.negative.name,
                category: pair.category,
                isPositive: true,
                pairIndex: index,
                angle: positiveAngle
            });
            
            negativeItems.push({
                name: pair.negative.name,
                value: pair.negative.value,
                rawValue: pair.negative.value,
                originalTrait: pair.negative.originalTrait,
                oppositeTrait: pair.positive.name,
                category: pair.category,
                isPositive: false,
                pairIndex: index,
                angle: negativeAngle
            });
            
            console.log(`  🔄 Pair ${index + 1}: ${pair.positive.name} at ${(positiveAngle * 180 / Math.PI).toFixed(1)}° ↔ ${pair.negative.name} at ${(negativeAngle * 180 / Math.PI).toFixed(1)}° (offset: ${(offset * 180 / Math.PI).toFixed(1)}°)`);
        });
    }
    
    // Sort items by angle for proper rendering order
    positiveItems.sort((a, b) => a.angle - b.angle);
    negativeItems.sort((a, b) => a.angle - b.angle);
    
    // Remove the temporary angle property before creating categories
    const cleanPositiveItems = positiveItems.map(({angle, ...item}) => item);
    const cleanNegativeItems = negativeItems.map(({angle, ...item}) => item);
    
    // Create two super-categories with clean split at vertical axis
    // Positive occupies right side, negative occupies left side
    const categories = [
        {
            name: 'Positive Traits',
            color: '#4CAF50', // Green
            startAngle: 0,
            endAngle: Math.PI, // Right side: 0° to 180°
            items: cleanPositiveItems,
            isHierarchical: false
        },
        {
            name: 'Negative Traits',
            color: '#F44336', // Red  
            startAngle: Math.PI,
            endAngle: 2 * Math.PI, // Left side: 180° to 360°
            items: cleanNegativeItems,
            isHierarchical: false
        }
    ];
    
    const layoutDescription = useOppositeLayout 
        ? 'opposite pairs π radians apart'
        : 'pairs mirrored along 90° vertical axis';
    console.log(`✅ Created 2 super-categories with ${layoutDescription}: ${positiveItems.length} positive traits (right side) and ${negativeItems.length} negative traits (left side)`);
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
 * Dynamically detect trait pairs from API response
 * Trait pairs are detected when two traits' values sum to approximately 1.0 (±0.01)
 * This allows the visualization to work with any trait pairs the API returns
 * @param {Object} personaData - Raw API data with traits
 * @returns {Object} - Map of trait to its opposite trait
 */
function detectTraitPairs(personaData) {
    const traitPairs = {};
    const processed = new Set();
    
    const traits = Object.keys(personaData);
    
    // Check each trait against all other traits to find pairs that sum to ~1.0
    for (let i = 0; i < traits.length; i++) {
        const trait1 = traits[i];
        if (processed.has(trait1)) continue;
        
        for (let j = i + 1; j < traits.length; j++) {
            const trait2 = traits[j];
            if (processed.has(trait2)) continue;
            
            const val1 = personaData[trait1];
            const val2 = personaData[trait2];
            const sum = val1 + val2;
            
            // If values sum to approximately 1.0 (±0.01), they're a pair
            if (Math.abs(sum - 1.0) < 0.01) {
                traitPairs[trait1] = trait2;
                traitPairs[trait2] = trait1;
                processed.add(trait1);
                processed.add(trait2);
                console.log(`🔗 Detected trait pair: ${trait1} (${val1.toFixed(3)}) ↔ ${trait2} (${val2.toFixed(3)}) = ${sum.toFixed(3)}`);
                break;
            }
        }
    }
    
    return traitPairs;
}

/**
 * Dynamically classify traits as positive or negative based on common patterns
 * Uses heuristics to determine if a trait is generally positive or negative
 * @param {string} traitName - Name of the trait
 * @returns {boolean} - true if positive, false if negative
 */
function classifyTrait(traitName) {
    const trait = traitName.toLowerCase();
    
    // Negative trait indicators (prefixes/contains)
    const negativeIndicators = [
        'un', 'dis', 'anti', 'in', // Negative prefixes
        'toxic', 'harmful', 'rude', 'aggressive', 'hostile',
        'sycophant', 'deceptive', 'dishonest', 'fake',
        'hallucinat', 'inaccurate', 'wrong', 'false',
        'boring', 'dull', 'cold', 'unfriendly'
    ];
    
    // Positive trait indicators (contains)
    const positiveIndicators = [
        'empath', 'kind', 'caring', 'warm', 'friendly',
        'encourag', 'support', 'help', 'positive',
        'social', 'outgoing', 'engaging',
        'honest', 'truthful', 'genuine', 'authentic',
        'funny', 'humorous', 'witty', 'playful',
        'accurate', 'correct', 'precise', 'factual',
        'respectful', 'polite', 'courteous',
        'creative', 'innovative', 'original',
        'casual', 'relaxed', 'easy'
    ];
    
    // Check for negative indicators
    for (const indicator of negativeIndicators) {
        if (trait.includes(indicator)) {
            return false;
        }
    }
    
    // Check for positive indicators
    for (const indicator of positiveIndicators) {
        if (trait.includes(indicator)) {
            return true;
        }
    }
    
    // Default to positive if no clear indicators (neutral traits)
    return true;
}

/**
 * Filters trait pairs to keep only the dominant trait from each pair
 * Dynamically detects pairs and filters - works with any traits the API returns
 * @param {Object} personaData - Raw API data with trait pairs
 * @returns {Object} - Object with filteredData (dominant traits) and oppositeTraits (mapping)
 */
function filterDominantTraits(personaData) {
    // First, dynamically detect trait pairs from the data
    const traitPairs = detectTraitPairs(personaData);
    console.log('🔍 Detected trait pairs:', traitPairs);
    
    const processed = new Set();
    const result = {};
    const oppositeTraits = {}; // Map to store opposite trait names
    
    for (const [traitName, value] of Object.entries(personaData)) {
        const traitKey = traitName.toLowerCase();
        
        // Skip if already processed as part of a pair
        if (processed.has(traitKey)) {
            continue;
        }
        
        // Check if this trait has a pair (using dynamically detected pairs)
        const oppositeTrait = traitPairs[traitName];
        
        if (oppositeTrait && personaData[oppositeTrait] !== undefined) {
            // This is a trait pair - keep the dominant one (higher value)
            const oppositeValue = personaData[oppositeTrait];
            
            if (value >= oppositeValue) {
                result[traitName] = value;
                oppositeTraits[traitName] = oppositeTrait; // Store opposite
                console.log(`  ✓ Keeping ${traitName} (${value.toFixed(3)}) over ${oppositeTrait} (${oppositeValue.toFixed(3)})`);
            } else {
                result[oppositeTrait] = oppositeValue;
                oppositeTraits[oppositeTrait] = traitName; // Store opposite
                console.log(`  ✓ Keeping ${oppositeTrait} (${oppositeValue.toFixed(3)}) over ${traitName} (${value.toFixed(3)})`);
            }
            
            // Mark both as processed
            processed.add(traitKey);
            processed.add(oppositeTrait.toLowerCase());
        } else {
            // Not a paired trait, keep it as-is
            result[traitName] = value;
            processed.add(traitKey);
            console.log(`  ℹ️ Non-paired trait: ${traitName} (${value.toFixed(3)})`);
        }
    }
    
    return { filteredData: result, oppositeTraits };
}

/**
 * Gets the effective trait name and polarity based on the trait
 * Dynamically classifies traits using heuristics
 * @param {string} traitName - Original trait name from API
 * @param {number} value - Trait value (0-1 range)
 * @returns {Object} - { name, isPositive, absValue }
 */
function getEffectiveTrait(traitName, value) {
    // Use dynamic classification instead of predefined list
    const isPositive = classifyTrait(traitName);
    
    return {
        name: formatTraitName(traitName),
        isPositive: isPositive,
        absValue: value
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
        filterDominantTraits,
        normalizeValue,
        getDefaultColor,
        getEffectiveTrait,
        formatTraitName,
        detectTraitPairs,
        classifyTrait
    };
}

