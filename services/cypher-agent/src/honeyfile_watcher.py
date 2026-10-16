import requests
from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer

from api_client import send_alert
from telemetry import get_mac_address


class HoneyfileHandler(FileSystemEventHandler):
    def _report(self, action, path):
        description = f'Honeyfile {action}: {path}'
        try:
            result = send_alert(get_mac_address(), description)
            print(f"[ALERTA ENVIADO] {description} ({result.get('status', 'sem status')})")
        except (requests.RequestException, ValueError, RuntimeError) as error:
            print(f'[ERRO ALERTA] Não foi possível notificar o CYPHERADM: {error}')

    def on_modified(self, event):
        if not event.is_directory:
            self._report('modificado', event.src_path)

    def on_deleted(self, event):
        if not event.is_directory:
            self._report('removido', event.src_path)


def start_honeyfile_monitor(path_to_watch):
    observer = Observer()
    observer.schedule(HoneyfileHandler(), path=path_to_watch, recursive=False)
    observer.start()
    return observer