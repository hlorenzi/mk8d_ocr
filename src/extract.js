let charImages = []
let charInputs = []


function setImage(input)
{
	let div = document.getElementById("divTable")
	charImages = []
	charInputs = []
	
	let extractNames = document.getElementById("radioNames").checked
	let extractScores = document.getElementById("radioScores").checked
	let extractFlags = document.getElementById("radioFlags").checked
	let withSpaces = document.getElementById("checkboxSpaces").checked
	
	ImageData.fromSrc(inputGetImageSrc(input), (img) =>
	{
		img = img.stretchTo(1280, 720)
		
		while (div.firstChild)
			div.removeChild(div.firstChild)
		
		let table = document.createElement("table")
		
		if (extractFlags)
		{
			let flags = img.extractFlags()
			for (let flag of flags)
				addToTable(table, flag)
		}
		else if (extractScores)
		{
			let scores = img.extractScores()
			for (let score of scores)
			{
				for (let x = score.imageData.width - 18; x > 0; x -= 18)
				{
					let charImage = score.extractRegion(x, 0, 18, score.imageData.height)
					addToTable(table, charImage)
				}
			}
		}
		else
		{
			let players = img.extractPlayers()
			for (let player of players)
			{
				let xPrev = null
				let x = 0
				while (true)
				{
					let xBegin = player.findNextBinaryColumn(x, true)
					if (xBegin == null)
						break
					
					let xEnd = player.findNextBinaryColumn(xBegin, false)
					if (xEnd == null)
						break
					
					if (xEnd == xBegin)
						break
					
					if (!withSpaces)
						xPrev = xBegin
					
					if (xPrev != null)
					{
						let charImage = player.extractRegion(xPrev, 0, xEnd - xPrev, player.imageData.height)
						addToTable(table, charImage)
					}
					
					xPrev = xBegin
					x = xEnd
				}
			}
		}
		
		div.appendChild(table)
	})
}


function addToTable(table, img)
{
	let tr = document.createElement("tr")
	
	let td1 = document.createElement("td")
	td1.appendChild(img.makeCanvas())
	tr.appendChild(td1)
	
	let td2 = document.createElement("td")
	let charInput = document.createElement("input")
	td2.appendChild(charInput)
	tr.appendChild(td2)
	
	table.appendChild(tr)
	
	charImages.push(img)
	charInputs.push(charInput)
}


function buildData()
{
	let extractNames = document.getElementById("radioNames").checked
	let extractScores = document.getElementById("radioScores").checked
	let extractFlags = document.getElementById("radioFlags").checked
	
	let array = (extractFlags ? flags : (extractScores ? scoreGlyphs : nameGlyphs))
	let arrayName = (extractFlags ? "flags" : (extractScores ? "scoreGlyphs" : "nameGlyphs"))
	
	for (let i = 0; i < charImages.length; i++)
	{
		if (charInputs[i].value == "")
			continue
		
		let entry = { }
		entry.c = charInputs[i].value
		entry.data = charImages[i]
		
		array.push(entry)
	}
	
	array.sort((a, b) => a.c.charCodeAt(0) - b.c.charCodeAt(0))
	
	let str = "let " + arrayName + " =\n[\n"
	for (let i = 0; i < array.length; i++)
	{
		if (i > 0)
			str += ",\n"
		
		let entry = array[i]
		
		str += "\t{ c: " + JSON.stringify(entry.c) + ", "
		str += "data: " + (extractFlags ? entry.data.toJson() : entry.data.toJsonBinarized()) + " }"
	}
	
	str += "\n]"
	console.log(str)
}