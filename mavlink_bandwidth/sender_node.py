from pymavlink import mavutil
import time

# Wait until a connection is initiated by another node (receiver_node.py)
conn = mavutil.mavlink_connection('udpin::14540')
conn.wait_heartbeat()
print("Heartbeat from system (system %u component %u)" % (conn.target_system, conn.target_component))

counts = {}

t1 = time.time()

bytes_recv = 0
bytes_sent = 0


while True:
    conn.mav.heartbeat_send(1,1,1,1,1)
    conn.mav.sys_status_send(1,2,3,4,5,6,7,0,0,0,0,0,0)
    conn.mav.gps2_raw_send(1,2,3,4,5,6,7,8,9,0,0,0)
    conn.mav.attitude_send(1,2,3,4,5,6,7)
    conn.mav.vfr_hud_send(1,2,3,4,5,6)

    while True:
        msg = conn.recv_msg()

        if msg is None: break
        if msg.get_type() not in counts:
            counts[msg.get_type()] = 0
        
        counts[msg.get_type()] += 1
    
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
