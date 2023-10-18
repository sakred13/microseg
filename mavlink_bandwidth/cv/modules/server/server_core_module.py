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
      #print('looping')
      looped += 1
      if msg:
          #print(msg.get_type())
          if msg.get_type() == 'ENCAPSULATED_DATA':
              # print('GOOD DATA %d' % msg.seqnr)
              # print('Received', msg.seqnr)
              if msg.seqnr <= last_seqnr:
                  print("Warning: sequence numbers not received in order!")
              last_seqnr = msg.seqnr
              recvd += 1
              buffer += bytearray(msg.data)
          elif msg.get_type() == 'DATA_TRANSMISSION_HANDSHAKE':
              print('END OF IMAGE')
              if msg.size == 0:
                  #print(f'Finished with seqnr={last_seqnr} and {recvd} packets')
                  break
              img_size = msg.size
              #print(f'Expecting {msg.packets} packets')
          elif msg.get_type() == 'CAMERA_CAPTURE_STATUS':
              print('HALT')
              connected = False
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
  return buffer

def handle_video_stream(msg):
  data_conn = mavutil.mavlink_connection(msg.uri)
  images_per_second = msg.framerate
  fourcc = cv2.VideoWriter_fourcc(*'mp4v')
  out = cv2.VideoWriter(f"{msg.name}.mp4", fourcc, images_per_second, (1280,720))
  images_received = 0
  last_image_requested_at = 0
  image_interval = 1 / images_per_second # second(s)
  t0 = time.time()
  connected = True
  while not should_stop.is_set() and connected:
    if last_image_requested_at + image_interval > time.time():
        time.sleep(last_image_requested_at + image_interval - time.time())
    last_image_requested_at = time.time()
    # Request image
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

    if buffer is None:
        continue


    if padding_size < 0:
        print('Padding must be non-negative!')
        exit(-1)

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
    handle_video_stream(msg)

