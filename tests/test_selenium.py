import time
import pytest

from selenium import webdriver
import seleniumbase
import undetected_chromedriver as uc_webdriver

from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.service import Service as ChromeService

from selenium.webdriver.common.by import By
from selenium.common.exceptions import WebDriverException
from utils import __server_url__, Detected, assert_detections, __screenshot_path__


def sel_eval(driver: webdriver.Chrome, script: str, timeout: float = 5):
    res = driver.execute_cdp_cmd("Runtime.evaluate", {
        "expression": "(async ()=>{" + script + "})()", "awaitPromise": True,
        "returnByValue": True, "timeout": timeout * 1000, "includeCommandLineAPI": True
    })
    exc = res.get("exceptionDetails")
    if exc:
        raise Exception(exc)
    return res["result"].get("value")


def detect(driver, is_uc=False):
    try:
        is_sb = False
        if isinstance(driver, seleniumbase.BaseCase):
            is_sb = True
            driver.uc_open_with_reconnect(__server_url__, 0.1)
            driver.disconnect()
        else:
            driver.get(__server_url__)

        if is_sb:
            driver.connect()
            sel_eval(driver, "setTimeout(() => {document.querySelector('#copy-button').click()}, 200)")
            driver.disconnect()
        else:
            time.sleep(0.2)
            click_target = driver.find_element(By.ID, "clickHere")
            click_target.click()

        time.sleep(1)
        for _ in range(2):
            if is_sb:
                driver.connect()
            detections = sel_eval(driver, "return await brotector.init_done")
            if is_sb:
                driver.disconnect()
            assert_detections(detections)
            if len(detections) > 0:
                print("\n")
                print(detections)
                print("\n")
                raise Detected(detections)
            time.sleep(2)
    except WebDriverException as e:
        if not is_uc:
            driver.quit()
        if "https://github.com/kaliiiiiiiiii/brotector" in e.msg:
            raise Detected(e.msg)
        raise e


def test_selenium():
    options = webdriver.ChromeOptions()
    options.add_experimental_option("excludeSwitches", ["enable-logging"])
    options.add_argument("--log-level=3")
    with webdriver.Chrome(options=options, service=ChromeService(ChromeDriverManager().install())) as driver:
        with pytest.raises(Detected):
            detect(driver)


def test_selenium_headless_mk_screenshot():
    options = webdriver.ChromeOptions()
    options.add_experimental_option("excludeSwitches", ["enable-logging"])
    options.add_argument("--log-level=3")
    with webdriver.Chrome(options=options, service=ChromeService(ChromeDriverManager().install())) as driver:
        with pytest.raises(Detected):
            detect(driver)
        driver.save_screenshot(__screenshot_path__)


def test_uc():
    options = uc_webdriver.ChromeOptions()
    options.add_argument("--log-level=3")
    with uc_webdriver.Chrome(options=options, service=ChromeService(ChromeDriverManager().install())) as driver:
        with pytest.raises(Detected):
            detect(driver, is_uc=True)


def test_seleniumbase():
    with pytest.raises(Detected):
        with seleniumbase.SB(uc=True) as sb:
            detect(sb)
