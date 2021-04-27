function getNode(data, layer, container) {
  //產生一個存放treemap的節點
  var treemap = document.createElement("div");

  //設定這個treemap的邊界
  var margin = { top: 10, right: 10, bottom: 10, left: 10 };

  //設定這個treemap的寬和高
  var height = container.clientHeight - margin.top - margin.bottom;
  var width = container.clientWidth - margin.left - margin.right;

  var svg = d3
    .select(treemap)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g");

  /**
   * 利用d3.hierarchy產生x y的資料
   * 這個函式可以自動算出這些treemap所佔的大小
   * sum可以算出所有數字的總和
   * d3需要靠總和的占比去推估每個長方形的大小
   * 最後排序一下，會比較好看
   */
  var d3ds = d3
    .hierarchy(data)
    .sum(function (d) {
      return d.size;
    })
    .sort(function (a, b) {
      return b.size - a.size;
    });

  //設定svg位置
  d3
    .treemap()
    .size([width, height])
    //每個treemap的上邊距、右邊距
    .paddingTop(35)
    .paddingRight(15)
    //每個treemap之間的邊距
    .paddingInner(5)(d3ds);

  //依照各個layer的內容給定指定顏色，例如，有6個部門就給6個不同的顏色
  var COLORS = [
    "234",
    "52",
    "104",
    "208",
    "182",
    "78",
    "26",
    "338",
    "312",
    "156",
    "260",
    "130",
    "0",
    "286"
  ];
  var color = d3
    .scaleOrdinal()
    .domain(layer)
    .range(COLORS.slice(0, layer.length));

  //設定透明度，越低越透明
  var opacity = d3
    .scaleLinear()
    //設定區間，看最高多少和最低多少
    .domain([100, 20])
    //設定區間的透明度
    .range([1, 0.5]);

  //畫長方形
  svg
    .selectAll("rectangle")
    //將所有頁節點(最下層的節點)資料加進來
    .data(d3ds.leaves())
    .enter()
    .append("rect")
    .attr("class", "customColor")
    //svg長方形起始座標為d3自動算出
    .attr("x", function (d) {
      return d.x0;
    })
    .attr("y", function (d) {
      return d.y0;
    })
    .attr("width", function (d) {
      return d.x1 - d.x0;
    })
    .attr("height", function (d) {
      return d.y1 - d.y0;
    })
    .style("stroke", "red")
    //以layer名稱套用顏色
    .attr("fill", function (d) {
      return "hsl(" + color(d.parent.data.name) + ", 100%, 50%)";
    })
    //以數量大小套用透明度
    .style("opacity", function (d) {
      return opacity(d.data.size);
    })
    .attr("tag", function (d) {
        return color(d.parent.data.name);
      });

  //寫項目名稱，例如: 部門的人事費、業務費...等等
  svg
    .selectAll("listNames")
    .data(d3ds.leaves())
    .enter()
    .append("text")
    //設定文字要出現在哪裡
    .attr("x", function (d) {
      return d.x0 + 1;
    })
    .attr("y", function (d) {
      return d.y0 + 20;
    })
    .text(function (d) {
      //節點大小不為0時印出節點名稱
      if (d.data.size > 0) return d.data.name;
      else return "";
    })
    //設定文字大小&顏色
    .attr("font-size", function (d) {
      return "1rem";
    })
    .attr("fill", "white");

  //寫項目的數值，例如部門的人事費總額、業務費總額
  svg
    .selectAll("listValue")
    .data(d3ds.leaves())
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0 + 1;
    })
    .attr("y", function (d) {
      return d.y0 + 35;
    })
    .text(function (d) {
      if (d.data.size > 0) {
        var value = Math.round(d.data.value/100000000) / 10;
        return value.toString() + "億";
      }
      else return "";
    })
    .attr("font-size", function (d) {
      return ".9rem";
    })
    .attr("fill", "white");

  //寫分層名稱，例如總統府、行政院...
  svg
    .selectAll("layerName")
    //在d3.hierarchy會自動幫我們分出各個階層的名稱，這個函式可以幫我們找出所有階層深度為1的名稱
    //可以先在d3.hierarchy呼叫完後印出輸出的值，將你要顯示的layer名稱深度先記錄下來，這邊可以直接使用
    .data(
      d3ds.descendants().filter(function (d) {
        return d.depth == 1;
      })
    )
    .enter()
    .append("text")
    .attr("x", function (d) {
      return d.x0 + 1;
    })
    .attr("y", function (d) {
      return d.y0 + 21;
    })
    .text(function (d) {
      return d.data.name;
    })
    .attr("font-size", "1.1rem")
    .attr("fill", "black");

  return treemap;
}
