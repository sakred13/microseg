from pymavlink import mavutil
import cv2
import numpy as np
import time
import signal
from threading import Thread, Event

# todo: expand to multiple connections without restarting

conn = mavutil.mavlink_connection('tcpin::14540')
conn.wait_heartbeat()
print("Heartbeat from system (system %u component %u)" % (conn.target_system, conn.target_component))

should_stop = Event()

# Run postprocessing before exiting
def sigint_handler(signum, frame):
    cv2.destroyAllWindows()
    should_stop.set()
    if conn.mav.total_bytes_received == 0:
        exit(0)
    
signal.signal(signal.SIGINT, sigint_handler)

images_received = 0
last_image_requested_at = 0
images_per_second = 4
image_interval = 1 / images_per_second # second(s)
t0 = time.time()
while images_received < 100 and not should_stop.is_set():
    if last_image_requested_at + image_interval > time.time():
       time.sleep(last_image_requested_at + image_interval - time.time())
    last_image_requested_at = time.time()
    # Request image
    conn.mav.data_transmission_handshake_send(
        0, # Data stream type: JPEG
        0, # Total data size (ACK only)
        1280, # Width
        720, # Height
        0, # Number of packets being sent (ACK only)
        0, # Payload size per packet (ACK only)
        100 # JPEG quality
    )

    buffer = bytearray()

    img_size = 0
    last_seqnr = -1
    recvd = 0
    while recvd != 0 or not should_stop.is_set():
        msg = conn.recv_msg()
        if msg:
            print(msg.get_type())
            if msg.get_type() == 'ENCAPSULATED_DATA':
                # print('Received', msg.seqnr)
                if msg.seqnr <= last_seqnr:
                    print("Warning: sequence numbers not received in order!")
                last_seqnr = msg.seqnr
                recvd += 1
                buffer += bytearray(msg.data)
            elif msg.get_type() == 'DATA_TRANSMISSION_HANDSHAKE':
                if msg.size == 0:
                    #print(f'Finished with seqnr={last_seqnr} and {recvd} packets')
                    break
                img_size = msg.size
                #print(f'Expecting {msg.packets} packets')

    if recvd == 0:
        continue

    padding_size = len(buffer) - img_size

    if padding_size < 0:
        print('Padding must be non-negative!')
        exit(-1)

    buffer = buffer[:-padding_size]
    cv2.imshow('Test', cv2.imdecode(np.asarray(buffer), cv2.IMREAD_COLOR))
    cv2.waitKey(1)

    images_received += 1




delta_t = time.time() - t0

print("Received %d at %.2f images/second" % (images_received, images_received/delta_t))
print("Overall: %u sent, %u received, %u errors bwin=%.1f kB/s bwout=%.1f kB/s" % (
    conn.mav.total_packets_sent,
    conn.mav.total_packets_received,
    conn.mav.total_receive_errors,
    0.001*(conn.mav.total_bytes_received)/delta_t,
    0.001*(conn.mav.total_bytes_sent)/delta_t))

conn.close()

