# Sunburst Scaling and Labels Enhancement

## New Features

### 1. **Value Scaling for Better Visibility** 📊
Small values (like 0.047 or 0.065) are now much more visible through:
- **Square root scaling** - compresses high values, expands low values
- **Minimum extension** - ensures non-zero values always show (default 30%)

### 2. **Perpendicular Labels** 🏷️
Each trait now has a label positioned perpendicular to its segment:
- **Auto-rotated** for readability (flips on left side)
- **Percentage values** shown below trait names
- **Clean typography** with proper sizing

---

## Configuration Options

### Basic Usage

```javascript
createPersonaSunburst(personaData, 'containerId', {
    width: 900,
    height: 900,
    animate: true
});
```

### Advanced Options

```javascript
createPersonaSunburst(personaData, 'containerId', {
    // Size
    width: 900,
    height: 900,
    
    // Center labels
    centerLabel: 'Persona',
    centerSubLabel: 'Vector',
    
    // Visual options
    animate: true,                  // Fade-in animation on load
    showLabels: true,               // Show perpendicular trait labels
    showPercentages: true,          // Show percentage values below labels
    
    // Scaling options
    useSqrtScaling: true,           // Use square root scaling for values
    minExtension: 0.3               // Minimum extension (0-1) for non-zero values
});
```

---

## Scaling Options Explained

### `useSqrtScaling` (default: true)

Applies square root transformation to values:

| Raw Value | Without Scaling | With √ Scaling |
|-----------|----------------|----------------|
| 0.01      | 1%            | 10%            |
| 0.04      | 4%            | 20%            |
| 0.16      | 16%           | 40%            |
| 0.36      | 36%           | 60%            |
| 0.64      | 64%           | 80%            |
| 1.00      | 100%          | 100%           |

**Effect:** Low values become more visible, high values slightly compressed.

**Example:**
```javascript
// Disable square root scaling (use raw values)
createPersonaSunburst(data, 'container', {
    useSqrtScaling: false
});
```

### `minExtension` (default: 0.3)

Sets minimum visible extension for non-zero values.

**Range:** 0.0 - 1.0 (as fraction of total radius)

**Examples:**

```javascript
// Very subtle minimum (10%)
createPersonaSunburst(data, 'container', {
    minExtension: 0.1
});

// Strong minimum (50%)
createPersonaSunburst(data, 'container', {
    minExtension: 0.5
});

// No minimum (use scaled values as-is)
createPersonaSunburst(data, 'container', {
    minExtension: 0
});
```

---

## Label Options

### `showLabels` (default: true)

Controls whether perpendicular labels are displayed.

```javascript
// Hide labels (hover-only mode)
createPersonaSunburst(data, 'container', {
    showLabels: false
});
```

### `showPercentages` (default: true)

Controls whether percentage values are shown below trait names.

```javascript
// Show only trait names (no percentages)
createPersonaSunburst(data, 'container', {
    showPercentages: false
});
```

---

## Visual Examples

### Default Settings (Recommended)

```javascript
createPersonaSunburst(personaData, 'container', {
    useSqrtScaling: true,
    minExtension: 0.3,
    showLabels: true,
    showPercentages: true
});
```

**Result:**
- ✅ Small values (0.047) become visible
- ✅ All traits have readable labels
- ✅ Percentages help interpret values
- ✅ Balanced visual appearance

### Minimal Extension

```javascript
createPersonaSunburst(personaData, 'container', {
    useSqrtScaling: true,
    minExtension: 0.1,
    showLabels: true
});
```

**Result:**
- More accurate representation of small differences
- Some very small values may be hard to see
- Better for data with similar magnitudes

### Maximum Visibility

```javascript
createPersonaSunburst(personaData, 'container', {
    useSqrtScaling: true,
    minExtension: 0.5,
    showLabels: true
});
```

**Result:**
- All non-zero traits very visible
- Good for comparing relative strengths
- Less accurate for absolute magnitudes

### Clean/Minimal (No Labels)

```javascript
createPersonaSunburst(personaData, 'container', {
    useSqrtScaling: true,
    minExtension: 0.3,
    showLabels: false,
    showPercentages: false
});
```

**Result:**
- Clean, uncluttered appearance
- Details on hover only
- Good for presentations or screenshots

---

## Scaling Algorithm

### Step 1: Square Root Scaling (Optional)

```javascript
if (value > 0 && useSqrtScaling) {
    scaledValue = Math.sqrt(value);
}
```

### Step 2: Minimum Extension

```javascript
if (scaledValue > 0) {
    scaledValue = Math.max(scaledValue, minExtension);
}
```

### Step 3: Calculate Visual Extension

```javascript
extension = scaledValue * (maxRadius - middleRadius);
outerRadius = middleRadius + extension;
```

### Example Calculation

Given:
- `value = 0.047` (4.7%)
- `useSqrtScaling = true`
- `minExtension = 0.3`
- `maxRadius - middleRadius = 200px`

Calculation:
```
1. √0.047 = 0.217
2. max(0.217, 0.3) = 0.3
3. 0.3 × 200px = 60px extension
```

**Result:** A 4.7% value displays as a 60px segment (visible!)

---

## Label Positioning

Labels are positioned **perpendicular** to their segments:

1. **Calculate midpoint** of segment arc
2. **Position label** slightly beyond outer radius
3. **Rotate text** perpendicular to radius
4. **Flip text** on left side for readability

```javascript
const midAngle = (startAngle + endAngle) / 2;
const labelRadius = outerRadius + (radius * 0.08);
const labelX = Math.sin(midAngle) * labelRadius;
const labelY = -Math.cos(midAngle) * labelRadius;

let rotation = (midAngle * 180 / Math.PI);
if (midAngle > π/2 && midAngle < 3π/2) {
    rotation += 180; // Flip for left side
}
```

---

## Console Logging

When rendering, you'll see detailed scaling information:

```
Empathetic: raw=0.000, scaled=0.000, extension=0.0px
Unempathetic: raw=0.140, scaled=0.374, extension=82.5px
Encouraging: raw=0.000, scaled=0.000, extension=0.0px
Discouraging: raw=0.172, scaled=0.415, extension=91.5px
Social: raw=0.000, scaled=0.000, extension=0.0px
Antisocial: raw=0.090, scaled=0.300, extension=66.2px
Formal: raw=0.065, scaled=0.300, extension=66.2px
...
```

This helps you understand:
- Raw API values
- Scaled values after transformation
- Actual pixel extensions

---

## Best Practices

### For Low-Value Data (most values < 0.2)

```javascript
createPersonaSunburst(data, 'container', {
    useSqrtScaling: true,
    minExtension: 0.35,  // Higher minimum for visibility
    showLabels: true,
    showPercentages: true
});
```

### For High-Value Data (most values > 0.5)

```javascript
createPersonaSunburst(data, 'container', {
    useSqrtScaling: false,  // Raw values are fine
    minExtension: 0.2,      // Lower minimum
    showLabels: true,
    showPercentages: true
});
```

### For Mixed Data (wide range of values)

```javascript
createPersonaSunburst(data, 'container', {
    useSqrtScaling: true,   // Balance high/low
    minExtension: 0.3,      // Default works well
    showLabels: true,
    showPercentages: true
});
```

### For Presentation/Export

```javascript
createPersonaSunburst(data, 'container', {
    useSqrtScaling: true,
    minExtension: 0.3,
    showLabels: false,      // Clean look
    showPercentages: false,
    animate: false          // No animation for screenshot
});
```

---

## Typography

Labels use responsive sizing:

```javascript
// Trait name
fontSize: Math.max(9, radius * 0.025)  // 9px minimum
fontWeight: 500
color: #333

// Percentage value
fontSize: Math.max(7, radius * 0.02)   // 7px minimum
fontWeight: 400
color: #666
```

---

## Accessibility

Labels are marked as non-interactive:

```css
pointer-events: none;
user-select: none;
```

This ensures:
- Labels don't block hover events on segments
- Labels can't be accidentally selected
- Clean interaction with underlying arcs

---

## Troubleshooting

### Labels overlapping?

**Solution:** Reduce the number of traits or increase size:

```javascript
createPersonaSunburst(data, 'container', {
    width: 1200,
    height: 1200,
    showLabels: true
});
```

### Small values not visible enough?

**Solution:** Increase minimum extension:

```javascript
createPersonaSunburst(data, 'container', {
    minExtension: 0.4  // Increase from 0.3
});
```

### Values look too compressed?

**Solution:** Disable square root scaling:

```javascript
createPersonaSunburst(data, 'container', {
    useSqrtScaling: false
});
```

---

## Related Files

- **Implementation:** `js/persona-sunburst.js`
- **Test Page:** `test-sunburst.html`
- **Dynamic Detection:** `DYNAMIC_TRAIT_DETECTION.md`
- **Data Flow:** `SUNBURST_DATA_FIX.md`

---

**Last Updated:** October 8, 2025  
**Branch:** user-study

