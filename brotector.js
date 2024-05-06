const startTime = new Date();
class Brotector {
  constructor(on_detection, interval=100) {
    // on_detection(data:dict)
    this.on_detection = on_detection
    this.detections = []
    this._detections = []
    this.interval = interval
    this.init_done = this.init()
  }
  log(data){
    data["timeSinceLoad"] = ((new Date()).getTime() - startTime.getTime()) / 1000;
    this.detections.push(data)
    this._detections.push(data.detection)
    this.on_detection(data)
  }
  async init(){
    this.test_navigator_webdriver()
    this.test_stackLookup()
    setInterval(this.intervalled.bind(this), this.interval)
  }
  async intervalled(){
    this.test_stackLookup()
  }
  test_navigator_webdriver(){
    if(navigator.webdriver === true){
        this.log({detection:"navigator.webdriver"})
    }
  }
  test_stackLookup(window) {
    const key = "runtime.enabled.stacklookup"
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
        if(stackLookup){this.log({detection:key})}
    }
  }
}