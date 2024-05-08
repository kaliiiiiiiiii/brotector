import time
import pytest

from selenium import webdriver
import seleniumbase
import undetected_chromedriver as uc_webdriver
from utils import __hml_path__, Detected, assert_detections


def sel_eval(driver: webdriver.Chrome, script: str, timeout: float = 5):
    res = driver.execute_cdp_cmd("Runtime.evaluate", {
        "expression": "(async ()=>{" + script + "})()", "awaitPromise": True,
        "returnByValue": True, "timeout": timeout * 1000, "includeCommandLineAPI": True
    })
    exc = res.get("exceptionDetails")
    if exc:
        raise Exception(exc)
    return res["result"].get("value")


def detect(driver):
    is_sb = False
    if isinstance(driver, seleniumbase.BaseCase):
        is_sb = True
        driver.uc_open_with_reconnect(__hml_path__, 0.1)
        driver.disconnect()
    else:
        driver.get(__hml_path__)
    script = """
        await brotector.init_done; 
        return brotector.detections
    """
    time.sleep(1)
    for _ in range(2):
        if is_sb:
            driver.connect()
        detections = sel_eval(driver, script)
        assert_detections(detections)
        if is_sb:
            driver.disconnect()
        if len(detections) > 0:
            print("\n")
            print(detections)
            print("\n")
            raise Detected(detections)
        time.sleep(5)


def test_selenium():
    options = webdriver.ChromeOptions()
    options.add_experimental_option("excludeSwitches", ["enable-logging"])
    options.add_argument("--log-level=3")
    with webdriver.Chrome(options=options) as driver:
        with pytest.raises(Detected):
            detect(driver)


def test_uc():
    options = uc_webdriver.ChromeOptions()
    options.add_argument("--log-level=3")
    with uc_webdriver.Chrome(options=options) as driver:
        with pytest.raises(Detected):
            detect(driver)


def test_seleniumbase():
    with pytest.raises(Detected):
        with seleniumbase.SB(uc=True) as sb:
            detect(sb)
