import csv
import time
from util.RepeatedTimer import RepeatedTimer

class FileWriter:
  def __init__(self, name):
    self.file = open(f"{name}.csv", "w")
    self.csv = csv.writer(self.file)

  def close(self):
    self.file.close()

class ModuleInformation:
  def __init__(self, name, conn, start_time):
    self.name = name
    self.start_time = start_time
    self.conn = conn

    self.writer = FileWriter(name)
    self.writer.csv.writerow(['Time', 'Sent', 'Received', 'In (kb/s)', 'Out (kb/s)'])

    self.prev_data = [time.monotonic(),
                      conn.mav.total_packets_sent,
                      conn.mav.total_packets_received,
                      0.001 * conn.mav.total_bytes_received,
                      0.001 * self.conn.mav.total_bytes_sent]

  def get_time(self):
    return time.monotonic() - self.start_time

  def get_data(self):
    return [self.get_time(),
            self.conn.mav.total_packets_sent,
            self.conn.mav.total_packets_received,
            0.001*self.conn.mav.total_bytes_received,
            0.001*self.conn.mav.total_bytes_sent]

  def compute_deltas(self):
    data = self.get_data()
    deltas = [self.get_time()]
    for i in range(4):
      deltas.append(data[i+1] - self.prev_data[i+1])
    delta_t = data[0] - self.prev_data[0]
    for i in range(2):
      deltas[i+3] /= delta_t
    self.prev_data = data
    return deltas
  
  def close(self):
    self.writer.close()

class BandwidthLogger:
  def __init__(self):
    self.modules = {}
    self.start_time = time.monotonic()
    self.RECORDING_INTERVAL = 0.5 # Seconds

  def add_module(self, name, conn):
    self.modules[name] = ModuleInformation(name, conn, self.start_time)

  def remove_module(self, name):
    self.modules[name].close()
    del self.modules[name]

  def _record_bandwidth(self, module):
    deltas = module.compute_deltas()
    module.writer.csv.writerow(deltas)

  def _run(self):
    print('Run!')
    for module in self.modules.values():
      self._record_bandwidth(module)

  def start(self):
    self.rt = RepeatedTimer(self.RECORDING_INTERVAL, self._run)

  def _close(self):
    for module in self.modules.values():
      module.close()

  def stop(self):
    self.rt.stop()
    self._close()
