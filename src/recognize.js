let recognizedNames = []
let recognizedScores = []
let finishedNum = 0


function setImage(input)
{
	let div = document.getElementById("divTable")
	
	ImageHelper.fromSrc(inputGetImageSrc(input), (img) => recognizeResults(div, img))
}


function recognizeResults(div, img)
{
	recognizedNames = []
	recognizedScores = []
	finishedNum = 0
	
	while (div.firstChild)
		div.removeChild(div.firstChild)
	
	let table = document.createElement("table")
	div.appendChild(table)
	
	img = img.stretchTo(1280, 720)
	
	let players = img.extractPlayers(false)
	let scores = img.extractScores(false)
	let flags = img.extractFlags(false)
	for (let p = 0; p < players.length; p++)
	{
		let tr = document.createElement("tr")
		
		let nameCanvas = players[p].makeCanvas()
		let td1 = document.createElement("td")
		td1.appendChild(nameCanvas)
		tr.appendChild(td1)
		
		let td2 = document.createElement("td")
		td2.appendChild(flags[p].makeCanvas())
		tr.appendChild(td2)
		
		let scoreCanvas = scores[p].makeCanvas()
		let td3 = document.createElement("td")
		td3.appendChild(scoreCanvas)
		tr.appendChild(td3)
		
		let td4 = document.createElement("td")
		let span1 = document.createElement("span")
		td4.appendChild(span1)
		tr.appendChild(td4)
		
		let td5 = document.createElement("td")
		let span2 = document.createElement("span")
		td5.appendChild(span2)
		tr.appendChild(td5)
		
		let td6 = document.createElement("td")
		let span3 = document.createElement("span")
		td6.appendChild(span3)
		tr.appendChild(td6)
		
		table.appendChild(tr)
		
		let worker = new Worker("src/worker_name.js")
		worker.onmessage = (ev) =>
		{
			finishedNum += 1
			
			switch (ev.data.kind)
			{
				case "name":  span1.innerHTML = ev.data.name; recognizedNames[ev.data.userdata.index] = ev.data.name; break
				case "score": span3.innerHTML = ev.data.score.toString(); recognizedScores[ev.data.userdata.index] = ev.data.score; break
				case "flag":  span2.innerHTML = ev.data.flag; break
			}
			
			if (finishedNum == 12 * 3)
				printSample()
		}
		
		nameCanvas.onclick = () =>
		{
			console.log("\"" + recognizedNames[p] + "\"")
			let worker = new Worker("src/worker_name.js")
			worker.postMessage({ kind: "name", img: players[p], debug: true, nameGlyphs: nameGlyphs })
		}
		
		scoreCanvas.onclick = () =>
		{
			console.log("\"" + recognizedScores[p] + "\"")
			let worker = new Worker("src/worker_name.js")
			worker.postMessage({ kind: "score", img: scores[p], debug: true, scoreGlyphs: scoreGlyphs })
		}
		
		worker.postMessage({ kind: "name",  img: players[p], nameGlyphs: nameGlyphs,   userdata: { index: p } })
		worker.postMessage({ kind: "score", img: scores[p],  scoreGlyphs: scoreGlyphs, userdata: { index: p } })
		worker.postMessage({ kind: "flag",  img: flags[p],   flagData: flagData,       userdata: { index: p } })
	}
}


function printSample()
{
	let str = "{ src: \"samples/sample ().jpg\",\n"
	str += "\tnames: " + JSON.stringify(recognizedNames) + ", \n"
	str += "\tscores: " + JSON.stringify(recognizedScores) + " },"
	
	console.log(str)
}