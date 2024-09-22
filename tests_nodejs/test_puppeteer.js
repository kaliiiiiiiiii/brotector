import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import {__server_url__, sleep} from './utils.js';

puppeteerExtra.use(StealthPlugin())

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
        await test(browser)
    }finally{
        await browser.close();
    }

}
async function test_puppeteerExtraStealth(){
    const browser = await puppeteerExtra.launch({ headless: false });
    try{
        await test(browser)
    }catch(e){
        if(e.name === "RangeError" && e.message === 'Maximum call stack size exceeded' 
            && e.stack.match("\n    at SeleniumScriptInjectionHandler")){
                // infinite recursion induced by puppeteer stealth https://github.com/berstend/puppeteer-extra/blob/39248f1f5deeb21b1e7eb6ae07b8ef73f1231ab9/packages/puppeteer-extra-plugin-stealth/evasions/_utils/index.js#L42
            }else{
                throw e
            };
    }finally{
        await browser.close();
    };

}

await test_puppeteer()
await test_puppeteerExtraStealth()
process.exit(0)
