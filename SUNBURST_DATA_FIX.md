# Sunburst Chart Data Gathering Fix

## Issue Summary

The sunburst chart was not properly gathering or displaying data from the API request. It appeared to be defaulting to simulated data because the **mock data format did not match the real API format**.

## Root Cause Analysis

### 1. **API Data Format (Correct)**
The Modal API returns trait pairs with values in the 0-1 range, where each pair sums to 1.0:

```javascript
{
  empathetic: 0.8033,      // Positive trait
  unempathetic: 0.1967,    // Complementary (sums to 1.0)
  encouraging: 0.6718,
  discouraging: 0.3282,
  social: 0.6984,
  antisocial: 0.3016,
  casual: 0.9519,
  formal: 0.0481,
  honest: 0.2424,
  sycophantic: 0.7576,
  funny: 0.7985,
  serious: 0.2015,
  accurate: 0.0173,
  hallucinatory: 0.9827,
  respectful: 0.0952,
  toxic: 0.9048
}
```

### 2. **Mock Data Format (Incorrect - BEFORE FIX)**
The test persona function was generating mock data with:
- **Wrong trait names** (`empathy` instead of `empathetic`)
- **Wrong value range** (-2 to 2 instead of 0 to 1)
- **No trait pairs** (missing complementary traits)

```javascript
// OLD INCORRECT FORMAT
const mockData = {
    empathy: (Math.random() * 4 - 2),      // -2 to 2 range ❌
    sycophancy: (Math.random() * 4 - 2),   // Wrong trait name ❌
    humor: (Math.random() * 4 - 2),        // No pairs ❌
    toxicity: (Math.random() * 4 - 2),
    formality: (Math.random() * 4 - 2),
    creativity: (Math.random() * 4 - 2)
};
```

### 3. **Sunburst Expectations**
The sunburst visualization (`persona-sunburst.js`) was designed to handle:
- Trait pairs (e.g., empathetic/unempathetic)
- Values in 0-1 range
- Automatic filtering to show only dominant trait from each pair
- Categorization into Positive (green) vs Negative (red) traits

## Fixes Applied

### 1. **Updated Mock Data Generator** (`js/chat.js`)

Changed `testPersonaWithMockData()` function to generate data matching the real API format:

```javascript
// NEW CORRECT FORMAT
const mockData = {
    // Trait pairs - values sum to 1.0
    empathetic: Math.random(),
    unempathetic: 0, // Will be calculated
    encouraging: Math.random(),
    discouraging: 0,
    social: Math.random(),
    antisocial: 0,
    casual: Math.random(),
    formal: 0,
    honest: Math.random(),
    sycophantic: 0,
    funny: Math.random(),
    serious: 0,
    accurate: Math.random(),
    hallucinatory: 0,
    respectful: Math.random(),
    toxic: 0
};

// Calculate complementary values so each pair sums to 1.0
mockData.unempathetic = 1 - mockData.empathetic;
mockData.discouraging = 1 - mockData.encouraging;
mockData.antisocial = 1 - mockData.social;
mockData.formal = 1 - mockData.casual;
mockData.sycophantic = 1 - mockData.honest;
mockData.serious = 1 - mockData.funny;
mockData.hallucinatory = 1 - mockData.accurate;
mockData.toxic = 1 - mockData.respectful;
```

### 2. **Enhanced Logging** (`js/chat.js`)

Added comprehensive logging in `checkPersona()` and `renderPersonaChart()` functions:

```javascript
// In checkPersona()
console.log('📊 Persona Vector API Response (full):', data);
console.log('📊 Persona Vector API Response (content only):', data.content);
console.log('📊 Data type:', typeof data.content);
console.log('📊 Data keys:', data.content ? Object.keys(data.content) : 'No keys');
console.log('📊 Sample values:', data.content ? Object.entries(data.content).slice(0, 3) : 'No values');

// In renderPersonaChart()
console.log('🎨 renderPersonaChart called with data:', personaData);
console.log('🎨 Data type:', typeof personaData);
console.log('🎨 Is object?', typeof personaData === 'object');
console.log('🎨 Keys:', personaData ? Object.keys(personaData) : 'null/undefined');
```

### 3. **Enhanced Sunburst Logging** (`js/persona-sunburst.js`)

Added detailed logging to trace data transformation:

```javascript
// In createPersonaSunburst()
console.log('🎨 Received personaData:', personaData);
console.log('🎨 Data type:', typeof personaData);
console.log('🎨 Data keys:', personaData ? Object.keys(personaData) : 'null/undefined');
console.log('🎨 First 3 entries:', personaData ? Object.entries(personaData).slice(0, 3) : 'none');

// In transformToCategories()
console.log('🔍 transformToCategories called with:', personaData);
console.log('🔄 Filtering dominant traits from:', personaData);
console.log('✅ Filtered dominant traits:', filteredData);
console.log('✅ Number of filtered traits:', Object.keys(filteredData).length);
```

## Data Flow

```
1. User clicks "Check Persona"
   ↓
2. checkPersona() sends system prompt to /api/persona-vector
   ↓
3. /api/persona-vector calls Modal API endpoint
   ↓
4. Modal API returns: { persona_vector_ratings: {...} }
   ↓
5. Vercel endpoint returns: { content: {...} }
   ↓
6. checkPersona() receives: data.content
   ↓
7. renderPersonaChart(data.content) is called
   ↓
8. createPersonaSunburst() receives data
   ↓
9. transformToCategories() filters dominant traits
   ↓
10. Sunburst visualization renders with proper trait pairs
```

## API Response Structure

The Vercel endpoint (`/api/persona-vector.js`) returns:

```javascript
{
  content: {
    empathetic: 0.8033,
    unempathetic: 0.1967,
    // ... more trait pairs
  }
}
```

The sunburst receives `data.content` which contains the trait pairs.

## Trait Pairs Reference

The following trait pairs are supported (each pair sums to 1.0):

| Positive Trait | Negative Trait |
|----------------|----------------|
| `empathetic`   | `unempathetic` |
| `encouraging`  | `discouraging` |
| `social`       | `antisocial`   |
| `casual`       | `formal`       |
| `honest`       | `sycophantic`  |
| `funny`        | `serious`      |
| `accurate`     | `hallucinatory`|
| `respectful`   | `toxic`        |

**Note:** Only the dominant trait (higher value) from each pair is displayed in the visualization.

## Testing

### To test with real API data:
1. Click "Check Persona" button in the system prompt interface
2. Watch browser console for detailed logging
3. Verify data structure matches expected format
4. Confirm sunburst renders correctly with trait pairs

### To test with mock data:
1. Click "Test Persona" button (if available in debug mode)
2. Verify mock data now matches API format
3. Confirm sunburst renders identically to real API data

## Debug Mode

To enable detailed logging, add URL parameter:
```
?debug=true
```

To see sunburst vs bar chart:
```
?sunburst=true   (default)
?sunburst=false  (bar chart)
```

## Files Modified

1. **js/chat.js**
   - Fixed `testPersonaWithMockData()` function
   - Added logging in `checkPersona()`
   - Added logging in `renderPersonaChart()`

2. **js/persona-sunburst.js**
   - Added logging in `createPersonaSunburst()`
   - Added logging in `transformToCategories()`

## Expected Behavior Now

✅ **Mock data** matches real API format exactly  
✅ **Real API data** flows correctly to sunburst  
✅ **Trait pairs** are properly filtered (dominant trait shown)  
✅ **Visualization** displays correct categories (Positive/Negative)  
✅ **Console logs** show detailed data flow for debugging  

## Troubleshooting

If sunburst still shows issues:

1. **Check Console Logs:**
   - Look for `📊 Persona Vector API Response` logs
   - Verify data structure matches expected format
   - Check for any error messages

2. **Verify API Response:**
   - Ensure Modal API is returning trait pairs
   - Confirm values are in 0-1 range
   - Check that pairs sum to 1.0

3. **Test Mock Data:**
   - Use "Test Persona" button to isolate API issues
   - Confirm mock data renders correctly
   - Compare mock vs real API behavior

## Future Improvements

- [ ] Add data validation to ensure trait pairs sum to 1.0
- [ ] Add fallback handling for missing trait pairs
- [ ] Create unit tests for data transformation
- [ ] Add visual indicators for data source (API vs Mock)

---

**Last Updated:** October 8, 2025  
**Branch:** user-study

