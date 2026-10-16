import os
import time

import requests

from honeyfile_watcher import start_honeyfile_monitor
from telemetry import collect_system_metrics, send_telemetry


HONEYFILE_DIR = os.path.join(os.path.dirname(__file__), "..", "honeyfiles")


def main():
    os.makedirs(HONEYFILE_DIR, exist_ok=True)

    observer = start_honeyfile_monitor(HONEYFILE_DIR)
    print(f"CYPHERAgent iniciado. Monitorando: {HONEYFILE_DIR}")

    try:
        next_report = time.monotonic()
        while True:
            try:
                metrics = collect_system_metrics()
                result = send_telemetry(metrics)
                status = result.get('status', 'não informado')
                print(f'[TELEMETRIA] {metrics} | Status CYPHERADM: {status}')
            except (requests.RequestException, ValueError, RuntimeError, OSError) as error:
                print(f'[ERRO TELEMETRIA] Não foi possível comunicar com o CYPHERADM: {error}')

            next_report += 5
            time.sleep(max(0, next_report - time.monotonic()))
    except KeyboardInterrupt:
        print("\nCYPHERAgent finalizado.")
    finally:
        observer.stop()
        observer.join()


if __name__ == "__main__":
    main()