<div align="center">
<img src="https://www.google.com/search?q=https://i.imgur.com/your-logo-image.png" alt="Leafify Logo" width="120px" />
<h1>Leafify - AI Medicinal Plant Identifier</h1>
<p>
<b>An intelligent web application that identifies medicinal plants from images, provides detailed information, and answers your questions with an integrated AI chatbot.</b>
</p>

<p>
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Python-3776AB%3Fstyle%3Dfor-the-badge%26logo%3Dpython%26logoColor%3Dwhite" alt="Python Badge">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Flask-000000%3Fstyle%3Dfor-the-badge%26logo%3Dflask%26logoColor%3Dwhite" alt="Flask Badge">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Firebase-FFCA28%3Fstyle%3Dfor-the-badge%26logo%3Dfirebase%26logoColor%3Dblack" alt="Firebase Badge">
<img src="https://www.google.com/search?q=https://img.shields.io/badge/Tailwind_CSS-38B2AC%3Fstyle%3Dfor-the-badge%26logo%3Dtailwind-css%26logoColor%3Dwhite" alt="Tailwind CSS Badge">
</p>
</div>

🌿 About The Project
Leafify is a powerful tool designed for botanists, herbalists, and nature enthusiasts. By leveraging the power of modern AI, this application allows users to upload a photo of a plant and receive an instant identification, complete with detailed information about its medicinal uses, growth conditions, and potential warnings. An integrated AI chatbot, powered by Google Gemini, acts as a personal botanist, ready to answer any follow-up questions you might have about the identified plant.

✨ Features
📸 AI-Powered Identification: Simply upload an image to get accurate plant suggestions with confidence scores.

📚 Detailed Information: Access structured details on medicinal uses, growth instructions, and important warnings for each plant.

🤖 Interactive AI Chatbot: Ask follow-up questions in natural language to get more specific information about an identified plant.

📜 Identification History: Signed-in users can keep a log of their past discoveries for easy reference.

☀️ Dark & Light Mode: A sleek, modern interface with theme switching for comfortable viewing day or night.

🔐 User Authentication: Secure sign-up and sign-in functionality using Firebase Authentication.

🛠️ Tech Stack
This project is built with a combination of powerful technologies for both the backend and frontend.

Backend:

Framework: Flask

Authentication: Firebase Admin SDK

AI Model: Google Gemini 1.5 Flash

Plant Identification: Plant.id API

Frontend:

Styling: Tailwind CSS

Core: HTML5, Vanilla JavaScript

Markdown Rendering: Marked.js

🚀 Getting Started
To get a local copy up and running, follow these simple steps.

Prerequisites
Python 3.8+ and pip

A Firebase project

API keys for Plant.id and Google Gemini

Installation & Setup
Clone the repository:

git clone [https://github.com/your-username/leafify.git](https://github.com/your-username/leafify.git)
cd leafify

Create and activate a virtual environment:

# For macOS/Linux
python3 -m venv venv
source venv/bin/activate

# For Windows
python -m venv venv
.\venv\Scripts\activate

Install the required packages:

pip install -r requirements.txt

Set up Firebase:

Go to your Firebase project settings and click on "Service Accounts".

Generate a new private key. This will download a JSON file.

Rename this file to serviceAccountKey.json and place it in the root directory of the project.

Configure Environment Variables:

Create a file named .env in the root directory.

Add your API keys to this file:

PLANT_ID_API_KEY="your_plant_id_api_key_here"
GEMINI_API_KEY="your_google_gemini_api_key_here"

Run the Flask application:

flask run

The application will be available at http://127.0.0.1:5000.

📄 License
Distributed under the MIT License. See LICENSE for more information.

💚 Acknowledgements
This project was made with ❤️ by nova nexus.
