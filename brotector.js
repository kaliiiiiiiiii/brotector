function getDebuggerTiming(){
    var start = globalThis.performance.now();
    debugger;
    return globalThis.performance.now()-start
}

function isEmpty() {
    for (var prop in this) if (this.hasOwnProperty(prop)) return false;
    return true;
};

function hookFunc(obj, func, callback){
    proxy = new Proxy(globalThis[obj].prototype[func], {
      apply: (target, thisArg, argumentsList) => {
        callback(target, thisArg, argumentsList)
        return Reflect.apply(target, thisArg, argumentsList)
      }
        }
    );
    Object.defineProperty(globalThis[obj].prototype, func, {value:proxy})
}

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
  constructor(on_detection, interval=70) {
    // on_detection(data:dict)
    this._isMouseHooked = false

    this.on_detection = on_detection
    this.detections = []
    this.mousePos = [0, 0]
    this._detections = []
    this.interval = interval
    this.init_done = this.init()
    this._doing_stacklookup = false
    this.devtools_open = false
    this._runtime_detected = false
    this._canvasMouseVisualizer = false
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
    this.hook_canvasVisualize()
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
    if (this._runtime_detected === false){
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
            if(this._doing_stacklookup){return}
            this._doing_stacklookup = true
            this._runtime_detected = true
            var start = globalThis.performance.now();

            try{await get_worker_response(()=>{debugger}, 200)}
            catch(e){if(e.message !== "timeout"){throw e}}

            var time = globalThis.performance.now()-start
            if (time>180){
                type = "devtools"
                score = score * 0.5
                this.devtools_open = true

            }else{this.devtools_open = false}
            this.log({detection:key, score:score, "type":type})
            this._doing_stacklookup = false
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
    hookFunc("CanvasRenderingContext2D", "arc", this.canvasVisualizeHandler.bind(this))
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
}
