let localData = JSON.parse(localStorage.getItem("scClientTables"));
let tableCount = 1;

//import for client sheet?
const fileParse = function () {
  let input = document.getElementById("openFile").files[0];
  Papa.parse(input, {
    complete: function (results, file) {
      console.log("Parsing complete", results, file);
      data = results["data"];
    },
  });
};

//example datastructure
let sampleTable = {
  name: "Google Shopping Clients",
  columns: [
    "Client Name",
    "Bid Changes",
    "Keyword Analysis",
    "Audiences",
    "Demographics",
    "Locations",
    "Dayparting",
    "Devices",
  ],
  rows: [["Client Name"]],
};

//builds JSON for localstorage
const buildLocalDataObj = function () {
  let dataArr = [];
  document.querySelectorAll(".tableContainer").forEach((tableContainer) => {
    let defaultObject = {
      name: "",
      columns: [],
      rows: [],
    };

    //Adds name to obj
    defaultObject.name = tableContainer.querySelector("h2 span").innerText;

    //Adds columns to obj
    for (let i = 0; i < tableContainer.querySelectorAll("th").length - 2; i++) {
      const e = tableContainer.querySelectorAll("th")[i];
      defaultObject.columns.push(e.querySelector("span").innerText);
    }

    //Adds Rows and Cells to obj
    let tableRows = tableContainer
      .querySelector("tbody")
      .querySelectorAll("tr");
    for (let i = 0; i < tableRows.length; i++) {
      const e = tableRows[i];
      let row = [];
      for (let i2 = 0; i2 < e.querySelectorAll("span").length; i2++) {
        const f = e.querySelectorAll("span")[i2];
        row.push(f.innerText);
      }
      defaultObject.rows.push(row);
    }
    dataArr.push(defaultObject);
  });
  localStorage.setItem("scClientTables", JSON.stringify(dataArr));
};

//Table Builder
const buildTable = function (table) {
  $("#tableWrapper").append(
    $(`<div class='t${tableCount}Container tableContainer'>`)
  );

  const container = $(`.t${tableCount}Container`);

  container.append(
    $(
      `<h2><span class='editable'>${table.name}</span><img src='../assets/editPencil.png' class='editPencil'></h2>`
    )
  );
  container.append(
    `<div id="t${tableCount}buttonWrapper" class="buttonWrapper">`
  );

  //adds submit changes button above table
  const scButton = $(
    `<input type="submit" class="submitChanges" id='t${tableCount}Submit' value="Submit Changes">`
  );
  scButton.data("tableID", `${tableCount}`).click(function () {
    const dateObj = new Date();
    let month = dateObj.getUTCMonth() + 1; //months from 1-12
    let day = dateObj.getUTCDate();
    let year = dateObj.getUTCFullYear();
    let m = day.toString();
    if (month.toString().length === 1) {
      month = "0" + month;
    }

    if (day.toString().length === 1) {
      day = "0" + day;
    }

    let newdate = year + "/" + month + "/" + day;

    const tableID = $(this).data("tableID");
    $(`.t${tableID}Checkbox:checkbox:checked`)
      .siblings(".editable")
      .text(newdate);
    $(`#t${tableID}`).find(`input[type='checkbox']`).prop("checked", false);

    buildLocalDataObj();
  });

  $(`#t${tableCount}buttonWrapper`).append(scButton);

  //addrows button + unhide client input on click
  const addRows = $(
    `<input type="submit" class="addRows" id='t${tableCount}AddRows' value="Add Clients">`
  );
  addRows.data("tableID", `${tableCount}`);
  addRows.click(function () {
    $(this)
      .parents(".buttonWrapper")
      .siblings(".addClientsWrapper")
      .css("display", "block");
  });

  $(`#t${tableCount}buttonWrapper`).append(addRows);
  $(`#t${tableCount}buttonWrapper`).append(
    $(
      `<input type="submit" class="addColumn" id='t${tableCount}AddColumn' value="Add Column">`
    )
  );
  $(`#t${tableCount}Submit`).data("table", tableCount);

  //builds popup textarea for add clients button
  const addClientsWrapper = $(`<div class='addClientsWrapper'>`);
  addClientsWrapper.data("tableID", `${tableCount}`);
  addClientsWrapper.append(
    '<textarea class="addClientsTextArea"></textarea><div></div>'
  );

  const addClientsSubmit = $('<input type="submit"></input>');
  addClientsSubmit.click(function () {
    let lines = $(this).siblings("textarea").val().split(/\n/);
    let arrayedLines = [];
    lines.forEach((line) => {
      const arrLine = new Array(line);
      arrayedLines.push(arrLine);
    });
    arrayedLines.forEach((line) => {
      addRow(line, addClientsWrapper.data("tableID"), false);
    });
    $(this).parents(".addClientsWrapper").css("display", "none");
  });

  addClientsWrapper.append(addClientsSubmit);

  container.append(addClientsWrapper);

  //builds table structure
  container.append($(`<table class="clientTable" id="t${tableCount}">`));
  $(`#t${tableCount}`).append(`<thead id='t${tableCount}Header'>`);

  $(`#t${tableCount}Header`).append(
    $(`<tr class="t${tableCount}HeaderRow headerRow">`)
  );

  //builds header row
  let clmcount = 0;
  table.columns.forEach((e) => {
    if (clmcount != 0) {
      $(`.t${tableCount}HeaderRow`).append(
        $(
          `<th class="column"><span class='editable'>${e}</span><img src='../assets/editPencil.png' class='editPencil'><img src="../assets/redX.png" class="redX delColumn"></th>`
        )
      );
    } else {
      $(`.t${tableCount}HeaderRow`).append(
        $(
          `<th class="column"><span class='editable'>${e}</span><img src='../assets/editPencil.png' class='editPencil'></th>`
        )
      );
    }
    clmcount += 1;
  });

  //Adds select all and delete columns to header
  $(`.t${tableCount}HeaderRow`).append($('<th class="column">Select All</th>'));
  $(`.t${tableCount}HeaderRow`).append(
    $(
      '<th class="delRowHeader"><img src="../assets/redX.png" class="redX delTable"></th>'
    )
  );
  $(`#t${tableCount}`).append($(`<tbody id="t${tableCount}Body">`));

  //builds body rows
  table.rows.forEach((row) => {
    addRow(row, tableCount);
  });

  container.append(
    $(`<input type="submit" class="addTable" value="Add Table">`)
  );

  tableCount += 1;
  buildLocalDataObj();
};
//end Build Table

const addRow = function (rowData, tableID, notify = false) {
  const columnCount = $(`#t${tableID}Header tr th`).length;
  $(`#t${tableID}Body`).append($(`<tr class='t${tableID}row'>`));
  while (rowData.length < columnCount - 2) {
    rowData.push("--");
  }

  for (let i = 0; i < columnCount; i++) {
    const item = rowData[i];
    if (i === columnCount - 2) {
      $(`.t${tableID}row:last`).append(`<td class='t${tableID}cell'>`);
      $(`.t${tableID}cell:last`).append(
        `<input type='checkbox' class='t${tableID}SelectAll selectAll'>`
      );
    } else if (i === columnCount - 1) {
      $(`.t${tableID}row:last`).append(
        `<td class='t${tableID}cell delRow'><img src='../assets/redX.png' class='redX'></td>`
      );
    } else if (i != 0) {
      $(`.t${tableID}row:last`).append(
        `<td class='t${tableID}cell'><span class='editable'>${item}</span><img src='../assets/editPencil.png' class='editPencil'></td>`
      );
      $(`.t${tableID}cell:last`).append(
        `<input type='checkbox' class='t${tableID}Checkbox'>`
      );
    } else {
      $(`.t${tableID}row:last`).append(
        `<td class='t${tableID}cell'><span class='editable'>${item}</span><img src='../assets/editPencil.png' class='editPencil'></td>`
      );
    }
  }

  if (notify) {
    $(".alert").css("display", "block");
  }
  buildLocalDataObj();
};

//--->make cells and column text editable > start
let previousString = "";
$(document).on("click", ".editPencil", function (event) {
  //make editable
  previousString = $(this).siblings("span").text();
  $(this).siblings("span").attr("contenteditable", "true");
  $(this).siblings("span").focus();
  $(this).siblings("span").addClass("editing");
});
//--->save text edits
$(document).on("focusout", ".editable", function (e) {
  $(this).attr("contenteditable", "false");
  $(this).removeClass("editing");
  buildLocalDataObj();
});
$(document).on("keydown", ".editable", function (e) {
  if (e.keyCode == 13) {
    $(this).attr("contenteditable", "false");
    $(this).removeClass("editing");
    buildLocalDataObj();
  }
});
//

//Row sorting functions
$(document).on("click", "th", function () {
  const table = $(this).parents("table").eq(0);
  let rows = table
    .find("tr:gt(0)")
    .toArray()
    .sort(comparer($(this).index()));
  this.asc = !this.asc;
  if (!this.asc) {
    rows = rows.reverse();
  }
  for (let i = 0; i < rows.length; i++) {
    table.append(rows[i]);
  }
});
function comparer(index) {
  return function (a, b) {
    const valA = getCellValue(a, index),
      valB = getCellValue(b, index);
    return $.isNumeric(valA) && $.isNumeric(valB)
      ? valA - valB
      : valA.toString().localeCompare(valB);
  };
}
function getCellValue(row, index) {
  return $(row).children("td").eq(index).text();
}
//

//selects all items in row
$(document).on("change", ".selectAll", function (event) {
  if (!$(this).prop("checked")) {
    console.log("m");
    $(this).parents("tr").find('input[type="checkbox"]').prop("checked", false);
  } else {
    console.log("e");
    $(this).parents("tr").find('input[type="checkbox"]').prop("checked", true);
  }
});

//Create new table button
$(document).on("click", ".addTable", function () {
  buildTable(sampleTable);
});

//Delete Column
$(document).on("click", ".delColumn", function () {
  if (
    confirm(
      "Are you sure you want to delete this column? This action cannot be undone."
    )
  ) {
    const columnIndex = $(this).parents("th").index();
    const parentTable = $(this).parents("table");
    const rows = parentTable.find("tr");
    rows.children(`:nth-child(${columnIndex + 1})`).remove();
    buildLocalDataObj();
  }
});

//Delete Row
$(document).on("click", ".delRow", function () {
  if (
    confirm(
      "Are you sure you want to delete this row? This action cannot be undone."
    )
  ) {
    $(this).closest("tr").remove();
    buildLocalDataObj();
  }
});

//Delete Table
$(document).on("click", ".delTable", function () {
  if (
    confirm(
      "Are you sure you want to delete this table? This action cannot be undone."
    )
  ) {
    if (
      confirm(
        "Are you absolutely sure you want to permanently delete this table?"
      )
    ) {
      $(this).closest(".tableContainer").remove();
      buildLocalDataObj();
    }
  }
});

//Add Column
$(document).on("click", ".addColumn", function () {
  const table = $(this).parents(".buttonWrapper").siblings("table");
  const tableID = $(this).siblings(".submitChanges").data("tableID");
  const headerCell =
    `<th class="column">` +
    `<span class='editable'>New Column</span>` +
    `<img src='../assets/editPencil.png' class='editPencil'>` +
    `<img src="../assets/redX.png" class="redX delColumn">` +
    `</th>`;

  const bodyCell =
    `<td>` +
    `<span class='editable'>--</span>` +
    `<img src='../assets/editPencil.png' class='editPencil'>` +
    `<input type='checkbox' class='t${tableID}Checkbox'>` +
    `</td>`;

  $(headerCell).insertBefore(table.find("thead tr th:nth-last-child(2)"));

  table
    .find("tbody")
    .find("tr")
    .each(function () {
      $(bodyCell).insertBefore($(this).find("td:nth-last-child(2)"));
    });
  buildLocalDataObj();
});
//

//Generates table on first site visit
if (!localData) {
  buildTable(sampleTable);
} else {
  localData.forEach((e) => {
    buildTable(e);
  });
}
