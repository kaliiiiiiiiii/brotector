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
    cell.textContent = msSinceLoad.toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "'")
    row.appendChild(cell)

    var cell = row.insertCell(2);
    cell.textContent = type
    row.appendChild(cell)

    var cell = row.insertCell(3);
    cell.textContent = score
    row.appendChild(cell)

    var cell = row.insertCell(4);
    cell.textContent = JSON.stringify(data, null, 2);

    var avg_score = avg(scores).toFixed(2)
    document.querySelector("#avg-score").textContent =avg_score
    document.querySelector("#avg-ms-load").textContent =avg(perfs).toFixed(2).replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, "'")

    var color = "red"
    if(avg_score < 0.4){
        color = "#ff8800"
    }
    if(score <= 0.2){color="#FFC000"};
    document.querySelector("#table-keys").setAttribute("bgcolor", color)
}
async function main(){
    window.brotector = new Brotector(log)
}
window.onload = main