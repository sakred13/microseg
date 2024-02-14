from flask import Flask, request

app = Flask(__name__)

@app.route('/api', methods=['GET'])
def receive_api_call():
    # Simulate some processing here
    return "OK"

if __name__ == "__main__":
    app.run(debug=True, port=5500)
