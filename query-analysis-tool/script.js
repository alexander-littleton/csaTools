let alphaNumericResults = [];
let justNumbersResults = [];


const run = () => {
  const file = document.getElementById("openFile").files[0];
  extractedData = extractQueryData(file);
  //todo: figure out whether data is using header and validate header
  main(extractedData);
}

const extractQueryData = (file) => {
  let extractedData
  Papa.parse(file, {
    complete:(results, file) => {
      "Parsing complete", results, file;
      const rawQueryData = results["data"];
      extractedData = cleanQueryData(rawQueryData);
    },
  });
  return extractedData
};

const cleanQueryData = function (rawQueryData) {
  return rawQueryData.map((row) => {
    return row.map((str) => {
      return str.replace(",", "");
    });
  });
};

const createQueryData = (name, exportable) => ({
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

const main = (parsedData, header = true) => {
  let outputData = {
    alphanumericRow: createQueryData("Alphanumeric", true),
    justNumbersRow: createQueryData("Just Numbers", true),
    totalsRow: createQueryData("All Terms", false),
  }
  let alphaNumericRow = outputData.alphanumericRow;
  let justNumbersRow = outputData.justNumbersRow;
  let totalsRow = outputData.totalsRow;
  
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
    
    const alphaNumRegex = /\b([a-zA-Z]+\d+|\d+[a-zA-Z]+)\b/g;
    if (alphaNumRegex.test(query)) {
      let alphaNumMatches = query.match(alphaNumRegex);
      alphaNumMatches.forEach((ngram) => {
        if (alphaNumericResults.indexOf(ngram) == -1) {
          alphaNumericResults.push(ngram);
        }
      });

      //we don't want to push into justNumTotals by design here
      const justNumbersRegex = /\b\d+\b/g;
      let justNumbersMatches = query.match(justNumbersRegex);
      if (justNumbersMatches) {
        justNumbersMatches.forEach((ngram) => {
          if (justNumbersResults.indexOf(ngram) == -1) {
            justNumbersResults.push(ngram);
          }
        });
      }
      alphaNumericRow = addPerformanceData(alphaNumericRow, performanceData);
    } else if (justNumRegex.test(query)) {
      let justNumMatches = query.match(justNumRegex);
      justNumMatches.forEach((term) => {
        if (justNumbersResults.indexOf(term) == -1) {
          justNumbersResults.push(term);
        }
      });
      justNumbersRow = addPerformanceData(justNumbersRow, performanceData);
    }
    totalsRow = addPerformanceData(totalsRow, performanceData);
  });
  loadQueryData(alphaNumericRow, justNumbersRow, totalsRow);
};

//object2 has to have all object1 keys
const addPerformanceData = function (object1, object2) {
  Object.keys(object1.performanceData).forEach((key) => {
    object1.performanceData[key] += object2[key];
  });
  return object1;
};

const loadQueryData = (alphaNumericRow, justNumbersRow, totalsRow) => {
  const alphaRow = document.getElementById("alphaRow");
  const numRow = document.getElementById("numRow");
  const nonNumRow = document.getElementById("nonNumRow");
  const numTotalRow = document.getElementById("totalRow");
  const dataCellEndPosition = 10;
  const alphaNumRowValues = Object.values(alphaNumericRow.performanceData);
  const justNumRowValues = Object.values(justNumbersRow.performanceData);
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
      calculateQuotients(table);
    });
  }
};

const calculateQuotients = function (table) {
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
      array = alphaNumericResults;
      break;
    case "numeric":
      array = justNumbersResults;
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

document.getElementById("submitFile").addEventListener("click", extractQueryData);
document
  .getElementById("alphaNumericDownload")
  .addEventListener("click", download);
document.getElementById("alphaNumericDownload").downloadParam = "alphaNumeric";
document.getElementById("numericDownload").addEventListener("click", download);
document.getElementById("numericDownload").downloadParam = "numeric";
