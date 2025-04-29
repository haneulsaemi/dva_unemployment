const file = "./unemployment2.csv";
const file2 = "./consumerprice2.csv";
const file3 = "./economicsentimentic.csv";

//dates = data.columns[c]
category_u = []
dates = []
ages = []
gender = ["계","남자", "여자"]
cp = []
ecosen = [] 

var sel_date = 1;
var sel_age = 0;
var sel_ctgr = 0;
var sel_gender = 0;
var correlataion;

function preload(){
    data = loadTable(file, 'csv', 'header');
    data2 = loadTable(file2, 'csv', 'header')
    data3 = loadTable(file3, 'csv', 'header');
}


function setup(){
    createCanvas(1000, 700)
    background(0)
    fill(255)
    rect(5,5, 990,690)
    fill(0)
    ygap = 30; xgap = 20;
    setUnemploymentDataList()
    setConsumerDataList()
    setEconomicSentimenticDataList()
    correlataion = correlationCoefficient(cp,data.getRow(sel_age+10*sel_gender).arr.slice(2))

    sel_d = createSelect();
    for(let i = 0; i < dates.length; i++){
        sel_d.option(dates[i])
    }
    sel_d.hide()
    sel_g = createSelect();
    for(let i = 0; i < gender.length; i++){
        sel_g.option(gender[i])
    }
    sel_g.position(20, 770);

    sel_a = createSelect();
    for(let i = 0; i < ages.length; i++){
        sel_a.option(ages[i])
    }
    sel_a.changed(()=>{
        sel_age = ages.indexOf(sel_a.value())
        drawGraph()
    })

    sel_d.changed(()=>{
        drawGraph()
    })
    sel_g.changed(()=>{
        sel_gender = gender.indexOf(sel_g.value())
        drawGraph()
    })

    drawGraph()
}



function setUnemploymentDataList(){
    row = data.getRowCount()
    column = data.getColumnCount()
    
    category_u[0] = data.columns[0]; category_u[1] = data.columns[1];
    for(let c = 2; c < column; c++) dates[c-2] = data.columns[c];
    ages = data.getColumn(category_u[1]).slice(0,10)
}

function setConsumerDataList(){
    row = data2.getRowCount()
    column = data2.getColumnCount()
    idx=0;
    for(let i = 1; i < column; i+=3) {
        cp[idx++] = data2.getRow(1).get(i)
    }
    
}

function setEconomicSentimenticDataList(){
    row = data3.getRowCount()
    column = data3.getColumnCount();

    for(let i = 1; i < column; i++){
        ecosen[i-1] = data3.getRow(0).get(i)
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

function changeSet(){
    if(this.checked()){
        sel.hide()
    }else{
        sel.show()
    }
}

function drawGraph(){
    fill(255)
    rect(5,5, 990,690)
    fill(0)
    strokeWeight(1)
    // line(50,50, 50, 640)
    // line(50,640, 950, 640)    
    strokeWeight(1)
    textSize(14)
    stroke(0)
    for(let i = 1; i <= 10; i++){
        line(50, 640-ygap*i ,  950, 640-ygap*i )
        text(i-1, 25, 642-ygap*i)
    }
    genderGraph()
    // drawScatterAndRegression(cp, data.getRow(sel_age + 10 * sel_gender).arr.slice(2).map(Number), 'red', '소비자물가');
    // drawScatterAndRegression(ecosen, data.getRow(sel_age + 10 * sel_gender).arr.slice(2).map(Number), 'purple', '경제심리지수');
}

function drawScatterAndRegression(xData, yData, colorName) {
    let minX = Math.min(...xData);
    let maxX = Math.max(...xData);
    let minY = Math.min(...yData);
    let maxY = Math.max(...yData);

    // x,y 범위에 맞게 매핑
    let mapX = (x) => map(x, minX, maxX, 100, 900);
    let mapY = (y) => map(y, minY, maxY, 600, 100);

    stroke(colorName);
    fill(colorName);

    // 산점도 그리기
    for (let i = 0; i < xData.length; i++) {
        ellipse(mapX(xData[i]), mapY(yData[i]), 5);
    }

    // 회귀선 계산
    let { slope, intercept } = linearRegression(xData, yData);

    // 두 점을 이용해 선 그리기
    let x1 = minX;
    let y1 = slope * x1 + intercept;
    let x2 = maxX;
    let y2 = slope * x2 + intercept;

    strokeWeight(2);
    line(mapX(x1), mapY(y1), mapX(x2), mapY(y2));
}

function linearRegression(x, y) {
    let n = x.length;
    let sumX = x.reduce((a,b) => a+b,0);
    let sumY = y.reduce((a,b) => a+b,0);
    let sumXY = x.map((xi, i) => xi * y[i]).reduce((a,b) => a+b,0);
    let sumX2 = x.map(xi => xi*xi).reduce((a,b) => a+b,0);

    let slope = (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX);
    let intercept = (sumY - slope*sumX) / n;
    return { slope, intercept };
}

function unemployYearGraph(){
    sel_date = dates.indexOf(sel_d.value())
    for(let i = 1; i < ages.length; i++){
        let x = data.getColumn(dates[sel_date])[i+ (10 * sel_gender)]
        rect(100+xgap*i, 640-x*ygap, 30, x*ygap)
        text(ages[i], 90+xgap*i, 655)
        text(x, 105+xgap*i, 630-x*ygap)
    }
}


function genderGraph(){
    sel_age = ages.indexOf(sel_a.value())
    correlataion1 = correlationCoefficient(cp,data.getRow(sel_age+10*sel_gender).arr.slice(2))
    correlataion2 = correlationCoefficient(ecosen,data.getRow(sel_age+10*sel_gender).arr.slice(2))
    let px = 0, py = 0, px2 = 0, py2 = 0, px3 = 0, py3=0;
    for(let i = 0; i < dates.length; i++){


        //상관계수 출력
        fill(0);
        textSize(20);
        textAlign(LEFT);
        text('소비자물가 상관계수: ' + correlataion1.toFixed(3), 700, 100); 
        text('경제심리지수 상관계수: ' + correlataion2.toFixed(3), 700, 130); 



        textSize(10)
        // fill(0)
        // 실업률 그래프 그리기
        stroke('blue');
        fill('blue');
        d = data.getColumn(dates[i])[10*sel_gender + sel_age]
        let x = 80 + (xgap+40) *i;
        let y = 640- float(d) * ygap -ygap;

        ellipse(x,y,3)
        if(i > 0) line(px, py, x, y);

        text(d, x-15, y-10)
        px = x; py = y;

        // 물가지수 그래프 그리기 
        stroke('red');
        fill('red');
        let x2 = 80 + (xgap+40) *i;

        let y2 = 640- float(ecosen[i]) * ygap -ygap;

        ellipse(x2,y2,3);
        if(i > 0) line(px2, py2, x2, y2);
        
        text(ecosen[i], x2-15, y2-10)
    
        px2 = x2; py2 = y2;
        //경제심리지수 그래프 그리기기

        stroke('purple');
        fill('purple');
        let x3 = 80 + (xgap+40) *i;
        let y3 = 640- float(cp[i]) * ygap -ygap;

        ellipse(x3,y3,3);
        if(i > 0) line(px3, py3, x3, y3);
        
        text(cp[i], x3-15, y3+20)

        px3 = x3;
        py3 = y3;

        //날짜 label
        fill(0)
        noStroke()
        // textSize(10)
        textAlign(CENTER)
        text(dates[i], 80 + (xgap+40) *i, 660)
    }

}

function consumerpriceYearGraph(){
    sel_date = dates.indexOf(sel_d.value())
    correlataion = correlationCoefficient(cp,data.getRow(sel_age+10*sel_gender).arr.slice(2))
}



function correlationCoefficient(arrX, arrY) {
    let n = arrX.length;
    arrX = arrX.map(Number);
    arrY = arrY.map(Number);
    
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