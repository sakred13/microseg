from flask import Flask, request, jsonify
import math
import random
app = Flask(__name__)

X_COORD = None
Y_COORD = None

@app.route('/startMission', methods=['POST'])
def start_mission():
    global X_COORD, Y_COORD

    data = request.json
    X_COORD = data.get('initX', 5.1)
    Y_COORD = data.get('initY', 6.0)

    return jsonify({"message": "Mission started", "X_COORD": X_COORD, "Y_COORD": Y_COORD})
# , "TURN_POINT_X": TURN_POINT_X, "TURN_POINT_Y": TURN_POINT_Y

@app.route('/commandToMove', methods=['POST'])
def command_to_move():
    global X_COORD, Y_COORD
    data = request.json
    slope = data.get('slope', 0.0)
    move_distance = data.get('distance', 2)
    # Calculate angle from slope
    angle = math.atan(slope)
    new_x = X_COORD + move_distance * math.cos(angle)
    new_y = Y_COORD + move_distance * math.sin(angle)    
    # Update coordinates
    X_COORD = new_x
    Y_COORD = new_y
    return jsonify({"message": "Moved", "X_COORD": X_COORD, "Y_COORD": Y_COORD, "slope": slope})

@app.route('/relayBridge', methods=['POST'])
def relay_bridge():
    dest = request.args.get('dest')
    if not dest:
        return jsonify({"error": "Destination not provided"}), 400

    data = request.json
    try:
        response = requests.post(f'http://{dest}', json=data)
        response_data = response.json()
        return jsonify(response_data), response.status_code
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

@app.route('/getCoordinates', methods=['GET'])
def get_coordinates():
    return jsonify({"X_COORD": X_COORD, "Y_COORD": Y_COORD})
    
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5050)