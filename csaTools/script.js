let data
const alphaNumRegex = /\b([a-zA-Z]+\d+|\d+[a-zA-Z]+)\b/g;
const justNumRegex = /\b\d+\b/g;
let alphaNumTotal = [];
let justNumTotal = [];
let total = [];
let alphaNumArray = [];
let numArray = [];

const fileParse = function() {
	let input = document.getElementById('openFile').files[0];
	Papa.parse(input, {
		complete: function(results, file) {
			console.log("Parsing complete", results, file);
			data = results["data"];
			cleanData(data);
			numParse(data);
			document.getElementById('tableWrapper').style.display = 'block'
		}
	});
};

const cleanData = function(json) {
	for (let i = 0; i < json.length; i++) {
		for (let x = 0; x < json[i].length; x++) {
			json[i][x] = json[i][x].replace(',', '')
		}
	}
};

const numParse = function(parsedData) {
	alphaNumTotal = [0,0,0,0,0];
	justNumTotal = [0,0,0,0,0];
	total = [0,0,0,0,0];
	alphaNumArray = []
	numArray = []

	for (let i = 1; i < parsedData.length; i++) {
		const e = parsedData[i][0];
		if (alphaNumRegex.test(e)) {
			let matchTerm = e.match(alphaNumRegex)
			matchTerm.forEach(term => {
				if (alphaNumArray.indexOf(term) == -1) {
					alphaNumArray.push(term)
				};
			});
			
			let numMatchTerm = e.match(justNumRegex)
			if (numMatchTerm) {	
				numMatchTerm.forEach(term => {
					if (numArray.indexOf(term) == -1) {
						numArray.push(term)
					};
				});
			};
			for (let y = 1; y < parsedData[i].length; y++) {
				const f = parsedData[i][y];
				alphaNumTotal[y-1]+=parseFloat(f);
			};
		} else if (justNumRegex.test(e)) {
			let numMatchTerm = e.match(justNumRegex)
			numMatchTerm.forEach(term => {
				if (numArray.indexOf(term) == -1) {
					numArray.push(term)
				};
			});
			for (let y = 1; y < parsedData[i].length; y++) {
				const f = parsedData[i][y];
				justNumTotal[y-1]+=parseFloat(f);
			};
		};
		for (let y = 1; y < parsedData[i].length; y++) {
			const f = parsedData[i][y];
			total[y-1]+=parseFloat(f);
		};
	};
	console.log(alphaNumTotal);
	console.log(justNumTotal);
	console.log(total);
	console.log(alphaNumArray)
	addTable();
};

const topTermsAnalysis = function() {
	
}

const addTable = function() {
	const table = document.getElementById('numberTable').rows
	for (let i = 0; i < 10; i++) {
		let t1 = table[1].cells[i+1]
		let t2 = table[2].cells[i+1]
		let t3 = table[3].cells[i+1]
		if (i==2||i==4) {
			t1.innerText = alphaNumTotal[i].toFixed(2);
			t2.innerText = justNumTotal[i].toFixed(2);
			t3.innerText = total[i].toFixed(2);
		} else if (i<5) {
			t1.innerText = alphaNumTotal[i];
			t2.innerText = justNumTotal[i];
			t3.innerText = total[i];
		} else if (i==5){
			t1.innerText = (alphaNumTotal[4]/alphaNumTotal[2]).toFixed(2);
			t2.innerText = (justNumTotal[4]/justNumTotal[2]).toFixed(2);
			t3.innerText = (total[4]/total[2]).toFixed(2);
		} else if (i==6){
			t1.innerText = (alphaNumTotal[2]/alphaNumTotal[1]).toFixed(2);
			t2.innerText = (justNumTotal[2]/justNumTotal[1]).toFixed(2);
			t3.innerText = (total[2]/total[1]).toFixed(2);
		} else if (i == 7){
			t1.innerText = (alphaNumTotal[4]/alphaNumTotal[3]).toFixed(2);
			t2.innerText = (justNumTotal[4]/justNumTotal[3]).toFixed(2);
			t3.innerText = (total[4]/total[3]).toFixed(2);
		} else if (i == 8){
			t1.innerText = ((alphaNumTotal[1]/alphaNumTotal[0])*100).toFixed(2) + '%';
			t2.innerText = ((justNumTotal[1]/justNumTotal[0])*100).toFixed(2) + '%';
			t3.innerText = ((total[1]/total[0])*100).toFixed(2) + '%';
		} else {
			t1.innerText = ((alphaNumTotal[3]/alphaNumTotal[1])*100).toFixed(2) + '%';
			t2.innerText = ((justNumTotal[3]/justNumTotal[1])*100).toFixed(2) + '%';
			t3.innerText = ((total[3]/total[1])*100).toFixed(2) + '%';
		}
	};
};


//possibly done debugging the above
const download = function(e) {
	let array
	switch(e.currentTarget.downloadParam) {
		case 'alphaNumeric':
		  array = alphaNumArray
		  break;
		case 'numeric':
		  array = numArray
		  break;
		default:
	  }
	console.log(array)
	let csvContent = "data:text/csv;charset=utf-8," + array.join('\n')
	const encodedUri = encodeURI(csvContent);
	const link = document.createElement("a");
	link.setAttribute("href", encodedUri);
	link.setAttribute("download", `${e.currentTarget.downloadParam}.csv`);
	document.body.appendChild(link); // Required for FF

	link.click();
};

document.getElementById('submitFile').addEventListener('click', fileParse);
document.getElementById('alphaNumericDownload').addEventListener('click', download);
document.getElementById('alphaNumericDownload').downloadParam = 'alphaNumeric'
document.getElementById('numericDownload').addEventListener('click', download);
document.getElementById('numericDownload').downloadParam = 'numeric'