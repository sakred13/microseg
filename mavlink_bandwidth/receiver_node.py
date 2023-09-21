from pymavlink import mavutil
import time

# Run sender_node.py first

conn = mavutil.mavlink_connection('udpout:3.85.133.213:14540')
conn.mav.heartbeat_send(mavutil.mavlink.MAV_TYPE_ONBOARD_CONTROLLER,
                        mavutil.mavlink.MAV_AUTOPILOT_INVALID,
                        0, 0, 0)

response = conn.recv_msg()

t1 = time.time()
bytes_recv = 0
bytes_sent = 0

while True:
    msg = conn.recv_match()
    if msg == None:
        pass
    
    t2 = time.time()
    if t2 - t1 > 1.0:
        print("%u sent, %u received, %u errors bwin=%.1f kB/s bwout=%.1f kB/s" % (
            conn.mav.total_packets_sent,
            conn.mav.total_packets_received,
            conn.mav.total_receive_errors,
            0.001*(conn.mav.total_bytes_received-bytes_recv)/(t2-t1),
            0.001*(conn.mav.total_bytes_sent-bytes_sent)/(t2-t1)))
        bytes_sent = conn.mav.total_bytes_sent
        bytes_recv = conn.mav.total_bytes_received
        t1 = t2
