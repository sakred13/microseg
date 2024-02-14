import requests
import time

def make_api_call():
    try:
        response = requests.get("https://44.204.27.252:5500/api")
        if response.status_code == 200:
            print("API call successful:", response.text)
        else:
            print("API call failed with status code:", response.status_code)
    except requests.exceptions.RequestException as e:
        print("Error making API call:", e)

if __name__ == "__main__":
    while True:
        make_api_call()
        time.sleep(5)
