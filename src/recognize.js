function setImage(input)
{
	let div = document.getElementById("divTable")
	
	ImageData.fromSrc(inputGetImageSrc(input), (img) =>
	{
		while (div.firstChild)
			div.removeChild(div.firstChild)
		
		let table = document.createElement("table")
		
		img = img.stretchTo(1280, 720)
		
		let players = img.extractPlayers()
		for (let p = 0; p < players.length; p++)
		{
			//if (p != 0) continue
			
			let player = players[p]
			
			let str = ""
			let x = 0
			while (true)
			{
				//console.log("\n\n\n\n")
				let scores = []
				
				for (let skip = -1; skip <= 1; skip++)
				{
					let xBegin = player.findNextBinaryColumn(x + skip, true)
					if (xBegin == null)
						break
					
					for (let glyph of characters)
					{
						let score = player.scoreGlyph(glyph, xBegin + skip)
						if (score == null)
							continue
						
						if (skip < 0)
							score -= 0.03
						
						scores.push({ x: xBegin + skip, glyph: glyph, score: score })
					}
				}
				
				if (scores.length == 0)
					break
				
				scores.sort((a, b) => b.score - a.score)
				
				if (false)
				{
					for (let g = 0; g < 10; g++)
						player.scoreGlyph(scores[g].glyph, scores[g].x, true)
				}
				
				let chosen = scores[0]
				
				if (chosen.x - x > 6)
					str += " "
				
				str += chosen.glyph.c
				
				for (let y = 0; y < player.imageData.height; y++)
				{
					if (!player.getBinaryPixel(chosen.x, y))
						player.setPixel(chosen.x, y, 0, 0, 255)
				}
				
				x = chosen.x + chosen.glyph.data.imageData.width + 1
			}
			
			let tr = document.createElement("tr")
			
			let td1 = document.createElement("td")
			td1.appendChild(player.makeCanvas())
			tr.appendChild(td1)
			
			let td2 = document.createElement("td")
			let span = document.createElement("span")
			span.innerHTML = str
			td2.appendChild(span)
			tr.appendChild(td2)
				
			table.appendChild(tr)
			
			//break
		}
		
		div.appendChild(table)
	})
}