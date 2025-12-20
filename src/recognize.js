let recognizedNames = []
let recognizedScores = []
let finishedNum = 0
let debugElem = null


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
	
	let { players, scores } = img.extractRegionsOfInterest()
	//let flags = img.extractFlags(false)
	for (let p = 0; p < players.length; p++)
	{
		let tr = document.createElement("tr")

		let nameCanvas = players[p].makeCanvas(true)
		let td1 = document.createElement("td")
		td1.appendChild(nameCanvas)
		tr.appendChild(td1)

		//let td2 = document.createElement("td")
		//td2.appendChild(flags[p].makeCanvas())
		//tr.appendChild(td2)
		
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
				//case "flag":  span2.innerHTML = ev.data.flag; break
			}
			
			if (finishedNum == players.length + scores.length)
				printSample()
		}
		
		nameCanvas.onclick = () =>
		{
			printDebug(players[p])

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
	}
}


function printSample()
{
	let str = "{ src: \"samples/sample ().jpg\",\n"
	str += "\tnames: " + JSON.stringify(recognizedNames) + ", \n"
	str += "\tscores: " + JSON.stringify(recognizedScores) + " },"
	
	console.log(str)
}


function printDebug(player)
{
	if (debugElem !== null)
		document.body.removeChild(debugElem)

	debugElem = document.createElement("div")
	document.body.appendChild(debugElem)
	
	const chars = player.clone().extractPlayerGlyphs()
	for (let c = 0; c < chars.length; c++)
	{
		const char = chars[c]
		
		const scores = []
		for (let glyph of nameGlyphs)
		{
			glyph.data.createCache()

			for (let s = 0; s <= 0; s++)// char.length; s++)
			{
				const subchar = char[s]
				subchar.createCache()

				let score = subchar.scoreGlyph(glyph)
				if (score == null)
					continue

				let debug = subchar.scoreGlyph(glyph, true)

				scores.push({ score, glyph, debug })
			}
		}

		scores.sort((a, b) => b.score - a.score)
		console.log(scores)

		for (let scoredGlyph of scores.slice(0, 10))
		{
			const glyph = scoredGlyph.glyph
			glyph.data.createCache()

			/*let str = ""
			for (let y = 0; y < subchar.imageData.height; y++)
			{
				for (let x = 0; x < subchar.imageData.width; x++)
					str += subchar.imageData.data[(y * subchar.imageData.width + x) * 4].toString().padStart(3) + ":" + subchar.cacheDistanceToEdge[y][x].toString().padStart(3) + " "
				str += "\n"
			}
			console.log(str)*/
			
			let canvas1 = char[0].makeCanvas(true)
			canvas1.style.paddingRight = "2px"
			let canvas2 = glyph.data.makeCanvas(true)
			let div = document.createElement("div")
			let span = document.createElement("span")
			span.innerHTML = scoredGlyph.debug
			div.appendChild(canvas1)
			div.appendChild(canvas2)
			div.appendChild(span)
			debugElem.appendChild(div)
		}
			
		debugElem.appendChild(document.createElement("br"))
		debugElem.appendChild(document.createElement("br"))
	}
}