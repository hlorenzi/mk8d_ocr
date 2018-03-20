let workIterator = null


function setImage(input)
{
	let div = document.getElementById("divTable")
	
	ImageData.fromSrc(inputGetImageSrc(input), (img) =>
	{
		workIterator = extractFromImage(img)
		window.requestAnimationFrame(doWork)
	})
}


let progressStep = 0
function setProgress(fraction)
{
	let div = document.getElementById("divProgress")
	
	if (fraction == null)
		div.style.visibility = "hidden"
	else
	{
		div.style.visibility = "visible"
		div.innerHTML = (fraction * 100).toFixed(0) + "% Working" + ".".repeat(progressStep)
		
		progressStep = (progressStep + 1) % 5
	}
}


function doWork()
{
	let next = workIterator.next()
	if (typeof(next.value) == "number")
	{
		setProgress(next.value)
		window.requestAnimationFrame(doWork)
	}
	else
	{
		setProgress(null)
		workIterator = null
		
		let data = next.value.data
		for (let i = 0; i < data.length; i++)
		{
			document.getElementById("inputPlayer" + (i + 1) + "Name").value = data[i].name
			document.getElementById("inputPlayer" + (i + 1) + "Flag").value = data[i].flag
			document.getElementById("inputPlayer" + (i + 1) + "Score").value = data[i].score
		}
		
		for (let i = 0; i < 6; i++)
			document.getElementById("inputClan" + (i + 1) + "Name").value = ""
		
		for (let i = 0; i < 6; i++)
			document.getElementById("inputClan" + (i + 1) + "Bonus").value = ""
		
		let clans = extractClans(data)
		for (let i = 0; i < clans.length; i++)
			document.getElementById("inputClan" + (i + 1) + "Name").value = clans[i]
		
		for (let i = 0; i < data.length; i++)
		{
			let clanIndex = clans.findIndex(c => data[i].name.startsWith(c))
			if (clanIndex < 0)
				clanIndex = 5
			
			document.getElementById("radioPlayer" + (i + 1) + "Clan" + (clanIndex + 1)).checked = true
		}
		
		let img = next.value.img
		let canvas = document.getElementById("canvasInput")
		let ctx = canvas.getContext("2d")
		ctx.drawImage(img.makeCanvas(), 0, 0, 1280, 720)
		canvas.style.display = "block"
		
		refresh()
		generateTable()
	}
}


function refresh()
{
	refreshColors()
	refreshTotals()
}


function refreshColors()
{
	for (let p = 0; p < 12; p++)
	{
		let clanIndex = 5
		for (let i = 0; i < 6; i++)
		{
			if (document.getElementById("radioPlayer" + (p + 1) + "Clan" + (i + 1)).checked)
				clanIndex = i
		}
		
		document.getElementById("trPlayer" + (p + 1)).style.backgroundColor =
			document.getElementById("inputClan" + (clanIndex + 1) + "Color").value
	}
}


function refreshTotals()
{
	let clanTotals = [0, 0, 0, 0, 0, 0]
	for (let p = 0; p < 12; p++)
	{
		let clanIndex = 5
		for (let i = 0; i < 6; i++)
		{
			if (document.getElementById("radioPlayer" + (p + 1) + "Clan" + (i + 1)).checked)
				clanIndex = i
		}
		
		let score = parseIntSafe(document.getElementById("inputPlayer" + (p + 1) + "Score").value)
		clanTotals[clanIndex] += score
	}
	
	for (let i = 0; i < 6; i++)
		clanTotals[i] += parseIntSafe(document.getElementById("inputClan" + (i + 1) + "Bonus").value)
	
	for (let i = 0; i < 6; i++)
		document.getElementById("inputClan" + (i + 1) + "Total").value = clanTotals[i]
}


function parseIntSafe(str)
{
	let value = parseInt(str)
	if (isNaN(value) || !isFinite(value))
		return 0
	
	return value
}


function* extractFromImage(img)
{
	yield 0
	
	img = img.stretchTo(1280, 720)
	yield 0
	
	let players = img.extractPlayers(false)
	for (let p = 0; p < players.length; p++)
	{
		players[p].createCache()
		yield 0
	}
	
	let scores = img.extractScores(false)
	for (let p = 0; p < scores.length; p++)
	{
		scores[p].createCache()
		yield 0
	}
	
	let flags = img.extractFlags()
	yield 0
	
	let data = []
	
	for (let p = 0; p < players.length; p++)
	{
		let result = { }
		let player = players[p]
		let score = scores[p]
		let flag = flags[p]
		for (let _ of player.recognizePlayerIterable(result)) yield (p / players.length)
		for (let _ of score.recognizeScoreIterable(result)) yield (p / players.length)
		for (let _ of flag.recognizeFlagIterable(result)) yield (p / players.length)
			
		data.push(result)
	}

	yield { img: img, data: data }
}


function extractClans(players)
{
	let clans = []
	
	for (let p = 0; p < players.length; p++)
	{
		for (let q = 0; q < players.length; q++)
		{
			if (p == q)
				continue
			
			let suffix = commonSuffix(players[p].name, players[q].name).trim()
			
			if (suffix.length > 0 && clans.findIndex(c => c == suffix) < 0)
				clans.push(suffix)
		}
	}
	
	while (true)
	{
		let changed = false
		for (let p = 0; p < clans.length && !changed; p++)
		{
			for (let q = p + 1; q < clans.length && !changed; q++)
			{
				let suffix = commonSuffix(clans[p], clans[q]).trim()
				
				if (suffix.length > 1)
				{
					clans[q] = suffix
					clans.splice(p, 1)
					changed = true
				}
			}
		}
		
		if (!changed)
			break
	}
	
	if (clans.length > 6)
		clans.splice(6, clans.length - 6)
	
	return clans
}


function commonSuffix(s1, s2)
{
	let suffix = ""
	
	for (let i = 0; i < s1.length; i++)
	{
		if (i >= s2.length)
			continue
		
		if (s1[i] != s2[i])
			break
		
		suffix += s1[i]
	}
	
	return suffix
}


function generateTable()
{
	let clans = []
	let players = []
	for (let i = 0; i < 6; i++)
	{
		let name = document.getElementById("inputClan" + (i + 1) + "Name").value
		if (name == "")
			continue
		
		let clan = { }
		clan.name = name
		clan.color = document.getElementById("inputClan" + (i + 1) + "Color").value
		clan.bonus = parseIntSafe(document.getElementById("inputClan" + (i + 1) + "Bonus").value)
		clan.players = []
		clan.score = clan.bonus
		
		for (let p = 0; p < 12; p++)
		{
			if (!document.getElementById("radioPlayer" + (p + 1) + "Clan" + (i + 1)).checked)
				continue
			
			let name = document.getElementById("inputPlayer" + (p + 1) + "Name").value
			if (name == "")
				continue
			
			let player = { }
			player.name = name
			player.flag = document.getElementById("inputPlayer" + (p + 1) + "Flag").value
			player.score = parseIntSafe(document.getElementById("inputPlayer" + (p + 1) + "Score").value)
			
			clan.score += player.score
			clan.players.push(player)
			
			players.push(player)
		}
		
		clan.players.sort((a, b) => b.score - a.score)
		clans.push(clan)
	}
	
	clans.sort((a, b) => b.score - a.score)
	players.sort((a, b) => b.score - a.score)
	
	for (let p = 0; p < players.length; p++)
	{
		if (p > 0 && players[p].score == players[p - 1].score)
			players[p].ranking = players[p - 1].ranking
		else
			players[p].ranking = p + 1
	}
	
	let data = { }
	data.clans = clans
	data.players = players
	
	drawTable(data)
}


function drawTable(data)
{
	const marginW = 15
	const marginH = 15
	const clanNameW = 200
	const clanScoreW = 200
	const playerH = 30
	const playerMarginH = 6
	const playerNameW = 200
	const playerFlagW = 30
	const playerScoreW = 80
	const playerW = playerNameW + playerFlagW + playerScoreW
	const rankW = 60
	const roundRadius = 4
	const w = marginW + clanNameW + clanScoreW + playerW + rankW + marginW
	const h = marginH + (playerH + playerMarginH) * data.players.length - playerMarginH + marginH
	
	let canvas = document.getElementById("canvasOutput")
	canvas.width = w
	canvas.height = h
	
	let ctx = canvas.getContext("2d")
	ctx.fillStyle = "#ffffff"
	ctx.fillRect(0, 0, w, h)
	
	let clanY = 0
	for (let i = 0; i < data.clans.length; i++)
	{
		let clan = data.clans[i]
		
		if (clan.players.length == 0)
			continue
		
		ctx.save()
		ctx.translate(marginW, marginH + clanY)
		
		let clanH = (playerH + playerMarginH) * data.clans[i].players.length - playerMarginH
		
		ctx.fillStyle = clan.color
		ctx.fillRoundRect(-3, -3, clanNameW + clanScoreW + playerW + rankW + 3, clanH + 6, roundRadius)
		
		ctx.font = Math.min(clanH - 6, clanNameW * 0.35) + "px Verdana"
		ctx.textAlign = "left"
		ctx.textBaseline = "middle"
		ctx.fillStyle = "#000000"
		ctx.fillText(clan.name, 5, clanH / 2, clanNameW - 20)
		
		ctx.textAlign = "right"
		ctx.fillText(clan.score.toString(), clanNameW + clanScoreW - 5, clanH / 2, clanScoreW - 20)
		
		clanY += clanH + playerMarginH
	
		for (let p = 0; p < clan.players.length; p++)
		{
			let player = clan.players[p]
			
			ctx.save()
			ctx.translate(clanNameW + clanScoreW, (playerH + playerMarginH) * p)
			
			ctx.globalAlpha = 0.35
			ctx.fillStyle = "#ffffff"
			ctx.fillRoundRect(0, 0, playerW, playerH, roundRadius)
			
			ctx.globalAlpha = 1
			
			ctx.font = (playerH - 6) + "px Verdana"
			ctx.textAlign = "left"
			ctx.textBaseline = "middle"
			ctx.fillStyle = "#000000"
			
			ctx.fillText(player.name, 5, playerH / 2, playerNameW - 10)
			
			ctx.textAlign = "right"
			ctx.fillText(player.score.toString(), playerW - 5, playerH / 2, playerScoreW - 10)
			
			ctx.textAlign = "left"
			let rankingStr = player.ranking + "th"
			if (player.ranking == 1) rankingStr = "1st"
			if (player.ranking == 2) rankingStr = "2nd"
			if (player.ranking == 3) rankingStr = "3rd"
			ctx.fillText(rankingStr, playerW + 5, playerH / 2, rankW - 10)
			
			ctx.restore()
		}
		
		ctx.restore()
	}
}


CanvasRenderingContext2D.prototype.fillRoundRect = function (x, y, width, height, radius = 0)
{
	this.beginPath()
	this.moveTo(x + radius, y)
	this.lineTo(x + width - radius, y)
	this.quadraticCurveTo(x + width, y, x + width, y + radius)
	this.lineTo(x + width, y + height - radius)
	this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height)
	this.lineTo(x + radius, y + height)
	this.quadraticCurveTo(x, y + height, x, y + height - radius)
	this.lineTo(x, y + radius)
	this.quadraticCurveTo(x, y, x + radius, y)
	this.closePath()
	this.fill()
} 