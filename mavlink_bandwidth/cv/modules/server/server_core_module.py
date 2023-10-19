from pymavlink import mavutil
import cv2
import numpy as np
import time
import signal
from threading import Thread, Event
from detect_faces import detect_faces

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
                print('END OF IMAGE')
                break
            else:
                print('START_OF_IMAGE')
                img_size = msg.size
        elif msg.get_type() == 'CAMERA_CAPTURE_STATUS':
            print('HALT')
            should_stop.set()
            break
        elif msg.get_type() == 'PING':
            print('PING')
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
  print(f"len(buf): {len(buffer)}")
  return buffer

def handle_video_stream(msg):
  print(f"Connecting to {msg.uri}...")
  data_conn = mavutil.mavlink_connection(msg.uri, source_component=1)
  print("Connected!")
  print(dir(data_conn))
  data_conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
    mavutil.mavlink.MAV_AUTOPILOT_INVALID,
    0, 0, 0)
  images_per_second = msg.framerate
  fourcc = cv2.VideoWriter_fourcc(*'mp4v')
  out = cv2.VideoWriter(f"{msg.name}.mp4", fourcc, images_per_second, (1280,720))
  images_received = 0
  last_image_requested_at = 0
  image_interval = 1 / images_per_second # second(s)
  t0 = time.time()
  while not should_stop.is_set():
    if last_image_requested_at + image_interval > time.time():
        time.sleep(last_image_requested_at + image_interval - time.time())
    last_image_requested_at = time.time()
    # Request image
    print('Requesting image')
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
    print(len(buffer))

    
    mat = cv2.imdecode(np.asarray(buffer), cv2.IMREAD_COLOR)
    detect_faces(mat)
    out.write(mat)

    images_received += 1

  print('received %d images' % images_received)
  conn.port.close()
  out.release()
  return images_received

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

