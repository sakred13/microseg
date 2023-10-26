from pymavlink import mavutil
from threading import Thread, Event
import signal
import time
import math
import sounddevice as sd
import numpy as np
from io import BytesIO


print('Starting audio module...')

conn = mavutil.mavlink_connection('tcpin::14558')

should_stop = Event()
def sigint_handler(signum, frame):
    if should_stop.is_set():
      conn.close()
      exit(0)
    should_stop.set()
    print('SIGINT')
    
signal.signal(signal.SIGINT, sigint_handler)

def send_chunk(conn):
  print('Sending chunk')
  freq = 44100
  duration = 5
  recording = sd.rec(int(duration * freq), samplerate=freq, channels=2)
  sd.wait()
  # print(recording.tolist())
  print(len(recording))
  print(recording.shape)
  by = bytes()
  np_bytes = BytesIO()
  np.save(np_bytes, recording, allow_pickle=True)
  np_bytes.seek(0)
  b = bytearray(np_bytes.read(-1))
  print(len(b))

  
  init_len = len(b)
  # Send image metadata
  # todo: send freq and duration
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
        # print(msg.get_type())
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
  # print('Sent image')

def handle_client(conn):
  while not should_stop.is_set():
    msg = conn.recv_msg()
    if msg is None:
      continue
    print(msg.get_type())
    if msg.get_type() == 'DATA_TRANSMISSION_HANDSHAKE':
      send_chunk(conn)
  conn.mav.camera_capture_status_send(
    (int) (1000 * (time.time() - t0)), # timestamp
    0, # image capturing status = idle
    0, # video capturing status = idle
    0, # image capture interval
    0, # elapsed time since recording started = unavailable
    0, # available storage capacity
    0 # num images captured
  )
  conn.port.close()

def print_summary(conn, delta_t):
  print("Overall: %u sent, %u received, %u errors bwin=%.1f kB/s bwout=%.1f kB/s" % (
      conn.mav.total_packets_sent,
      conn.mav.total_packets_received,
        conn.mav.total_receive_errors,
        0.001*(conn.mav.total_bytes_received)/delta_t,
        0.001*(conn.mav.total_bytes_sent)/delta_t))

def wait_heartbeat(conn):
  while not should_stop.is_set():
    # print('waiting for heartbeat')
    if conn.wait_heartbeat(timeout=1):
      print("Heartbeat from system (system %u component %u)" % (conn.target_system, conn.target_component))
      break

def refresh_conn(conn):
  while not should_stop.is_set():
      try:
          return conn.listen.accept()
      except Exception as e:
          pass

is_first_run = True
while not should_stop.is_set():
  if not is_first_run:
    conn = refresh_conn(conn)
  else:
    is_first_run = False

  wait_heartbeat(conn)
  if should_stop.is_set():
      break
  print('Heartbeak received!')

  t0 = time.time()
  handle_client(conn)

  delta_t = time.time() - t0
  print_summary(conn, delta_t)
