const titleToKorean = {
  "Seoul": "서울특별시", "Busan": "부산광역시", "Daegu": "대구광역시",
  "Incheon": "인천광역시", "Gwangju": "광주광역시", "Daejeon": "대전광역시",
  "Ulsan": "울산광역시", "Sejong": "세종특별자치시", "Gyeonggi": "경기도",
  "Gangwon": "강원도", "North Chungcheong": "충청북도",
  "South Chungcheong": "충청남도", "North Jeolla": "전라북도",
  "South Jeolla": "전라남도", "North Gyeongsang": "경상북도",
  "South Gyeongsang": "경상남도", "Jeju": "제주도"
};

const width = 800;
const height = 1000;
const tooltip = d3.select(".tooltip");

let currentYearIndex = 0;
let hoveredRegion = null;
let years = [];

d3.xml("south-korea.svg").then(svgData => {
  const svgNode = svgData.documentElement;
  const container = d3.select("#map").append("svg")
    .attr("width", width)
    .attr("height", height);

  container.node().appendChild(svgNode);

  const paths = d3.select(svgNode).selectAll("path");

  const regionElements = {};
  paths.each(function () {
    const path = d3.select(this);
    const eng = path.attr("title");
    const kor = titleToKorean[eng];
    if (kor) {
      regionElements[kor] = path;
    }
  });

  d3.csv("unemploy_map.csv").then(data => {
    years = data.columns.slice(2); // 연도 목록
    const unemploymentByYear = {};

    // CSV -> { year: { region: value } }
    data.forEach(row => {
      if (row["성별"] !== "계" || row["시도별"] === "계") return;
      const region = row["시도별"];
      years.forEach(year => {
        if (!unemploymentByYear[year]) unemploymentByYear[year] = {};
        unemploymentByYear[year][region] = +row[year] || 0;
      });
    });

    // 색상 스케일 설정
    const maxVal = d3.max(years.map(y =>
      d3.max(Object.values(unemploymentByYear[y]))
    ));

    const color = d3.scaleSequentialLog()
      .domain([1, maxVal])
      .interpolator(d3.interpolateBlues);

    // 연도 표시 텍스트
    const label = d3.select("#yearText");

    function update(year) {
      label.text(`${year}년`);

      Object.entries(regionElements).forEach(([region, path]) => {
        const val = unemploymentByYear[year]?.[region] || 0;
        path.transition().duration(500)
          .attr("fill", val ? color(val) : "#ccc");
      });

      if (hoveredRegion) {
        const value = unemploymentByYear[year]?.[hoveredRegion] || 0;
        tooltip.html(`<strong>${hoveredRegion}</strong><br>실업자 수: ${value.toLocaleString()}`);
      }
    }

    // 툴팁 이벤트 핸들러
    Object.entries(regionElements).forEach(([region, path]) => {
      path.on("mouseover", (event) => {
        hoveredRegion = region;
        const year = years[currentYearIndex];
        const val = unemploymentByYear[year]?.[region] || 0;
        tooltip.style("opacity", 1)
          .html(`<strong>${region}</strong><br>실업자 수: ${val.toLocaleString()}`)
          .style("left", (event.pageX + 10) + "px")
          .style("top", (event.pageY - 20) + "px");
      }).on("mouseout", () => {
        tooltip.style("opacity", 0);
        hoveredRegion = null;
      });
    });

    // 애니메이션 시작
    update(years[currentYearIndex]);
    setInterval(() => {
      currentYearIndex = (currentYearIndex + 1) % years.length;
      update(years[currentYearIndex]);
    }, 2000);
  });
});
