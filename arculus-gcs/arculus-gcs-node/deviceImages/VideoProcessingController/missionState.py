from flask import Flask, jsonify, make_response
import json

app = Flask(__name__)

@app.route('/getMissionState', methods=['GET'])
def get_mission_state():
    try:
        with open('mission_state.json', 'r') as f:
            mission_state = json.load(f)
        response = make_response(jsonify(mission_state), 200)
        response.headers['Access-Control-Allow-Origin'] = '*'  # Allow requests from any origin
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response
    except FileNotFoundError:
        return jsonify({'error': 'Mission state file not found.'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET')
    return response

if __name__ == '__main__':
    app.run(debug=True, port=5050)

