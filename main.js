/*
var func = "beginPath"
var obj = CanvasRenderingContext2D
proxy = new Proxy(obj.prototype[func], {
  apply: (target, thisArg, argumentsList) => {
    console.log("canvas beginPath detected")
    return Reflect.apply(target, thisArgument, argumentsList)
  }
}
)
Object.defineProperty(obj, func, {get:proxy})
*/

const scores = []
const perfs = []

function avg(array){
    sum = array.reduce((a,c) => a + c, 0)
    return sum / array.length
};
function copyAsJSON(){
    const data = JSON.stringify(window.brotector.detections, null, 2)
    navigator.clipboard.writeText(data)
};
async function log(data){
    console.log(data)
    const table = document.querySelector("#detections")

    const detection = data.detection
    const msSinceLoad = data.msSinceLoad
    const type = data.type
    const score = data.score
    data = data.data

    scores.push(score)
    perfs.push(msSinceLoad)

    row = table.insertRow(-1)

    var cell = row.insertCell(0);
    cell.textContent = detection
    row.appendChild(cell)

    var cell = row.insertCell(1);
    cell.textContent = msSinceLoad.toFixed(2)
    row.appendChild(cell)

    var cell = row.insertCell(2);
    cell.textContent = type
    row.appendChild(cell)

    var cell = row.insertCell(3);
    cell.textContent = score
    row.appendChild(cell)

    var cell = row.insertCell(4);
    cell.textContent = JSON.stringify(data, null, 2);

    document.querySelector("#avg-score").textContent = avg(scores).toFixed(2)
    document.querySelector("#avg-ms-load").textContent =avg(perfs).toFixed(2)
}
async function main(){
    window.brotector = new Brotector(log)
}
window.onload = main