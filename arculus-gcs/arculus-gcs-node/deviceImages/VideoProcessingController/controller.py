import requests
import time
import math
import json
import sys
# File path for saving mission state
MISSION_STATE_FILE = "mission_state.json"

if len(sys.argv) != 7:
    print("Usage: python script.py initX initY destX destY survIp supIp")
    sys.exit(1)

# Parse command-line arguments
initX, initY, destX, destY = map(float, sys.argv[1:5])
survIp, supIp = map(str, sys.argv[5:7])

survX, survY, supX, supY = initX, initY, initX, initY
returnFlag = 1
turnPointX, turnPointY = None, None
enemyFound = False
enemyX, enemyY = None, None
survHome = False
turnpointReached = False
survPath = []
supPath = []
enemyRadius = 0
missionSuccess = False

# Function to update mission state and store in JSON file
def update_mission_state():
    mission_state = {
        "survX": survX,
        "survY": survY,
        "supX": supX,
        "supY": supY,
        "enemyFound": enemyFound,
        "survHome": survHome,
        "enemyX": enemyX,
        "enemyY": enemyY,
        "supPath": supPath,
        "survPath": survPath,
        "enemyRadius": enemyRadius,
        "destX": destX,
        "destY": destY,
        "missionSuccess": missionSuccess
        # Add other variables as needed
    }
    with open(MISSION_STATE_FILE, "w") as f:
        json.dump(mission_state, f)

def is_home(x, y, move_distance):
    distance = math.sqrt((x - initX)**2 + (y - initY)**2)
    return returnFlag == -1 and distance <= move_distance

def turnpoint_reached(x, y, move_distance):
    distance = math.sqrt((x - turnPointX)**2 + (y - turnPointY)**2)
    print('distance: ', distance)
    return distance <= move_distance

def dest_reached(x, y, move_distance):
    distance = math.sqrt((x - destX)**2 + (y - destY)**2)
    return distance <= move_distance

# Start the mission by making a POST request to the first server
response = requests.post(f'http://{survIp}:3050/startMission', json={'initX': initX, 'initY': initY, 'destX': destX, 'destY': destY})
if response.ok:
    # Continue if response is OK
    requests.post(f'http://{supIp}:4050/startMission', json={'initX': initX, 'initY': initY})
    
    # Calculate the destination direction
    destinationDirection = (destY - initY) / (destX - initX) if (destX - initX) != 0 else float('inf')
    
    # Start the movement loop
    while True:

        survPath.append({'x': survX, 'y': survY})

        print("survX: ", survX, ", survY: ", survY)  # Print surveillance drone coordinates
        
        # Make a POST API call every one second
        response = requests.post(f'http://{survIp}:3050/commandToMove', json={'slope': destinationDirection, 'distance': 40 * returnFlag})
        response_data = response.json()
        
        if response_data.get('message') == "Moved":
            # Update coordinates if moved
            survX, survY = response_data.get('X_COORD'), response_data.get('Y_COORD')
            destinationDirection = (destY - survY) / (destX - survX) if (destX - survX) != 0 else float('inf')
            
        elif response_data.get('message') == "Found air defense":
            # Update turn point and enemy coordinates if air defense is found
            print("Found Air Defense")
            returnFlag = -1
            turnPointX, turnPointY = response_data.get('TURN_POINT_X'), response_data.get('TURN_POINT_Y')
            enemyX, enemyY, enemyRadius = response_data.get('ENEMY_X'), response_data.get('ENEMY_Y'), response_data.get('ENEMY_RADIUS')
            enemyFound = True
            
        elif response_data.get('message') == "Reached Destination":
            # Update flag if destination is reached
            print("Reached Destination")
            returnFlag = -1
        
        if is_home(survX, survY, 40):
            print("Surveillance Drone reached home")
            survHome = True
            break
        
        time.sleep(1)
        update_mission_state()

    if enemyFound == False:
        turnPointDirection = (destY - supY) / (destX - supX) if (destX - supX) != 0 else float('inf')
    else:
        turnPointDirection = (turnPointY - supY) / (turnPointX - supX) if (turnPointX - supX) != 0 else float('inf')

    while True:
        # Update mission state
        print("supX: ", supX, ", supY: ", supY)  # Print supply drone coordinates
        supPath.append({'x': supX, 'y': supY})

        if enemyFound and turnpoint_reached(supX, supY, 40):
            print("Supply Drone turning")
            turnpointReached = True
        
        elif dest_reached(supX, supY, 40):
            missionSuccess = True
            print("Mission Success")
            update_mission_state()
            break
        
        response = requests.post(f'http://{supIp}:4050/commandToMove', json={'slope': turnPointDirection, 'distance': 40})
        response_data = response.json()
        if response_data.get('message') == "Moved":
            # Update coordinates if moved
            supX, supY = response_data.get('X_COORD'), response_data.get('Y_COORD')
            if turnpointReached or enemyFound == False:
                turnPointDirection = (destY - supY) / (destX - supX) if (destX - supX) != 0 else float('inf')
            else:
                turnPointDirection = (turnPointY - supY) / (turnPointX - supX) if (turnPointX - supX) != 0 else float('inf')
        

        # Sleep for some time to avoid too frequent API calls
        time.sleep(1)
        update_mission_state()

else:
    print("Failed to start mission on the first server.")
