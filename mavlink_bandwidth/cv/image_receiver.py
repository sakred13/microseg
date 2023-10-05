from pymavlink import mavutil
import cv2
import numpy as np
import time

# Run sender_node.py first

conn = mavutil.mavlink_connection('tcp:localhost:14540')
conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
                        mavutil.mavlink.MAV_AUTOPILOT_INVALID,
                        0, 0, 0)

images_received = 0
last_image_requested_at = 0
image_interval = 1 # second(s)
while images_received < 100:
    #if last_image_requested_at + image_interval > time.time():
    #    time.sleep(last_image_requested_at + image_interval - time.time())
    #last_image_requested_at = time.time()
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

    t0 = time.time()

    while True:
        msg = conn.recv_msg()
        if msg:
            # print(msg.get_type()) # DATA_TRANSMISSION_HANDSHAKE
            if msg.get_type() == 'ENCAPSULATED_DATA':
                # print('Received', msg.seqnr)
                if msg.seqnr <= last_seqnr:
                    print("Warning: sequence numbers not received in order!")
                last_seqnr = msg.seqnr
                recvd += 1
                buffer += bytearray(msg.data)
            elif msg.get_type() == 'DATA_TRANSMISSION_HANDSHAKE':
                if msg.size == 0:
                    print(f'Finished with seqnr={last_seqnr} and {recvd} packets')
                    break
                img_size = msg.size
                print(f'Expecting {msg.packets} packets')

    t0 = time.time() - t0
    print("Overall: %u sent, %u received, %u errors bwin=%.1f kB/s bwout=%.1f kB/s" % (
        conn.mav.total_packets_sent,
        conn.mav.total_packets_received,
        conn.mav.total_receive_errors,
        0.001*(conn.mav.total_bytes_received)/t0,
        0.001*(conn.mav.total_bytes_sent)/t0))

    print(f'Buffer size: {len(buffer)}')
    print(f'Image size: {img_size}')

    padding_size = len(buffer) - img_size
    print(f'Padding size: {len(buffer) - img_size}')

    if padding_size < 0:
        print('Padding must be non-negative!')
        exit(-1)

    buffer = buffer[:-padding_size]
    print(f'New buffer size: {len(buffer)}')
    cv2.imshow('Test', cv2.imdecode(np.asarray(buffer), cv2.IMREAD_COLOR))

    images_received += 1
    cv2.waitKey(0)
