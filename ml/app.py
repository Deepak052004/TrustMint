from flask import Flask, request, jsonify
from flask_cors import CORS
from textblob import TextBlob
import pickle
import re
import numpy as np
from tensorflow.keras.models import model_from_json
from tensorflow.keras.preprocessing.sequence import pad_sequences

app = Flask(__name__)
CORS(app)

# --- LOAD MODEL & TOKENIZER ---
try:
    with open("model/trained_tokenizer_new.pkl", "rb") as f:
        tokenizer = pickle.load(f)
    with open("model/config.json", "r", encoding="utf-8") as f:
        model_json = f.read()
    model = model_from_json(model_json)
    model.load_weights("model/model.weights.h5")
    MAX_LEN = model.input_shape[1]
    print("✅ ML Model and Tokenizer Loaded")
except Exception as e:
    print(f"❌ Initialization Error: {e}")

# --- ENHANCED SIGNAL ANALYZER ---
class SignalAnalyzer:
    @staticmethod
    def get_signals(text):
        blob = TextBlob(text)
        # 0.0 (Objective/Fact) to 1.0 (Subjective/Opinion)
        subjectivity = blob.sentiment.subjectivity
        
        # Clickbait/Sensationalism detection
        caps_ratio = sum(1 for c in text if c.isupper()) / (len(text) + 1)
        excl_count = text.count('!')
        
        # Logic: If it's highly subjective and uses shouting punctuation
        emi_score = (subjectivity * 0.6) + (min(excl_count * 0.1, 0.2)) + (caps_ratio * 0.2)
        
        return {
            "subjectivity": round(subjectivity, 4),
            "emi_score": min(round(emi_score, 2), 1.0),
            "certainty": round(1.0 - subjectivity, 2)
        }

@app.route("/verify", methods=["POST"])
def verify():
    data = request.get_json()
    text = data.get("text", "").strip()

    if not text or len(text.split()) < 3:
        return jsonify({"probability": 0.5, "note": "Insufficient text"})

    # 1. ML Probability
    seq = tokenizer.texts_to_sequences([text.lower()])
    processed = pad_sequences(seq, maxlen=MAX_LEN, padding="pre")
    prob = float(model.predict(processed, verbose=0)[0][0])

    # 2. NLP Signal Analysis
    signals = SignalAnalyzer.get_signals(text)

    return jsonify({
        "probability": round(prob, 4),
        "subjectivity": signals["subjectivity"],
        "emotional_manipulation": {"emi_score": signals["emi_score"]},
        "linguistic_certainty": {"certainty_ratio": signals["certainty"]}
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=False)