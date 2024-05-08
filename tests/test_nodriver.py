import nodriver
import nodriver as uc
from utils import __hml_path__, Detected, assert_detections
import pytest
import asyncio


async def nodriver_eval(page, script: str, timeout: float = 5):
    cmd = nodriver.cdp.runtime.evaluate(expression="(async ()=>{" + script + "})()", await_promise=True, return_by_value=True,include_command_line_api=True)
    res = await asyncio.wait_for(page.send(cmd),timeout=timeout)
    return res[0].value


async def detect(page: nodriver.Tab):
    script = """
        await brotector.init_done; 
        return brotector.detections
    """
    await page.get(__hml_path__)
    await asyncio.sleep(0.5)
    click_target = await page.query_selector("#copy-button")
    await click_target.click()
    await asyncio.sleep(0.5)
    for _ in range(2):
        detections = await nodriver_eval(page, script)
        assert_detections(detections)
        if len(detections) > 0:
            print("\n")
            print(detections)
            print("\n")
            raise Detected(detections)
        await asyncio.sleep(5)


@pytest.mark.asyncio
async def test_nodriver():
    browser = await uc.start()
    try:
        page = await browser.get("about:blank")
        with pytest.raises(Detected):
            await detect(page)
    finally:
        browser.stop()
