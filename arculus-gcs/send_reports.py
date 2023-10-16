import subprocess
import time
import csv
from io import StringIO
from collections import defaultdict

def capture_traffic():
    try:
        # Run tshark command and capture the output
        command = "timeout 5s tshark -i eth0 -Tfields -e ip.src -e ip.dst -e frame.time -e frame.protocols -e tcp.srcport -e tcp.dstport -e frame.number -E header=y -E separator='\t' -E occurrence=f"

        result = subprocess.run(command, shell=True, stdout=subprocess.PIPE, text=True)

        # Parse the CSV output
        csv_data = StringIO(result.stdout)
        reader = csv.DictReader(csv_data, delimiter='\t')  # Set delimiter to tab

        # Accumulate data over multiple iterations
        cumulative_data = []
        for row in reader:
            cumulative_data.append(row)

        return cumulative_data

    except Exception as e:
        print(f"Error: {e}")
        return []

def print_packet_counts(data):
    packet_counts = defaultdict(int)
    for row in data:
        # Assuming TCP protocol, you may need to adapt for other protocols
        source_ip = row.get('ip.src', '')
        destination_ip = row.get('ip.dst', '')
        # Count packets from source_port to destination_port
        packet_counts[(source_ip, destination_ip)] += 1

    print("Packet Counts:")
    for (source_ip, destination_ip), count in packet_counts.items():
        print(f"From IP address {source_ip} to IP address {destination_ip}: {count} packets")

if __name__ == "__main__":
    while True:
            captured_data = capture_traffic()
            print_packet_counts(captured_data)
