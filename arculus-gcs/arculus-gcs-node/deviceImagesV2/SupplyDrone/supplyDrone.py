from flask import Flask, request, jsonify, Response
import math
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

secure_vault = load_secure_vault()
with open("encryptionKey.txt", "rb") as key_file:
    encryptionKey = key_file.read()

app = Flask(__name__)

# Global variables
X_COORD = None
Y_COORD = None
blocklist = []  # Initialize an empty list for blocked IP addresses

@app.route('/startMission', methods=['POST'])
def start_mission():
    global X_COORD, Y_COORD
    data = decrypt_json(request.data, encryptionKey)
    X_COORD = data.get('initX', 5.1)
    Y_COORD = data.get('initY', 6.0)
    return Response(encrypt_json({"message": "Mission started", "X_COORD": X_COORD, "Y_COORD": Y_COORD}, encryptionKey), mimetype='text/plain')

@app.route('/commandToMove', methods=['POST'])
def command_to_move():
    global X_COORD, Y_COORD
    data = decrypt_json(request.data, encryptionKey)
    slope = data.get('slope', 0.0)
    move_distance = data.get('distance', 2)
    angle = math.atan(slope)
    new_x = X_COORD + move_distance * math.cos(angle)
    new_y = Y_COORD + move_distance * math.sin(angle)
    X_COORD = new_x
    Y_COORD = new_y
    return Response(encrypt_json({"message": "Moved", "X_COORD": X_COORD, "Y_COORD": Y_COORD}, encryptionKey), mimetype='text/plain')

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

@app.route('/getCoordinates', methods=['GET'])
def get_coordinates():
    return jsonify({"X_COORD": X_COORD, "Y_COORD": Y_COORD})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=4050)
