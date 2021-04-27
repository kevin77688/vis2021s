var allText = null;
var treemapContainer = null;
var objectKeys = null;
var rectList = null;

var Base64 = {
  _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
  encode: function (r) {
    var t,
      e,
      o,
      a,
      h,
      c,
      n = "",
      d = 0;
    for (r = Base64._utf8_encode(r); d < r.length; )
      (o = (c = r.charCodeAt(d++)) >> 2),
        (a = ((3 & c) << 4) | ((t = r.charCodeAt(d++)) >> 4)),
        (h = ((15 & t) << 2) | ((e = r.charCodeAt(d++)) >> 6)),
        (c = 63 & e),
        isNaN(t) ? (h = c = 64) : isNaN(e) && (c = 64),
        (n =
          n +
          this._keyStr.charAt(o) +
          this._keyStr.charAt(a) +
          this._keyStr.charAt(h) +
          this._keyStr.charAt(c));
    return n;
  },
  decode: function (r) {
    var t,
      e,
      o,
      a,
      h,
      c = "",
      n = 0;
    for (r = r.replace(/[^A-Za-z0-9\+\/\=]/g, ""); n < r.length; )
      (t =
        (this._keyStr.indexOf(r.charAt(n++)) << 2) |
        ((o = this._keyStr.indexOf(r.charAt(n++))) >> 4)),
        (e =
          ((15 & o) << 4) | ((a = this._keyStr.indexOf(r.charAt(n++))) >> 2)),
        (o = ((3 & a) << 6) | (h = this._keyStr.indexOf(r.charAt(n++)))),
        (c += String.fromCharCode(t)),
        64 != a && (c += String.fromCharCode(e)),
        64 != h && (c += String.fromCharCode(o));
    return (c = Base64._utf8_decode(c));
  },
  _utf8_encode: function (r) {
    r = r.replace(/\r\n/g, "\n");
    for (var t = "", e = 0; e < r.length; e++) {
      var o = r.charCodeAt(e);
      o < 128
        ? (t += String.fromCharCode(o))
        : (127 < o && o < 2048
            ? (t += String.fromCharCode((o >> 6) | 192))
            : ((t += String.fromCharCode((o >> 12) | 224)),
              (t += String.fromCharCode(((o >> 6) & 63) | 128))),
          (t += String.fromCharCode((63 & o) | 128)));
    }
    return t;
  },
  _utf8_decode: function (r) {
    for (var t = "", e = 0, o = (c1 = c2 = 0); e < r.length; )
      (o = r.charCodeAt(e)) < 128
        ? ((t += String.fromCharCode(o)), e++)
        : 191 < o && o < 224
        ? ((c2 = r.charCodeAt(e + 1)),
          (t += String.fromCharCode(((31 & o) << 6) | (63 & c2))),
          (e += 2))
        : ((c2 = r.charCodeAt(e + 1)),
          (c3 = r.charCodeAt(e + 2)),
          (t += String.fromCharCode(
            ((15 & o) << 12) | ((63 & c2) << 6) | (63 & c3)
          )),
          (e += 3));
    return t;
  },
};

function gethsl(value) {
  value = parseInt(value);
  return (value + 1) < 359 ? value + 1 : (value + 1) % 360;
}

function changeColor() {
  rectList = document.getElementsByClassName("customColor");
  console.log(rectList);
  for (var i = 0; i < rectList.length; i++) {
    var currentHSL = rectList[i].getAttribute("tag");
    var nextHSL = gethsl(currentHSL);
    var nextHSLText = "hsl(" + currentHSL + ",100%, 40%)";
    rectList[i].setAttribute("fill", nextHSLText);
    rectList[i].setAttribute("tag", nextHSL);
  }
}

function onPageload() {
  treemapContainer = document.getElementById("treemap");
  objectKeys = document.getElementById("ObjectKeys");

  document
    .getElementById("dropfile")
    .addEventListener("dragover", function (evt) {
      evt.preventDefault();
    });
  onFileDrop();
  getFile();
  window.setInterval(changeColor, 50);
}

function buildTree(result) {
  dataLoader(result, function () {
    for (i = 0; i < objectKeys.length; i++)
      if (objectKeys.options[i].value == "selectValue") {
        objectKeys.remove("selectValue");
        break;
      }
    objectKeys.selectedIndex = "0";
    dataClassifier(objectKeys.value, function (data, layers) {
      node = getNode(data, layers, treemapContainer);
      treemapContainer.innerHTML = node.innerHTML;
    });
  });
}

function getFile() {
  var csvFile = new XMLHttpRequest();
  csvFile.open(
    "GET",
    "https://raw.githubusercontent.com/kevin77688/vis2021s/master/lab02/data2.csv",
    true
  );
  csvFile.onreadystatechange = function () {
    if (csvFile.readyState === 4)
      if (csvFile.status === 200) buildTree(csvFile.responseText);
  };
  csvFile.send(null);
}

function onFileDrop() {
  document.getElementById("dropfile").addEventListener("drop", function (evt) {
    evt.preventDefault();

    var files = evt.dataTransfer.files;

    if (files.length) {
      if (treemapContainer.innerHTML.length) treemapContainer.innerHTML = "";

      if (objectKeys.innerHTML.length) objectKeys.innerHTML = "";

      var csvFile = files[0];

      //讀取csv
      var fr = new FileReader();

      fr.onload = function () {
        buildTree(fr.result);
      };

      fr.readAsText(csvFile);
    }
  });
}
