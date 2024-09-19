import os
_dir = str(os.path.dirname(os.path.dirname(os.path.realpath(__file__))))
__hml_path__ = _dir + "/index.html?selCrash=false"
__screenshot_path__ = _dir+"/assets/example_screenshot_headless.png"


def assert_detections(detections: list):
    for detection in detections:
        if detection.get("detection") == "runtime.enabled":
            assert detection.get("type") == "webdriver"
            data = detection.get("data", {})
            assert data.get("stackLookupCount", 1) == 1
            assert data.get("nameLookupCount", 3) >= 3


class Detected(Exception):
    pass
