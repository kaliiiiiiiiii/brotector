import os

__hml_path__ = str(os.path.dirname(os.path.dirname(os.path.realpath(__file__)))) + "/index.html"


class Detected(Exception):
    pass
