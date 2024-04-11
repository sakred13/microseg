from flask import Flask, request, jsonify
import math
import requests
#from surveillanceDrone.surveillance import generate_random_coordinates

app = Flask(__name__)

# Global variables
X_COORD, Y_COORD = 20.0, 30.0
ENEMY_X, ENEMY_Y, ENEMY_RADIUS = 67.7, 63.6, 17
MOVE_DISTANCE = 2

def get_surveillance_coordinates():
    # Make a request to the surveillance drone for coordinates
    # response = requests.get('http://localhost:5590/getCoordinates')
    # data = response.json()
    # return data['ENEMY_X'], data['ENEMY_Y'], data['ENEMY_RADIUS']
    ENEMY_X = 90
    ENEMY_Y = 100
    ENEMY_RADIUS = 5
    return ENEMY_X, ENEMY_Y, ENEMY_RADIUS

def determine_smaller_half_of_circle(enemy_radius):
    global X_COORD, Y_COORD, ENEMY_X, ENEMY_Y

    # Calculate the angle between the drone and the enemy
    angle_to_enemy = math.atan2(ENEMY_Y - Y_COORD, ENEMY_X - X_COORD)

    # Calculate the angle from the drone's current position to the smaller half of the circle
    smaller_half_angle = angle_to_enemy - math.pi / 2  # Move to the left side of the circle

    # Calculate the coordinates on the smaller half of the circle with a margin of 5 units
    target_x = ENEMY_X + (enemy_radius + 5) * math.cos(smaller_half_angle)
    target_y = ENEMY_Y + (enemy_radius + 5) * math.sin(smaller_half_angle)

    # Calculate the perpendicular line
    perpendicular_angle = smaller_half_angle + math.pi / 2
    perpendicular_slope = math.tan(perpendicular_angle)

    # Adjust the supply destination coordinates based on the smaller half
    if smaller_half_angle < 0:
        supply_destination_x = target_x + 5  # Move to the right side
        supply_destination_y = perpendicular_slope * (supply_destination_x - target_x) + target_y
    else:
        supply_destination_x = target_x - 5  # Move to the left side
        supply_destination_y = perpendicular_slope * (supply_destination_x - target_x) + target_y

    return supply_destination_x, supply_destination_y, target_x, target_y

def move_around_circle_and_approach_supply():
    global X_COORD, Y_COORD

    # Determine the smaller half of the circle and the supply destination
    x, y, enemy_radius = get_surveillance_coordinates()  # Use the function to get coordinates
    supply_destination_x, supply_destination_y, target_x, target_y = determine_smaller_half_of_circle(enemy_radius)

    # Move towards the point 5 units away from the smaller half
    move_distance_to_target = 5
    angle_to_target = math.atan2(target_y - Y_COORD, target_x - X_COORD)
    new_x = X_COORD + move_distance_to_target * math.cos(angle_to_target)
    new_y = Y_COORD + move_distance_to_target * math.sin(angle_to_target)
    
    # Update coordinates
    X_COORD = new_x
    Y_COORD = new_y

    # Move in a straight line towards the supply destination
    angle_to_supply_destination = math.atan2(supply_destination_y - Y_COORD, supply_destination_x - X_COORD)
    new_x = X_COORD + MOVE_DISTANCE * math.cos(angle_to_supply_destination)
    new_y = Y_COORD + MOVE_DISTANCE * math.sin(angle_to_supply_destination)

    # Update coordinates
    X_COORD = new_x
    Y_COORD = new_y

@app.route('/startMission', methods=['POST'])
def start_mission():
    global X_COORD, Y_COORD
    surveillance_x, surveillance_y, random_radius = get_surveillance_coordinates()
    ENEMY_X = surveillance_x
    ENEMY_Y = surveillance_y
    ENEMY_RADIUS = random_radius
    data = request.json
    X_COORD = data.get('initX', 10)
    Y_COORD = data.get('initY', 20)
    return jsonify({"message": "Mission started", "X_COORD": X_COORD, "Y_COORD": Y_COORD, "ENEMY_X": ENEMY_X, "ENEMY_Y": ENEMY_Y, "ENEMY_RADIUS" : ENEMY_RADIUS})


@app.route('/moveAroundAndApproachSupply', methods=['POST'])
def move_around_and_approach_supply():
    move_around_circle_and_approach_supply()
    return jsonify({ "X_COORD": X_COORD, "Y_COORD": Y_COORD})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4050)
