require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const db = require('./database');
const FormData = require('form-data');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure multer for file uploads (in-memory storage)
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(__dirname));

// API Routes

// Create new submission
app.post('/api/submissions', (req, res) => {
    const submissionData = req.body;

    db.saveSubmission(submissionData, (err, result) => {
        if (err) {
            console.error('Error saving submission:', err);
            res.status(500).json({ error: 'Failed to save submission' });
        } else {
            res.status(201).json({
                message: 'Submission saved successfully',
                submissionId: result.id
            });
        }
    });
});

// Get all submissions
app.get('/api/submissions', (req, res) => {
    db.getAllSubmissions((err, submissions) => {
        if (err) {
            console.error('Error fetching submissions:', err);
            res.status(500).json({ error: 'Failed to fetch submissions' });
        } else {
            res.json(submissions);
        }
    });
});

// Get single submission by ID
app.get('/api/submissions/:id', (req, res) => {
    const id = req.params.id;

    db.getSubmissionById(id, (err, submission) => {
        if (err) {
            console.error('Error fetching submission:', err);
            res.status(500).json({ error: 'Failed to fetch submission' });
        } else if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
        } else {
            res.json(submission);
        }
    });
});

// Update submission
app.put('/api/submissions/:id', (req, res) => {
    const id = req.params.id;
    const updateData = req.body;

    db.updateSubmission(id, updateData, (err, result) => {
        if (err) {
            console.error('Error updating submission:', err);
            res.status(500).json({ error: 'Failed to update submission' });
        } else if (result.changes === 0) {
            res.status(404).json({ error: 'Submission not found' });
        } else {
            res.json({ message: 'Submission updated successfully' });
        }
    });
});

// Delete submission
app.delete('/api/submissions/:id', (req, res) => {
    const id = req.params.id;

    db.deleteSubmission(id, (err, result) => {
        if (err) {
            console.error('Error deleting submission:', err);
            res.status(500).json({ error: 'Failed to delete submission' });
        } else if (result.changes === 0) {
            res.status(404).json({ error: 'Submission not found' });
        } else {
            res.json({ message: 'Submission deleted successfully' });
        }
    });
});

// Get statistics
app.get('/api/statistics', (req, res) => {
    db.getStatistics((err, stats) => {
        if (err) {
            console.error('Error fetching statistics:', err);
            res.status(500).json({ error: 'Failed to fetch statistics' });
        } else {
            res.json(stats);
        }
    });
});

// OpenAI Proxy Endpoints (keeps API key secure on server)

// Chat completions proxy
app.post('/api/chat', async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(req.body)
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json(error);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('OpenAI API error:', error);
        res.status(500).json({ error: 'Failed to call OpenAI API' });
    }
});

// Audio transcription proxy (Whisper)
app.post('/api/transcribe', upload.single('file'), async (req, res) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    if (!req.file) {
        return res.status(400).json({ error: 'No audio file provided' });
    }

    try {
        // Create form data with the audio file
        const formData = new FormData();
        formData.append('file', req.file.buffer, {
            filename: 'audio.webm',
            contentType: req.file.mimetype
        });
        formData.append('model', req.body.model || 'whisper-1');

        const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                ...formData.getHeaders()
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            return res.status(response.status).json(error);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Whisper API error:', error);
        res.status(500).json({ error: 'Failed to transcribe audio' });
    }
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin_dashboard.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`\n<� FUZE Submission Portal Server`);
    console.log(`========================================`);
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`Main portal: http://localhost:${PORT}/`);
    console.log(`Admin dashboard: http://localhost:${PORT}/admin`);
    console.log(`========================================\n`);
});
