
import os
os.environ['MAVLINK20'] = "1" # Change to MAVLink 20 for video commands

from pymavlink import mavutil
import time
import math

# mavutil.set_dialect('common')

conn = mavutil.mavlink_connection('tcpin::14540')
conn.wait_heartbeat()
print("Heartbeat from system (system %u component %u)" % (conn.target_system, conn.target_component))


conn.mav.video_stream_information_send(
    1, # stream_id
    1, # number of streams available
    2, # stream type is RTSP
    1, # flag for VIDEO_STREAM_STATUS_FLAGS_RUNNING
    12,
    1280, # horizontal resolution
    720, # vertical resolution
    1000, # bit rate
    0, # rotation
    90, # horizontal fov
    b'Test', # name
    b'' # url
)


t0 = time.time()
t1 = time.time()
bytes_sent = 0
bytes_recv = 0

with open('sample_short.mp4', 'rb') as video:
    f = video.read()
    b = bytearray(f)
    print(len(b))
    init_len = len(b)
    # Request image
    payload_size = 253 # Max is 255, recommended is 253
    print(math.ceil(len(b)/payload_size))
    conn.mav.data_transmission_handshake_send(
        0, # Data stream type: JPEG
        len(b), # Total data size (ACK only)
        1280, # Width
        720, # Height
        math.ceil(len(b) / payload_size), # Number of packets being sent (ACK only)
        payload_size, # Payload size per packet (ACK only)
        100 # JPEG quality
    )
    seqnr = 0 # Sequence number for chunk
    t0 = time.time()
    t2 = time.time()
    while len(b) > 0:
        t2 = time.time()
        # print(len(b))
        if len(b) < payload_size:
            print(f'Padding with {payload_size - len(b)} bytes')
        conn.mav.encapsulated_data_send(
            seqnr,
            b[0:payload_size] if len(b) > payload_size else b + bytearray((payload_size - len(b)) * [0])
        )
        seqnr += 1
        if len(b) >= payload_size:
            b = b[payload_size:]
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
