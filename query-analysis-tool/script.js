const alphanumericTerms = new Set();
const justNumbersTerms = new Set();


const runQueryAnalysisFromFile = () => {
  const file = document.getElementById("openFile").files[0];
  const extractedQueryData = extractQueryData(file);
  //todo: figure out whether data is using header and validate headers
  const transformedQueryData = transformQueryData(extractedQueryData);
  loadQueryData(transformedQueryData);
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
  //This currently is undefined
  return extractedData
};

const cleanQueryData = (rawQueryData) => {
  // // this needs to be moved to after data is cleaned i think
  // const expectedHeaders = ["Impressions", "Clicks", "Cost", "Conversions", "Revenue"]
  // if (rawQueryData[0] !== expectedHeaders) {
  //   throw new Error(`Incorrect headers used in file: ${rawQueryData[0]}`)
  // }
  return rawQueryData.map((row) => {
    return row.map((str) => {
      return str.replace(",", "");
    });
  });
};

const createPerformanceData = () => ({
    impressions: 0,
    clicks: 0,
    cost: 0.0,
    conversions: 0.0,
    revenue: 0.0,
  });

/**
 * @param {[string[]]} extractedQueryData 
 * @param {Boolean} header 
 */
const transformQueryData = (extractedQueryData, header = true) => {
  header ? extractedQueryData.shift() : null;

  let alphanumericQueryPerformance = createPerformanceData()
  let justNumbersQueryPerformance = createPerformanceData()
  let totalQueryPerformance = createPerformanceData()
  
  extractedQueryData.forEach((row) => {
    const [query, impressions, clicks, cost, conversions, revenue] = row;
    const queryPerformanceData = {
      impressions: parseFloat(impressions),
      clicks: parseFloat(clicks),
      cost: parseFloat(cost),
      conversions: parseFloat(conversions),
      revenue: parseFloat(revenue),
    };
    
    //example matches - "34thg2", "xrp2002"
    const alphanumericRegEx = /\b([a-zA-Z]+\d+|\d+[a-zA-Z]+)\b/g;
    const alphanumericMatches = query.match(alphanumericRegEx);
    if (alphanumericMatches.length) {
      alphanumericMatches.forEach(match => alphanumericTerms.add(match));
    }
    alphanumericQueryPerformance = sumObjectValues(alphanumericQueryPerformance, queryPerformanceData);
  
    //example matches - "303", "436276"
    const justNumbersRegex = /\b\d+\b/g;
    const justNumbersMatches = query.match(justNumbersRegex);
    if (justNumbersMatches.length) {
        justNumbersMatches.forEach(match => justNumbersTerms.add(match));
    }
    if (alphanumericMatches.length === 0 && justNumbersMatches.length) {
      //alphanumeric gets priority for taking the credit here since those terms typically see higher conversion likelihood
      // TODO: put more thought into whether we actually want to give credit regardless
      // Right now the calculation for non numbered queries depends on credit being given to one or the other
      justNumbersQueryPerformance = sumObjectValues(justNumbersQueryPerformance, queryPerformanceData);
    }  
    totalQueryPerformance = sumObjectValues(totalQueryPerformance, queryPerformanceData);
  });

  const numberlessQueryPerformance = subtractObjectValues(
    totalQueryPerformance, 
    alphanumericQueryPerformance, 
    justNumbersQueryPerformance
    )
  
  return {
    alphanumericRow: alphanumericQueryPerformance, 
    justNumbersRow: justNumbersQueryPerformance, 
    numberlessRow: numberlessQueryPerformance, 
    totalRow: totalQueryPerformance
  }
};

//object2 has to have all object1 keys
const sumObjectValues = (object1, object2) => {
  Object.keys(object1.performanceData).forEach((key) => {
    object1[key] += object2[key];
  });
  return object1;
};

//object2 has to have all object1 keys
const subtractObjectValues = (object1, object2, object3) => {
  Object.keys(object1.performanceData).forEach((key) => {
    object1[key] -= object2[key]
    object1[key] -= object3[key]
  });
  return object1;
};

const loadQueryData = (transformedQueryData) => {
  const {alphanumericRow, justNumbersRow, numberlessRow, totalRow} = transformedQueryData

  const alphaRow = document.getElementById("alphanumericRow");
  //i don't know if this works as intended as it might not return the values in the correct order
  const alphaNumRowValues = Object.values(alphanumericRow);
  loadDataIntoRow(alphaRow, alphaNumRowValues)

  const numRow = document.getElementById("justNumbersRow");
  const justNumRowValues = Object.values(justNumbersRow);
  loadDataIntoRow(numRow, justNumRowValues)

  const nonNumRow = document.getElementById("numberlessRow");
  const numberlessRowValues = Object.values(numberlessRow);
  loadDataIntoRow(nonNumRow, numberlessRowValues)

  const numTotalRow = document.getElementById("totalRow");
  const totalRowValues = Object.values(totalRow);
  loadDataIntoRow(numTotalRow, totalRowValues)
  
  document.querySelectorAll("table").forEach((table) => {
    //move this into transform
    addQuotients(table);
  });
};
/**
 * 
 * @param {HTMLTableRowElement} row 
 * @param {number[]} data 
 */
const loadDataIntoRow = (row, data) => {
  const dataCellEndPosition = 10;
  for (let cell=1; cell <= dataCellEndPosition; cell++) {
    row.cells[cell].innerText = data[cell]
  }
}

const addQuotients = (performanceData) => {
  const {impressions, clicks, cost, conversions, revenue} = performanceData
  performanceData.roas = (revenue/cost).toFixed(2);
  performanceData.avgCpc = (cost/clicks).toFixed(2);
  performanceData.aov = (revenue/conversions).toFixed(2);
  performanceData.ctr = (clicks/impressions).toFixed(2);
  performanceData.cvr = (conversions/clicks).toFixed(2);
  return performanceData
};

const downloadMatchingQueries = function (e) {
  let array;
  switch (e.currentTarget.downloadParam) {
    case "alphaNumeric":
      array = alphanumericTerms;
      break;
    case "numeric":
      array = justNumbersTerms;
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
document.getElementById("alphaNumericDownload").addEventListener("click", downloadMatchingQueries);
document.getElementById("alphaNumericDownload").downloadParam = "alphaNumeric";
document.getElementById("numericDownload").addEventListener("click", downloadMatchingQueries);
document.getElementById("numericDownload").downloadParam = "numeric";
