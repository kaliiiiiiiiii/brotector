import pytest
import asyncio
from utils import __hml_path__, Detected
from playwright import async_api
from undetected_playwright import async_api as uc_async_api
import botright


async def playwright_eval(cdp_session: async_api.CDPSession, script: str, timeout: float = 5):
    res = await cdp_session.send("Runtime.evaluate", {
        "expression": "(async ()=>{" + script + "})()", "awaitPromise": True,
        "returnByValue": True, "timeout": timeout * 1000, "includeCommandLineAPI": True
    })
    exc = res.get("exceptionDetails")
    if exc:
        raise Exception(exc)
    return res["result"].get("value")


async def detect(context: async_api.BrowserContext):
    page = await context.new_page()
    cdp_session = await context.new_cdp_session(page)
    await page.goto(__hml_path__)
    await asyncio.sleep(0.1)
    for _ in range(2):
        detections = await playwright_eval(cdp_session, """
            await brotector.init_done; 
            return brotector.detections
        """)
        if len(detections) > 0:
            print("\n")
            print(detections)
            print("\n")
            raise Detected(detections)
        await asyncio.sleep(5)


@pytest.mark.asyncio
async def test_playwright():
    async with async_api.async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=False)
        context = await browser.new_context()
        with pytest.raises(Detected):
            await detect(context)
        await browser.close()


@pytest.mark.asyncio
async def test_playwright_stealthy():
    async with async_api.async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=False,
                                          args=["--disable-blink-features=AutomationControlled"])
        context = await browser.new_context()
        with pytest.raises(Detected):
            await detect(context)
        await browser.close()


@pytest.mark.asyncio
async def test_uc_playwright():
    async with uc_async_api.async_playwright() as p:
        browser = await p.chromium.launch(channel="chrome", headless=False,
                                          args=["--disable-blink-features=AutomationControlled"])
        context = await browser.new_context()
        with pytest.raises(Detected):
            await detect(context)
        await browser.close()


@pytest.mark.asyncio
async def test_botright():
    botright_client = await botright.Botright()
    try:
        browser = await botright_client.new_browser(channel="chrome")
        with pytest.raises(Detected):
            await detect(browser)
    finally:
        await botright_client.close()


@pytest.mark.asyncio
async def test_uc_botright():
    botright_client = await botright.Botright(use_undetected_playwright=True)
    try:
        browser = await botright_client.new_browser(channel="chrome")
        with pytest.raises(Detected):
            await detect(browser)
    finally:
        await botright_client.close()
