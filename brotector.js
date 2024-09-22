const chromedriverSourceMatches = [
"WebDriver", "W3C", "Execute-Script", "cdc_adoQpoasnfa76pfcZLmcfl", "Chromium", "shadow-6066-11e4-a52e-4f735466cecf",
"element-6066-11e4-a52e-4f735466cecf", "STALE_ELEMENT_REFERENCE", "crbug.com/40229283",
"shadow root is detached from the current frame","stale element not found in the current frame"]

const stackScriptInjectionMatches = {
    "pyppeteer":"    at [\\s\\S]* \\(__pyppeteer_evaluation_script__:[0-9]+:[0-9]+\\)",
    "puppeteer":"    at [\\s\\S]* \\(__puppeteer_evaluation_script__:[0-9]+:[0-9]+\\)"
}

const hookers = [
    ["HTMLElement", "click"],
    ["HTMLElement","querySelector"],
    ["HTMLElement","querySelectorAll"],
]

const brotectorBanner = `


    You've been detected by
    ###################################################################
    #  ____                   _                   _                   #
    # | __ )   _ __    ___   | |_    ___    ___  | |_    ___    _ __  #
    # |  _ \\  | '__|  / _ \\  | __|  / _ \\  / __| | __|  / _ \\  | '__| #
    # | |_) | | |    | (_) | | |_  |  __/ | (__  | |_  | (_) | | |    #
    # |____/  |_|     \\___/   \\__|  \\___|  \\___|  \\__|  \\___/  |_|    #
    ###################################################################
    https://github.com/kaliiiiiiiiii/brotector

`

function getDebuggerTiming(){
    var start = globalThis.performance.now();
    debugger;
    return (globalThis.performance.now()-start)
}
function isEmpty() {
    for (var prop in this) if (this.hasOwnProperty(prop)) return false;
    return true;
};

async function getHighEntropyValues(){
    const n = globalThis.navigator? globalThis.navigator: globalThis.WorkerNavigator
    data = await n.userAgentData.getHighEntropyValues([
                "architecture",
                "bitness",
                "formFactor",
                "model",
                "platform",
                "platformVersion",
                "uaFullVersion",
                "wow64"
    ])
    data["userAgent"] = n.userAgent
    return data
}

function get_worker_response(fn, timeout=undefined) {
        try {
            const URL = window.URL || window.webkitURL;
            var fn = "self.onmessage=async function(e){postMessage(await (" + fn.toString() + ")())}";
            var blob;
            try {
                blob = new Blob([fn], { type: "application/javascript" });
            } catch (e) {
                // Backwards-compatibility
                window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
                blob = new BlobBuilder();
                blob.append(response);
                blob = blob.getBlob();
            }
            var url = URL.createObjectURL(blob);
            var worker = new Worker(url);
            var _promise = new Promise((resolve, reject) => {
                if(timeout !== undefined){setTimeout(()=>{worker.terminate(); reject(new Error("timeout"))}, timeout)}
                worker.onmessage = (m) => {
                    worker.terminate();
                    resolve(m.data);
                };
                worker.onerror = (e)=>{reject(new Error("Worker onerror"))}
            });
            worker.postMessage("call");
            return _promise;
        } catch (e) {
            return new Promise((resolve, reject) => {
                reject(e);
            });
        }
    }

const startTime = window.performance.now();
class Brotector {
  constructor(on_detection, interval=50, selCrash=true) {
    // on_detection(data:dict)
    this._isMouseHooked = false

    this.on_detection = on_detection
    this.selCrash = selCrash
    this.detections = []
    this.mousePos = [0, 0]
    this._detections = []
    this.interval = interval
    this.init_done = this.init()
    this._doing_devtoolsTest = false
    this.devtools_open = false
    this._runtime_detected = false
    this._canvasMouseVisualizer = false
    this._lastStackLookupCount = 0
    this._nameLookupCount = 0
    this.__pwInitScripts = false
    this.__playwright__binding__ = false
  }
  log(data){
    data["msSinceLoad"] = window.performance.now() - startTime;
    this.detections.push(data)
    this._detections.push(data.detection)
    this.on_detection(data)
  }
  async init(){
    this.test_navigator_webdriver()
    this.test_runtimeEnabled()
    this.test_PWinitScripts()
    this.test_window_cdc()
    this.test_HighEntropyValues()
    this.hook_mouseEvents()
    this.hook_canvasVisualize()
    this.hook_SeleniumScriptInjection()

    for (const [obj, func] of hookers){
        this.hookFunc(obj, func, ()=>{})
    }

    Object.defineProperty(Error.prototype, 'name', {
                configurable: false,
                enumerable: false,
                get: (() => {this._nameLookupCount += 1; return "Error"}).bind(this)
                });
    // instead of setInterval
    (async () => {while(true){
            this.intervalled.bind(this)();
            await new Promise(
                ((resolve)=>{
                        setTimeout(resolve, this.interval)
                    }).bind(this)
                )
        }
    }).bind(this)()

    await new Promise((resolve)=>{setTimeout(resolve, 200)})
    return this.detections
  }
  async intervalled(){
    this.test_runtimeEnabled()
    this.test_PWinitScripts()
  }
  hookFunc(obj, func, callback){
    const proxy = new Proxy(globalThis[obj].prototype[func], {
      apply: ((target, thisArg, argumentsList) => {
        callback(target, thisArg, argumentsList)
        try{this.test_stack(`${obj}:${func}`, argumentsList)}catch(e){console.error(e)};
        return Reflect.apply(target, thisArg, argumentsList)
      }).bind(this)
    }
    );
    Object.defineProperty(globalThis[obj].prototype, func, {value:proxy})
}
  test_stack(hook, args){
      var stack
      try{throw Error()}catch(e){stack = e.stack}
      for (const line of stack.split("\n")){
        for (const [type, regex] of Object.entries(stackScriptInjectionMatches)){
            if(line.match(regex)){
                this.log({detection:"stack.signature", type:type, score:0.9, data:{stack:stack, hook:hook}})
            }
        }
      }
  }
  test_navigator_webdriver(){
    if(navigator.webdriver === true){
        this.log({detection:"navigator.webdriver", score:1})
    }
  }
  test_window_cdc(){
    let matches = []
    for(let prop in window) {
       prop.match(/cdc_[a-z0-9]/ig) && matches.push(prop)
    }
    if(matches.length > 0){
        this.log({detection:"window.cdc", data:matches, score:1})
    }
  }
  test_PWinitScripts(){
    const keys = ["__pwInitScripts", "__playwright__binding__"]
    var key
    for (key of keys){
        if((globalThis[key] !== undefined) && !this[key]){
            this[key] = true
            this.log({detection:"PWinitScript", data:{"value":globalThis[key]}, score:1, type:key})
        }
    }

  }
  async test_runtimeEnabled() {

    const key = "runtime.enabled"
    var type = "webdriver"
    var score = 1

    if (this._lastStackLookupCount === 0){

        // stacklookup
        var stackLookupCount = 0
        const e = new Error()
        Object.defineProperty(e, 'stack', {
                configurable: false,
                enumerable: false,
                get: function() {
                    stackLookupCount += 1
                    return "";
                    }
                });
        var c = undefined
        try{c = console.context("Brotector: ");}catch{}
        if (c===undefined){c=console}
        c.debug(e);
        this._nameLookupCount = 0
        c.debug(new Error(""))
        const nameLookupCount = this._nameLookupCount
        if(stackLookupCount > 0 || nameLookupCount >= 2){
            if(this._doing_devtoolsTest){return}
            this._doing_devtoolsTest = true
            var start = globalThis.performance.now();
            var time = undefined
            await new Promise((resolve) => {setTimeout(resolve, 200)})
            try{var time = await get_worker_response(getDebuggerTiming, 200)}
            catch(e){if(e.message !== "timeout"){throw e}}

            if(time === undefined){time = globalThis.performance.now()-start}
            c.clear()
            if(stackLookupCount > 1 && time>180 && nameLookupCount >= 2){
                type = "devtools"
                score = 0.1
            }else if((stackLookupCount > 1 || nameLookupCount === 3) && time>180){
                type = "devtools"
                score = 0.2
            }else if (time>180){
                score = 0.3
                type = "devtools"
                this.devtools_open = true
            }else{this.devtools_open = false}

            this.log({detection:key, score:score, "type":type,
                data:{
                    "stackLookupCount":stackLookupCount,
                    "nameLookupCount":nameLookupCount
                    }
                }
                )
            this._doing_devtoolsTest = false
            this._lastStackLookupCount = stackLookupCount
        }
    }
  }
  async test_HighEntropyValues(){
    let data = await get_worker_response(getHighEntropyValues)
    var score = 0
    if(data.architecture === "" &&
       data.model === "" && data.platformVersion == "" &&
       data.uaFullVersion === "" && data.bitness == ""){
       this.log({"detection":"UA_Override", "type":"HighEntropyValues.empty", score:0.9})
    }
  }
  hook_mouseEvents() {
    if (!this._isMouseHooked){
        for (let event of ["mousedown", "mouseup", "mousemove", "pointermove", "click", "touchstart", "touchend", "touchmove", "touch", "wheel"]){
            document.addEventListener(event,this.mouseEventHandler.bind(this))
        }
    }
  }
  mouseEventHandler(e) {
    const key = "Input.cordinatesLeak"
    var is_touch = false
    if (["touchstart", "touchend", "touchmove", "touch"].includes(e.type)) {
            is_touch = true;
            e = e.touches[0] || e.changedTouches[0];
        }

    if(e.type === "mousemove"){
        this.mousePos = [e.clientX, e.clientY]
    }

    if(e.pageY == e.screenY && e.pageX == e.screenX){var score=1}else{var score=0};
    if (score !== 0 && 1 >= outerHeight - innerHeight) {
            // fullscreen
            score = 0;
        };
    if (score !== 0 && is_touch && navigator.userAgentData.mobile) {
            score = 0.5; // mobile touch can have e.pageY == e.screenY && e.pageX == e.screenX
        }
    if (e.isTrusted === false) {
            this.log({"detection":"Input.untrusted", "type":e.type, score:1})
        }
    else if(document.activeElement === e.srcElement &&
            document.activeElement === e.target &&
            e.type === "click" && e.x === 0 && e.y === 0 &&
            e.screenX === 0 &&  e.screenY === 0 &&
            e.clientX === 0 && e.clientY === 0){} // click over select via TAB + (ENTER or SPACE)
    else if (score > 0){
        this.log({"detection":key, "type":e.type, "score":score})
    }
  }
  hook_canvasVisualize() {
    this.hookFunc("CanvasRenderingContext2D", "arc", this.canvasVisualizeHandler.bind(this))
  }
  canvasVisualizeHandler(target, thisArg, argumentsList){
      if(this._canvasMouseVisualizer){return}
      var pos = this.mousePos
      const canvas = thisArg.canvas
      var range = 5
      if(
        canvas.style.position === "fixed" && canvas.style.pointerEvents == "none" &&
        canvas.style.left[0] === "0" && canvas.style.top[0] === "0" &&
        ((canvas.width - 1) <= window.innerWidth) && ((canvas.height - 1) <= window.innerHeight) &&
        ((pos[0] - range) <= argumentsList[0] && (pos[0] + range) >= argumentsList[0]) &&
        ((pos[0] - range) <= argumentsList[0] && (pos[0] + range) >= argumentsList[0])
      ){
        this._canvasMouseVisualizer = true
        this.log({"detection":"canvasMouseVisualizer",  "score":0.8})
      }
  }
  hook_SeleniumScriptInjection(){
    this.hookFunc("Function", "apply", this.SeleniumScriptInjectionHandler.bind(this))
  }
  SeleniumScriptInjectionHandler(target, thisArg, argumentsList){
    let code = thisArg.toString()
    let matches = {}
    let testStr = undefined
    for (testStr of chromedriverSourceMatches){
        if(code.indexOf(testStr) !== -1){
            if (matches[testStr] == undefined){matches[testStr] = 0}
            matches[testStr] += 1
        }
    }
    const len = Object.keys(matches).length
    if (len > 0){
        this.log({"detection":"SeleniumScriptInjection", "score":0.9, data:{args:argumentsList,matches:matches}})
        if(this.selCrash){throw Error(brotectorBanner)}
    }
  }
}
