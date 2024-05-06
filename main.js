async function log(data){
    console.log(data)
    const detections_elem = document.querySelector("#detections")

    var str = JSON.stringify(data, null, 2);
    var text = document.createTextNode(str);
    detections_elem.appendChild(text)
}
async function main(){
    window.brotector = new Brotector(log)
}
window.onload = main