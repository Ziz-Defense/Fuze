const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || ''
);

// Initialize database schema
async function initializeDatabase() {
    try {
        // Note: Table creation should be done via Supabase dashboard SQL editor
        // This function is kept for consistency but table should exist already
        console.log('✅ Supabase client initialized');
        console.log('📋 Ensure submissions table exists in Supabase dashboard');
    } catch (error) {
        console.error('❌ Error initializing Supabase:', error.message);
    }
}

// Initialize on module load
initializeDatabase();

// Save a new submission
async function saveSubmission(data) {
    try {
        const { data: result, error } = await supabase
            .from('submissions')
            .insert([{
                company_name: data.company_name || null,
                contact_email: data.contact_email || null,
                contact_phone: data.contact_phone || null,
                company_size: data.company_size || null,
                company_type: data.company_type || null,
                technology_name: data.technology_name || null,
                technology_description: data.technology_description || null,
                detailed_description: data.detailed_description || null,
                technology_category: data.technology_category || null,
                unique_value_proposition: data.unique_value_proposition || null,
                military_applications: data.military_applications || null,
                commercial_applications: data.commercial_applications || null,
                trl_level: data.trl_level || null,
                mrl_level: data.mrl_level || null,
                development_stage: data.development_stage || null,
                ip_status: data.ip_status || null,
                team_size: data.team_size || null,
                team_expertise: data.team_expertise || null,
                funding_pathway: data.funding_pathway || null,
                funding_amount_requested: data.funding_amount_requested || null,
                previous_fuze_awards: data.previous_fuze_awards || null,
                previous_fuze_amount: data.previous_fuze_amount || null,
                development_timeline: data.development_timeline || null,
                sam_gov_registered: data.sam_gov_registered || null,
                dsip_registered: data.dsip_registered || null,
                capability_score: data.capability_score || null,
                ai_assessment: data.ai_assessment || null,
                recommendation: data.recommendation || null,
                conversation_transcript: data.conversation_transcript || null
            }])
            .select();

        if (error) throw error;
        return { id: result[0].id };
    } catch (error) {
        throw new Error(`Failed to save submission: ${error.message}`);
    }
}

// Get all submissions
async function getAllSubmissions() {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch submissions: ${error.message}`);
    }
}

// Get a single submission by ID
async function getSubmissionById(id) {
    try {
        const { data, error } = await supabase
            .from('submissions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            if (error.code === 'PGRST116') return null; // Not found
            throw error;
        }
        return data;
    } catch (error) {
        throw new Error(`Failed to fetch submission: ${error.message}`);
    }
}

// Update submission
async function updateSubmission(id, data) {
    try {
        const { error, count } = await supabase
            .from('submissions')
            .update({
                ...data,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (error) throw error;
        return { changes: count || 0 };
    } catch (error) {
        throw new Error(`Failed to update submission: ${error.message}`);
    }
}

// Delete submission
async function deleteSubmission(id) {
    try {
        const { error, count } = await supabase
            .from('submissions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { changes: count || 0 };
    } catch (error) {
        throw new Error(`Failed to delete submission: ${error.message}`);
    }
}

// Get submission statistics
async function getStatistics() {
    try {
        // Get total count
        const { count: total_submissions } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true });

        // Get average score (need to fetch all for calculation)
        const { data: scores } = await supabase
            .from('submissions')
            .select('capability_score');

        const validScores = scores?.filter(s => s.capability_score != null).map(s => s.capability_score) || [];
        const avg_score = validScores.length > 0
            ? validScores.reduce((a, b) => a + b, 0) / validScores.length
            : 0;

        // Get SAM registered count
        const { count: sam_registered } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .eq('sam_gov_registered', true);

        // Get high TRL count
        const { count: high_trl } = await supabase
            .from('submissions')
            .select('*', { count: 'exact', head: true })
            .gte('trl_level', 7);

        return {
            total_submissions: total_submissions || 0,
            avg_score: avg_score || 0,
            sam_registered: sam_registered || 0,
            high_trl: high_trl || 0
        };
    } catch (error) {
        throw new Error(`Failed to fetch statistics: ${error.message}`);
    }
}

module.exports = {
    saveSubmission,
    getAllSubmissions,
    getSubmissionById,
    updateSubmission,
    deleteSubmission,
    getStatistics
};
