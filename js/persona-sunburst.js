// Persona Vector Sunburst Visualization using D3.js
// Two-ring design: inner ring shows categories, outer ring shows individual traits
//
// DATA FORMATS SUPPORTED:
//
// 1. API Format (trait pairs with complementary values that sum to 1.0):
//    {
//      empathetic: 0.803,     // Trait value (0-1 range)
//      unempathetic: 0.197,   // Opposite trait (empathetic + unempathetic = 1.0)
//      encouraging: 0.672,    // Trait value
//      discouraging: 0.328,   // Opposite trait (encouraging + discouraging = 1.0)
//      social: 0.698,         // Trait value
//      antisocial: 0.302,     // Opposite trait (social + antisocial = 1.0)
//      toxic: 0.105,          // Negative trait value
//      respectful: 0.895      // Opposite trait (toxic + respectful = 1.0)
//    }
//    Note: Only the dominant trait (higher value) from each pair is displayed
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
        showPercentages: options.showPercentages !== false
    };

    // Clear any existing SVG in the container
    d3.select(`#${containerId}`).selectAll('*').remove();
    console.log('🧹 Cleared existing sunburst content');

    // Transform data into categories structure
    console.log('🔄 About to transform data to categories...');
    const categories = transformToCategories(personaData);
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
            // Use raw values (0-1 range) directly for extension
            const extension = item.value * (maxOuterRadius - middleRadius);
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
    console.log('🔍 transformToCategories called with:', personaData);
    
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
    const filteredData = filterDominantTraits(personaData);
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
 * Trait pairs mapping: defines opposite trait pairs returned by the API
 * Each pair's values sum to 1.0, and only the dominant trait is displayed
 */
const TRAIT_PAIRS = {
    empathetic: 'unempathetic',
    unempathetic: 'empathetic',
    encouraging: 'discouraging',
    discouraging: 'encouraging',
    social: 'antisocial',
    antisocial: 'social',
    casual: 'formal',
    formal: 'casual',
    honest: 'sycophantic',
    sycophantic: 'honest',
    funny: 'serious',
    serious: 'funny',
    accurate: 'hallucinatory',
    hallucinatory: 'accurate',
    respectful: 'toxic',
    toxic: 'respectful'
};

/**
 * Trait classification: defines which traits are inherently positive or negative
 * for categorization in the sunburst visualization
 */
const TRAIT_CLASSIFICATION = {
    // Positive traits (desirable characteristics)
    empathetic: true,
    encouraging: true,
    social: true,
    casual: true,
    honest: true,
    funny: true,
    accurate: true,
    respectful: true,
    
    // Negative traits (undesirable characteristics)
    unempathetic: false,
    discouraging: false,
    antisocial: false,
    formal: false,  // Context-dependent, but treating as neutral-negative
    sycophantic: false,
    serious: false, // Context-dependent, but treating as neutral-negative
    hallucinatory: false,
    toxic: false
};

/**
 * Filters trait pairs to keep only the dominant trait from each pair
 * Works with API format where trait pairs have complementary values (sum to 1.0)
 * @param {Object} personaData - Raw API data with trait pairs
 * @returns {Object} - Filtered data with only dominant traits
 */
function filterDominantTraits(personaData) {
    const processed = new Set();
    const result = {};
    
    for (const [traitName, value] of Object.entries(personaData)) {
        const traitKey = traitName.toLowerCase();
        
        // Skip if already processed as part of a pair
        if (processed.has(traitKey)) {
            continue;
        }
        
        // Check if this trait has a pair
        const oppositeTrait = TRAIT_PAIRS[traitKey];
        
        if (oppositeTrait && personaData[oppositeTrait] !== undefined) {
            // This is a trait pair - keep the dominant one (higher value)
            const oppositeValue = personaData[oppositeTrait];
            
            if (value >= oppositeValue) {
                result[traitName] = value;
            } else {
                result[oppositeTrait] = oppositeValue;
            }
            
            // Mark both as processed
            processed.add(traitKey);
            processed.add(oppositeTrait.toLowerCase());
        } else {
            // Not a paired trait, keep it as-is
            result[traitName] = value;
            processed.add(traitKey);
        }
    }
    
    return result;
}

/**
 * Gets the effective trait name and polarity based on the trait
 * @param {string} traitName - Original trait name from API
 * @param {number} value - Trait value (0-1 range)
 * @returns {Object} - { name, isPositive, absValue }
 */
function getEffectiveTrait(traitName, value) {
    const traitKey = traitName.toLowerCase();
    
    // Check if trait is in our classification
    const isPositive = TRAIT_CLASSIFICATION[traitKey];
    
    // If trait not in classification, use default (treat as positive)
    return {
        name: formatTraitName(traitName),
        isPositive: isPositive !== undefined ? isPositive : true,
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
        TRAIT_PAIRS,
        TRAIT_CLASSIFICATION
    };
}

