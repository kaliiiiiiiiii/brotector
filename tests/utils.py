import os
import http.server

from selenium_driverless.utils.utils import random_port

__port__ = random_port("localhost")

_dir = str(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
__server_url__ = f"http://localhost:{__port__}/index.html?selCrash=false"
__screenshot_path__ = _dir + "/assets/example_screenshot_headless.png"


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=_dir, **kwargs)

    def log_message(self, format, *args, **kwargs):
        pass

    def log_error(self, format, *args):
        pass

    def handle(self):
        try:
            super().handle()
        except ConnectionResetError:
            pass


def assert_detections(detections: list):
    for detection in detections:
        if detection.get("detection") == "runtime.enabled":
            assert detection.get("type") == "webdriver"
            data = detection.get("data", {})
            assert data.get("stackLookupCount", 1) == 1
            assert data.get("nameLookupCount", 3) >= 3


class Detected(Exception):
    pass
