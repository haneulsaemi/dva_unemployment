const file = "./unemploy3.csv";
const file2 = "./cp3.csv";

let data, data2;
let dates = [];
let ages = [];
let gender = ["계", "남자", "여자"];
let cp = [];

let mode = "CPI";

let sel_age = 0;
let sel_gender = 0;

let sel_a, sel_g;
let points = [];

let minY = 0, maxY = 0;

function preload() {
    data = loadTable(file, 'csv', 'header');
    data2 = loadTable(file2, 'csv', 'header');
}

function setup() {
    createCanvas(1000, 750);
    setUnemploymentDataList();
    setConsumerDataList();
    setEcosenDataList();

    sel_g = createSelect();
    gender.forEach(g => sel_g.option(g));
    sel_g.position(20, height + 10);
    sel_g.changed(() => {
        sel_gender = gender.indexOf(sel_g.value());
        updateGraphData();
    });

    sel_a = createSelect();
    ages.forEach(a => sel_a.option(a));
    sel_a.position(150, height + 10);
    sel_a.changed(() => {
        sel_age = ages.indexOf(sel_a.value());
        updateGraphData();
    });

    let sel_mode = createSelect();
    sel_mode.option("CPI");
    sel_mode.option("ECOSEN");
    sel_mode.position(300, height + 10);
    sel_mode.changed(() => {
        mode = sel_mode.value();
        updateGraphData();
    });

    updateGraphData();
}

function draw() {
    background(255);
    drawAxes();
    drawScatter();
    drawHoverTooltip();
}

function setUnemploymentDataList() {
    const column = data.getColumnCount();
    for (let c = 2; c < column; c++) dates[c - 2] = data.columns[c];
    ages = data.getColumn(data.columns[1]).slice(0, 10);
}

function setConsumerDataList() {
    const column = data2.getColumnCount();
    for (let i = 1; i < column; i += 3) {
        cp.push(Number(data2.getRow(1).get(i)));
    }
}

function setEcosenDataList() {
    // "경제심리지수(원계열)" 행 전체를 가져오기
    let row = data2.getRow(1); // 2번째 행 (인덱스 1)
    ecosen = [];

    for (let i = 1; i < row.arr.length; i++) { // i=1부터: 날짜 열
        let val = Number(row.get(i));
        if (!isNaN(val)) {
            ecosen.push(val);
        }
    }

}

function updateGraphData() {
    const yData = data.getRow(sel_age + 10 * sel_gender).arr.slice(2).map(Number);
    const xLabels = dates.slice(0, yData.length);

    let valueData = mode === "CPI" ? cp : ecosen;
    valueData = valueData.map(Number);
    const minLength = Math.min(yData.length, valueData.length);

    let minVal = Math.min(...valueData);
    let maxVal = Math.max(...valueData);
    minY = Math.min(...yData);
    maxY = Math.max(...yData);

    points = [];

    for (let i = 0; i < minLength; i++) {
        const x = map(i, 0, minLength - 1, 100, width - 100);
        const y = map(yData[i], minY, maxY, height - 100, 150);
        const normalized = (valueData[i] - minVal) / (maxVal - minVal);
        const size = map(normalized, 0, 1, 20, 50);
        const col = map(normalized, 0, 1, 150, 255);

        points.push({
            x,
            y,
            size,
            date: xLabels[i],
            indicator: valueData[i],
            unemploy: yData[i],
            color: col,
            index: i
        });
    }
}

function drawAxes() {
    stroke(0);
    strokeWeight(1);
    line(70, 150, 70, height - 100); // y축
    line(70, height - 100, width - 50, height - 100); // x축

    fill(0);
    noStroke();
    textSize(12);
    textAlign(RIGHT);
    for (let i = 0; i <= 10; i++) {
        let val = lerp(minY, maxY, i / 10);
        let y = map(val, minY, maxY, height - 100, 150);
        text(val.toFixed(1), 60, y);
        stroke(220);
        line(70, y, width - 50, y);
    }

    fill(0);
    textSize(14);
    text("시간 흐름 (X축)", width / 2, height - 40);
    push();
    translate(20, height / 2);
    rotate(-HALF_PI);
    text("실업률", 0, 0);
    pop();
}

function drawScatter() {
    noStroke();
    textAlign(CENTER);
    textSize(10);

    for (let p of points) {
        fill(255, 100, 100, p.color * 0.8)
        ellipse(p.x, p.y, p.size, p.size);

        // X축 날짜 라벨 (간격 조절)
        if (p.index % 5 === 0) {
            fill(80);
            text(p.date, p.x, height - 80);
        }
    }
}

function drawHoverTooltip() {
    let closestPoint = null;
    let minDist = Infinity;

    for (let p of points) {
        let d = dist(mouseX, mouseY, p.x, p.y);
        if (d < p.size / 2 + 3 && d < minDist) {
            closestPoint = p;
            minDist = d;
        }
    }

    if (closestPoint) {
        let p = closestPoint;

        stroke(0);
        strokeWeight(2);
        fill(255, 200, 200);
        ellipse(p.x, p.y, p.size + 4, p.size + 4);

        let tooltipX = p.x + 12;
        if (p.x > width - 200) {
            tooltipX = p.x - 192;
        }

        noStroke();
        fill(0, 0, 0, 180);
        rect(tooltipX, p.y - 45, 180, 60, 8);

        fill(255);
        textSize(13);
        textAlign(LEFT);
        text(`📅 날짜: ${p.date}`, tooltipX + 6, p.y - 28);

        if (mode === "CPI") {
            text(`📈 소비자물가지수: ${p.indicator.toFixed(2)}`, tooltipX + 6, p.y - 13);
        } else {
            text(`🧠 경제심리지수: ${p.indicator.toFixed(2)}`, tooltipX + 6, p.y - 13);
        }

        text(`📉 실업률: ${p.unemploy.toFixed(2)}`, tooltipX + 6, p.y + 2);
    }
}
