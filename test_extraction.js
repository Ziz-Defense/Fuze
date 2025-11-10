// Test extraction with real conversation data
require('dotenv').config();

async function testExtraction() {
    const sampleConversation = `assistant: Welcome! I'm excited to learn more about your company and innovation.

user: Our company, Orbital Aegis Systems, pioneers space-based laser defense platforms. Range: 500-800 km; Accuracy: <0.05 mrad; Power: 1-2 MW burst; Satellite: 850 kg.

assistant: Great! Who are your competitors?

user: Helios Defense Systems, Aether Dynamics, StratLaser Labs. Our edge: 0.05 mrad vs 0.1 mrad typical.

assistant: Tell me about your team.

user: Dr. Elena Vargas - CEO & Co-Founder, Former DARPA. Col. James Rourke - COO, 25-year U.S. Air Force. Dr. Arun Patel - CTO, 12 patents. Maya Chen - CFO.

assistant: What's your funding situation?

user: Series B Target: $95 million. Monthly burn: $1.8M. CAGE Code: 9K2T7. SAM.gov: March 12, 2024.`;

    const extractionPrompt = `Extract ALL mentioned information from conversation. Return ONLY valid JSON:
{
  "company_name": "string or null",
  "technology_name": "string or null",
  "technology_description": "brief summary",
  "trl_level": number or null,
  "funding_amount_requested": number or null,
  "sam_gov_registered": boolean or null
}

Conversation:
${sampleConversation}`;

    try {
        console.log('Testing extraction...');
        console.log('Prompt length:', extractionPrompt.length);

        const response = await fetch('https://fuze-portal.vercel.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    { role: 'system', content: 'Return ONLY valid JSON, no markdown.' },
                    { role: 'user', content: extractionPrompt }
                ],
                max_tokens: 500,
                temperature: 0.2
            })
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error:', errorText);
            return;
        }

        const data = await response.json();
        console.log('\n=== RAW RESPONSE ===');
        console.log(JSON.stringify(data, null, 2));

        console.log('\n=== EXTRACTED CONTENT ===');
        console.log(data.choices[0].message.content);

    } catch (error) {
        console.error('Test failed:', error.message);
    }
}

testExtraction();
