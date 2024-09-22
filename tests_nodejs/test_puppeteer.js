import puppeteer from 'puppeteer';
import {__server_url__, sleep} from './utils.js'

const script = async ()=>{
    await brotector.init_done
    return brotector.detections
}

async function test(browser){
    const page = await browser.newPage();
    await page.goto(__server_url__);
    await sleep(500)
    await page.click("#clickHere")
    const detections = await page.evaluate(script)
    if(detections.length == 0){throw Error("Not detected")}
    console.log(detections)
}

async function test_puppeteer(){
    const browser = await puppeteer.launch({ headless: false });
    try{
        test(browser)
    }finally{
        await browser.close();
    }

}

await test_puppeteer()
