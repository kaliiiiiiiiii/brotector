import pytest
import threading
import socketserver
import atexit
from utils import __port__, Handler


@pytest.fixture(autouse=True, scope='session')
def my_fixture():
    with socketserver.TCPServer(("", __port__), Handler) as httpd:
        atexit.register(httpd.shutdown)
        t = threading.Thread(target=httpd.serve_forever)
        t.start()
        try:
            yield
        finally:
            httpd.shutdown()
            t.join()

