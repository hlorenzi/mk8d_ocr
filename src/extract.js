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
	let joinGlyphs = document.getElementById("checkboxSpaces").checked
	
	let isMKWorld = document.getElementById("radioMKWorld").checked
	let isMK8DX = document.getElementById("radioMK8DX").checked

	ImageHelper.fromSrc(inputGetImageSrc(input), (img) =>
	{
		img = img.stretchTo(1920, 1080)
		
		while (div.firstChild)
			div.removeChild(div.firstChild)
		
		let table = document.createElement("table")
		
		/*if (extractFlags)
		{
			let flags = img.extractFlags()
			for (let flag of flags)
				addToTable(table, flag)
		}
		else*/
		if (extractScores)
		{
			let scores = img.extractScores()
			for (let score of scores)
			{
				let glyphs = score.extractScoreGlyphs()
				for (const glyph of glyphs)
					for (const subglyph of glyph)
						addToTable(table, subglyph)
			}
		}
		else
		{
			let players = img.extractPlayers()
			for (let player of players)
			{
				let glyphs = player.extractPlayerGlyphs(joinGlyphs)
				for (const glyph of glyphs)
					for (const subglyph of glyph)
						addToTable(table, subglyph)
			}
		}
		
		div.appendChild(table)
	})
}


function addToTable(table, img)
{
	if (img === null)
		return

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


function listNameGlyphs()
{
	let str = ""
	let prev = ""
	for (let glyph of nameGlyphs)
	{
		if (glyph.c != prev && glyph.c.length == 1)
		{
			str += glyph.c
			prev = glyph.c
		}
	}
	
	console.log(str)
}


function buildData()
{
	let extractNames = document.getElementById("radioNames").checked
	let extractScores = document.getElementById("radioScores").checked
	let extractFlags = document.getElementById("radioFlags").checked
	
	let array = (extractFlags ? flagData : (extractScores ? scoreGlyphs : nameGlyphs))
	let arrayName = (extractFlags ? "flagData" : (extractScores ? "scoreGlyphs" : "nameGlyphs"))
	
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
		
		str += "\t{ "
		if (entry.skip) str += "skip: true, "
		str += "c: " + JSON.stringify(entry.c) + ", "
		str += "data: " + (extractFlags ? entry.data.toJson() : entry.data.toJsonBinarized()) + " }"
	}
	
	str += "\n]"
	console.log(str)
}