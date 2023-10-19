from pymavlink import mavutil
import cv2
import time
import math
import signal
from threading import Thread, Event
import subprocess
import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands
mavutil.set_dialect('common')



# Wait until a connection is initiated by another node (receiver_node.py)
conn = mavutil.mavlink_connection('tcp:localhost:14540')
# conn = mavutil.mavlink_connection('tcp:3.19.237.42:14540')
conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
                        mavutil.mavlink.MAV_AUTOPILOT_INVALID,
                        1, 0, 0)


should_stop = Event()
proc = None

# Run postprocessing before exiting
def sigint_handler(signum, frame):
    cv2.destroyAllWindows()
    should_stop.set()
    if proc is not None:
      proc.kill()
    
signal.signal(signal.SIGINT, sigint_handler)

t0 = 0


def handle_start_video_capture_request(conn):
  print('video cap start')
  proc = subprocess.Popen(['python3', './device/device_video_module.py'])
  print('done')
  # stream_conn = mavutil.mavlink_connection('tcp:3.19.237.42:14541')
  # stream_conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
  #                       mavutil.mavlink.MAV_AUTOPILOT_INVALID,
  #                       0, 0, 0)

is_video_capture_active = False

def send_video_stream_information(conn):
  conn.mav.video_stream_information_send(
    1, # Video stream id
    1, # Num streams available
    2, # Type = MPEG on TCP (not reaally MPEG)
    1, # Status = Running
    4.0, # Framerate
    1280, # Width
    720, # Height
    1000, # bit rate
    0, # rotation
    90, # horizontal fov
    b'Test', # name
    b'tcp:localhost:14541' # url
  )

def handle_request_message(conn, msg):
  if msg.param1 == 269: # Video stream informiaton
    send_video_stream_information(conn)

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
    elif msg.command == 512:
      cmd = 'REQUEST_MESSAGE'
    else:
      print('Unknown command: %d' % msg.command)
    
    print('Unwrapped command: %s' % cmd)
  if cmd == 'VIDEO_START_CAPTURE' and not is_video_capture_active:
    is_video_capture_active = True
    handle_start_video_capture_request(conn)
  elif cmd == 'REQUEST_MESSAGE':
    handle_request_message(conn, msg)


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

