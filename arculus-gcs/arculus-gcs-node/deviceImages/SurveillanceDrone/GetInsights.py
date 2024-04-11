from flask import Flask, request, jsonify
import math
import random
app = Flask(__name__)
# Global variables
MOVE_DISTANCE = 2
ENEMY_X = None
ENEMY_Y = None
ENEMY_RADIUS_MIN = None
ENEMY_RADIUS_MAX = None
ENEMY_RADIUS = None
X_COORD = None
Y_COORD = None
def generate_random_coordinates():
    global ENEMY_X, ENEMY_Y, ENEMY_RADIUS_MIN, ENEMY_RADIUS_MAX
    # Check if enemy coordinates and radius have been generated
    # if ENEMY_X is not None and ENEMY_Y is not None and ENEMY_RADIUS_MIN is not None and ENEMY_RADIUS_MAX is not None:
    #     return ENEMY_X, ENEMY_Y, random.uniform(ENEMY_RADIUS_MIN, ENEMY_RADIUS_MAX)
    # Define the boundaries of the inner square
    top_boundary = 80  # 100% - 20% from the top
    bottom_boundary = 20  # 20% from the bottom
    side_boundary = 25  # 25% inwards from the sides
    # Calculate the range for X and Y coordinates
    x_range = (side_boundary, 100 - side_boundary)
    y_range = (bottom_boundary, top_boundary)
    # Generate random coordinates within the specified range
    ENEMY_X = random.uniform(x_range[0], x_range[1])
    ENEMY_Y = random.uniform(y_range[0], y_range[1])
    # Generate random radius within the specified range
    ENEMY_RADIUS_MIN = random.uniform(10, 15)
    ENEMY_RADIUS_MAX = random.uniform(ENEMY_RADIUS_MIN, 15)
    print(ENEMY_X, ENEMY_Y)
    return ENEMY_X, ENEMY_Y, random.uniform(ENEMY_RADIUS_MIN, ENEMY_RADIUS_MAX)
def is_within_enemy_radius(x, y):
    distance = math.sqrt((x - ENEMY_X)**2 + (y - ENEMY_Y)**2)
    return ENEMY_RADIUS_MIN <= distance <= ENEMY_RADIUS_MAX
@app.route('/startMission', methods=['POST'])
def start_mission():
    global X_COORD, Y_COORD, ENEMY_X, ENEMY_Y
    random_x, random_y, random_radius = generate_random_coordinates()
    ENEMY_X = random_x
    ENEMY_Y = random_y
    ENEMY_RADIUS = random_radius
    print(ENEMY_X, ENEMY_Y, ENEMY_RADIUS)
    data = request.json
    X_COORD = data.get('initX', 5.1)
    Y_COORD = data.get('initY', 6.0)
    return jsonify({"message": "Mission started", "X_COORD": X_COORD, "Y_COORD": Y_COORD, "ENEMY_X": ENEMY_X, "ENEMY_Y": ENEMY_Y, "ENEMY_RADIUS": ENEMY_RADIUS})
@app.route('/commandToMove', methods=['POST'])
def command_to_move():
    global X_COORD, Y_COORD
    data = request.json
    slope = data.get('slope', 0.0)
    # Calculate angle from slope
    angle = math.atan(slope)
    new_x = X_COORD + MOVE_DISTANCE * math.cos(angle)
    new_y = Y_COORD + MOVE_DISTANCE * math.sin(angle)
    if is_within_enemy_radius(new_x, new_y):
        opposite_angle = angle + math.pi  # Calculate the opposite angle
        backtrack_distance = MOVE_DISTANCE * 2  # Backtrack for a certain distance
        # Move the drone in the opposite direction
        X_COORD -= backtrack_distance * math.cos(opposite_angle)
        Y_COORD -= backtrack_distance * math.sin(opposite_angle)
        return jsonify({"message": "Found air defense", "X_COORD": X_COORD, "Y_COORD": Y_COORD})
    # Update coordinates
    X_COORD = new_x
    Y_COORD = new_y
    return jsonify({"message": "Moved", "X_COORD": X_COORD, "Y_COORD": Y_COORD, "slope": slope})
@app.route('/getCoordinates', methods=['GET'])
def get_coordinates():
    return jsonify({"X_COORD": X_COORD, "Y_COORD": Y_COORD})
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3050)