from flask import Flask, request, jsonify
import subprocess

app = Flask(__name__)

pot_type_commands = {
    "Cowrie": "sudo mkdir /Cowrie && cd /Cowrie && sudo wget \"{}/api/script/?text=true&script_id=3\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d",
    "Dionaea": "sudo mkdir /Dionaea && cd /Dionaea && sudo wget \"{}/api/script/?text=true&script_id=4\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d",
    "Conpot": "sudo mkdir /Conpot && cd /Conpot && sudo wget \"{}/api/script/?text=true&script_id=2\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d",
    "Elasticpot": "sudo mkdir /Elasticpot && cd /Elasticpot && sudo wget \"{}/api/script/?text=true&script_id=5\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d",
    "ssh-auth-logger": "sudo mkdir /ssh-auth-logger && cd /ssh-auth-logger && sudo wget \"{}/api/script/?text=true&script_id=8\" --no-check-certificate -O deploy.sh && sudo bash deploy.sh {} {} && sudo docker-compose up -d"
}

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True, threaded=True)
