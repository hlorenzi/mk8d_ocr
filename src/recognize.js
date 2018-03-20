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
		let flags = img.extractFlags()
		for (let p = 0; p < players.length; p++)
		{
			//if (p != 0) continue
			
			let result = { name: "", flag: "", score: 0 }
			let player = players[p]
			let score = scores[p]
			let flag = flags[p]
			for (let _ of player.recognizePlayerIterable(result)) { }
			for (let _ of score.recognizeScoreIterable(result)) { }
			for (let _ of flag.recognizeFlagIterable(result)) { }
			
			let tr = document.createElement("tr")
			
			let td1 = document.createElement("td")
			td1.appendChild(player.makeCanvas())
			tr.appendChild(td1)
			
			let td2 = document.createElement("td")
			td2.appendChild(flags[p].makeCanvas())
			tr.appendChild(td2)
			
			let td3 = document.createElement("td")
			td3.appendChild(scores[p].makeCanvas())
			tr.appendChild(td3)
			
			let td4 = document.createElement("td")
			let span1 = document.createElement("span")
			span1.innerHTML = result.name
			td4.appendChild(span1)
			tr.appendChild(td4)
			
			let td5 = document.createElement("td")
			let span2 = document.createElement("span")
			span2.innerHTML = (result.flag == null ? "?" : result.flag)
			td5.appendChild(span2)
			tr.appendChild(td5)
			
			let td6 = document.createElement("td")
			let span3 = document.createElement("span")
			span3.innerHTML = result.score.toString()
			td6.appendChild(span3)
			tr.appendChild(td6)
			
			table.appendChild(tr)
			
			//break
		}
		
		div.appendChild(table)
	})
}