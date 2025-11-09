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
app.post('/api/submissions', async (req, res) => {
    try {
        const submissionData = req.body;
        const result = await db.saveSubmission(submissionData);
        res.status(201).json({
            message: 'Submission saved successfully',
            submissionId: result.id
        });
    } catch (error) {
        console.error('Error saving submission:', error);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

// Get all submissions
app.get('/api/submissions', async (req, res) => {
    try {
        const submissions = await db.getAllSubmissions();
        res.json(submissions);
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Get single submission by ID
app.get('/api/submissions/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const submission = await db.getSubmissionById(id);
        if (!submission) {
            res.status(404).json({ error: 'Submission not found' });
        } else {
            res.json(submission);
        }
    } catch (error) {
        console.error('Error fetching submission:', error);
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

// Update submission
app.put('/api/submissions/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const updateData = req.body;
        const result = await db.updateSubmission(id, updateData);
        if (result.changes === 0) {
            res.status(404).json({ error: 'Submission not found' });
        } else {
            res.json({ message: 'Submission updated successfully' });
        }
    } catch (error) {
        console.error('Error updating submission:', error);
        res.status(500).json({ error: 'Failed to update submission' });
    }
});

// Delete submission
app.delete('/api/submissions/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const result = await db.deleteSubmission(id);
        if (result.changes === 0) {
            res.status(404).json({ error: 'Submission not found' });
        } else {
            res.json({ message: 'Submission deleted successfully' });
        }
    } catch (error) {
        console.error('Error deleting submission:', error);
        res.status(500).json({ error: 'Failed to delete submission' });
    }
});

// Get statistics
app.get('/api/statistics', async (req, res) => {
    try {
        const stats = await db.getStatistics();
        res.json(stats);
    } catch (error) {
        console.error('Error fetching statistics:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
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
        // Create form data with the audio file (use Blob from buffer)
        const { Readable } = require('stream');
        const formData = new FormData();

        // Convert buffer to stream for form-data library
        const bufferStream = Readable.from(req.file.buffer);
        formData.append('file', bufferStream, {
            filename: 'audio.webm',
            contentType: req.file.mimetype || 'audio/webm'
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
            const errorText = await response.text();
            console.error('OpenAI API error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Transcription failed',
                details: errorText
            });
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Whisper API error:', error);
        res.status(500).json({ error: 'Failed to transcribe audio', details: error.message });
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
