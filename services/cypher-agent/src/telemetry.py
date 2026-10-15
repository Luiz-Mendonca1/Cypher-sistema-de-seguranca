import psutil
import uuid

def collect_system_metrics():
    # Obtém o endereço MAC
    mac = ':'.join(['{:02x}'.format((uuid.getnode() >> element) & 0xff) 
                    for element in range(0, 8*6, 8)][::-1])
    
    metrics = {
        "macAddress": mac,
        "cpuUsage": psutil.cpu_percent(interval=None),
        "ramUsage": psutil.virtual_memory().percent,
        "activeProcesses": len(psutil.pids())
    }
    return metrics