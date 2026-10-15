import os
import time

from honeyfile_watcher import start_honeyfile_monitor
from telemetry import collect_system_metrics


HONEYFILE_DIR = os.path.join(os.path.dirname(__file__), "..", "honeyfiles")


def main():
    os.makedirs(HONEYFILE_DIR, exist_ok=True)

    observer = start_honeyfile_monitor(HONEYFILE_DIR)
    print(f"CYPHERAgent iniciado. Monitorando: {HONEYFILE_DIR}")

    try:
        next_report = time.monotonic()
        while True:
            metrics = collect_system_metrics()
            print(f"[TELEMETRIA] {metrics}")
            next_report += 5
            time.sleep(max(0, next_report - time.monotonic()))
    except KeyboardInterrupt:
        print("\nCYPHERAgent finalizado.")
    finally:
        observer.stop()
        observer.join()


if __name__ == "__main__":
    main()