const fileParse = function () {
  let input = document.getElementById("openFile").files[0];
  Papa.parse(input, {
    complete: function (results, file) {
      "Parsing complete", results, file;
      const data = results["data"];
      main(cleanData(data));
    },
  });
};

const cleanData = function (json) {
  return json.map((row) => {
    return row.map((str) => {
      return str.replace(",", "");
    });
  });
};

const createRow = (name, exportable) => ({
  name: name,
  performanceData: {
    impressions: 0,
    clicks: 0,
    cost: 0.0,
    conversions: 0.0,
    revenue: 0.0,
  },
  exportable: exportable,
});

const main = function (parsedData, header = true) {
  let alphaNumArray = [];
  let numArray = [];
  let alphaNumRow = createRow("Alphanumeric", true);
  let justNumRow = createRow("Just Numbers", true);
  let totalsRow = createRow("All Terms", false);
  alphaNumArray = [];
  numArray = [];
  const alphaNumRegex = /\b([a-zA-Z]+\d+|\d+[a-zA-Z]+)\b/g;
  const justNumRegex = /\b\d+\b/g;

  header ? parsedData.shift() : null;

  parsedData.forEach((row) => {
    const [query, impressions, clicks, cost, conversions, revenue] = row;
    const performanceData = {
      impressions: parseFloat(impressions),
      clicks: parseFloat(clicks),
      cost: parseFloat(cost),
      conversions: parseFloat(conversions),
      revenue: parseFloat(revenue),
    };

    if (alphaNumRegex.test(query)) {
      let alphaNumMatches = query.match(alphaNumRegex);
      alphaNumMatches.forEach((ngram) => {
        if (alphaNumArray.indexOf(ngram) == -1) {
          alphaNumArray.push(ngram);
        }
      });

      //we don't want to push into justNumTotals by design here
      let justNumMatches = query.match(justNumRegex);
      if (justNumMatches) {
        justNumMatches.forEach((ngram) => {
          if (numArray.indexOf(ngram) == -1) {
            numArray.push(ngram);
          }
        });
      }
      alphaNumRow = addPerformanceData(alphaNumRow, performanceData);
    } else if (justNumRegex.test(query)) {
      let justNumMatches = query.match(justNumRegex);
      justNumMatches.forEach((term) => {
        if (numArray.indexOf(term) == -1) {
          numArray.push(term);
        }
      });
      justNumRow = addPerformanceData(justNumRow, performanceData);
    }
    totalsRow = addPerformanceData(totalsRow, performanceData);
  });
  genTable(alphaNumRow, justNumRow, totalsRow);
};

//object2 has to have all object1 keys
const addPerformanceData = function (object1, object2) {
  Object.keys(object1.performanceData).forEach((key) => {
    object1.performanceData[key] += object2[key];
  });
  return object1;
};

const genTable = (alphaNumRow, justNumRow, totalsRow) => {
  const alphaRow = document.getElementById("alphaRow");
  const numRow = document.getElementById("numRow");
  const nonNumRow = document.getElementById("nonNumRow");
  const numTotalRow = document.getElementById("totalRow");
  const dataCellEndPosition = 10;
  const alphaNumRowValues = Object.values(alphaNumRow.performanceData);
  const justNumRowValues = Object.values(justNumRow.performanceData);
  const totalsRowValues = Object.values(totalsRow.performanceData);
  for (let i = 0; i < dataCellEndPosition; i++) {
    let t1 = alphaRow.cells[i + 1];
    let t2 = numRow.cells[i + 1];
    let t3 = nonNumRow.cells[i + 1];
    let t4 = numTotalRow.cells[i + 1];
    if (i == 2 || i == 4) {
      t1.innerText = alphaNumRowValues[i].toFixed(2);
      t2.innerText = justNumRowValues[i].toFixed(2);
      t4.innerText = totalsRowValues[i].toFixed(2);
      t3.innerText = (
        totalsRowValues[i].toFixed(2) -
        alphaNumRowValues[i].toFixed(2) -
        justNumRowValues[i].toFixed(2)
      ).toFixed(2);
    } else if (i < 5) {
      t1.innerText = alphaNumRowValues[i];
      t2.innerText = justNumRowValues[i];
      t4.innerText = totalsRowValues[i];
      t3.innerText =
        totalsRowValues[i] - alphaNumRowValues[i] - justNumRowValues[i];
    }
    document.querySelectorAll("table").forEach((table) => {
      genDividends(table);
    });
  }
};

const genDividends = function (table) {
  const dataCellEndPos = 10;
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
