from pymavlink import mavutil
import cv2
import numpy as np
import time
import signal
from threading import Thread, Event
from detect_faces import detect_faces

import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands

# todo: getting BAD_DATA packages on cloud

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

def send_video_stream_information(con):
  conn.mav.video_stream_information_send(
    1, # Video stream id
    1, # Num streams available
    2, # Type = MPEG on TCP (not reaally MPEG)
    1, # Status = Running
    4.0, # Framerate
    1280, # Width
    720, # Height
    
  )

def handle_request_message(conn, msg):
  cmdnum = msg.command
  if cmdnum == 269: # Video Stream Information
    send_video_stream_information(conn)

while not should_stop.is_set():
  msg = conn.recv_msg()
  if msg is None:
    continue
  print(msg.get_type())
  cmd = msg.get_type()
  if cmd == 'COMMAND_LONG':
    if msg.command == 512:
      cmd = 'REQUEST_MESSAGE'
    else:
      print('Unknown command: %d' % msg.command)
    
    print('Unwrapped command: %s' % cmd)
  # todo: handle request video stream information message by pointing the device to the video_module port  
  if cmd == 'REQUEST_MESSAGE':
    print(msg)
    handle_request_message(conn, msg)

