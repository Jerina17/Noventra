import pytest

from backend.app import app
from backend.services.nlp_service import extract_profile_from_text
from backend.services.recommendation_service import recommend_courses
from backend.services.skill_gap_service import generate_skill_gaps


@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    response = client.get('/api/health')
    assert response.status_code == 200
    assert response.get_json()['status'] == 'ok'


def test_extract_profile_from_text():
    text = 'நான் பத்தாம் வகுப்பு படித்துள்ளேன். எனக்கு விவசாயத்தில் ஐந்து வருட அனுபவம் உள்ளது. உணவு பதப்படுத்துதலில் ஆர்வம் உள்ளது.'
    profile = extract_profile_from_text(text)
    assert profile['education'] in ['10th', '10th Standard', '10Th'] or '10' in str(profile['education'])
    assert profile['current_livelihood'] in ['Agriculture', 'Food Processor', 'Farmer']
    assert profile['experience_years'] == 5
    assert 'Food Processing' in profile['interest'] or 'Food Processor' in profile['interest']


def test_skill_gap_generation():
    profile = {'skills': ['Farming'], 'career_goal': 'Food Processing'}
    gaps = generate_skill_gaps(profile, 'Food Processing')
    assert 'Food safety' in gaps or 'Packaging' in gaps or 'Food processing techniques' in gaps


def test_recommendation_scoring():
    profile = {
        'education': '10th',
        'current_livelihood': 'Agriculture',
        'experience_years': 5,
        'skills': ['Farming'],
        'interest': 'Food Processing',
        'career_goal': 'Food Processing',
        'district': 'Demo District'
    }
    recommendations = recommend_courses(profile)
    assert recommendations
    assert recommendations[0]['score'] >= 80
    assert 'Food Processing' in recommendations[0]['title'] or 'Food Processing' in recommendations[0]['sector']


def test_analyze_profile_returns_structured_payload(client):
    response = client.post('/api/analyze-profile', json={'text': 'நான் பத்தாம் வகுப்பு படித்துள்ளேன். விவசாயத்தில் 5 வருடம் வேலை செய்தேன். உணவு பதப்படுத்துதலில் ஆர்வம் உள்ளது.'})
    assert response.status_code == 200
    payload = response.get_json()
    assert payload['success'] is True
    assert payload['source'] in {'ai', 'fallback'}
    assert set(['education', 'current_livelihood', 'experience_years', 'skills', 'interest', 'career_goal', 'district', 'language']).issubset(payload['profile'])
    assert payload['profile']['experience_years'] == 5


def test_profile_api_rejects_empty_payload(client):
    response = client.post('/api/profile', json={})
    assert response.status_code == 400
    assert 'missing information' in response.get_json()['error'].lower()


def test_pmajay_mapping_and_nsqf_alignment():
    profile = {
        'education': '10th',
        'current_livelihood': 'Agriculture',
        'experience_years': 5,
        'skills': ['Farming'],
        'interest': 'Food Processing',
        'career_goal': 'Food Processing',
        'district': 'Demo District'
    }
    recommendations = recommend_courses(profile)
    assert recommendations
    item = recommendations[0]
    assert item['scheme_alignment']['scheme'] == 'PM-AJAY'
    assert 'Skill Development' in item['scheme_alignment']['focus']
    assert item['qualification']['verified'] in {True, False}
    assert item['qualification']['sector']
    assert item['qualification']['demo_status'] in {'Verified NQR data', 'Verified NSQF qualification'}


def test_skill_gap_calculation_uses_required_skills_vs_existing():
    profile = {'skills': ['Farming'], 'career_goal': 'Food Processing'}
    gaps = generate_skill_gaps(profile, 'Food Processing')
    assert 'Food safety' in gaps or 'Packaging' in gaps or 'Food processing techniques' in gaps
    assert not any(skill.lower() == 'farming' for skill in gaps)


def test_missing_and_unverified_nsqf_data_is_handled_safely():
    from backend.services.recommendation_service import normalize_qualification_record

    empty = normalize_qualification_record({})
    assert empty['verified'] is False
    assert empty['qualification_name'] == 'Not available'
    assert empty['job_role'] == 'Not available'

    unverified = normalize_qualification_record({'qualification_name': 'Sample', 'verified': False, 'nsqf_level': 3})
    assert unverified['verified'] is False
    assert unverified['nsqf_level'] is None
    assert unverified['qualification_name'] == 'Not available'


def test_demo_profile_remains_explainable_and_traceable():
    profile = {
        'education': '10th',
        'current_livelihood': 'Agriculture',
        'experience_years': 5,
        'skills': ['Farming'],
        'interest': 'Food Processing',
        'career_goal': 'Food Processing',
        'district': 'Demo District'
    }
    recommendations = recommend_courses(profile)
    explanation = recommendations[0]['why_this_recommendation']
    assert 'Agriculture' in explanation or 'Food Processing' in explanation
    assert 'PM-AJAY' in explanation or 'skill-development' in explanation.lower()


def test_verified_nqr_record_ranked_for_food_processing_demo_profile():
    profile = {
        'education': '10th',
        'current_livelihood': 'Agriculture',
        'experience_years': 5,
        'skills': ['Farming'],
        'interest': 'Food Processing',
        'career_goal': 'Start a small food-processing business',
        'district': 'Demo District'
    }
    recommendations = recommend_courses(profile)
    top = recommendations[0]
    assert 'Food' in top['title'] or 'Agri' in top['title'] or 'Processing' in top['sector']
    assert top['qualification']['verified'] is True
    assert top['qualification']['source'] == 'National Qualification Register'
    assert top['qualification']['source_url'] == 'https://nqr.gov.in/'


def test_ten_personas_dynamic_recommendations():
    personas = [
        ('Tailor', 'Garment'),
        ('Farmer', 'Agriculture'),
        ('Driver', 'Driving'),
        ('Electrician', 'Electrical'),
        ('Beautician', 'Beauty'),
        ('Carpenter', 'Furniture'),
        ('Computer Student', 'IT'),
        ('Nurse', 'Healthcare'),
        ('Mechanic', 'Automotive'),
        ('Fisherman', 'Fisheries'),
    ]
    for occ, expected_kw in personas:
        profile = {
            'education': '12th',
            'current_livelihood': occ,
            'experience_years': 3,
            'skills': [occ],
            'interest': occ,
            'career_goal': occ,
            'district': 'Test District'
        }
        recs = recommend_courses(profile)
        assert recs, f"No recommendations returned for {occ}"
        top_title = recs[0]['title']
        top_sector = recs[0]['sector']
        # Verify that Food Processing is NOT hardcoded returned unless persona is Food Processing
        assert 'Food Processing' not in top_title and 'Food Processing' not in top_sector, f"Returned Food Processing for {occ}"

