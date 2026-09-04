from flask import Flask, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)


@app.route('/api/stats')
def get_stats():
    try:
        with open('ai_decision_stats.json', 'r') as f:
            return jsonify(json.load(f))
    except FileNotFoundError:
        return jsonify({"error": "Run ai_recovery_agent.py first"}), 404


@app.route('/api/audit')
def get_audit():
    try:
        with open('ai_audit_trail.json', 'r') as f:
            data = json.load(f)
            return jsonify(data[:20])
    except FileNotFoundError:
        return jsonify({"error": "Run ai_recovery_agent.py first"}), 404


if __name__ == '__main__':
    print("\n" + "=" * 60)
    print("RecoverAI Backend is running on http://localhost:5001")
    print("=" * 60 + "\n")
    app.run(debug=True, port=5001)
