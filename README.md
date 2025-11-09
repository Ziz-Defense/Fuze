# FUZE Submission Portal

AI-powered conversational submission assessment system for the Army FUZE program. This portal provides a chat-centric interface for innovators to submit technology proposals, with automated capability assessment and scoring.

## 🚀 Live Demo

**Production URL:** https://fuze-portal.vercel.app

Try the live portal to experience the AI-powered submission process!

## About Army FUZE

Army FUZE is a venture-capital-style program investing ~$750M/year in defense technology companies through:
- **xTech competitions** - Prize-based innovation challenges
- **SBIR/STTR** - Small Business Innovation Research contracts
- **TMI** - Technology Maturation Initiative
- **ManTech** - Manufacturing Technology advancement

**Priority Technology Areas:**
- Unmanned Aerial Systems (UAS/Drones)
- Counter-Drone Technologies
- Electronic Warfare
- Energy Resiliency Solutions

## Features

### Chat-Centric Submission
- Natural conversational AI interface (no forms)
- **Voice input with OpenAI Whisper** - Speak your responses instead of typing
- Guided intake process with intelligent follow-up questions
- Automatic extraction of structured data from conversation
- Real-time TRL/MRL assessment and explanation

### Comprehensive Data Capture (20+ Fields)
**Company Information:**
- Company name, contact, size, type
- Government registrations (SAM.gov, DSIP)

**Technology Details:**
- Product name and description
- Technology category and unique value proposition
- Military and commercial applications

**Technical Maturity:**
- TRL (Technology Readiness Level 1-9)
- MRL (Manufacturing Readiness Level 1-10)
- Development stage and IP status

**Funding Information:**
- Pathway (xTech, SBIR/STTR, Direct Phase II, TMI, ManTech)
- Amount requested and previous awards
- Development timeline

**Assessment:**
- AI-generated capability score (0-10)
- Detailed assessment report
- Recommendation (Strong Fit / Moderate Fit / Needs Development / Not Ready)

### Admin Dashboard
- Real-time statistics and analytics
- Searchable/filterable submissions table
- Detailed submission views
- CSV export functionality

## Technology Stack

- **Frontend**: Pure HTML/CSS/JavaScript with FUZE brand styling
- **Backend**: Node.js + Express.js
- **Database**: SQLite (lightweight, file-based)
- **AI**: OpenAI GPT-4 for conversational intake and assessment
- **Voice Input**: OpenAI Whisper API for speech-to-text transcription
- **Styling**: FUZE.ARMY.MIL brand guidelines (Bricolage Grotesque + DM Sans)

## Security & Architecture

### Secure Backend Proxy
All OpenAI API calls (chat completions and voice transcription) are routed through secure backend proxy endpoints:
- `/api/chat` - Proxies GPT-4 chat completions
- `/api/transcribe` - Proxies Whisper audio transcriptions

**Benefits:**
- ✅ API key stored securely in server environment variables
- ✅ Never exposed to client browser or source code
- ✅ Production-ready security for public deployment
- ✅ Centralized API usage monitoring and rate limiting

### Data Flow
1. User interacts with frontend (chat or voice input)
2. Frontend sends request to backend proxy endpoint
3. Backend authenticates with OpenAI using server-side API key
4. Response returned to frontend without exposing credentials
5. Submission data saved to SQLite database

## Installation

### Prerequisites
- Node.js 16+ and npm
- OpenAI API key

### Setup

1. Clone the repository:
```bash
git clone https://github.com/Ziz-Defense/Fuze.git
cd Fuze
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

**Security Note:** All OpenAI API calls are now handled securely through backend proxy endpoints. Your API key is stored in environment variables on the server and never exposed to the client browser.

4. Start the server:
```bash
npm start
```

5. Open in browser:
- **Main Portal**: http://localhost:3000/
- **Admin Dashboard**: http://localhost:3000/admin

## Usage

### For Submitters

1. Navigate to http://localhost:3000/
2. The AI specialist will greet you automatically
3. Answer questions naturally - either **type** or **click the microphone 🎤 to speak**
   - Click microphone once to start recording (button turns red and pulses)
   - Click again to stop recording and auto-transcribe your speech to text
   - Or simply type your responses traditionally
4. The system extracts and structures your information
5. Receive capability assessment and recommendations at the end

### For Administrators

1. Navigate to http://localhost:3000/admin
2. View statistics: total submissions, average scores, registrations
3. Search/filter submissions by company, technology, category
4. Click "View" to see detailed submission information
5. Export all data to CSV for analysis

## API Endpoints

### Submissions
- `POST /api/submissions` - Create new submission
- `GET /api/submissions` - Get all submissions
- `GET /api/submissions/:id` - Get single submission
- `PUT /api/submissions/:id` - Update submission
- `DELETE /api/submissions/:id` - Delete submission

### Statistics
- `GET /api/statistics` - Get aggregate statistics

## Database Schema

The SQLite database includes the following fields:

```sql
CREATE TABLE submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Company (4 fields)
    company_name, contact_email, contact_phone, company_size, company_type,
    
    -- Technology (6 fields)
    technology_name, technology_description, technology_category,
    unique_value_proposition, military_applications, commercial_applications,
    
    -- Maturity (4 fields)
    trl_level, mrl_level, development_stage, ip_status,
    
    -- Team (2 fields)
    team_size, team_expertise,
    
    -- Funding (5 fields)
    funding_pathway, funding_amount_requested, previous_fuze_awards,
    previous_fuze_amount, development_timeline,
    
    -- Registrations (2 fields)
    sam_gov_registered, dsip_registered,
    
    -- Assessment (3 fields)
    capability_score, ai_assessment, recommendation,
    
    -- Metadata (2 fields)
    conversation_transcript, created_at, updated_at
)
```

## Design System

Following [FUZE.ARMY.MIL](https://fuze.army.mil) brand guidelines:

**Colors:**
- Primary Blue: `#0072ce`
- Accent Yellow: `#ffcc01`
- Accent Green: `#6da34d`
- Black Background: `#000000`
- Muted Gray Text: `#c5c5c5`

**Typography:**
- Headings: Bricolage Grotesque (tight kerning)
- Body: DM Sans (17px, 1.36em line-height)

**UI Principles:**
- Dark mode aesthetic
- Minimal, clean interface
- 700px narrow chat area with black sides
- High contrast for readability
- Mobile responsive

## Security Notes

⚠️ **IMPORTANT**: Never commit API keys to version control

- API keys are stored in `.env` (gitignored)
- Use `.env.example` as a template
- In production, use environment variables or secret management
- Consider implementing backend proxy to hide API keys from client

## Development

Run with auto-restart on file changes:
```bash
npm run dev
```

## Deployment

### Vercel (Recommended)
1. Connect GitHub repository to Vercel
2. Add `OPENAI_API_KEY` environment variable in Vercel dashboard
3. Deploy

### Traditional Server
1. Install Node.js on server
2. Clone repository
3. Run `npm install`
4. Set environment variables
5. Use PM2 or systemd to keep server running

## Contributing

This is a Ziz Defense project. For contributions:
1. Fork the repository
2. Create a feature branch
3. Make changes following FUZE brand guidelines
4. Submit pull request

## License

MIT License - See LICENSE file for details

## Support

For questions about Army FUZE program:
- Visit: https://fuze.army.mil
- xTech: https://xtech.army.mil

For technical issues with this portal:
- GitHub Issues: https://github.com/Ziz-Defense/Fuze/issues

---

**Built by Ziz Defense** | Ignite. Innovate. Accelerate. 🎯
