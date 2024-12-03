import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.evaluate(() => {
    const f = document.createElement("iframe");
    f.src = "data:text/html;charset=utf-8,<p></p>",
    f.style.height = 0
    f.style.width = 0
    f.style.opacity = 0
    document.body.appendChild(f),
    console.log("fire"),
    f.contentWindow.open("", "", "top=9999,left=9999,width=1,height=1")
  });
}

main();