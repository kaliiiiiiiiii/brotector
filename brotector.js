function getDebuggerTiming(){
    var start = globalThis.performance.now();
    debugger;
    return globalThis.performance.now()-start
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

function get_worker_response(fn) {
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
                worker.onmessage = (m) => {
                    worker.terminate();
                    resolve(m.data);
                };
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
  constructor(on_detection, interval=70) {
    // on_detection(data:dict)
    this._isMouseHooked = false

    this.on_detection = on_detection
    this.detections = []
    this._detections = []
    this.interval = interval
    this.init_done = this.init()
    this._getting_debugger_timing = false
    this._devtools_open = false
  }
  log(data){
    data["msSinceLoad"] = window.performance.now() - startTime;
    this.detections.push(data)
    this._detections.push(data.detection)
    this.on_detection(data)
  }
  async init(){
    this.test_navigator_webdriver()
    this.test_stackLookup()
    this.test_window_cdc()
    this.test_HighEntropyValues()
    this.hook_mouseEvents()
    setInterval(this.intervalled.bind(this), this.interval)
    return this.detections
  }
  async intervalled(){
    this.test_stackLookup()
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
  async test_stackLookup() {
    const key = "runtime.enabled.stacklookup"
    var type = "webdriver"
    var score = 1
    if(this._getting_debugger_timing){return}
    if (!(this._detections.includes(key))){
        let stackLookup = false;
        const e = new Error()
        // there might be several ways to catch property access from console print functions
        Object.defineProperty(e, 'stack', {
            configurable: false,
            enumerable: false,
            get: function() {
                stackLookup = true;
                return '';
                }
            });
        console.debug(e);
        if(stackLookup){
            this._getting_debugger_timing = true
            var time = await get_worker_response(getDebuggerTiming)
            if (time>100){
                type = "devtools"
                score = score * 0.5
                this._devtools_open = true
            }else{this._devtools_open = false}
            this.log({detection:key, score:score, "type":type})
            this._getting_debugger_timing = false
        }
    }
  }
  async test_HighEntropyValues(){
    let data = await get_worker_response(getHighEntropyValues)
    var score = 0
    if(data.architecture === "" &&
       data.model === "" && data.platformVersion == "" &&
       data.uaFullVersion === "" && data.bitness == ""){
       this.log({"detection":"Headless", "type":"HighEntropyValues.empty", score:0.9})
    }
  }
  hook_mouseEvents(window) {
    if (!this._isMouseHooked){
        for (let event of ["mousedown", "mouseup", "mousemove", "click", "touchstart", "touchend", "touchmove", "touch", "wheel"]){
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
}