"use strict";
// Fix for older browsers?


let refreshTimeout = null


function queueRefresh()
{
	document.getElementById("canvasTable").style.opacity = 0.5
	
	if (refreshTimeout != null)
		clearTimeout(refreshTimeout)
	
	refreshTimeout = setTimeout(refreshFromData, 500)
}


function refreshFromData()
{
	let textarea = document.getElementById("textareaData")
	let canvas = document.getElementById("canvasTable")
	
	document.getElementById("canvasTable").style.opacity = 1
	drawTable(canvas, parseData(textarea.value))
}


function loadExample()
{
	document.getElementById("textareaData").value =
		"A - Full Team Name\n" +
		"Player 1 112 [us]\n" +
		"Player 2 110 [gb]\n" +
		"Player 3 76 [au]\n" +
		"Player 4 72 [ca]\n" +
		"Player 5 90 [de]\n" +
		"Player 6 55 [ie]\n" +
		"\n" +
		"B\n" +
		"Player 7 70+20+8 [cl]\n" +
		"Player 8 78 [br]\n" +
		"Player 9 46\n" +
		"Player 10 100 [kr]\n" +
		"Player 11 68 [jp]\n" +
		"Player 12 79 [mx]"
		
	queueRefresh()
}


function handleConvertSyntax()
{
	document.getElementById("textareaData").value =
		convertSyntax(document.getElementById("textareaData").value)
		
	queueRefresh()
}


function convertSyntax(str)
{
	let converted = ""
		
	let data = parseData(str)
	
	if (detectSyntax(str))
	{
		for (let clan of data)
		{
			for (let player of clan.players)
				converted += clan.tag + " " + player.name + " " + player.score + " [" + player.flag + "]\n"
		}
	}
	else
	{
		for (let clan of data)
		{
			converted += (clan.tag == null ? "-" : clan.tag) + (clan.name == null ? "" : " - " + clan.name) + "\n"
			for (let player of clan.players)
				converted += (player.name == null || player.name == "" ? "-" : player.name) + " " + player.score + " [" + player.flag + "]\n"
			
			converted += "\n"
		}
	}
	
	return converted
}


function detectSyntax(str)
{
	let lines = str.replace("\r\n", "\n").split("\n").map(s => s.trim()).filter(s => s != "")
	
	if (lines.length == 0)
		return []
	
	// Is first line a clan name?
	return (parsePlayer(lines[0]) == null)
}


function parseData(str)
{
	let lines = str.replace("\r\n", "\n").split("\n").map(s => s.trim()).filter(s => s != "")
	
	if (lines.length == 0)
		return []
	
	if (detectSyntax(str))
	{
		// Parse mode: clan names on separate lines
		let clans = []
		let clan = null
		
		for (let line of lines)
		{
			let playerData = parsePlayer(line)
			if (playerData != null)
			{
				if (clan != null)
					clan.players.push(playerData)
			}
			
			else
			{
				clan = parseClan(line)
				if (clan != null)
					clans.push(clan)
			}
		}
		
		return clans
	}
	else
	{
		// Parse mode: clan names accompanying each player name
		let players = []
		
		for (let line of lines)
		{
			let playerData = parsePlayer(line)
			if (playerData != null)
				players.push(playerData)
		}
		
		let clanTags = extractClans(players)
		
		let clans = []
		for (let clanTag of clanTags)
			clans.push({ tag: clanTag, name: null, players: [], bonuses: 0 })
		
		for (let player of players)
		{
			let clan = clans.find(c => player.name.startsWith(c.tag))
			if (clan == null)
			{
				clan = clans.find(c => c.tag == null)
				if (clan == null)
				{
					clan = { tag: null, name: null, players: [], bonuses: 0 }
					clans.push(clan)
				}
			}
			
			if (clan.tag != null)
				player.name = trimSeparatorsStart(player.name.substr(clan.tag.length).trim())
			
			clan.players.push(player)
		}
		
		return clans
	}
}


function parseClan(str)
{
	let matches = str.trim().match(/(.*?)(?:-(.*))?$/)
	if (matches == null)
		return null
	
	return {
		tag: matches[1].trim(),
		name: matches[2] == null ? null : matches[2].trim(),
		players: [],
		bonuses: 0
	}
}


function parsePlayer(str)
{
	let matches = str.trim().match(/(.*)[ ]+([0-9+]+)(?:[ ]*\[(.*)\])?$/)
	if (matches == null)
		return null
	
	let score = matches[2].split("+").reduce((accum, x) => accum + parseInt(x), 0)
	
	return {
		name:  matches[1].trim(),
		score: score,
		flag:  matches[3] == null ? null : matches[3].trim()
	}
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
	
	clans = clans.map(c => trimSeparatorsEnd(c.trim()))
	
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


function isSeparator(c)
{
	return (
		c == "." ||
		c == "*" ||
		c == "·" ||
		c == "■" ||
		c == "□" ||
		c == "▲" ||
		c == "△" ||
		c == "▼" ||
		c == "▽" ||
		c == "◆" ||
		c == "◇" ||
		c == "○" ||
		c == "◎" ||
		c == "●" ||
		c == "★" ||
		c == "☆" ||
		c == "♪" ||
		c == "、" ||
		c == "。" ||
		c == "〃")	
}


function trimSeparatorsStart(str)
{
	while (str.length > 1 && isSeparator(str[0]))
		str = str.substr(1).trim()
	
	return str
}


function trimSeparatorsEnd(str)
{
	while (str.length > 1 && isSeparator(str[str.length - 1]))
		str = str.substr(0, str.length - 1).trim()
	
	return str
}


function drawTable(elem, clans)
{
	let TOTAL_WIDTH = parseInt(elem.width)
	let TOTAL_HEIGHT = parseInt(elem.height)
	let HEADER_HEIGHT = TOTAL_HEIGHT / 13
	let CLAN_NAME_X = TOTAL_WIDTH / 12 * 2
	let CLAN_NAME_WIDTH = TOTAL_WIDTH / 12 * 4
	let CLAN_SCORE_X = TOTAL_WIDTH / 12 * 10
	let CLAN_SCORE_WIDTH = TOTAL_WIDTH / 12 * 4
	let CLAN_MARGIN_HEIGHT = TOTAL_HEIGHT / 13 / 2
	let PLAYER_WIDTH = TOTAL_WIDTH / 12 * 4
	let PLAYER_X = TOTAL_WIDTH / 2 - PLAYER_WIDTH / 2
	let PLAYER_HEIGHT = TOTAL_HEIGHT / 14
	let PLAYER_NAME_X = PLAYER_WIDTH / 20 * 5.5
	let PLAYER_NAME_WIDTH = PLAYER_WIDTH / 20 * 10
	let PLAYER_FLAG_X = PLAYER_WIDTH / 20 * 11
	let PLAYER_FLAG_WIDTH = PLAYER_HEIGHT * 0.6 * (4 / 3)
	let PLAYER_FLAG_HEIGHT = PLAYER_HEIGHT * 0.6
	let PLAYER_SCORE_X = PLAYER_WIDTH / 20 * 15.5
	let PLAYER_SCORE_WIDTH = PLAYER_WIDTH / 20 * 4
	let PLAYER_RANK_X = PLAYER_WIDTH / 20 * 18.5
	let PLAYER_RANK_WIDTH = PLAYER_WIDTH / 20 * 4
	let PLAYER_RANK_SIZE = PLAYER_HEIGHT * 0.8
	
	// Calculate and sort clan scores
	clans.map(clan => Object.assign(clan, { score: clan.players.reduce((accum, p) => accum + p.score, 0) }))
	clans.sort((a, b) => b.score - a.score)
	clans.forEach(clan => clan.players.sort((a, b) => b.score - a.score))
	
	// Calculate clan colors
	let unusedHues =
	[
		  0,  14,  20,  24,  28,  32,
		 53,  66,  87, 108, 120, 130,
		140, 145, 150, 155, 160, 185,
		190, 195, 200, 210, 220, 225,
		240
	]
	
	let usedHashes = []
	for (let c = 0; c < clans.length; c++)
	{
		let clan = clans[c]
		
		let hash = 118
		let nameLower = (clan.tag == null ? "" : clan.tag.toLowerCase())
		for (let i = 0; i < nameLower.length; i++)
			hash += nameLower.charCodeAt(i) * 12
		
		while (usedHashes.find(h => ((Math.abs(hash - h) + 256) % 256) < 5) != null)
			hash += 5;
		
		usedHashes.push(hash % 256)
		
		clan.hue = (hash % 256) / 256
		clan.saturation = (clan.tag == null || clan.tag == "" ? 0 : 0.8)
	}
	
	// Join all players into an array
	let players = []
	clans.forEach(clan => clan.players.forEach(player => players.push(player)))
	players.sort((a, b) => b.score - a.score)
	
	let hasAnyFlags = false
	players.forEach(p => hasAnyFlags |= (p.flag != null))
	
	if (!hasAnyFlags)
	{
		PLAYER_NAME_X += PLAYER_WIDTH / 20 + 1
		PLAYER_NAME_WIDTH += PLAYER_WIDTH / 20 + 2
	}
	
	// Load flag images
	let loadImage = (id, src) =>
	{
		let img = document.getElementById(id)
		if (img == null)
		{
			allFlagsLoaded = false
			let img = document.createElement("img")
			img.id = id
			img.style.display = "none"
			img.imgLoaded = false
			
			img.onload = () => img.imgLoaded = true
			img.onerror = () => img.imgLoaded = null
			
			img.src = src
			
			document.body.appendChild(img)
			return false
		}
		else if (img.imgLoaded == false)
			return false
		else
			return true
	}
	
	let allFlagsLoaded = true
	for (let player of players)
	{
		if (player.flag != null)
		{
			let src = player.flag.toLowerCase()
			if (src == "uk") src = "gb"
			
			allFlagsLoaded &= loadImage("imgFlag_" + player.flag.toLowerCase(), "https://lipis.github.io/flag-icon-css/flags/4x3/" + src + ".svg")
		}
	}
	
	if (!allFlagsLoaded)
		queueRefresh()
	
	// Load rank images
	let rankSrcs =
	[
		"https://emojipedia-us.s3.amazonaws.com/thumbs/120/microsoft/106/crown_1f451.png",
		"https://emojipedia-us.s3.amazonaws.com/thumbs/120/microsoft/106/second-place-medal_1f948.png",
		"https://emojipedia-us.s3.amazonaws.com/thumbs/120/microsoft/106/third-place-medal_1f949.png"
	]
	
	let allRanksLoaded = true
	for (let rankSrc of rankSrcs)
	for (let i = 0; i < rankSrcs.length; i++)
		allRanksLoaded &= loadImage("imgRank" + (i + 1), rankSrcs[i])
	
	if (!allRanksLoaded)
		queueRefresh()
	
	// Calculate player rankings
	for (let p = 0; p < players.length; p++)
	{
		if (p > 0 && players[p].score == players[p - 1].score)
			players[p].ranking = players[p - 1].ranking
		else
			players[p].ranking = p + 1
	}
	
	// Calculate layout
	clans.forEach(clan => clan.h = Math.max(1, clan.players.length) * PLAYER_HEIGHT)
	
	let h = clans.reduce((accum, clan) => accum + clan.h, 0)
	
	clans.forEach(clan => clan.h += (TOTAL_HEIGHT - HEADER_HEIGHT - h) / clans.length)
	
	let y = HEADER_HEIGHT
	for (let clan of clans)
	{
		clan.y = y + CLAN_MARGIN_HEIGHT
		y += clan.h
		clan.h -= CLAN_MARGIN_HEIGHT * 2
	}
	
	// Start drawing
	let ctx = elem.getContext("2d")
	
	// Check for fonts
	if (document.fonts)
	{
		let fontsMissing =
			!document.fonts.check("1em Roboto") ||
			!document.fonts.check("1em \"Rubik Mono One\"")
		
		if (fontsMissing)
		{
			let text = "ƒšяαボ"
			
			ctx.font = "30px Roboto"
			ctx.fillStyle = "#ffffff"
			ctx.fillText(text, 0, 0)
			ctx.font = "30px Rubik Mono One"
			ctx.fillStyle = "#ffffff"
			ctx.fillText(text, 0, 0)
			queueRefresh()
		}
	}
	
	ctx.save()
	
	// Clear background
	ctx.fillStyle = "#000000"
	ctx.fillRect(0, 0, elem.width, elem.height)
	
	// Draw header
	let date = new Date()
	let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	let dateStr = date.getDate() + " " + months[date.getMonth()] + " " + date.getFullYear()
	
	let raceStr = ""
	let raceScores = [0, 1, 4, 0, 11, 0, 22, 0, 39, 48, 58, 69, 82]
	let totalScore = clans.reduce((accum, clan) => accum + clan.score, 0)
	let raceNum = totalScore / raceScores[players.length]
	if (raceScores[players.length] > 0 && Math.floor(raceNum) == raceNum)
		raceStr = "    •    " + Math.floor(raceNum) + " race" + (raceNum > 1 ? "s" : "")
	
	ctx.font = (HEADER_HEIGHT * 0.65) + "px Roboto"
	ctx.textBaseline = "middle"
	ctx.fillStyle = "#ffffff"
	ctx.textAlign = "center"
	
	ctx.fillText(dateStr + raceStr, TOTAL_WIDTH / 2, HEADER_HEIGHT / 2, TOTAL_WIDTH)
	
	// Draw clans
	for (let clan of clans)
	{
		ctx.save()
		ctx.translate(0, clan.y)
		
		ctx.fillStyle = rgbToHex(hsvToRgb(clan.hue, clan.saturation + 0.1, 1))
		ctx.fillRect(0, -CLAN_MARGIN_HEIGHT, TOTAL_WIDTH, clan.h + 1 + CLAN_MARGIN_HEIGHT * 2)
		
		ctx.save()
		ctx.fillStyle = rgbToHex(hsvToRgb(clan.hue, clan.saturation, 0.4))
		let alternateY = true
		for (let y = 0; y < clan.h / 2 + CLAN_MARGIN_HEIGHT + 10; y += 10)
		{
			alternateY = !alternateY
			for (let x = alternateY ? 7.5 : 0; x < TOTAL_WIDTH + 10; x += 14)
			{
				ctx.globalAlpha = 0.15 * Math.sin(Math.PI * y / clan.h)
				ctx.beginPath()
				ctx.arc(x, clan.h / 2 + y, 4, 0, Math.PI * 2)
				ctx.arc(x, clan.h / 2 - y, 4, 0, Math.PI * 2)
				ctx.fill()
			}
		}
		ctx.restore()
		
		let clanTagSize = Math.floor(Math.min(clan.h * 1.5, CLAN_NAME_WIDTH * 0.35))
		ctx.font = clanTagSize + "px Rubik Mono One"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillStyle = "#000000"
		
		if (clan.h > PLAYER_HEIGHT)
		{
			ctx.save()
			ctx.translate(CLAN_SCORE_X, 0)
			ctx.scale(0.75, 1)
			ctx.fillText(clan.score.toString(), 0, clan.h / 2, CLAN_SCORE_WIDTH - 20)
			ctx.restore()
			
			ctx.font = clanTagSize + "px Roboto"
			if (clan.tag != null)
				ctx.fillText(clan.tag, CLAN_NAME_X, clan.h / 2, CLAN_NAME_WIDTH - 20)
			
			if (clan.name != null)
			{
				ctx.font = Math.floor(clanTagSize * 0.25) + "px Roboto"
				ctx.fillText(clan.name, CLAN_NAME_X, clan.h / 2 + clanTagSize * 0.6, CLAN_NAME_WIDTH - 20)
			}
		}
		
		for (let p = 0; p < clan.players.length; p++)
		{
			let player = clan.players[p]
			
			ctx.save()
			ctx.translate(PLAYER_X, clan.h / 2 + (-clan.players.length / 2 + p) * PLAYER_HEIGHT)
			
			ctx.save()
			ctx.fillStyle = rgbToHex(hsvToRgb(clan.hue, clan.saturation, 0.6))
			ctx.globalAlpha = 0.4
			ctx.roundRect(0, 2, PLAYER_WIDTH, PLAYER_HEIGHT - 4, 5)
			ctx.fill()
			ctx.restore()
			
			ctx.font = (PLAYER_HEIGHT * 0.65) + "px Roboto"
			ctx.textBaseline = "middle"
			ctx.fillStyle = "#000000"
			ctx.textAlign = "center"
			
			ctx.save()
			ctx.translate(PLAYER_NAME_X, 0)
			ctx.scale(0.95, 1)
			ctx.fillText(player.name, 0, PLAYER_HEIGHT / 2, PLAYER_NAME_WIDTH)
			ctx.restore()
			
			ctx.save()
			if (player.ranking <= 3)
			{
				let imgRank = document.getElementById("imgRank" + player.ranking)
				if (imgRank != null && imgRank.imgLoaded == true)
					ctx.drawImage(imgRank, PLAYER_RANK_X - PLAYER_RANK_SIZE / 2, PLAYER_HEIGHT / 2 - PLAYER_RANK_SIZE / 2, PLAYER_RANK_SIZE, PLAYER_RANK_SIZE)
			}
			else
			{			
				let rankStr = player.ranking + "th"
				
				ctx.fillStyle = (player.ranking >= 15 ? "#660000" : "#000000")
				ctx.globalAlpha = (player.ranking >= 15 ? 1 : 0.6)
				ctx.font = "italic " + (PLAYER_HEIGHT * 0.65 * 0.6) + "px Roboto"
				ctx.fillText(rankStr, PLAYER_RANK_X, PLAYER_HEIGHT / 2, PLAYER_RANK_WIDTH)
			}
			ctx.restore()
			
			if (player.flag != null)
			{
				let flagElem = document.getElementById("imgFlag_" + player.flag.toLowerCase())
				if (flagElem != null && flagElem.imgLoaded == true)
				{
					ctx.fillRect(PLAYER_FLAG_X - 2, PLAYER_HEIGHT / 2 - PLAYER_FLAG_HEIGHT / 2 - 2, PLAYER_FLAG_WIDTH + 4, PLAYER_FLAG_HEIGHT + 4)
					ctx.drawImage(flagElem, PLAYER_FLAG_X, PLAYER_HEIGHT / 2 - PLAYER_FLAG_HEIGHT / 2, PLAYER_FLAG_WIDTH, PLAYER_FLAG_HEIGHT)
				}
			}
			
			ctx.translate(PLAYER_SCORE_X, 0)
			ctx.scale(0.75, 1)
			ctx.font = (PLAYER_HEIGHT * 0.65) + "px Rubik Mono One"
			ctx.fillStyle = "#000000"
			ctx.fillText(player.score.toString(), 0, PLAYER_HEIGHT / 2 + 2, PLAYER_SCORE_WIDTH)
			
			ctx.restore()
		}
		
		ctx.restore()
	}
	
	for (let c = 0; c < clans.length - 1; c++)
	{
		let clan = clans[c]
		
		let barY = clan.y + clan.h + CLAN_MARGIN_HEIGHT
		
		ctx.fillStyle = "#000000"
		ctx.globalAlpha = 0.5
		ctx.beginPath()
		ctx.rect(55, barY - 2, TOTAL_WIDTH - 180, 4)
		ctx.fill()
		
		ctx.globalAlpha = 1
		
		ctx.font = (PLAYER_HEIGHT * 0.75) + "px Roboto"
		ctx.textBaseline = "middle"
		ctx.fillStyle = "#000000"
		ctx.textAlign = "center"
		ctx.fillText("±" + (clans[c].score - clans[c + 1].score).toString(), TOTAL_WIDTH - 10 - 80, barY, 60)
	}
	
	ctx.restore()
}


function hsvToRgb(h, s, v)
{
    let r = 0
	let g = 0
	let b = 0
	
    let i = Math.floor(h * 6)
    let f = h * 6 - i
    let p = v * (1 - s)
    let q = v * (1 - f * s)
    let t = v * (1 - (1 - f) * s)
	
    switch (i % 6)
	{
        case 0: r = v; g = t; b = p; break
        case 1: r = q; g = v; b = p; break
        case 2: r = p; g = v; b = t; break
        case 3: r = p; g = q; b = v; break
        case 4: r = t; g = p; b = v; break
        case 5: r = v; g = p; b = q; break
    }
	
    return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255)
	}
}


function rgbToHex(r, g, b)
{
	if (g == undefined)
		return rgbToHex(r.r, r.g, r.b)
	
    return "#" + ((1 << 24) + (Math.floor(r) << 16) + (Math.floor(g) << 8) + Math.floor(b)).toString(16).slice(1)
}


CanvasRenderingContext2D.prototype.roundRect = function (x, y, width, height, radius = 0)
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
} 