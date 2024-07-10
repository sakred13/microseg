from flask import Flask, request, jsonify
import math
import random
app = Flask(__name__)
# Global variables
# move_distance = 2
ENEMY_X = None
ENEMY_Y = None
ENEMY_RADIUS_MIN = None
ENEMY_RADIUS_MAX = None
ENEMY_RADIUS = None
X_COORD = 5.1
Y_COORD = 6
TURN_POINT_X = None
TURN_POINT_Y = None
blocklist = []  # Initialize an empty list for blocked IP addresses

def find_circle_line_intersections(circle_center, radius, point1, point2):
    (h, k), r = circle_center, radius
    (x1, y1), (x2, y2) = point1, point2

    # Check for vertical line
    if x1 == x2:
        # Calculate y values directly since we have a vertical line
        y_diff_square = r**2 - (x1 - h)**2
        if y_diff_square < 0:
            return None  # The line doesn't intersect the circle
        y_diff = math.sqrt(y_diff_square)
        return [(x1, k + y_diff), (x1, k - y_diff)]
    
    # Calculate line coefficients for non-vertical line
    a = y2 - y1
    b = x1 - x2
    c = x2 * y1 - x1 * y2
    
    A = a * a + b * b
    B = 2 * (a * c + a * b * k - b * b * h)
    C = c * c + 2 * b * c * k + b * b * k * k - b * b * r * r
    
    D = B * B - 4 * A * C
    if D < 0:
        return None  # No intersection
    
    intersections = []
    for sign in (-1, 1):
        x = (-B + sign * math.sqrt(D)) / (2 * A)
        y = (-a * x - c) / b
        intersections.append((x, y))
    
    return intersections

def midpoint_of_minor_arc(circle_center, radius, point1, point2):
    intersections = find_circle_line_intersections(circle_center, radius, point1, point2)
    
    if not intersections:
        return None  # No intersections, no arc
    
    angles = [math.atan2(y - circle_center[1], x - circle_center[0]) for x, y in intersections]
    angles = [angle if angle >= 0 else angle + 2 * math.pi for angle in angles]
    
    angles.sort()
    
    if angles[1] - angles[0] <= math.pi:
        midpoint_angle = (angles[0] + angles[1]) / 2
    else:
        midpoint_angle = (angles[0] + angles[1]) / 2 + math.pi
    
    midpoint_angle = midpoint_angle % (2 * math.pi)
    
    arc_midpoint_x = circle_center[0] + radius * math.cos(midpoint_angle)
    arc_midpoint_y = circle_center[1] + radius * math.sin(midpoint_angle)
    
    return arc_midpoint_x, arc_midpoint_y

# Function to calculate a point radially away from the midpoint of the arc
def point_radially_away_from_arc_midpoint(midpoint, center, radius, distance):
    # Calculate the angle of the midpoint relative to the center
    angle = math.atan2(midpoint[1] - center[1], midpoint[0] - center[0])
    
    # Calculate the new radius
    new_radius = radius + distance
    
    # Calculate the new point coordinates
    point_x = center[0] + new_radius * math.cos(angle)
    point_y = center[1] + new_radius * math.sin(angle)
    
    return point_x, point_y

def generate_random_coordinates():
    global ENEMY_X, ENEMY_Y, ENEMY_RADIUS_MIN, ENEMY_RADIUS_MAX, ENEMY_RADIUS
    # Check if enemy coordinates and radius have been generated
    # if ENEMY_X is not None and ENEMY_Y is not None and ENEMY_RADIUS_MIN is not None and ENEMY_RADIUS_MAX is not None:
    #     return ENEMY_X, ENEMY_Y, random.uniform(ENEMY_RADIUS_MIN, ENEMY_RADIUS_MAX)
    # Define the boundaries of the inner square
    top_boundary = 0.7 * 1024  # 100% - 20% from the top
    bottom_boundary = 0.3 * 1024  # 20% from the bottom
    side_boundary = 0.3 * 1792 # 25% inwards from the sides
    # Calculate the range for X and Y coordinates
    x_range = (side_boundary, 1792 - side_boundary)
    y_range = (bottom_boundary, top_boundary)
    # Generate random coordinates within the specified range
    ENEMY_X = random.uniform(x_range[0], x_range[1])
    ENEMY_Y = random.uniform(y_range[0], y_range[1])
    # Generate random radius within the specified range
    ENEMY_RADIUS_MIN = random.uniform(10, 15)
    ENEMY_RADIUS_MAX = random.uniform(ENEMY_RADIUS_MIN, 15)
    print(ENEMY_X, ENEMY_Y)
    ENEMY_RADIUS = random.uniform(170, 190)

def is_within_dest_radius(x, y, move_distance):
    distance = math.sqrt((x - DEST_X)**2 + (y - DEST_Y)**2)
    return distance <= move_distance

def is_within_enemy_radius(x, y):
    distance = math.sqrt((x - ENEMY_X)**2 + (y - ENEMY_Y)**2)
    print('enemy radius', ENEMY_RADIUS, 'distance', distance)
    return distance <= ENEMY_RADIUS

@app.route('/startMission', methods=['POST'])
def start_mission():
    global X_COORD, Y_COORD, ENEMY_X, ENEMY_Y, ENEMY_RADIUS, DEST_X, DEST_Y, TURN_POINT_X, TURN_POINT_Y

    data = request.json
    X_COORD = data.get('initX', 5.1)
    Y_COORD = data.get('initY', 6.0)
    DEST_X = data.get('destX', 12)
    DEST_Y = data.get('destY', 12)

    generate_random_coordinates()

    try:
        midpoint = midpoint_of_minor_arc((ENEMY_X, ENEMY_Y), ENEMY_RADIUS, (X_COORD, Y_COORD), (DEST_X, DEST_Y))
        TURN_POINT_X, TURN_POINT_Y = point_radially_away_from_arc_midpoint(midpoint, (ENEMY_X, ENEMY_Y), ENEMY_RADIUS, 70)
    except:
        print('Not intersecting')
    return jsonify({"message": "Mission started", "X_COORD": X_COORD, "Y_COORD": Y_COORD, "ENEMY_X": ENEMY_X, "ENEMY_Y": ENEMY_Y, "ENEMY_RADIUS": ENEMY_RADIUS})
# , "TURN_POINT_X": TURN_POINT_X, "TURN_POINT_Y": TURN_POINT_Y

@app.route('/commandToMove', methods=['POST'])
def command_to_move():
    global X_COORD, Y_COORD
    data = request.json
    slope = data.get('slope', 0.0)
    move_distance = data.get('distance', 2)
    # Calculate angle from slope
    angle = math.atan(slope)
    new_x = (X_COORD if X_COORD else 0) + move_distance * math.cos(angle)
    new_y = (Y_COORD if Y_COORD else 0) + move_distance * math.sin(angle)
    if is_within_enemy_radius(new_x, new_y):
        # opposite_angle = angle + math.pi  # Calculate the opposite angle
        # backtrack_distance = move_distance   # Backtrack for a certain distance
        # # Move the drone in the opposite direction
        # X_COORD -= backtrack_distance * math.cos(opposite_angle)
        # Y_COORD -= backtrack_distance * math.sin(opposite_angle)
        return jsonify({"message": "Found air defense", "X_COORD": X_COORD, "Y_COORD": Y_COORD, "TURN_POINT_X": TURN_POINT_X, "TURN_POINT_Y": TURN_POINT_Y, "ENEMY_RADIUS": ENEMY_RADIUS, "ENEMY_X": ENEMY_X, "ENEMY_Y": ENEMY_Y})
    
    if is_within_dest_radius(new_x, new_y, move_distance):
        return jsonify({"message": "Reached Destination", "X_COORD": X_COORD, "Y_COORD": Y_COORD})
    
    # Update coordinates
    X_COORD = new_x
    Y_COORD = new_y
    return jsonify({"message": "Moved", "X_COORD": X_COORD, "Y_COORD": Y_COORD, "slope": slope})

@app.route('/getCoordinates', methods=['GET'])
def get_coordinates():
    return jsonify({"X_COORD": X_COORD, "Y_COORD": Y_COORD})
    
@app.route('/addToBlocklist', methods=['POST'])
def add_to_blocklist():
    ip = request.json.get('ip')
    if ip and ip not in blocklist:
        blocklist.append(ip)
        return jsonify({"message": f"{ip} added to blocklist"}), 200
    else:
        return jsonify({"message": "Invalid IP or already in blocklist"}), 400

@app.before_request
def check_ip_blocklist():
    requester_ip = request.remote_addr
    if requester_ip in blocklist:
        return jsonify({"message": "Forbidden access"}), 403
        
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=3050)