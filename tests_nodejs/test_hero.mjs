import {__server_url__, sleep} from './utils.mjs';
import Hero from '@ulixee/hero-playground';

async function test(){
    const hero = new Hero({ showChromeInteractions: true, showChrome: true });
  
  const tab = hero.activeTab;
  await tab.goto(__server_url__)
  await sleep(1000)
  const aElem = hero.document.querySelector('button');
  await hero.interact({ click: { element: aElem } })
  var res = undefined
  while(res === undefined){
    await sleep(10)
    res = await await tab.getJsValue("brotector.detections")
  }
  await sleep(500)
  res = await await tab.getJsValue("brotector.detections")
  console.log(res)
  await hero.close();
}

await test()
process.exit(0)