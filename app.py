import os
from flask import Flask, render_template, request, jsonify, session, redirect, url_for
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, auth
import requests
import google.generativeai as genai
import json

# --- Initialization ---
load_dotenv()
app = Flask(__name__)
app.secret_key = os.urandom(24) 

# --- Initialize Firebase Admin SDK ---
try:
    # Make sure 'serviceAccountKey.json' is in the same directory as your app.py
    cred = credentials.Certificate('serviceAccountKey.json')
    firebase_admin.initialize_app(cred)
except Exception as e:
    print(f"Error initializing Firebase Admin SDK: {e}")

# --- API Configuration ---
PLANT_ID_API_KEY = os.getenv("PLANT_ID_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
PLANT_ID_API_URL = "https://api.plant.id/v2/identify"

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


# --- Main Routes ---
@app.route('/')
def index():
    if 'user' in session: return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/signin')
def signin():
    if 'user' in session: return redirect(url_for('dashboard'))
    return render_template('signin.html')

@app.route('/signup')
def signup():
    if 'user' in session: return redirect(url_for('dashboard'))
    return render_template('signup.html')

@app.route('/dashboard')
def dashboard():
    if 'user' not in session: return redirect(url_for('signin'))
    # You should create a dashboard.html file in a 'templates' folder
    return render_template('dashboard.html', user_email=session['user']['email'])

@app.route('/signout')
def signout():
    session.pop('user', None)
    return redirect(url_for('index'))


# --- API Endpoints ---
@app.route('/session-login', methods=['POST'])
def session_login():
    try:
        id_token = request.json['idToken']
        decoded_token = auth.verify_id_token(id_token)
        session['user'] = {'uid': decoded_token['uid'], 'email': decoded_token.get('email', '')}
        return jsonify({"status": "success"}), 200
    except Exception as e:
        return jsonify({"error": "Failed to authenticate"}), 401

@app.route('/identify', methods=['POST'])
def identify():
    if 'user' not in session: return jsonify({'error': 'Unauthorized'}), 401
    if 'image' not in request.files: return jsonify({'error': 'No image file.'}), 400
    try:
        suggestions = get_suggestions_from_plant_id(request.files['image'])
        if not suggestions: return jsonify({'error': "Could not identify the plant."}), 404
        top_plant_name = suggestions[0]['plant_name']
        structured_description = get_description_from_gemini(top_plant_name)
        return jsonify({'suggestions': suggestions, 'description': structured_description})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/chat', methods=['POST'])
def chat():
    if 'user' not in session: return jsonify({'error': 'Unauthorized'}), 401
    
    data = request.json
    question = data.get('question')
    plant_name = data.get('plant_name')

    if not question or not plant_name:
        return jsonify({'error': 'Missing question or plant context.'}), 400

    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        prompt = f"""
        You are a helpful botanist assistant for the app Leafify.
        In the context of the plant "{plant_name}", concisely answer the following user question: "{question}"
        Provide a helpful and direct answer.
        """
        response = model.generate_content(prompt)
        return jsonify({'answer': response.text})
    except Exception as e:
        return jsonify({'error': f'Failed to get response from AI: {str(e)}'}), 500


# --- Helper Functions ---
def get_suggestions_from_plant_id(image_file):
    files = {'images': (image_file.filename, image_file.read(), image_file.mimetype)}
    headers = {'Api-Key': PLANT_ID_API_KEY}
    # Using verify=False can be a security risk. In production, configure SSL properly.
    response = requests.post(PLANT_ID_API_URL, files=files, headers=headers, verify=False)
    response.raise_for_status()
    data = response.json()
    if data.get('suggestions'):
        return [{'plant_name': s['plant_name'], 'probability': s['probability']} for s in data['suggestions']]
    return None

def get_description_from_gemini(plant_name):
    model = genai.GenerativeModel('gemini-2.5-flash')
    # UPDATED PROMPT
    prompt = f'''
    For the plant "{plant_name}", provide a JSON object with three keys: "medicinal_uses", "how_to_grow", and "warnings".
    For the value of each key, please provide the text in clean, well-formatted Markdown.
    Use headings for categories (like Internal Use, Topical Use) and bullet points for individual items.
    '''
    response = model.generate_content(prompt)
    cleaned_response = response.text.strip().replace('```json', '').replace('```', '')
    try:
        return json.loads(cleaned_response)
    except json.JSONDecodeError:
        return {"medicinal_uses": "Info not available.", "how_to_grow": "Info not available.", "warnings": "Info not available."}

if __name__ == '__main__':
    app.run(debug=True)