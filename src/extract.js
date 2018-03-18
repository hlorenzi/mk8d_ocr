let charImages = []
let charInputs = []


function setImage(input)
{
	let div = document.getElementById("divTable")
	charImages = []
	charInputs = []
	
	let withSpaces = document.getElementById("checkboxSpaces").checked
	
	ImageData.fromSrc(inputGetImageSrc(input), (img) =>
	{
		img = img.stretchTo(1280, 720)
		
		while (div.firstChild)
			div.removeChild(div.firstChild)
		
		let table = document.createElement("table")
		
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
					
					let tr = document.createElement("tr")
					
					let td1 = document.createElement("td")
					td1.appendChild(charImage.makeCanvas())
					tr.appendChild(td1)
					
					let td2 = document.createElement("td")
					let charInput = document.createElement("input")
					td2.appendChild(charInput)
					tr.appendChild(td2)
					
					table.appendChild(tr)
					
					charImages.push(charImage)
					charInputs.push(charInput)
				}
				
				xPrev = xBegin
				x = xEnd
			}
		}
		
		div.appendChild(table)
	})
}


function buildData()
{
	for (let i = 0; i < charImages.length; i++)
	{
		if (charInputs[i].value == "")
			continue
		
		let entry = { }
		entry.c = charInputs[i].value
		entry.data = charImages[i]
		
		characters.push(entry)
	}
	
	characters.sort((a, b) => a.c.charCodeAt(0) - b.c.charCodeAt(0))
	
	let str = "let characters =\n[\n"
	for (let i = 0; i < characters.length; i++)
	{
		if (i > 0)
			str += ",\n"
		
		let entry = characters[i]
		
		str += "\t{ c: " + JSON.stringify(entry.c) + ", "
		str += "data: " + entry.data.toJsonBinarized() + " }"
	}
	
	str += "\n]"
	console.log(str)
}