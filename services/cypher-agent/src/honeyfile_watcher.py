from watchdog.events import FileSystemEventHandler
from watchdog.observers import Observer


class HoneyfileHandler(FileSystemEventHandler):
    def on_modified(self, event):
        if not event.is_directory:
            print(f"[ALERTA CRÍTICO] Honeyfile modificado: {event.src_path}")

    def on_deleted(self, event):
        if not event.is_directory:
            print(f"[ALERTA CRÍTICO] Honeyfile eliminado: {event.src_path}")


def start_honeyfile_monitor(path_to_watch):
    observer = Observer()
    observer.schedule(HoneyfileHandler(), path=path_to_watch, recursive=False)
    observer.start()
    return observer