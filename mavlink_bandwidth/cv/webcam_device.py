from pymavlink import mavutil
import cv2
import time
import math
import signal
from threading import Thread, Event

import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands
mavutil.set_dialect('common')



# Wait until a connection is initiated by another node (receiver_node.py)
conn = mavutil.mavlink_connection('tcp:localhost:14540')
# conn = mavutil.mavlink_connection('tcp:3.19.237.42:14540')
conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
                        mavutil.mavlink.MAV_AUTOPILOT_INVALID,
                        0, 0, 0)

cam = cv2.VideoCapture(0)
if not cam.isOpened():
  print("Camera not opened!")
  exit(1)

should_stop = Event()

# Run postprocessing before exiting
def sigint_handler(signum, frame):
    cv2.destroyAllWindows()
    should_stop.set()
    
signal.signal(signal.SIGINT, sigint_handler)

t0 = 0

def handle_image_send(conn):
  

  result, image = cam.read()
  
  if not result:
    print("Failed!")
    return
  
  b = bytearray(cv2.imencode('.jpg', image)[1])
  
  init_len = len(b)
  # Request image
  conn.mav.data_transmission_handshake_send(
    0, # Data stream type: JPEG
    len(b), # Total data size (ACK only)
    1280, # Width
    720, # Height
    math.ceil(len(b) / 253), # Number of packets being sent (ACK only)
    253, # Payload size per packet (ACK only)
    100 # JPEG quality
  )
  
  seqnr = 0 # Sequence number for chunk
  
  while len(b) > 0:
    # print(len(b))
    #if len(b) < 253:
        #print(f'Padding with {253 - len(b)} bytes')
    print('seqnr: %d, len(b): %d' % (seqnr, len(b[0:253])))
    conn.mav.encapsulated_data_send(
        seqnr,
        b[0:253] if len(b) > 253 else b + bytearray((253 - len(b)) * [0])
    )


    seqnr += 1
    if len(b) >= 253:
        b = b[253:]
    else:
        break

    if seqnr % 100 == 0:
      conn.mav.ping_send(
        int((time.time() - int(time.time())) * 1000000),
        0,
        0,
        0
      )
      while True:
        msg = conn.recv_msg()
        if msg is None:
          continue
        print(msg.get_type())
        if msg.get_type() == 'PING':
          break
  
  if should_stop.is_set():
    conn.mav.camera_capture_status_send(
      (int) (1000 * (time.time() - t0)), # timestamp
      0, # image capturing status = idle
      0, # video capturing status = idle
      0, # image capture interval
      0, # elapsed time since recording started = unavailable
      0, # available storage capacity
      0 # num images captured
    )

  # All zero values to end transmission
  conn.mav.data_transmission_handshake_send(0,0,0,0,0,0,0)
  
def handle_image_stream_request(conn):
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
  # stream_conn = mavutil.mavlink_connection('tcp:3.19.237.42:14541')
  # stream_conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
  #                       mavutil.mavlink.MAV_AUTOPILOT_INVALID,
  #                       0, 0, 0)

while not should_stop.is_set():
  msg = conn.recv_msg()
  if msg is None:
    continue
  print(msg.get_type())
  if t0 == 0:
    t0 = time.time()
  cmd = msg.get_type()
  if cmd == 'COMMAND_LONG':
    if msg.command == 2500:
      cmd = 'VIDEO_START_CAPTURE'
    else:
      print('Unknown command: %d' % msg.command)
    
    print('Unwrapped command: %s' % cmd)
  if cmd == 'VIDEO_START_CAPTURE':
    handle_image_stream_request(conn)

if t0 == 0:
  t0 = time.time() - 1

conn.mav.camera_capture_status_send(
  (int) (1000 * (time.time() - t0)), # timestamp
  0, # image capturing status = idle
  0, # video capturing status = idle
  0, # image capture interval
  0, # elapsed time since recording started = unavailable
  0, # available storage capacity
  0 # num images captured
)

delta_t = time.time() - t0

print("%u sent, %u received, %u errors bwin=%.1f kB/s bwout=%.1f kB/s" % (
  conn.mav.total_packets_sent,
  conn.mav.total_packets_received,
  conn.mav.total_receive_errors,
  0.001*(conn.mav.total_bytes_received)/delta_t,
  0.001*(conn.mav.total_bytes_sent)/delta_t))

