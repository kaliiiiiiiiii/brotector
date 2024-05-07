# Brotector


An advanced antibot for webdriver such as 
- [x] [driverless](https://github.com/kaliiiiiiiiii/Selenium-Driverless)
  - [ ] **with [cdp-patches](https://github.com/Kaliiiiiiiiii-Vinyzu/CDP-Patches)**
- [x] [selenium](https://github.com/SeleniumHQ/selenium/tree/trunk/py#selenium-client-driver)
  - [x] [undetected-chromedriver](https://github.com/ultrafunkamsterdam/undetected-chromedriver)
  - [x] [seleniumbase](https://github.com/seleniumbase/SeleniumBase)
- [ ] [puppeteer](https://github.com/puppeteer/puppeteer) (not test yet)
  - [ ] [puppeteer-extra-stealth](https://github.com/berstend/puppeteer-extra/tree/master/packages/puppeteer-extra-plugin-stealth#puppeteer-extra-plugin-stealth---) (not test yet)
  - [x] [pyppeteer](https://github.com/pyppeteer/pyppeteer)
    - [x] [pyppeteer-stealth](https://github.com/MeiK2333/pyppeteer_stealth)
- [x] [playwright](https://github.com/microsoft/playwright-python)
  - [x] [undetected-playwright](https://github.com/kaliiiiiiiiii/undetected-playwright-python) (buggy)
    - [ ] with [cdp-patches](https://github.com/Kaliiiiiiiiii-Vinyzu/CDP-Patches) (no test yet)
  - [x] [botright](https://github.com/Vinyzu/Botright)
    - [x] with [cdp-patches](https://github.com/Kaliiiiiiiiii-Vinyzu/CDP-Patches) (no test yet)
    - [x] with [uc-playwright](https://github.com/kaliiiiiiiiii/undetected-playwright-python) (buggy)
      - [ ] with [cdp-patches](https://github.com/Kaliiiiiiiiii-Vinyzu/CDP-Patches) (no test yet)
- [x] [nodriver](https://github.com/ultrafunkamsterdam/nodriver)

For the tests, each driver
- has to perform at least one mouse event (such as click, mousemove, ...)
- is running headull
- running on Google-Chrome if possible


## detections

#### navigator.webdriver

`navigator.webdriver` (JavaScript) is set to `true`

-----
#### runtime.enabled.stacklookup

[`Runtime`](https://chromedevtools.github.io/devtools-protocol/tot/Runtime) is enabled \
occurs when:
  - [`Runtime.enable`](https://chromedevtools.github.io/devtools-protocol/tot/Runtime/#method-enable) or [`Console.enable`](https://chromedevtools.github.io/devtools-protocol/tot/Console/#method-enable) (CDP) has been called (most libraries do that)
  - the user opens the devtools

-----
#### Input.cordinatesLeak
occurs due to [crbug#1477537](https://bugs.chromium.org/p/chromium/issues/detail?id=1477537) \
[CDP-Patches](https://github.com/Kaliiiiiiiiii-Vinyzu/CDP-Patches) can be used to bypass this

-----
#### window.cdc
a leak specific to **chromedriver** (selenium) \
see [stackoverflow-answer](https://stackoverflow.com/a/75776883/20443541)

----
#### "Input.untrusted"
Mouse event not dispatched by a user detected
see [`Event.isTrusted`](https://developer.mozilla.org/en-US/docs/Web/API/Event/isTrusted) property

## Contribution
feel free to
- open `[feature request]`s for driver detections
- open PRs
- use the discussions

## Licence
see [LICENSE](https://github.com/kaliiiiiiiiii/brotector/blob/master/LICENSE)

## Author & Copyright

Aurin Aegerter (aka Steve, kaliiiiiiiiii)

## Thanks
- [selenium-detector](https://github.com/HMaker/HMaker.github.io/tree/master/selenium-detector)
