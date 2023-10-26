from pymavlink import mavutil
import cv2
import time
import math
import signal
from threading import Thread, Event
import subprocess
import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands
mavutil.set_dialect('murry')

should_stop = Event()
capturing = Event()
proc = None

# Run postprocessing before exiting
def sigint_handler(signum, frame):
    cv2.destroyAllWindows()
    should_stop.set()
    if proc is not None:
      proc.kill()
    
signal.signal(signal.SIGINT, sigint_handler)

conn = mavutil.mavlink_connection('tcpin::14550')
while not should_stop.is_set():
  # print('waiting for heartbeat')
  if conn.wait_heartbeat(timeout=1):
    print('new connection!')
    break

t0 = 0


def handle_start_audio_capture_request(conn):
  print('audio cap start')
  proc = subprocess.Popen(['python3', './microphone/microphone_audio_module.py'])
  print('done')

is_audio_capture_active = False

def send_audio_stream_information(conn):
  conn.mav.audio_stream_information_send(
    1, # Audio stream id
    1, # Num streams available
    b'stream', # Stream name
    b'tcp:localhost:14558' # url
  )

def handle_request_message(conn, msg):
  if msg.param1 == 501: # Video stream informiaton
    send_audio_stream_information(conn)

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
    elif msg.command == 701:
      cmd = 'AUDIO_START_CAPTURE'
    else:
      print('Unknown command: %d' % msg.command)
    
    print('Unwrapped command: %s' % cmd)
  if cmd == 'AUDIO_START_CAPTURE' and not is_audio_capture_active:
    is_audio_capture_active = True
    handle_start_audio_capture_request(conn)
  elif cmd == 'REQUEST_MESSAGE':
    handle_request_message(conn, msg)


if t0 == 0:
  t0 = time.time() - 1

delta_t = time.time() - t0

print("%u sent, %u received, %u errors bwin=%.1f kB/s bwout=%.1f kB/s" % (
  conn.mav.total_packets_sent,
  conn.mav.total_packets_received,
  conn.mav.total_receive_errors,
  0.001*(conn.mav.total_bytes_received)/delta_t,
  0.001*(conn.mav.total_bytes_sent)/delta_t))

