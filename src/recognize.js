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
		let scores = img.extractScores()
		for (let p = 0; p < players.length; p++)
		{
			//if (p != 0) continue
			
			let result = { }
			let player = players[p]
			let score = scores[p]
			for (let _ of player.recognizePlayerIterable(result)) { }
			for (let _ of score.recognizeScoreIterable(result)) { }
			
			let tr = document.createElement("tr")
			
			let td1 = document.createElement("td")
			td1.appendChild(player.makeCanvas())
			tr.appendChild(td1)
			
			let td2 = document.createElement("td")
			td2.appendChild(scores[p].makeCanvas())
			tr.appendChild(td2)
			
			let td3 = document.createElement("td")
			let span1 = document.createElement("span")
			span1.innerHTML = result.name
			td3.appendChild(span1)
			tr.appendChild(td3)
			
			let td4 = document.createElement("td")
			let span2 = document.createElement("span")
			span2.innerHTML = result.score.toString()
			td4.appendChild(span2)
			tr.appendChild(td4)
			
			table.appendChild(tr)
			
			//break
		}
		
		div.appendChild(table)
	})
}