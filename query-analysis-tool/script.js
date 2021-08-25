let data;
const alphaNumRegex = /\b([a-zA-Z]+\d+|\d+[a-zA-Z]+)\b/g;
const justNumRegex = /\b\d+\b/g;
const numAlphaRow = document.getElementById("alphaRow");
const numRow = document.getElementById("numRow");
const numNonRow = document.getElementById("nonNumRow");
const numTotalRow = document.getElementById("totalRow");
const dataCellEndPos = 10;
let alphaNumTotal = [];
let justNumTotal = [];
let total = [];
let alphaNumArray = [];
let numArray = [];

const fileParse = function () {
  let input = document.getElementById("openFile").files[0];
  Papa.parse(input, {
    complete: function (results, file) {
      "Parsing complete", results, file;
      data = results["data"];
      cleanData(data);
      numParse(data);
      document.getElementById("tableWrapper").style.display = "block";
    },
  });
};

const cleanData = function (json) {
  for (let i = 0; i < json.length; i++) {
    for (let x = 0; x < json[i].length; x++) {
      json[i][x] = json[i][x].replace(",", "");
    }
  }
};

const numParse = function (parsedData) {
  alphaNumTotal = [0, 0, 0, 0, 0];
  justNumTotal = [0, 0, 0, 0, 0];
  total = [0, 0, 0, 0, 0];
  alphaNumArray = [];
  numArray = [];

  for (let i = 1; i < parsedData.length; i++) {
    const e = parsedData[i][0];
    if (alphaNumRegex.test(e)) {
      let matchTerm = e.match(alphaNumRegex);
      matchTerm.forEach((term) => {
        if (alphaNumArray.indexOf(term) == -1) {
          alphaNumArray.push(term);
        }
      });

      let numMatchTerm = e.match(justNumRegex);
      if (numMatchTerm) {
        numMatchTerm.forEach((term) => {
          if (numArray.indexOf(term) == -1) {
            numArray.push(term);
          }
        });
      }
      for (let y = 1; y < parsedData[i].length; y++) {
        const f = parsedData[i][y];
        alphaNumTotal[y - 1] += parseFloat(f);
      }
    } else if (justNumRegex.test(e)) {
      let numMatchTerm = e.match(justNumRegex);
      numMatchTerm.forEach((term) => {
        if (numArray.indexOf(term) == -1) {
          numArray.push(term);
        }
      });
      for (let y = 1; y < parsedData[i].length; y++) {
        const f = parsedData[i][y];
        justNumTotal[y - 1] += parseFloat(f);
      }
    }
    for (let y = 1; y < parsedData[i].length; y++) {
      const f = parsedData[i][y];
      total[y - 1] += parseFloat(f);
    }
  }
  genTable();
};

const genTable = function () {
  for (let i = 0; i < dataCellEndPos; i++) {
    let t1 = numAlphaRow.cells[i + 1];
    let t2 = numRow.cells[i + 1];
    let t3 = numNonRow.cells[i + 1];
    let t4 = numTotalRow.cells[i + 1];
    if (i == 2 || i == 4) {
      t1.innerText = alphaNumTotal[i].toFixed(2);
      t2.innerText = justNumTotal[i].toFixed(2);
      t4.innerText = total[i].toFixed(2);
      t3.innerText = (
        total[i].toFixed(2) -
        alphaNumTotal[i].toFixed(2) -
        justNumTotal[i].toFixed(2)
      ).toFixed(2);
    } else if (i < 5) {
      t1.innerText = alphaNumTotal[i];
      t2.innerText = justNumTotal[i];
      t4.innerText = total[i];
      t3.innerText = total[i] - alphaNumTotal[i] - justNumTotal[i];
    }
    document.querySelectorAll("table").forEach((table) => {
      genDividends(table);
    });
  }
};

const genDividends = function (table) {
  const rows = table.querySelectorAll("tr");
  rows.forEach((row) => {
    row.id;
    if (row.id != "titleRow") {
      const cells = row.cells;
      for (let i = 5; i < dataCellEndPos; i++) {
        const cell = cells[i + 1];
        cell.innerText;
        if (i == 5) {
          cell.innerText = (
            parseFloat(cells[5].innerText) / parseFloat(cells[3].innerText)
          ).toFixed(2);
        } else if (i == 6) {
          cell.innerText = (
            parseFloat(cells[3].innerText) / parseFloat(cells[2].innerText)
          ).toFixed(2);
        } else if (i == 7) {
          cell.innerText = (
            parseFloat(cells[5].innerText) / parseFloat(cells[4].innerText)
          ).toFixed(2);
        } else if (i == 8) {
          cell.innerText =
            (
              (parseFloat(cells[2].innerText) /
                parseFloat(cells[1].innerText)) *
              100.0
            ).toFixed(2) + "%";
        } else {
          cell.innerText =
            (
              (parseFloat(cells[4].innerText) /
                parseFloat(cells[2].innerText)) *
              100.0
            ).toFixed(2) + "%";
        }
      }
    }
  });
};

//possibly done debugging the above
const download = function (e) {
  let array;
  switch (e.currentTarget.downloadParam) {
    case "alphaNumeric":
      array = alphaNumArray;
      break;
    case "numeric":
      array = numArray;
      break;
    default:
  }
  array;
  let csvContent = "data:text/csv;charset=utf-8," + array.join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `${e.currentTarget.downloadParam}.csv`);
  document.body.appendChild(link); // Required for FF

  link.click();
};

document.getElementById("submitFile").addEventListener("click", fileParse);
document
  .getElementById("alphaNumericDownload")
  .addEventListener("click", download);
document.getElementById("alphaNumericDownload").downloadParam = "alphaNumeric";
document.getElementById("numericDownload").addEventListener("click", download);
document.getElementById("numericDownload").downloadParam = "numeric";
