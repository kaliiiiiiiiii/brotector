import os
import sys
__hml_path__ = str(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) + "/index.html"


def assert_detections(detections:list):
    for detection in detections:
        if detection.get("detection") == "runtime.enabled.stacklookup":
            assert detection.get("type") == "webdriver"
            if detection.get("data", {}).get("stackLookupCount") > 1:
                print("\nstackLookupCount bigger than 1\n", file=sys.stderr)


class Detected(Exception):
    pass
