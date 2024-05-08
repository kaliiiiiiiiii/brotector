import os
import warnings
__hml_path__ = str(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) + "/index.html"


def assert_detections(detections:list):
    for detection in detections:
        if detection.get("detection") == "runtime.enabled.stacklookup":
            if not detection.get("type") == "webdriver":
                warnings.warn("detected devtools instead of webdriver.\nPossibly, due to the driver handling breakpoints")


class Detected(Exception):
    pass
