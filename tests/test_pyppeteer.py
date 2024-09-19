import pytest
import asyncio
from pyppeteer import launch
from pyppeteer_stealth import stealth
from utils import __hml_path__, Detected, assert_detections
from selenium_driverless.utils.utils import find_chrome_executable

extra_args = ["--no-fist-run", "--disable-fre", "--no-default-browser-check", "--disable-features=FedCm"]


async def detect(page):
    await page.goto(__hml_path__)
    await asyncio.sleep(0.1)
    await page.click("#clickHere")
    for _ in range(2):
        detections = await page.evaluate("""
            async ()=>{
                await brotector.init_done; 
                return brotector.detections
            }
        """)
        assert_detections(detections)
        if len(detections) > 0:
            print("\n")
            print(detections)
            print("\n")
            raise Detected(detections)
        await asyncio.sleep(5)


@pytest.mark.asyncio
async def test_pyppeteer():
    browser = await asyncio.wait_for(launch(headless=False, executablePath=find_chrome_executable(),
                           ignoreDefaultArgs=False, args=[*extra_args]),10)
    page = await browser.newPage()
    with pytest.raises(Detected):
        await detect(page)
    await browser.close()


@pytest.mark.asyncio
async def test_pyppeteer_stealthy():
    browser = await asyncio.wait_for(launch(headless=False, executablePath=find_chrome_executable(),
                           args=['--disable-blink-features=AutomationControlled', *extra_args]), 10)
    page = await browser.newPage()
    with pytest.raises(Detected):
        await detect(page)
    await browser.close()


@pytest.mark.asyncio
async def test_pyppeteer_stealth():
    browser = await asyncio.wait_for(launch(headless=False, executablePath=find_chrome_executable(),
                           args=['--disable-blink-features=AutomationControlled', *extra_args]),10)
    page = await browser.newPage()
    with pytest.raises(Detected):
        await stealth(page)
        await detect(page)
    await browser.close()
