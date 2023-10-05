from pymavlink import mavutil
import cv2
import time
import math

# Wait until a connection is initiated by another node (receiver_node.py)
conn = mavutil.mavlink_connection('tcpin::14540')
conn.wait_heartbeat()
print("Heartbeat from system (system %u component %u)" % (conn.target_system, conn.target_component))

cam = cv2.VideoCapture(0)

def handle_image_request():
  t0 = time.time()
  t1 = time.time()
  bytes_sent = 0
  bytes_recv = 0
  
  if not cam.isOpened():
    print("Camera not opened!")
    return
  
  result, image = cam.read()
  
  if not result:
    print("Failed!")
  
  b = bytearray(cv2.imencode('.jpg', image)[1])
  print(len(b))
  
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
  t0 = time.time()
  
  while len(b) > 0:
    # print(len(b))
    if len(b) < 253:
        print(f'Padding with {253 - len(b)} bytes')
    
    conn.mav.encapsulated_data_send(
        seqnr,
        b[0:253] if len(b) > 253 else b + bytearray((253 - len(b)) * [0])
    )
    seqnr += 1
    t2 = time.time()
    if len(b) >= 253:
        b = b[253:]
    else:
        break
  
  t0 = time.time() - t0
  print('Sent %d bytes of image data' % init_len)
  print("Overall: %u sent, %u received, %u errors bwin=%.1f kB/s bwout=%.1f kB/s" % (
    conn.mav.total_packets_sent,
    conn.mav.total_packets_received,
    conn.mav.total_receive_errors,
    0.001*(conn.mav.total_bytes_received)/t0,
    0.001*(conn.mav.total_bytes_sent)/t0))
  
  # All zero values to end transmission
  conn.mav.data_transmission_handshake_send(0,0,0,0,0,0,0)
  

while True:
    msg = conn.recv_msg()
    if msg is None:
      continue
    if msg.get_type() == 'DATA_TRANSMISSION_HANDSHAKE':
      handle_image_request()

