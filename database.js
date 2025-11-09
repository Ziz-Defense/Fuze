const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create/connect to SQLite database
const dbPath = path.join(__dirname, 'fuze_submissions.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to SQLite database');
        initializeDatabase();
    }
});

// Initialize database schema
function initializeDatabase() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS submissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,

            -- Company Information
            company_name TEXT,
            contact_email TEXT,
            contact_phone TEXT,
            company_size TEXT,
            company_type TEXT,

            -- Technology Details
            technology_name TEXT,
            technology_description TEXT,
            detailed_description TEXT,
            technology_category TEXT,
            unique_value_proposition TEXT,
            military_applications TEXT,
            commercial_applications TEXT,

            -- Technical Maturity
            trl_level INTEGER,
            mrl_level INTEGER,
            development_stage TEXT,
            ip_status TEXT,

            -- Team Information
            team_size INTEGER,
            team_expertise TEXT,

            -- Funding Information
            funding_pathway TEXT,
            funding_amount_requested REAL,
            previous_fuze_awards TEXT,
            previous_fuze_amount REAL,
            development_timeline TEXT,

            -- Government Registrations
            sam_gov_registered BOOLEAN,
            dsip_registered BOOLEAN,

            -- Assessment
            capability_score REAL,
            ai_assessment TEXT,
            recommendation TEXT,

            -- Metadata
            conversation_transcript TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `;

    db.run(createTableQuery, (err) => {
        if (err) {
            console.error('Error creating table:', err.message);
        } else {
            console.log('Submissions table ready');
        }
    });
}

// Save a new submission
function saveSubmission(data, callback) {
    const query = `
        INSERT INTO submissions (
            company_name, contact_email, contact_phone, company_size, company_type,
            technology_name, technology_description, detailed_description, technology_category,
            unique_value_proposition, military_applications, commercial_applications,
            trl_level, mrl_level, development_stage, ip_status,
            team_size, team_expertise,
            funding_pathway, funding_amount_requested, previous_fuze_awards,
            previous_fuze_amount, development_timeline,
            sam_gov_registered, dsip_registered,
            capability_score, ai_assessment, recommendation,
            conversation_transcript
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
        data.company_name || null,
        data.contact_email || null,
        data.contact_phone || null,
        data.company_size || null,
        data.company_type || null,
        data.technology_name || null,
        data.technology_description || null,
        data.detailed_description || null,
        data.technology_category || null,
        data.unique_value_proposition || null,
        data.military_applications || null,
        data.commercial_applications || null,
        data.trl_level || null,
        data.mrl_level || null,
        data.development_stage || null,
        data.ip_status || null,
        data.team_size || null,
        data.team_expertise || null,
        data.funding_pathway || null,
        data.funding_amount_requested || null,
        data.previous_fuze_awards || null,
        data.previous_fuze_amount || null,
        data.development_timeline || null,
        data.sam_gov_registered || null,
        data.dsip_registered || null,
        data.capability_score || null,
        data.ai_assessment || null,
        data.recommendation || null,
        data.conversation_transcript || null
    ];

    db.run(query, values, function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { id: this.lastID });
        }
    });
}

// Get all submissions
function getAllSubmissions(callback) {
    const query = 'SELECT * FROM submissions ORDER BY created_at DESC';
    db.all(query, [], (err, rows) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, rows);
        }
    });
}

// Get a single submission by ID
function getSubmissionById(id, callback) {
    const query = 'SELECT * FROM submissions WHERE id = ?';
    db.get(query, [id], (err, row) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
}

// Update submission
function updateSubmission(id, data, callback) {
    const fields = Object.keys(data).map(key => `${key} = ?`).join(', ');
    const values = Object.values(data);
    values.push(id);

    const query = `UPDATE submissions SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`;

    db.run(query, values, function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { changes: this.changes });
        }
    });
}

// Delete submission
function deleteSubmission(id, callback) {
    const query = 'DELETE FROM submissions WHERE id = ?';
    db.run(query, [id], function(err) {
        if (err) {
            callback(err, null);
        } else {
            callback(null, { changes: this.changes });
        }
    });
}

// Get submission statistics
function getStatistics(callback) {
    const query = `
        SELECT
            COUNT(*) as total_submissions,
            AVG(capability_score) as avg_score,
            COUNT(CASE WHEN sam_gov_registered = 1 THEN 1 END) as sam_registered,
            COUNT(CASE WHEN trl_level >= 7 THEN 1 END) as high_trl
        FROM submissions
    `;

    db.get(query, [], (err, row) => {
        if (err) {
            callback(err, null);
        } else {
            callback(null, row);
        }
    });
}

module.exports = {
    db,
    saveSubmission,
    getAllSubmissions,
    getSubmissionById,
    updateSubmission,
    deleteSubmission,
    getStatistics
};
