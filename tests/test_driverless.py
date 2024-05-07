from selenium_driverless import webdriver
from selenium_driverless.types.target import Target
from selenium_driverless.types.by import By
from cdp_patches.input import AsyncInput
from utils import __hml_path__, Detected
import pytest
import asyncio


async def detect(target: Target, cdp_patches_input):
    script = """
        await brotector.init_done; 
        return brotector.detections
    """
    await target.get(__hml_path__)
    await asyncio.sleep(0.5)
    click_target = await target.find_element(By.ID, "click-target")
    if cdp_patches_input:
        x, y = await click_target.mid_location()
        await cdp_patches_input.click("left",x, y)
    else:
        await click_target.click()
    await asyncio.sleep(0.5)
    for _ in range(2):
        detections = await target.eval_async(script)
        detections = [dict(**detection) for detection in detections]
        if len(detections) > 0:
            print("\n")
            print(detections)
            print("\n")
            raise Detected(detections)
        await asyncio.sleep(5)


@pytest.mark.asyncio
async def test_driverless():
    async with webdriver.Chrome() as driver:
        with pytest.raises(Detected):
            await detect(driver.current_target, cdp_patches_input=False)


@pytest.mark.asyncio
async def test_driverless_with_cdp_patches():
    async with webdriver.Chrome() as driver:
        with pytest.raises(Detected):
            await detect(driver.current_target, cdp_patches_input=await AsyncInput(browser=driver))
