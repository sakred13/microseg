import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands
from pymavlink import mavutil
import pymavlink
print(pymavlink.__version__)
import cv2
import numpy as np
import time
from datetime import datetime
import signal
from threading import Thread, Event

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
        print(msg.get_type())
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

MAX_VIDEO_LENGTH = 60 # Seconds

def save_video_stream(msg, logger):
  print(f"Connecting to {msg.uri}...")
  data_conn = mavutil.mavlink_connection(msg.uri, source_component=1)
  logger.add_module('storage_video', data_conn)

  print("Connected!")
  data_conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
    mavutil.mavlink.MAV_AUTOPILOT_INVALID,
    0, 0, 0)
  images_per_second = msg.framerate
  fourcc = cv2.VideoWriter_fourcc(*'mp4v')
  out = cv2.VideoWriter(f"{msg.name}.mp4", fourcc, images_per_second, (1280,720))
  images_received = 0
  last_image_requested_at = 0
  image_interval = 1 / images_per_second # second(s)
  tolerance = image_interval * 0.1
  # print(f"tolerance: {tolerance}")
  t0 = time.monotonic()
  while not should_stop.is_set():
    # print(last_image_requested_at + image_interval - time.time())
    if last_image_requested_at + image_interval > time.monotonic() + tolerance:
      time.sleep(last_image_requested_at + image_interval - time.monotonic() - tolerance/2)
    last_image_requested_at = time.monotonic()
    # Request image
    # print('Requesting image')
    data_conn.mav.data_transmission_handshake_send(
        0, # Data stream type: JPEG
        0, # Total data size (ACK only)
        1280, # Width
        720, # Height
        0, # Number of packets being sent (ACK only)
        0, # Payload size per packet (ACK only)
        100 # JPEG quality
    )


    buffer = handle_data(data_conn)

    if buffer is None or len(buffer) == 0:
        continue
    
    mat = cv2.imdecode(np.asarray(buffer), cv2.IMREAD_COLOR)
    out.write(mat)

    images_received += 1

    if time.monotonic() - t0 >= MAX_VIDEO_LENGTH:
      out.release()
      out = cv2.VideoWriter(f"{datetime.now()}.mp4", fourcc, images_per_second, (1280,720))
      t0 = time.monotonic()

  logger.remove_module('storage_video')
  data_conn.port.close()
  out.release()
  return images_received