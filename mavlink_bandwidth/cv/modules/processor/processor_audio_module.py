import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands
from pymavlink import mavutil
import pymavlink
print(pymavlink.__version__)
import cv2
import numpy as np
import time
import signal
from threading import Thread, Event
from detect_faces import detect_faces
import sounddevice as sd
from io import BytesIO

mavutil.set_dialect('common')

# Module to receive videos from devices
should_stop = Event()

# Run postprocessing before exiting
def sigint_handler(signum, frame):
    if should_stop.is_set():
        exit(0)
    should_stop.set()
    if conn.mav.total_bytes_received == 0:
        exit(0)
    
signal.signal(signal.SIGINT, sigint_handler)

def handle_data(data_conn):
  buffer = bytearray()
  img_size = 0
  last_seqnr = -1
  recvd = 0
  looped = 0
  while recvd != 0 or not should_stop.is_set():
    msg = data_conn.recv_msg()
    looped += 1
    if msg:
        # print(msg.get_type())
        if msg.get_type() == 'ENCAPSULATED_DATA':
            # print('GOOD DATA %d' % msg.seqnr)
            # print('Received', msg.seqnr)
            if msg.seqnr <= last_seqnr:
                print("Warning: sequence numbers not received in order!")
            last_seqnr = msg.seqnr
            recvd += 1
            buffer += bytearray(msg.data)
        elif msg.get_type() == 'DATA_TRANSMISSION_HANDSHAKE':
            if msg.size == 0:
                # print('END OF IMAGE')
                break
            else:
                # print('START_OF_IMAGE')
                img_size = msg.size
        elif msg.get_type() == 'CAMERA_CAPTURE_STATUS':
            # print('HALT')
            should_stop.set()
            break
        elif msg.get_type() == 'PING':
            # print('PING')
            data_conn.mav.ping_send(
                int((time.time()-int(time.time())) * 1000000),
                0,
                0,
                0
            )
        elif msg.get_type() == 'BAD_DATA':
            print('BAD DATA')
  if recvd == 0 or len(buffer) == 0:
    return None
  padding_size = len(buffer) - img_size
  buffer = buffer[:-padding_size]
  return buffer

def handle_audio_stream(msg, logger):
  print(f"Connecting to {msg.uri}...")
  data_conn = mavutil.mavlink_connection(msg.uri, source_component=1)
  logger.add_module('audio', data_conn)

  freq = 44100
  duration = 5
  print("Connected!")
  data_conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
    mavutil.mavlink.MAV_AUTOPILOT_INVALID,
    0, 0, 2)
  # images_per_second = msg.framerate
  # fourcc = cv2.VideoWriter_fourcc(*'mp4v')
  # out = cv2.VideoWriter(f"{msg.name}.mp4", fourcc, images_per_second, (1280,720))
  # images_received = 0
  # last_image_requested_at = 0
  # image_interval = 1 / images_per_second # second(s)
  # tolerance = image_interval * 0.1
  # # print(f"tolerance: {tolerance}")

  # t0 = time.time()
  while not should_stop.is_set():
    data_conn.mav.data_transmission_handshake_send(
        0, # Data stream type: JPEG
        0, # Total data size (ACK only)
        0, # Width
        0, # Height
        0, # Number of packets being sent (ACK only)
        0, # Payload size per packet (ACK only)
        100 # JPEG quality
    )


    chunk = handle_data(data_conn)
    bio = BytesIO(chunk)
    arr = np.load(bio, allow_pickle=True)
    print(arr.tolist())
    sd.play(arr)

  # if buffer is None or len(buffer) == 0:
  #     continue
    
  logger.remove_module('audio')
  data_conn.port.close()
  return 0