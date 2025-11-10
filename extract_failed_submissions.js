// Auto-extract failed submissions (where company_name is null but conversation exists)
const fs = require('fs');

async function extractFailedSubmissions() {
    try {
        console.log('🔍 Finding submissions that need extraction...\n');

        // Get all submissions
        const response = await fetch('https://fuze-portal.vercel.app/api/submissions');
        const submissions = await response.json();

        // Find submissions with conversation but no extracted data
        const needsExtraction = submissions.filter(s =>
            s.conversation_transcript &&
            s.conversation_transcript.length > 100 &&
            !s.company_name
        );

        console.log(`Found ${needsExtraction.length} submissions needing extraction\n`);

        if (needsExtraction.length === 0) {
            console.log('✅ All submissions already extracted!');
            return;
        }

        for (const submission of needsExtraction) {
            console.log(`\n📊 Processing submission ${submission.id}...`);
            console.log(`   Conversation length: ${submission.conversation_transcript.length} chars`);

            await extractAndUpdate(submission.id, submission.conversation_transcript);

            // Wait 2 seconds between extractions to avoid rate limits
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        console.log('\n✅ All extractions complete!');

    } catch (error) {
        console.error('❌ Script failed:', error.message);
    }
}

async function extractAndUpdate(id, conversationText) {
    try {
        // Build extraction prompt
        const extractionPrompt = `You are a data extraction specialist for Army FUZE submissions. Analyze the following conversation transcript and extract structured data.

CONVERSATION TRANSCRIPT:
${conversationText}

YOUR TASK:
Extract ALL mentioned information from the conversation and provide it in JSON format. For fields not mentioned, use null.

CRITICAL: You must provide these two detailed outputs:
1. "detailed_description": A comprehensive 3-5 paragraph technical description of the technology. Include: how it works, key technical specifications, unique innovations, current development state, and future potential. Be thorough and technical.

2. "ai_assessment": A brutally honest 2-3 paragraph military value analysis. Answer: Is this valuable to the military? Why or why not? What are the strengths and weaknesses? What are the risks? Be direct and critical where needed.

Return ONLY valid JSON in this exact format (no markdown, no backticks):
{
  "company_name": "string or null",
  "contact_email": "string or null",
  "contact_phone": "string or null",
  "company_size": "string or null",
  "company_type": "string or null",
  "technology_name": "string or null",
  "technology_description": "brief 1-sentence summary",
  "detailed_description": "REQUIRED: 3-5 paragraph detailed technical description",
  "technology_category": "string or null",
  "unique_value_proposition": "string or null",
  "military_applications": "string or null",
  "commercial_applications": "string or null",
  "trl_level": number or null,
  "mrl_level": number or null,
  "development_stage": "string or null",
  "ip_status": "string or null",
  "team_size": number or null,
  "team_expertise": "string or null",
  "funding_pathway": "string or null",
  "funding_amount_requested": number or null,
  "previous_fuze_awards": "string or null",
  "previous_fuze_amount": number or null,
  "development_timeline": "string or null",
  "sam_gov_registered": boolean or null,
  "dsip_registered": boolean or null,
  "capability_score": number (0-10) or null,
  "ai_assessment": "REQUIRED: 2-3 paragraph brutally honest military value analysis",
  "recommendation": "Strong Fit / Moderate Fit / Needs Development / Not Ready"
}

DO NOT include conversation_transcript or timestamp in your JSON output - these will be added automatically.`;

        // Call extraction API
        const extractResponse = await fetch('https://fuze-portal.vercel.app/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: 'gpt-4-turbo',
                messages: [
                    { role: 'system', content: 'You are a data extraction specialist. Return ONLY valid JSON with no markdown code blocks, no backticks, no explanation text - just pure JSON starting with { and ending with }.' },
                    { role: 'user', content: extractionPrompt }
                ],
                max_tokens: 4096,
                temperature: 0.2
            })
        });

        if (!extractResponse.ok) {
            const errorText = await extractResponse.text();
            console.error(`   ❌ Extraction failed: ${errorText}`);
            return;
        }

        const extractData = await extractResponse.json();
        let extracted = extractData.choices[0].message.content;

        // Clean up response
        extracted = extracted.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();

        // Parse JSON
        const jsonMatch = extracted.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            console.error('   ❌ No JSON found in response');
            return;
        }

        const parsed = JSON.parse(jsonMatch[0]);
        console.log(`   ✅ Extracted: ${parsed.company_name || 'Unknown'} - ${parsed.technology_name || 'Unknown'}`);
        console.log(`   📊 Score: ${parsed.capability_score || 'N/A'}/10 | ${parsed.recommendation || 'N/A'}`);

        // Update submission
        const updateResponse = await fetch(`https://fuze-portal.vercel.app/api/submissions/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(parsed)
        });

        if (!updateResponse.ok) {
            const errorText = await updateResponse.text();
            console.error(`   ❌ Update failed: ${errorText}`);
            return;
        }

        console.log(`   💾 Updated submission ${id} successfully`);

    } catch (error) {
        console.error(`   ❌ Error processing submission ${id}:`, error.message);
    }
}

// Run it
extractFailedSubmissions();
