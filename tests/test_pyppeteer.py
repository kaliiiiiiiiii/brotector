import pytest
import asyncio
from pyppeteer import launch
from pyppeteer.errors import ElementHandleError
from pyppeteer_stealth import stealth
from utils import __server_url__, Detected, assert_detections
from selenium_driverless.utils.utils import find_chrome_executable

extra_args = ["--no-fist-run", "--disable-fre", "--no-default-browser-check", "--disable-features=FedCm"]


async def detect(page):
    await page.goto(__server_url__)
    await asyncio.sleep(0.1)
    await page.click("#clickHere")
    for _ in range(2):
        detections = await page.evaluate("""
            async ()=>{
                // await brotector.init_done; // would crash due to infinite recursion at puppeteer stealth
                return brotector.detections
            }
        """)
        assert_detections(detections)
        if len(detections) > 0:
            raise Detected(detections)
        await asyncio.sleep(5)


@pytest.mark.asyncio
async def test_pyppeteer():
    browser = await asyncio.wait_for(launch(headless=False, executablePath=find_chrome_executable(),
                                            ignoreDefaultArgs=False, args=[*extra_args]), 10)
    try:
        page = await browser.newPage()
        with pytest.raises(Detected):
            await detect(page)
    finally:
        await browser.close()


@pytest.mark.asyncio
async def test_pyppeteer_stealthy():
    browser = await asyncio.wait_for(launch(headless=False, executablePath=find_chrome_executable(),
                                            args=['--disable-blink-features=AutomationControlled', *extra_args]), 10)
    try:
        page = await browser.newPage()
        with pytest.raises(Detected):
            await detect(page)
    finally:
        await browser.close()


@pytest.mark.asyncio
async def test_pyppeteer_stealth():
    browser = await asyncio.wait_for(launch(headless=False, executablePath=find_chrome_executable(),
                                            args=['--disable-blink-features=AutomationControlled', *extra_args]), 10)
    try:
        page = await browser.newPage()
        with pytest.raises(Detected):
            await stealth(page)
            try:
                await detect(page)
            except ElementHandleError as e:
                if e.args[0] == 'Evaluation failed: RangeError: Maximum call stack size exceeded':
                    raise Detected("Pyppeteer stealth infinite recursion crash at "
                                   "https://github.com/berstend/puppeteer-extra/blob"
                                   "/39248f1f5deeb21b1e7eb6ae07b8ef73f1231ab9/packages/puppeteer-extra-plugin-stealth"
                                   "/evasions/_utils/index.js#L42")
                raise e
    finally:
        await browser.close()
