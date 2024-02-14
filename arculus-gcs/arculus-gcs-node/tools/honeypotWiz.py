from flask import Flask, request, jsonify
import sys
import subprocess

app = Flask(__name__)

if len(sys.argv) < 3:
    print("Usage: python3 honeypotWiz.py <arculus_public_ipv4_address> <arculus_private_ipv4_address>")
    sys.exit(1)

allowed_ip = sys.argv[1]
allowed_ip2 = sys.argv[2]

pot_type_commands = {
    "Cowrie": "sudo docker container prune -f && sudo rm -rf /Cowrie && sudo mkdir /Cowrie && cd /Cowrie && sudo wget \"{}/api/script/?text=true&script_id=3\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d",
    "Dionaea": "sudo docker container prune -f && sudo rm -rf /Dionaea && sudo mkdir /Dionaea && cd /Dionaea && sudo wget \"{}/api/script/?text=true&script_id=4\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d",
    "Conpot": "sudo docker container prune -f && sudo rm -rf /Conpot && sudo mkdir /Conpot && cd /Conpot && sudo wget \"{}/api/script/?text=true&script_id=2\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d",
    "Elasticpot": "sudo docker container prune -f && sudo rm -rf /Elasticpot && sudo mkdir /Elasticpot && cd /Elasticpot && sudo wget \"{}/api/script/?text=true&script_id=5\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d",
    "ssh-auth-logger": "sudo docker container prune -f && sudo rm -rf /ssh-auth-logger && sudo mkdir /ssh-auth-logger && cd /ssh-auth-logger && sudo wget \"{}/api/script/?text=true&script_id=8\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d"
}

def is_allowed_ip(remote_ip):
    return remote_ip == allowed_ip or remote_ip == allowed_ip2

# Middleware to check the source IP address before processing requests
@app.before_request
def before_request():
    remote_ip = request.remote_addr
    if not is_allowed_ip(remote_ip):
        print('remote address: ', remote_ip)
        print('allowed address: ', allowed_ip)
        return jsonify({'error': 'Unauthorized access.'}), 401
        
@app.route('/deployHoneyPot', methods=['POST'])
def execute_command():
    try:
        data = request.get_json()
        pot_type = data.get('potType')
        deploy_key = data.get('deployKey')
        url = data.get('url')

        print(pot_type, deploy_key, url)

        if pot_type in pot_type_commands.keys():
            command = pot_type_commands[pot_type].format(url, url, deploy_key)
            if command:
                # Run the command and wait for it to complete
                result = subprocess.run(command, shell=True, capture_output=True, text=True)

                # Check the return code of the command
                if result.returncode == 0:
                    # Command executed successfully, return a 200 OK response
                    output = result.stdout
                    return jsonify({'message': f"Command for {pot_type} executed successfully.", 'output': output}), 200
                else:
                    # Command failed, return a 500 Internal Server Error response
                    error_output = result.stderr
                    return jsonify({'error': f"Failed to execute command for {pot_type}.", 'output': error_output}), 500
            else:
                # No command defined, return a 400 Bad Request response
                return jsonify({'message': f"No command defined for {pot_type}."}), 400
        else:
            # Invalid potType specified, return a 400 Bad Request response
            return jsonify({'message': "Invalid potType specified."}), 400

    except Exception as e:
        # Handle exceptions and return a 500 Internal Server Error response
        return jsonify({'error': str(e)}), 500

pot_undep_commands = {
    "Cowrie": "sudo docker-compose -f /Cowrie/docker-compose.yml down && sudo rm -rf /Cowrie",
    "Dionaea": "sudo docker-compose -f /Dionaea/docker-compose.yml down && sudo rm -rf /Dionaea",
    "Conpot": "sudo docker-compose -f /Conpot/docker-compose.yml down && sudo rm -rf /Conpot",
    "Elasticpot": "sudo docker-compose -f /Elasticpot/docker-compose.yml down && sudo rm -rf /Elasticpot",
    "ssh-auth-logger": "sudo docker-compose -f /ssh-auth-logger/docker-compose.yml down && sudo rm -rf /ssh-auth-logger"
}

@app.route('/undeployHoneypot', methods=['DELETE'])
def undeploy_honeypot():
    try:
        data = request.get_json()
        pot_type = data.get('potType')

        if pot_type in pot_undep_commands.keys():
            command = pot_undep_commands[pot_type]

            # Run the command and wait for it to complete
            result = subprocess.run(command, shell=True, capture_output=True, text=True)

            # Check the return code of the command
            if result.returncode == 0:
                # Command executed successfully, return a 200 OK response
                output = result.stdout
                return jsonify({'message': f"Honeypot {pot_type} undeployed successfully.", 'output': output}), 200
            else:
                # Command failed, return a 500 Internal Server Error response
                error_output = result.stderr
                return jsonify({'error': f"Failed to undeploy honeypot {pot_type}.", 'output': error_output}), 500
        else:
            # Invalid potType specified, return a 400 Bad Request response
            return jsonify({'message': "Invalid potType specified."}), 400

    except Exception as e:
        # Handle exceptions and return a 500 Internal Server Error response
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
