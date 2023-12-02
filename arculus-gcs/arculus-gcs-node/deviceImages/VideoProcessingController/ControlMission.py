import os
import requests
import time

# Environment variables for source and destination coordinates
SRC_X = float(os.environ.get('SRC_X'))
SRC_Y = float(os.environ.get('SRC_Y'))
DST_X = float(os.environ.get('DST_X'))
DST_Y = float(os.environ.get('DST_Y'))

# Function to send a command to the surveillance drone
def send_surveillance_command(x_units):
    api_url = "http://survDrone/nextPointCommand"
    payload = {"x_units": x_units}
    response = requests.post(api_url, json=payload)
    return response.text

# Initial command to move the surveillance drone towards the destination
initial_response = send_surveillance_command(10)

if initial_response == "Everything clear":
    while True:
        # Check video data
        video_api_url = "/videoData"
        video_data_response = requests.get(video_api_url).text
        
        if video_data_response == "Everything clear":
            # Send the surveillance drone forward
            send_surveillance_command(10)
        elif video_data_response == "I see something":
            # Send the surveillance drone backward
            send_surveillance_command(-10)
        else:
            break  # Exit the loop if an unexpected response is received

    # Decide a turning point for the supply drone's new trajectory
    turning_point_x = (SRC_X + DST_X) / 2
    turning_point_y = (SRC_Y + DST_Y) / 2

    while True:
        # Send command to go to the turning point
        send_surveillance_command(turning_point_x)
        send_surveillance_command(turning_point_y)

        # Receive the current location of the supply drone
        supply_drone_location = requests.get("/supplyDroneLocation").json()
        supply_drone_x = supply_drone_location["x"]
        supply_drone_y = supply_drone_location["y"]

        # Check if the turning point is reached
        if (
            abs(supply_drone_x - turning_point_x) < 1
            and abs(supply_drone_y - turning_point_y) < 1
        ):
            # Set a flag and start directing the supply drone towards the destination
            supply_drone_flag = True

        if supply_drone_flag:
            # Calculate the direction towards the destination
            direction_x = DST_X - supply_drone_x
            direction_y = DST_Y - supply_drone_y

            # Send command to move towards the destination
            send_surveillance_command(direction_x)
            send_surveillance_command(direction_y)

            # Check if the final destination is reached
            if (
                abs(supply_drone_x - DST_X) < 1
                and abs(supply_drone_y - DST_Y) < 1
            ):
                break  # Stop sending new commands
        else:
            time.sleep(1)  # Wait for 1 second before checking the location again
else:
    print("Initial response from surveillance drone was unexpected.")
