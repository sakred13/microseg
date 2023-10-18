from pymavlink import mavutil
import cv2
from threading import Thread, Event
import signal

conn = mavutil.mavlink_connection('tcpin::14542')

cam = cv2.VideoCapture(0)
if not cam.isOpened():
  print("Camera not opened!")
  exit(1)

should_stop = Event()
def sigint_handler(signum, frame):
    cv2.destroyAllWindows()
    should_stop.set()
    
signal.signal(signal.SIGINT, sigint_handler)

def handle_image_send(conn):
  result, image = cam.read()
  
  if not result:
    print("Failed!")
    return
  
  b = bytearray(cv2.imencode('.jpg', image)[1])
  
  init_len = len(b)
  # Send image metadata
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

is_first_run = True
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

while not should_stop.is_set():
  
  if not is_first_run:
    conn = refresh_conn(conn)
  else:
    is_first_run = False

  wait_heartbeat(conn)
  if should_stop.is_set():
      break
  # print('heartbeat done')


  frames_received = handle_client(conn)

  print_summary(conn, delta_t, frames_received)
