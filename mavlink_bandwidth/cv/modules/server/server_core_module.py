from pymavlink import mavutil
import cv2
import numpy as np
import time
import signal
from threading import Thread, Event
from detect_faces import detect_faces
from server_video_module import handle_video_stream

import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands

should_stop = Event()

# Run postprocessing before exiting
def sigint_handler(signum, frame):
    cv2.destroyAllWindows()
    should_stop.set()
    if conn.mav.total_bytes_received == 0:
        exit(0)
    
signal.signal(signal.SIGINT, sigint_handler)


conn = mavutil.mavlink_connection('tcpin::14540')
while not should_stop.is_set():
    # print('waiting for heartbeat')
    if conn.wait_heartbeat(timeout=1):
        break

message = conn.mav.command_long_encode(
      conn.target_system,  # Target system ID
      conn.target_component,  # Target component ID
      mavutil.mavlink.MAV_CMD_VIDEO_START_CAPTURE,  # ID of command to send
      0,  # Confirmation
      0,  # param1: All streams
      0, # param2: Camera status frequency = never
      0,       # param3 (unused)
      0,       # param4 (unused)
      0,       # param5 (unused)
      0,       # param6 (unused)
      0        # param7 (unused)
)
conn.mav.send(message)

message = conn.mav.command_long_encode(
      conn.target_system,  # Target system ID
      conn.target_component,  # Target component ID
      mavutil.mavlink.MAV_CMD_REQUEST_MESSAGE,  # ID of command to send
      0,  # Confirmation
      mavutil.mavlink.MAVLINK_MSG_ID_VIDEO_STREAM_INFORMATION,  # param1: Message ID to be streamed
      0, # param2: Get all streams
      0,       # param3 (unused)
      0,       # param4 (unused)
      0,       # param5 (unused)
      0,       # param5 (unused)
      0        # param6 (unused)
)
conn.mav.send(message)


while not should_stop.is_set():
  msg = conn.recv_msg()
  if msg is None:
    continue
  print(msg.get_type())
  if msg.get_type() == 'VIDEO_STREAM_INFORMATION':
    time.sleep(1)
    handle_video_stream(msg)
    conn.close()
    break

