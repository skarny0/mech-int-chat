// Test script for Persona Vector endpoint
const testPersonaVectorEndpoint = async () => {
    const testData = {
        system: "You are a helpful research assistant for the MIT Media Lab Chat Study. Provide thoughtful, informative responses to help participants with their research questions. Be conversational and engaging while maintaining a professional tone."
    };

    try {
        console.log('🧪 Testing Persona Vector endpoint...');
        console.log('📤 Request data:', JSON.stringify(testData, null, 2));
        console.log('');
        
        const response = await fetch('/api/persona-vector', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(testData)
        });

        console.log('📊 Response status:', response.status);
        console.log('');

        if (response.ok) {
            const data = await response.json();
            console.log('✅ Success! Full response:', JSON.stringify(data, null, 2));
            console.log('');
            
            // Analyze the response
            const personaData = data.content;
            const traitCount = personaData ? Object.keys(personaData).length : 0;
            
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('📈 RESPONSE ANALYSIS:');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log(`✓ Total traits returned: ${traitCount}`);
            console.log(`✓ Expected: 16 (8 trait pairs × 2)`);
            console.log(`✓ Match: ${traitCount === 16 ? '✅ YES' : '❌ NO'}`);
            console.log('');
            
            if (personaData) {
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('📋 TRAIT PAIRS RECEIVED:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                // Define expected trait pairs
                const traitPairs = [
                    ['empathetic', 'unempathetic'],
                    ['encouraging', 'discouraging'],
                    ['social', 'antisocial'],
                    ['casual', 'formal'],
                    ['honest', 'sycophantic'],
                    ['funny', 'serious'],
                    ['accurate', 'hallucinatory'],
                    ['respectful', 'toxic']
                ];
                
                traitPairs.forEach(([trait1, trait2]) => {
                    const val1 = personaData[trait1];
                    const val2 = personaData[trait2];
                    const sum = (val1 !== undefined && val2 !== undefined) ? (val1 + val2).toFixed(4) : 'N/A';
                    const present = (val1 !== undefined && val2 !== undefined) ? '✅' : '❌';
                    
                    console.log(`${present} ${trait1.padEnd(15)} ${val1 !== undefined ? val1.toFixed(4) : 'MISSING'}`);
                    console.log(`   ${trait2.padEnd(15)} ${val2 !== undefined ? val2.toFixed(4) : 'MISSING'} (sum: ${sum})`);
                    console.log('');
                });
                
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🔍 VALIDATION:');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                
                // Check all pairs sum to 1.0
                let allPairsValid = true;
                traitPairs.forEach(([trait1, trait2]) => {
                    const val1 = personaData[trait1];
                    const val2 = personaData[trait2];
                    if (val1 !== undefined && val2 !== undefined) {
                        const sum = val1 + val2;
                        if (Math.abs(sum - 1.0) > 0.001) {
                            console.log(`❌ ${trait1}/${trait2} pair doesn't sum to 1.0: ${sum.toFixed(4)}`);
                            allPairsValid = false;
                        }
                    }
                });
                
                if (allPairsValid) {
                    console.log('✅ All trait pairs sum to 1.0 (±0.001)');
                }
                
                // Check value ranges
                let allValuesInRange = true;
                Object.entries(personaData).forEach(([trait, value]) => {
                    if (value < 0 || value > 1) {
                        console.log(`❌ ${trait} value out of range [0,1]: ${value}`);
                        allValuesInRange = false;
                    }
                });
                
                if (allValuesInRange) {
                    console.log('✅ All values in range [0, 1]');
                }
                console.log('');
            }
        } else {
            const errorData = await response.json();
            console.log('❌ Error response:', JSON.stringify(errorData, null, 2));
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
        console.error('Stack:', error.stack);
    }
};

// Run the test
testPersonaVectorEndpoint();
