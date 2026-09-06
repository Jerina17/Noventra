# Livelihood Saathi

## Project
Livelihood Saathi is a lightweight MVP for the SIH 2026 problem statement SIH26097. It helps beneficiaries build a digital livelihood profile, understand potential skill gaps, and receive simple, explainable training recommendations aligned to livelihood goals.

## Problem Statement
SIH26097: AI-Driven Voice Assistant for Livelihood Mapping and NSQF-Aligned Skilling Recommendations for SC Communities under GIA component of PM-AJAY.

## Overview
The product uses a simple voice-first or text-first flow to collect livelihood information from beneficiaries. It organizes the information into a digital profile, identifies potential skill gaps, and recommends relevant learning pathways using deterministic rule-based scoring. The system is designed to be lightweight and usable in low-bandwidth environments.

## Features
- Voice-first interaction using Web Speech API
- Text fallback for low-connectivity or unsupported browsers
- Digital livelihood profile creation
- Explainable, score-based recommendation engine
- Potential skill-gap analysis
- Government dashboard with aggregated trends
- Demo mode for reliable presentations
- Low-bandwidth design with compact UI and caching
- SQLite persistence for prototype use

## Architecture
### Frontend
- Static HTML/CSS/JavaScript files in the frontend folder
- Mobile-first and lightweight
- Uses browser speech and localStorage for draft data

### Backend
- Flask API in backend/app.py
- REST endpoints for profile, recommendations, dashboard and health

### AI/NLP
- Simple natural-language parsing layer is implemented in backend/services/nlp_service.py
- For production use, this can be replaced by a cloud AI model such as Gemini or OpenAI
- The final recommendation remains rule-based and explainable

### Database
- SQLite database created in database/livelihood_saathi.db
- Schema is defined in backend/database.py and is designed to be migration-friendly

### Recommendation Engine
- Deterministic scoring is implemented in backend/services/recommendation_service.py
- Course data is stored in backend/data/courses.json
- Demo records are clearly marked as demo data and must not be presented as official government information

## Installation
1. Create and activate a virtual environment.

Windows:

```
cd d:\SIH
python -m venv venv
venv\Scripts\activate
```

2. Install Python dependencies.

```
pip install -r backend/requirements.txt
```

3. Start the backend server.

```
python backend/app.py
```

4. Open the frontend in a browser.

```
http://localhost:5000/
```

## Environment Variables
Create a .env file in the backend folder if needed.

Example:

```
SECRET_KEY=your-secret-key
AI_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
DATABASE_PATH=database/livelihood_saathi.db
```

Do not commit .env files to version control.

## Demo
Use the Try Demo button on the home page to automatically load this example profile:

- Education: 10th
- Occupation: Agriculture
- Experience: 5 years
- Skills: Farming
- Interest: Food Processing
- Goal: Food Processing
- District: Demo District

This flow demonstrates the full pipeline without requiring an AI API call.

## Deployment
### Backend
The Flask API is deployable to Render or similar hosting services.

### Frontend
The frontend is a lightweight static site and can also be served from a static host or behind the Flask app for the MVP.

## Limitations
- Browser speech recognition availability varies by browser and device.
- Cloud AI integration is optional and requires connectivity.
- Course data is demo-only and must be verified before use in any real deployment.
- NSQF information in the demo dataset is not official and must be clearly labeled as such.

## Demo flow
1. Open the home page.
2. Choose language.
3. Select Start My Profile or Try Demo.
4. Fill in or accept the demo profile.
5. View potential skill gaps.
6. Review ranked recommendations.
7. Open the dashboard for aggregated insights.

## License
This project is a prototype for the Smart India Hackathon 2026 and is intended for demonstration and evaluation.
