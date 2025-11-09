require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const db = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

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
