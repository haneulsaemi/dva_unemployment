// --- 파일 경로 설정 ---
const file = "./unemploy3.csv";
const file2 = "./cp3.csv";
const file3 = "./ecosen3.csv";

// --- 데이터 저장용 변수 ---
let category_u = [];
let dates = [];
let ages = [];
let gender = ["계", "남자", "여자"];
let cp = [];
let ecosen = [];

// --- 선택 변수 ---
let sel_age = 0;
let sel_gender = 0;

// --- 인터페이스 요소 ---
let sel_a, sel_g;

function preload() {
    data = loadTable(file, 'csv', 'header');
    data2 = loadTable(file2, 'csv', 'header');
    data3 = loadTable(file3, 'csv', 'header');
}

function setup() {
    createCanvas(1000, 700);
    background(255);
    ygap = 30;
    xgap = 20;

    setUnemploymentDataList();
    setConsumerDataList();
    setEconomicSentimenticDataList();

    sel_g = createSelect();
    gender.forEach(g => sel_g.option(g));
    sel_g.position(20, 770);
    sel_g.changed(() => {
        sel_gender = gender.indexOf(sel_g.value());
        drawGraph();
    });

    sel_a = createSelect();
    ages.forEach(a => sel_a.option(a));
    sel_a.position(150, 770);
    sel_a.changed(() => {
        sel_age = ages.indexOf(sel_a.value());
        drawGraph();
    });

    drawGraph();
}

function setUnemploymentDataList() {
    let column = data.getColumnCount();
    category_u[0] = data.columns[0];
    category_u[1] = data.columns[1];
    for (let c = 2; c < column; c++) dates[c-2] = data.columns[c];
    ages = data.getColumn(category_u[1]).slice(0, 10);
}

function setConsumerDataList() {
    let column = data2.getColumnCount();
    let idx = 0;
    for (let i = 1; i < column; i += 3) {
        cp[idx++] = data2.getRow(1).get(i);
    }
}

function setEconomicSentimenticDataList() {
    let column = data3.getColumnCount();
    for (let i = 1; i < column; i++) {
        ecosen[i-1] = data3.getRow(0).get(i);
    }
    ecosen = minMaxNormalize(ecosen);
}

function minMaxNormalize(arr) {
    let min = Math.min(...arr);
    let max = Math.max(...arr);
    return arr.map(x => {
        let normalized = (x - min) / (max - min);
        return Math.round(normalized * 10) / 10; // 소수 둘째자리로 반올림
    });
}

function drawGraph() {
    background(255);
    drawAxes(); // --- x축, y축 추가 표시 ---
    drawScatterAndRegression(cp, getUnemploymentData(), 'red', '소비자물가');
    drawScatterAndRegression(ecosen, getUnemploymentData(), 'purple', '경제심리지수');
}

function drawAxes() {
    stroke(0);
    strokeWeight(1);
    line(50, 640, 950, 640); // x축
    line(50, 140, 50, 640); // y축

    noStroke();
    fill(0);
    textAlign(CENTER);
    let xgap = 900/10;
    for (let i = 0; i <= 10; i++) {
        let y = 640 - i * 50;
        //y축 그리기
        text(i, 30, y + 5);
        stroke(220);
        line(50, y, 950, y); // --- 축에 따른 눈금선 추가 ---

        //x축 그리기
        line(50+xgap*i, 640, 50+xgap*i, 140);
        text(i/10, 50+xgap*i, 660);
         
    }
    
    noStroke();
    textAlign(RIGHT);
    textSize(14);
    
    fill(255,0,0)
    text("소비자물가", 480, 680); // --- x축 라벨 추가 ---
    fill(0)
    text("/",500,680)
    fill(255,0,255)
    text("경제심리지수", 590, 680); // --- x축 라벨 추가 ---

    fill(0)
    push();
    translate(20, 400);
    rotate(-HALF_PI);
    text("실업률", 0, 0); // --- y축 라벨 추가 ---
    pop();
}

function getUnemploymentData() {
    return data.getRow(sel_age + 10 * sel_gender).arr.slice(2).map(Number);
}

function drawScatterAndRegression(xData, yData, colorName, labelName) {
    
    xData = xData.map(Number);
    yData = yData.map(Number);

    let minX = Math.min(...xData);
    let maxX = Math.max(...xData);
    let minY = Math.min(...yData);
    let maxY = Math.max(...yData);

    let offsetX = 50;
    let offsetY = 640;
    let plotWidth = 900;
    let plotHeight = 500;

    let mapX = (x) => map(x, minX, maxX, offsetX, offsetX + plotWidth);
    let mapY = (y) => map(y, minY, maxY, offsetY, offsetY - plotHeight);

    if(colorName === "purple"){
        fill(255,0,255);
        stroke(255,0,255);
    }else{
        fill(255,0,0);
        stroke(255,0,0);
    }
    // fill(colorName)

    for (let i = 0; i < xData.length; i++) {
        ellipse(mapX(xData[i]), mapY(yData[i]), 10, 10); // --- 산점도 그리기 ---
    }

    let { slope, intercept } = linearRegression(xData, yData);
    let corr = correlationCoefficient(xData, yData);

    stroke(colorName);
    strokeWeight(2);
    let x1 = minX;
    let y1 = slope * x1 + intercept;
    let x2 = maxX;
    let y2 = slope * x2 + intercept;
    line(mapX(x1), mapY(y1), mapX(x2), mapY(y2)); // --- 회귀선 그리기 ---
    fill(colorName)
    noStroke();
    textAlign(LEFT);
    textSize(14);
    if (colorName === 'red') {
        text(labelName + ' 회귀선', 800, 50);
        text('상관계수: ' + corr.toFixed(3), 800, 70); // --- 상관계수 표시 추가 ---
    } else {
        text(labelName + ' 회귀선', 800, 100);
        text('상관계수: ' + corr.toFixed(3), 800, 120); // --- 상관계수 표시 추가 ---
    }
}

function linearRegression(x, y) {
    let n = x.length;
    let sumX = x.reduce((a, b) => a + b, 0);
    let sumY = y.reduce((a, b) => a + b, 0);
    let sumXY = x.map((xi, i) => xi * y[i]).reduce((a, b) => a + b, 0);
    let sumX2 = x.map(xi => xi * xi).reduce((a, b) => a + b, 0);

    let slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    let intercept = (sumY - slope * sumX) / n;
    return { slope, intercept };
}

function correlationCoefficient(arrX, arrY) {
    let n = arrX.length;
    let meanX = arrX.reduce((a, b) => a + b, 0) / n;
    let meanY = arrY.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let denominatorX = 0;
    let denominatorY = 0;

    for (let i = 0; i < n; i++) {
        let dx = arrX[i] - meanX;
        let dy = arrY[i] - meanY;
        numerator += dx * dy;
        denominatorX += dx * dx;
        denominatorY += dy * dy;
    }

    return numerator / Math.sqrt(denominatorX * denominatorY);
}
