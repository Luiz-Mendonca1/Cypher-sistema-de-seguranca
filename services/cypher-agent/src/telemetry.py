import socket
import uuid

import psutil

from api_client import post_telemetry


def get_mac_address():
    return ':'.join(
        '{:02x}'.format((uuid.getnode() >> element) & 0xff)
        for element in range(8 * 5, -1, -8)
    )


def get_local_ip():
    with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as connection:
        try:
            connection.connect(('8.8.8.8', 80))
            return connection.getsockname()[0]
        except OSError as error:
            for addresses in psutil.net_if_addrs().values():
                for address in addresses:
                    if address.family == socket.AF_INET and not address.address.startswith('127.'):
                        return address.address
            raise RuntimeError('Não foi possível determinar o IP local.') from error


def collect_system_metrics():
    metrics = {
        'mac': get_mac_address(),
        'hostname': socket.gethostname(),
        'ip': get_local_ip(),
        "cpuUsage": psutil.cpu_percent(interval=None),
        "ramUsage": psutil.virtual_memory().percent,
        "activeProcesses": len(psutil.pids())
    }
    return metrics


def send_telemetry(metrics):
    return post_telemetry(metrics)