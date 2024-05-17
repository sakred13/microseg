import requests
import time
import math
import json
import sys
import base64
from cryptography.fernet import Fernet
# File path for saving mission state

MISSION_STATE_FILE = "mission_state.json"

if len(sys.argv) != 8:
    print("Usage: python script.py initX initY destX destY survIp supIp relayIp")
    sys.exit(1)

with open("encryptionKey.txt", "rb") as key_file:
    encryptionKey = key_file.read()

import json
import base64
from cryptography.fernet import Fernet

def load_secure_vault():
    """Load encryption keys from a file into a list."""
    try:
        with open('securevault_keychain.txt', 'r') as file:
            return [line.strip() for line in file.readlines()]
    except FileNotFoundError:
        print("The file securevault_keychain.txt was not found.")
        return []
    except Exception as e:
        print(f"An error occurred: {e}")
        return []

def encrypt_json(data, encryptionKey):
    """Encrypt JSON data."""
    fernet = Fernet(encryptionKey.encode())
    # Data must be a string before being encoded to bytes for encryption
    data_bytes = json.dumps(data).encode()
    encrypted = fernet.encrypt(data_bytes)
    return base64.urlsafe_b64encode(encrypted).decode()

def decrypt_json(encrypted_data, encryptionKey):
    """Decrypt JSON data."""
    fernet = Fernet(encryptionKey.encode())
    # Convert base64 string to bytes before decryption
    encrypted_data_bytes = base64.urlsafe_b64decode(encrypted_data.encode())
    decrypted_bytes = fernet.decrypt(encrypted_data_bytes)
    return json.loads(decrypted_bytes.decode())

def encrypt_by_secure_vault(data, key_indices):
    """Encrypt data using keys from secure_vault based on indices."""
    for index in reversed(key_indices):
        data = encrypt_json(data, secure_vault[index])
        print(f"Data after encryption with key {index}: {data}")  # Debugging output
    return data

def decrypt_by_secure_vault(data, key_indices):
    """Decrypt data using keys from secure_vault based on indices."""
    for index in key_indices:
        data = decrypt_json(data, secure_vault[index])
        print(f"Data after decryption with key {index}: {data}")  # Debugging output
    return data

# Parse command-line arguments
secure_vault = load_secure_vault()
initX, initY, destX, destY = map(float, sys.argv[1:5])
survIp, supIp, relayIp = map(str, sys.argv[5:8])

survX, survY, supX, supY, relayX, relayY = initX, initY, initX, initY, initX, initY
relayDestX, relayDestY = 0, 0
returnFlag = 1
turnPointX, turnPointY = None, None
enemyFound = False
enemyX, enemyY = None, None
survHome = False
turnpointReached = False  
survPath = []
supPath = []
relayPath = []
enemyRadius = 0
missionSuccess = False
survCommLost = False
supCommLost = False
survCommEst = False
supCommEst = False

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
        "relayPath": relayPath,
        "enemyRadius": enemyRadius,
        "destX": destX,
        "destY": destY,
        "missionSuccess": missionSuccess,
        "survCommLost": survCommLost,
        "supCommLost": supCommLost,
        "relayX": relayX,
        "relayY": relayY,
        "survCommEst": survCommEst,
        "supCommEst": supCommEst
        # Add other variables as needed
    }
    with open(MISSION_STATE_FILE, "w") as f:
        json.dump(mission_state, f)

def clear_mission_state():
    with open(MISSION_STATE_FILE, "w") as f:
        f.write("")

def is_home(x, y, move_distance):
    distance = math.sqrt((x - initX)**2 + (y - initY)**2)
    return returnFlag == -1 and distance <= move_distance

def comm_established(x, y, move_distance):
    distance = math.sqrt((x - relayDestX)**2 + (y - relayDestY)**2)
    return returnFlag == -1 and distance <= move_distance

def turnpoint_reached(x, y, move_distance):
    distance = math.sqrt((x - turnPointX)**2 + (y - turnPointY)**2)
    print('distance: ', distance)
    return distance <= move_distance

def dest_reached(x, y, move_distance):
    distance = math.sqrt((x - destX)**2 + (y - destY)**2)
    return distance <= move_distance

# Start the mission by making a POST request to the first server
response = requests.post(f'http://{survIp}:3050/startMission', data = encrypt_json({'initX': initX, 'initY': initY, 'destX': destX, 'destY': destY}, encryptionKey))
if response.ok:
    # Continue if response is OK
    requests.post(f'http://{supIp}:4050/startMission', data = encrypt_json({'initX': initX, 'initY': initY}, encryptionKey))
    
    # Calculate the destination direction
    destinationDirection = (destY - initY) / (destX - initX) if (destX - initX) != 0 else float('inf')
    survMoveCommand = f'http://{survIp}:3050/commandToMove'
    supMoveCommand = f'http://{supIp}:4050/commandToMove'
    # Start the movement loop
    while True:

        survPath.append({'x': survX, 'y': survY})

        print("survX: ", survX, ", survY: ", survY)  # Print surveillance drone coordinates
        
        # Make a POST API call every one second
        try:
            response = requests.post(survMoveCommand, data=encrypt_json({'slope': destinationDirection, 'distance': 40 * returnFlag}, encryptionKey))
            response_data = decrypt_json(response.data, encryptionKey)
            if response.ok:
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

        except requests.exceptions.ConnectionError as e:
            print("Connection error occurred:", e)
        # else:
            survCommLost = True
            relayDestX, relayDestY = (initX + survX)/2, (initY + survY)/2
            lastFoundDirection = (relayDestY - initY) / (relayDestX - initX) if (relayDestX - initX) != 0 else float('inf')
            while True:
                relayPath.append({'x': relayX, 'y': relayY})

                print("relayX: ", relayX, ", relayY: ", relayY)  # Print surveillance drone coordinates
                
                # Make a POST API call every one second
                response = requests.post(f'http://{relayIp}:5050/commandToMove', data=encrypt_json({'slope': lastFoundDirection, 'distance': 40}, encryptionKey))
                response_data = decrypt_json(response.data, encryptionKey)
                print('Response from Surveillance Drone Received')

                if response_data.get('message') == "Moved":
                    # Update coordinates if moved
                    relayX, relayY = response_data.get('X_COORD'), response_data.get('Y_COORD')
                
                if comm_established(relayX, relayY, 40):
                    survCommEst = True
                    print("Relay Communication Established")
                    survMoveCommand = f'http://{relayIp}:5050/relayBridge?dest={survIp}:3050'
                    break
                update_mission_state()
        
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
            time.sleep(10)
            clear_mission_state()
            break
        
        response = requests.post(supMoveCommand, json={'slope': turnPointDirection, 'distance': 40})
        if response.ok:
            print('Response from Supply Drone Received')
            response_data = response.json()
            if response_data.get('message') == "Moved":
                # Update coordinates if moved
                supX, supY = response_data.get('X_COORD'), response_data.get('Y_COORD')
                if turnpointReached or enemyFound == False:
                    turnPointDirection = (destY - supY) / (destX - supX) if (destX - supX) != 0 else float('inf')
                else:
                    turnPointDirection = (turnPointY - supY) / (turnPointX - supX) if (turnPointX - supX) != 0 else float('inf')

        else:
            supCommLost = True
            relayDestX, relayDestY = (initX + supX)/2, (initY + supY)/2
            lastFoundDirection = (relayDestY - initY) / (relayDestX - initX) if (relayDestX - initX) != 0 else float('inf')
            while True:
                relayPath.append({'x': relayX, 'y': relayY})

                print("relayX: ", relayX, ", relayY: ", relayY)  # Print surveillance drone coordinates
                
                # Make a POST API call every one second
                response = requests.post(f'http://{relayIp}:5050/commandToMove', json={'slope': lastFoundDirection, 'distance': 40})
                response_data = response.json()
                
                if response_data.get('message') == "Moved":
                    # Update coordinates if moved
                    relayX, relayY = response_data.get('X_COORD'), response_data.get('Y_COORD')
                
                if comm_established(relayX, relayY, 40):
                    supCommEst = True
                    print("Relay Communication Established")
                    supMoveCommand = f'http://{relayIp}:5050/relayBridge?dest={supIp}:4050'
                    break
        

        # Sleep for some time to avoid too frequent API calls
        time.sleep(1)
        update_mission_state()

else:
    print("Failed to start mission on the first server.")
