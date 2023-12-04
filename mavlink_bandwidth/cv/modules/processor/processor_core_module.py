from pymavlink import mavutil
import cv2
import numpy as np
import time
import signal
import sys
sys.path.append('.')
from threading import Thread, Event
from detect_faces import detect_faces
from processor_video_module import handle_video_stream
from processor_audio_module import handle_audio_stream
from util.BandwidthLogger import BandwidthLogger

import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands
mavutil.set_dialect('murry')

should_stop = Event()

logger = BandwidthLogger()



print(sys.argv)
use_cam = not '-no_cam' in sys.argv
use_mic = not '-no_mic' in sys.argv
use_security = '-sec' in sys.argv
camera_conn = None
if use_cam:
  camera_conn = mavutil.mavlink_connection('tcp:localhost:14540')
  logger.add_module('camera_device', camera_conn)
  camera_conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
                          mavutil.mavlink.MAV_AUTOPILOT_INVALID,
                          1, 0, 0)

mic_conn = None
if use_mic:
  mic_conn = mavutil.mavlink_connection('tcp:localhost:14550')
  logger.add_module('microphone_device', mic_conn)
  mic_conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
                          mavutil.mavlink.MAV_AUTOPILOT_INVALID,
                          1, 0, 0)

# Run postprocessing before exiting
def sigint_handler(signum, frame):
  print('sigint')
  if should_stop.is_set():
    exit(0)
  cv2.destroyAllWindows()
  should_stop.set()
  logger.stop()
  # if (not use_cam or camera_conn.mav.total_bytes_received == 0) and (not use_mic or mic_conn.mav.total_bytes_received == 0):
  if use_cam:
    print('closing cam')
    camera_conn.close()
  if use_mic:
    mic_conn.close()
  exit(0)
    
signal.signal(signal.SIGINT, sigint_handler)

logger.start()

def request_video_stream(conn):
  message = conn.mav.command_long_encode(
        conn.target_system,  # Target system ID
        conn.target_component,  # Target component ID
        mavutil.mavlink.MAV_CMD_VIDEO_START_CAPTURE,  # ID of command to send
        0, # Confirmation
        0, # param1: All streams
        0, # param2: Camera status frequency = never
        0, # param3 (unused)
        0, # param4 (unused)
        0, # param5 (unused)
        0, # param6 (unused)
        0  # param7 (unused)
  )
  conn.mav.send(message)

  message = conn.mav.command_long_encode(
        conn.target_system,  # Target system ID
        conn.target_component,  # Target component ID
        mavutil.mavlink.MAV_CMD_REQUEST_MESSAGE,  # ID of command to send
        0,  # Confirmation
        mavutil.mavlink.MAVLINK_MSG_ID_VIDEO_STREAM_INFORMATION,  # param1: Message ID to be streamed
        0, # param2: Get all streams
        0, # param3 (unused)
        0, # param4 (unused)
        0, # param5 (unused)
        0, # param5 (unused)
        0  # param6 (unused)
  )
  conn.mav.send(message)

def request_audio_stream(conn):
  print("requesting audio stream")
  message = conn.mav.command_long_encode(
        conn.target_system,  # Target system ID
        conn.target_component,  # Target component ID
        mavutil.mavlink.MAV_CMD_AUDIO_START_CAPTURE, # ID of command to send
        0, # Confirmation
        0, # param1: All streams
        0, # param2 (unused)
        0, # param3 (unused)
        0, # param4 (unused)
        0, # param5 (unused)
        0, # param6 (unused)
        0  # param7 (unused)
  )
  conn.mav.send(message)

  message = conn.mav.command_long_encode(
        conn.target_system,  # Target system ID
        conn.target_component,  # Target component ID
        mavutil.mavlink.MAV_CMD_REQUEST_MESSAGE,  # ID of command to send
        0,  # Confirmation
        mavutil.mavlink.MAVLINK_MSG_ID_AUDIO_STREAM_INFORMATION,  # param1: Message ID to be streamed
        0, # param2: Get all streams
        0, # param3 (unused)
        0, # param4 (unused)
        0, # param5 (unused)
        0, # param5 (unused)
        0  # param6 (unused)
  )
  conn.mav.send(message)

if use_cam:
  request_video_stream(camera_conn)

if use_mic:
  request_audio_stream(mic_conn)

while not should_stop.is_set():
  msg = None
  if use_cam:
    msg = camera_conn.recv_msg()
  if msg is None and use_mic:
    msg = mic_conn.recv_msg()
  if msg is None:
    continue
  print(msg.get_type())
  if msg.get_type() == 'VIDEO_STREAM_INFORMATION' and use_cam:
    time.sleep(1)
    Thread(target = handle_video_stream, args = (msg, logger, should_stop, use_security)).start()
  if msg.get_type() == 'AUDIO_STREAM_INFORMATION' and use_mic:
    time.sleep(1)
    print('starting thread!')
    Thread(target = handle_audio_stream, args = (msg, logger)).start()



