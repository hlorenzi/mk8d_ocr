let refreshTimeout = null
let warningFlashTimeout = null
let warningCanFlash = false


let raceScores = [0, 1, 4, 0, 11, 0, 22, 0, 39, 48, 58, 69, 82]


const needsPngFlags = (navigator.userAgent.toLowerCase().indexOf("firefox") > -1)


const STYLE_DEFAULT = 0
const STYLE_MKU = 1
const STYLE_200L = 2
const STYLE_AMERICASCUP = 3


function main()
{
	//cacheTeamRegistry()
	
	document.getElementById("textareaData").placeholder = 
		"Type in the results here, or load an example below.\n\n" +
		"If you have a saved MK8D screenshot, upload it at the bottom of the page.\n\n" +
		"If you have copied an MK8D screenshot to the clipboard, just hit Ctrl+V anywhere."
		
	document.getElementById("tableTotals").innerHTML =
		"<tr style='font-size:1.25em;'><td>MK8D Point Totals</td><td>1 Race</td><td>12 Races</td></tr>" +
		"<tr><td>12 Players / 6v6</td><td>" + raceScores[12] + "</td><td>" + (raceScores[12] * 12) + "</td></tr>" +
		"<tr><td>11 Players / 6v5</td><td>" + raceScores[11] + "</td><td>" + (raceScores[11] * 12) + "</td></tr>" +
		"<tr><td>10 Players / 5v5</td><td>" + raceScores[10] + "</td><td>" + (raceScores[10] * 12) + "</td></tr>" +
		"<tr><td>9 Players / 3v3v3</td><td>" + raceScores[9] + "</td><td>" + (raceScores[9] * 12) + "</td></tr>" +
		"<tr><td>8 Players / 4v4</td><td>" + raceScores[8] + "</td><td>" + (raceScores[8] * 12) + "</td></tr>" +
		"<tr><td>6 Players / 3v3</td><td>" + raceScores[6] + "</td><td>" + (raceScores[6] * 12) + "</td></tr>" +
		"<tr><td>4 Players / 2v2</td><td>" + raceScores[4] + "</td><td>" + (raceScores[4] * 12) + "</td></tr>" +
		"<tr><td>2 Players / 1v1</td><td>" + raceScores[2] + "</td><td>" + (raceScores[2] * 12) + "</td></tr>"
		
	refreshFromData()
}


function queueRefresh()
{
	document.getElementById("imgTable").style.opacity = 0.5
	
	if (refreshTimeout != null)
		clearTimeout(refreshTimeout)
	
	refreshTimeout = setTimeout(refreshFromData, 500)
}


function refreshFromData()
{
	let textarea = document.getElementById("textareaData")
	let canvas = document.getElementById("canvasTable")
	let img = document.getElementById("imgTable")
	let spanTotal = document.getElementById("spanTotal")
	let spanWarning = document.getElementById("spanWarning")
	
	img.style.opacity = 1
	
	let style = STYLE_DEFAULT
	
	let reqStyle = getURLQueryParameter("style")
	if (reqStyle != null)
	{
		if (reqStyle.toLowerCase() == "mku")
			style = STYLE_MKU
		else if (reqStyle.toLowerCase() == "200l")
			style = STYLE_200L
		else if (reqStyle.toLowerCase() == "americas")
			style = STYLE_AMERICASCUP
	}
	
	drawTable(canvas, spanTotal, spanWarning, parseData(textarea.value), style)
	
	img.src = canvas.toDataURL()
}


function copyToClipboard()
{
	// From https://stackoverflow.com/questions/27863617/is-it-possible-to-copy-a-canvas-image-to-the-clipboard
	
	let div = document.getElementById("divTable")
	
    if (document.body.createTextRange)
	{
        let range = document.body.createTextRange()
        range.moveToElementText(div)
        range.select()
    }
	else if (window.getSelection)
	{
        let selection = window.getSelection()
        let range = document.createRange()
        range.selectNodeContents(div)
        selection.removeAllRanges()
        selection.addRange(range)
    }
	
	document.execCommand("Copy")
}


function clearWarning()
{
	if (warningFlashTimeout != null)
		clearTimeout(warningFlashTimeout)
	
	warningFlashTimeout = null
	
	let warning = document.getElementById("spanWarning")
	warning.style.backgroundColor = "white"
	warning.style.color = "black"
}


function flashWarning(remaining = 10)
{
	//if (!warningCanFlash)
		remaining = 0
	
	let warning = document.getElementById("spanWarning")
	
	warning.style.backgroundColor = (remaining % 2 == 1) ? "white" : "red"
	warning.style.color = (remaining % 2 == 1) ? "black" : "white"
	
	if (remaining > 0)
	{
		if (warningFlashTimeout != null)
			clearTimeout(warningFlashTimeout)
		
		warningFlashTimeout = setTimeout(() => flashWarning(remaining - 1), 100)
	}
	else
		warningCanFlash = false
}


function loadExample1()
{
	document.getElementById("textareaData").value =
		"A - Full Team Name #ff00ff\n" +
		"Alice [us] 112\n" +
		"Billy [gb] 110\n" +
		"Carol [au] 76\n" +
		"Derek [ca] 72\n" +
		"Ellen [de] 90-10\n" +
		"Frank [ie] 55\n" +
		"Penalty -10\n" +
		"\n" +
		"B\n" +
		"Grant [cl] 70+20+8\n" +
		"Henry [br] 78\n" +
		"Isaac 46\n" +
		"James [kr] 100\n" +
		"Karen [jp] 68\n" +
		"Lucas [mx] 79 "
		
	queueRefresh()
}


function loadExample2()
{
	document.getElementById("textareaData").value =
		"-\n" +
		"Alice [us] 112\n" +
		"Billy [gb] 110\n" +
		"Carol [au] 76\n" +
		"Derek [ca] 72\n" +
		"Ellen [de] 90-10\n" +
		"Frank [ie] 55\n" +
		"Grant [cl] 70+20+8\n" +
		"Henry [br] 78\n" +
		"Isaac 46\n" +
		"James [kr] 100\n" +
		"Karen [jp] 68\n" +
		"Lucas [mx] 79 "
		
	queueRefresh()
}


function loadExample3()
{
	document.getElementById("textareaData").value =
		"#mkwii\n\n" +
		"A - Full Team Name\n" +
		"Alice [us] 112|65|42\n" +
		"Billy [gb] 110|32|88\n" +
		"Carol [au] 76|18|45\n" +
		"Derek [ca] 72|26|79\n" +
		"Ellen [de] 90-10|80|54\n" +
		"Frank [ie] 55|38|34\n" +
		"Penalty -10\n" +
		"\n" +
		"B\n" +
		"Grant [cl] 70+20+8|50|62\n" +
		"Henry [br] 78|45|70\n" +
		"Isaac 46|28|61\n" +
		"James [kr] 100|80|49\n" +
		"Karen [jp] 68|36|38\n" +
		"Lucas [mx] 79|15|108 "
		
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
	let lines = str.replace("\r\n", "\n").split("\n").map(s => s.trim()).filter(s => s != "")
	if (lines.length == 0)
		return ""
	
	let converted = ""
		
	let data = parseData(str)
	
	let gamemode = "mk8d"
	if (lines[0].startsWith("#"))
	{
		gamemode = lines[0].substr(1)
		lines.splice(0, 1)
		converted += "#" + gamemode + "\n\n"
	}
	
	if (detectSyntax(lines))
	{
		for (let clan of data.clans)
		{
			for (let player of clan.players)
				converted += clan.tag + " " + player.name + " [" + player.flag + "] " + player.gpScores.join("|") + (player.penalties < 0 ? player.penalties : "") + "\n"
			
			if (clan.penalty != 0)
				converted += clan.tag + " Penalty " + clan.penalty + "\n"
		}
	}
	else
	{
		for (let clan of data.clans)
		{
			converted += (clan.tag == null ? "-" : clan.tag) + (clan.name == null ? "" : " - " + clan.name) + "\n"
			for (let player of clan.players)
				converted += (player.name == null || player.name == "" ? "-" : player.name) + " [" + player.flag + "] " + player.gpScores.join("|") + (player.penalties < 0 ? player.penalties : "") + "\n"
			
			if (clan.penalty != 0)
				converted += "Penalty " + clan.penalty + "\n"
			
			converted += "\n"
		}
	}
	
	return converted
}


function detectSyntax(lines)
{
	if (lines.length == 0)
		return false
	
	// Is first line a clan name?
	return (parsePlayer(lines[0]) == null)
}


function parseData(str)
{
	let lines = str.replace("\r\n", "\n").split("\n").map(s => s.trim()).filter(s => s != "")
	
	if (lines.length == 0)
		return []
	
	let gamemode = "mk8d"
	if (lines[0].startsWith("#"))
	{
		gamemode = lines[0].substr(1)
		lines.splice(0, 1)
	}
	
	if (detectSyntax(lines))
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
		
		clans.forEach(clan =>
		{
			let penalties = 0
			for (let i = clan.players.length - 1; i >= 0; i--)
			{
				if (clan.players[i].totalScore <= 0 && clan.players[i].name.toLowerCase() == "penalty")
				{
					penalties += clan.players[i].totalScore
					clan.players.splice(i, 1)
				}
			}
			
			clan.penalty = penalties
		})
		
		return { gamemode, clans }
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
		
		let assignmentAttempts = []
		for (let i = 0; i < 10; i++)
		{
			let clanTags = extractClans(players, i)
			assignmentAttempts.push({ clanTags, clans: assignPlayersToExtractedClans(clanTags, players) })
		}
		
		let bestAssignmentScore = -100000
		let bestAttempt = assignmentAttempts[0]
		//console.log("== attempts ==")
		for (let attempt of assignmentAttempts)
		{
			let assignmentScore = 0
			
			assignmentScore += attempt.clans.length
			
			if (attempt.clans.length > 0)
			{
				let allSame = true
				let playersInClan0 = attempt.clans[0].players.length
				attempt.clans.forEach(clan => allSame &= (clan.players.length == playersInClan0))
				
				if (allSame)
					assignmentScore += 10
			}
			
			let clanWithoutTag = attempt.clans.find(clan => clan.tag == null)
			if (clanWithoutTag)
				assignmentScore -= clanWithoutTag.players.length
			
			//console.log(assignmentScore)
			//console.log(attempt.clanTags)
			//console.log(attempt.clans)
			//console.log(";")
			
			if (assignmentScore > bestAssignmentScore)
			{
				bestAssignmentScore = assignmentScore
				bestAttempt = attempt
			}
		}
		
		bestAttempt.clans.forEach(clan =>
		{
			let penalties = 0
			for (let i = clan.players.length - 1; i >= 0; i--)
			{
				if (clan.players[i].totalScore <= 0 && clan.players[i].name.toLowerCase() == "penalty")
				{
					penalties += clan.players[i].totalScore
					clan.players.splice(i, 1)
				}
			}
			
			clan.penalty = penalties
		})
		
		return { gamemode, clans: bestAttempt.clans }
	}
}


function parseClan(str)
{
	let hexColorMatches = str.trim().match(/(.*)[ ]+#([0-9A-Fa-f]+)$/)
	let strWithoutHexColor = (hexColorMatches == null || hexColorMatches[2].length != 6 ? str : hexColorMatches[1])
	
	let matches = strWithoutHexColor.trim().match(/(.*?)(?:-(.*))?$/)
	if (matches == null)
		return null
	
	return {
		tag: matches[1].trim(),
		name: matches[2] == null ? null : matches[2].trim(),
		players: [],
		bonuses: 0,
		color: (hexColorMatches != null ? hexColorMatches[2] : null)
	}
}


function parsePlayer(str)
{
	let matches = str.trim().match(/(.*)[ ]+([0-9+|-]+)$/)
	if (matches == null)
		return null
	
	let nameMatches = matches[1].trim().match(/(.*)[ ]+(?:\[(.*)\])?$/)
	
	let name = (nameMatches == null ? matches[1] : nameMatches[1]).trim()
	let flag = (nameMatches == null ? "" : (nameMatches[2] == null ? "" : nameMatches[2].trim()))
	
	let safeParseInt = (s) =>
	{
		let x = parseInt(s)
		if (isNaN(x) || !isFinite(x))
			return 0
		
		return x
	}
	
	let gpScoresStr = matches[2].split("|").map(s => s.trim().match(/((?:\+?|-)[0-9]+)/g))
	if (gpScoresStr == null)
		return null
	
	for (let gpScore of gpScoresStr)
		if (gpScore == null)
			return null
	
	let gpScores = gpScoresStr.map(s => s.reduce((accum, x) =>
	{
		let value = safeParseInt(x)
		return (value < 0) ? accum : accum + value
	}, 0))
	
	let penalties = gpScoresStr.reduce((accum, gp) => accum + gp.reduce((accum, x) =>
	{
		let value = safeParseInt(x)
		return (value > 0) ? accum : accum + value
	}, 0), 0)
	
	let totalScoreWithoutPenalties = gpScores.reduce((accum, x) => accum + x, 0)
	let totalScore = totalScoreWithoutPenalties + penalties
	
	return { name, gpScores, penalties, totalScoreWithoutPenalties, totalScore, flag }
}


function extractClans(players, minLength)
{
	let clans = []
	
	for (let p = 0; p < players.length; p++)
	{
		for (let q = 0; q < players.length; q++)
		{
			if (p == q)
				continue
			
			let suffix = commonSuffix(players[p].name, players[q].name).trim()
			
			if (suffix.length > minLength && clans.findIndex(c => c == suffix) < 0)
				clans.push(suffix)
		}
	}
	
	/*while (true)
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
		clans.splice(6, clans.length - 6)*/
	
	clans = clans.map(c => trimSeparatorsEnd(c.trim()))
	
	return clans
}


function assignPlayersToExtractedClans(clanTags, players)
{
	let clans = []
	for (let clanTag of clanTags)
		clans.push({ tag: clanTag, name: null, players: [], bonuses: 0 })
	
	for (let clan of clans)
	{
		clan.possiblePlayersWithTag = 0
		players.forEach(p =>
		{
			if (p.name.startsWith(clan.tag))
				clan.possiblePlayersWithTag += 1
		})
		
		//console.log("[" + clan.tag + "] possible players: " + clan.possiblePlayersWithTag)
	}
	
	for (let player of players)
	{
		let clan = null
		
		let biggestRoster = 0
		for (let c of clans.filter(c => player.name.startsWith(c.tag)))
		{
			if (c.possiblePlayersWithTag > biggestRoster)
			{
				biggestRoster = c.possiblePlayersWithTag
				clan = c
			}
		}
		
		if (clan == null)
		{
			clan = clans.find(c => c.tag == null)
			if (clan == null)
			{
				clan = { tag: null, name: null, players: [], bonuses: 0 }
				clans.push(clan)
			}
		}
		
		let playerClone = Object.assign({}, player)
		
		if (clan.tag != null)
			playerClone.name = trimSeparatorsStart(playerClone.name.substr(clan.tag.length).trim())
		
		clan.players.push(playerClone)
	}
	
	clans = clans.filter(clan => clan.players.length > 0)
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
		c == "," ||
		c == "*" ||
		c == "|" ||
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
		c == "⇔" ||
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


function drawTable(elem, totalElem, warningElem, gamedata, style = STYLE_DEFAULT)
{
	switch (style)
	{
		case STYLE_DEFAULT: drawTableDefault(elem, totalElem, warningElem, gamedata); break
		case STYLE_MKU: drawTableEvent(elem, totalElem, warningElem, gamedata, { name: "Mario Kart Universal", icon: "mku", color1: "#007F86", color2: "#CD4E00" }); break
		case STYLE_200L: drawTableEvent(elem, totalElem, warningElem, gamedata, { name: "200 League", icon: "200l", color1: "#c48651", color2: "#8e2651" }); break
		case STYLE_AMERICASCUP: drawTableEvent(elem, totalElem, warningElem, gamedata, { name: "Americas Cup", icon: "americas", color1: "#00b7fd", color2: "#ed5351" }); break
	}
}


function drawTableDefault(elem, totalElem, warningElem, gamedata)
{
	clearWarning()
	warningElem.innerHTML = ""
	totalElem.innerHTML = ""
	
	let clans = gamedata.clans || []
	
	let SCORE_COLUMNS = 1
	clans.forEach(clan => clan.players.forEach(p => SCORE_COLUMNS = Math.max(SCORE_COLUMNS, p.gpScores.length)))
	if (SCORE_COLUMNS > 1)
		SCORE_COLUMNS += 1
	
	let STANDARD_HEIGHT = 520
	let ROW_NUM = clans.reduce((accum, clan) => accum + clan.players.length, 0)
	let CLAN_PENALTY_ROW_NUM = clans.reduce((accum, clan) => accum + (clan.penalty != 0 ? 1 : 0), 0)
	
	let showClanRanks = (clans.length > 1)
	
	let HEADER_HEIGHT = STANDARD_HEIGHT / 13
	let CLAN_MARGIN_HEIGHT = STANDARD_HEIGHT / 13 / 2
	let PLAYER_HEIGHT = STANDARD_HEIGHT / 14
	
	let TOTAL_WIDTH = 860 + 40 * (SCORE_COLUMNS - 1)
	let TOTAL_HEIGHT = STANDARD_HEIGHT + (Math.max(12, ROW_NUM + CLAN_PENALTY_ROW_NUM) - 12) * PLAYER_HEIGHT
	
	elem.width = TOTAL_WIDTH
	elem.height = TOTAL_HEIGHT
	
	let x = 0
	let COLUMNS = 56 + SCORE_COLUMNS * 4
	let COLUMN = TOTAL_WIDTH / COLUMNS
	
	let CLAN_RANK_WIDTH = (showClanRanks ? COLUMN * 4 : 0)
	let CLAN_RANK_ICON_WIDTH = CLAN_RANK_WIDTH * 0.8
	let CLAN_RANK_X = x + CLAN_RANK_WIDTH / 2
	x += CLAN_RANK_WIDTH
	
	let CLAN_NAME_WIDTH = (showClanRanks ? COLUMN * 16 : COLUMN * 20)
	let CLAN_NAME_X = x + CLAN_NAME_WIDTH / 2
	x += CLAN_NAME_WIDTH
	
	let PLAYER_WIDTH = COLUMN * (COLUMNS - 40)
	let PLAYER_X = x
	x += PLAYER_WIDTH
	
	let CLAN_SCORE_WIDTH = COLUMN * 20
	let CLAN_SCORE_X = x + CLAN_SCORE_WIDTH / 2
	
	let PLAYER_COLUMNS = 16 + 4 * SCORE_COLUMNS
	let PLAYER_COLUMN = PLAYER_WIDTH / PLAYER_COLUMNS
	x = 0
	
	let PLAYER_NAME_WIDTH = PLAYER_COLUMN * 10
	let PLAYER_NAME_X = x + PLAYER_NAME_WIDTH / 2
	x += PLAYER_NAME_WIDTH
	
	let PLAYER_FLAG_WIDTH = PLAYER_COLUMN * 3
	let PLAYER_FLAG_ICON_WIDTH = PLAYER_HEIGHT * 0.6 * (needsPngFlags ? (4.25 / 3) : (4 / 3))
	let PLAYER_FLAG_ICON_HEIGHT = PLAYER_HEIGHT * 0.6
	let PLAYER_FLAG_X = x + PLAYER_FLAG_WIDTH / 2
	x += PLAYER_FLAG_WIDTH
	
	let PLAYER_SCORE_WIDTH = PLAYER_COLUMN * 4// PLAYER_WIDTH / PLAYER_SUBDIV * (4 * SCORE_COLUMNS)
	let PLAYER_SCORE_X = x + PLAYER_SCORE_WIDTH / 2// PLAYER_WIDTH / PLAYER_SUBDIV * (13.5 + (2 * SCORE_COLUMNS))
	x += PLAYER_SCORE_WIDTH * SCORE_COLUMNS
	
	let PLAYER_RANK_WIDTH = PLAYER_COLUMN * 3
	let PLAYER_RANK_X = x + PLAYER_RANK_WIDTH / 2
	let PLAYER_RANK_ICON_WIDTH = PLAYER_HEIGHT * 0.8
	x += PLAYER_RANK_WIDTH
	
	let PLAYER_PENALTY_WIDTH = PLAYER_COLUMN * 3.1
	let PLAYER_PENALTY_X = x + (PLAYER_COLUMN * 3) - PLAYER_COLUMN * 1.5
	
	// Calculate and sort clan scores
	clans.map(clan => Object.assign(clan, { score: clan.players.reduce((accum, p) => accum + p.totalScore, 0) + clan.penalty }))
	clans.map(clan => Object.assign(clan, { scoreWithoutPenalties: clan.players.reduce((accum, p) => accum + p.totalScoreWithoutPenalties, 0) }))
	clans.sort((a, b) => b.score - a.score)
	clans.forEach(clan => clan.players.sort((a, b) => b.totalScoreWithoutPenalties - a.totalScoreWithoutPenalties))
	
	// Calculate clan colors
	let usedHashes = []
	for (let c = 0; c < clans.length; c++)
	{
		let clan = clans[c]
		
		if (clan.color && clan.color.length == 6)
		{
			let rgb = hexToRgb(clan.color)
			let hsv = rgbToHsv(rgb.r, rgb.g, rgb.b)
			clan.hue = hsv.h
			clan.saturation = hsv.s
			clan.colorValue = hsv.v
			continue
		}
		
		let hash = 122
		let nameLower = (clan.tag == null ? "" : clan.tag.toLowerCase())
		for (let i = 0; i < nameLower.length; i++)
		{
			if (nameLower[i] == " ")
				continue
			
			hash += nameLower.charCodeAt(i) * 12
		}
		
		while (usedHashes.find(h => ((Math.abs(hash - h) + 256) % 256) < 10) != null)
			hash += 10;
		
		hash %= 256
		
		usedHashes.push(hash)
		
		clan.hue = hash / 256
		clan.saturation = (clan.tag == null || clan.tag == "" ? 0 : 0.1 + (hash >= 150 && hash <= 215 ? (hash >= 165 && hash <= 200 ? 0.4 : 0.6) : 0.8))
		clan.colorValue = 1
	}
	
	// Join all players into an array
	let players = []
	clans.forEach(clan => clan.players.forEach(player => players.push(player)))
	players.sort((a, b) => b.totalScore - a.totalScore)
	
	let hasAnyFlags = false
	players.forEach(p => hasAnyFlags |= (p.flag != null && p.flag != ""))
	
	if (!hasAnyFlags)
	{
		PLAYER_NAME_X += PLAYER_COLUMN * 1.5
		PLAYER_NAME_WIDTH += PLAYER_COLUMN * 3
	}
	
	// Load flag images
	let loadImage = (id, src) =>
	{
		let img = document.getElementById(id)
		if (img == null)
		{
			allFlagsLoaded = false
			let img = document.createElement("img")
			img.setAttribute("crossOrigin", "anonymous")
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
			
			allFlagsLoaded &= loadImage("imgFlag_" + player.flag.toLowerCase(),
				needsPngFlags ?
				("https://raw.githubusercontent.com/hjnilsson/country-flags/master/png100px/" + src + ".png") :
				("https://lipis.github.io/flag-icon-css/flags/4x3/" + src + ".svg"))
		}
	}
	
	if (!allFlagsLoaded)
		queueRefresh()
	
	// Load rank images
	let rankSrcs =
	[
		window.location.href.substr(0, window.location.href.lastIndexOf("/")) + "/assets/1st.png",
		window.location.href.substr(0, window.location.href.lastIndexOf("/")) + "/assets/2nd.png",
		window.location.href.substr(0, window.location.href.lastIndexOf("/")) + "/assets/3rd.png",
		window.location.href.substr(0, window.location.href.lastIndexOf("/")) + "/assets/turtle.png",
	]
	
	let allRanksLoaded = true
	for (let rankSrc of rankSrcs)
	for (let i = 0; i < rankSrcs.length; i++)
		allRanksLoaded &= loadImage("imgRank" + (i + 1), rankSrcs[i])
	
	if (!allRanksLoaded)
		queueRefresh()
	
	// Calculate clan rankings
	for (let p = 0; p < clans.length; p++)
	{
		if (p > 0 && clans[p].score == clans[p - 1].score)
			clans[p].ranking = clans[p - 1].ranking
		else
			clans[p].ranking = p + 1
	}
	
	// Calculate player rankings
	let lowestRanking = 1
	for (let p = 0; p < players.length; p++)
	{
		if (p > 0 && players[p].totalScore == players[p - 1].totalScore)
			players[p].ranking = players[p - 1].ranking
		else
			players[p].ranking = p + 1
		
		lowestRanking = players[p].ranking
	}
	
	// Calculate layout
	clans.forEach(clan => clan.h = Math.max(1, clan.players.length + (clan.penalty != 0 ? 1 : 0)) * PLAYER_HEIGHT)
	
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
			!document.fonts.check("900 1em Roboto") ||
			!document.fonts.check("100 1em Roboto") ||
			!document.fonts.check("1em \"Rubik Mono One\"")
		
		if (fontsMissing)
		{
			let text = "ƒšяαボ"
			
			ctx.font = "900 30px Roboto"
			ctx.fillStyle = "#ffffff"
			ctx.fillText(text, 0, 0)
			ctx.font = "100 30px Roboto"
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
	let totalScore = clans.reduce((accum, clan) => accum + clan.scoreWithoutPenalties, 0)
	totalElem.innerHTML = "Total Points: " + totalScore
	
	let raceNum = totalScore / raceScores[players.length]
	if (gamedata.gamemode == "mk8d")
	{
		if (raceScores[players.length] > 0)
		{
			if (Math.floor(raceNum) == raceNum)
				raceStr = "    •    " + Math.floor(raceNum) + " race" + (raceNum > 1 ? "s" : "")
			else
			{
				let nextWholeRaceNum = Math.ceil(raceNum)
				let missingPoints = (raceScores[players.length] * nextWholeRaceNum) - totalScore
				
				warningElem.innerHTML =
					"<br>⚠ Doesn't look like a proper result! Did someone disconnect? ⚠<br>" +
					"(Missing " + missingPoints + " point" + (missingPoints > 1 ? "s" : "") + " for " + nextWholeRaceNum + " race" + (nextWholeRaceNum > 1 ? "s" : "") + ")"
					
				flashWarning()
			}
		}
	}
	
	ctx.font = "900 " + (HEADER_HEIGHT * 0.65) + "px Roboto"
	ctx.textBaseline = "middle"
	ctx.fillStyle = "#ffffff"
	ctx.textAlign = "center"
	
	ctx.fillText(dateStr + raceStr, TOTAL_WIDTH / 2, HEADER_HEIGHT / 2 + (HEADER_HEIGHT * 0.65) * 0.1, TOTAL_WIDTH)
	
	let calcClanTagSize = (clan) => Math.floor(Math.min(clan.h * 1.5, CLAN_SCORE_WIDTH * 0.35))
	let calcClanScoreSize = (clan) => Math.floor(Math.min(clan.h * 1.5, CLAN_SCORE_WIDTH * 0.35))
	
	// Get clan tag widths
	let maxClanTagWidth = 0
	for (let clan of clans)
	{
		ctx.save()
		ctx.font = "900 " + calcClanTagSize(clan) + "px Roboto"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillStyle = "#000000"
		
		clan.tagWidth = 0
		
		if (clan.tag != null)
			clan.tagWidth = Math.min(ctx.measureText(clan.tag).width, CLAN_NAME_WIDTH - 20)
		
		maxClanTagWidth = Math.max(maxClanTagWidth, clan.tagWidth)
		ctx.restore()
	}
	
	// Draw clans
	for (let clan of clans)
	{
		ctx.save()
		ctx.translate(0, clan.y)
		
		ctx.fillStyle = rgbToHex(hsvToRgb(clan.hue, clan.saturation, clan.colorValue))
		ctx.fillRect(0, -CLAN_MARGIN_HEIGHT, TOTAL_WIDTH, clan.h + 1 + CLAN_MARGIN_HEIGHT * 2)
		
		ctx.save()
		ctx.fillStyle = rgbToHex(hsvToRgb(clan.hue, clan.saturation - 0.1, clan.colorValue * 0.4))
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
		
		
		if (clan.players.length > 1)//(clan.h > PLAYER_HEIGHT)
		{
			ctx.save()
			ctx.font = calcClanScoreSize(clan) + "px Rubik Mono One"
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.fillStyle = "#000000"
			
			ctx.translate(CLAN_SCORE_X, 0)
			ctx.scale(0.75, 1)
			ctx.fillText(clan.score.toString(), 0, clan.h / 2 + calcClanTagSize(clan) * 0.1, CLAN_SCORE_WIDTH - 20)
			ctx.restore()
			
			ctx.save()
			ctx.font = "900 " + calcClanTagSize(clan) + "px Roboto"
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.fillStyle = "#000000"
			if (clan.tag != null)
				ctx.fillText(clan.tag, CLAN_NAME_X, clan.h / 2, CLAN_NAME_WIDTH - 20)
			
			if (clan.name != null)
			{
				ctx.font = "900 " + Math.floor(calcClanTagSize(clan) * 0.25) + "px Roboto"
				ctx.fillText(clan.name, CLAN_NAME_X, clan.h / 2 + calcClanTagSize(clan) * 0.8, CLAN_NAME_WIDTH - 20)
			}
			ctx.restore()
			
			if (showClanRanks)
			{
				ctx.save()
				if (clan.ranking <= 3)
				{
					let imgRank = document.getElementById("imgRank" + clan.ranking)
					if (imgRank != null && imgRank.imgLoaded == true)
						ctx.drawImage(imgRank, (CLAN_NAME_X - maxClanTagWidth / 2) / 2 - CLAN_RANK_ICON_WIDTH / 2, clan.h / 2 - CLAN_RANK_ICON_WIDTH / 2, CLAN_RANK_ICON_WIDTH, CLAN_RANK_ICON_WIDTH)
				}
				else
				{			
					let rankStr = clan.ranking + "th"
					
					ctx.fillStyle = "#000000"
					ctx.globalAlpha = 0.6
					ctx.font = "900 " + (PLAYER_HEIGHT * 0.95 * 0.6) + "px Roboto"
					ctx.textAlign = "center"
					ctx.textBaseline = "middle"
					ctx.fillText(rankStr, (CLAN_NAME_X - maxClanTagWidth / 2) / 2, clan.h / 2 + (PLAYER_HEIGHT * 0.95 * 0.6) * 0.1, CLAN_RANK_WIDTH)
				}
				ctx.restore()
			}
		}
			
		
		for (let p = 0; p < clan.players.length; p++)
		{
			let player = clan.players[p]
			
			ctx.save()
			ctx.translate(PLAYER_X, clan.h / 2 + (-clan.players.length / 2 + p - (clan.penalty != 0 ? 0.5 : 0)) * PLAYER_HEIGHT)
			
			ctx.save()
			ctx.fillStyle = rgbToHex(hsvToRgb(clan.hue, clan.saturation - 0.1, clan.colorValue * 0.6))
			ctx.globalAlpha = 0.4
			ctx.roundRect(0, 2, PLAYER_WIDTH, PLAYER_HEIGHT - 4, 5)
			ctx.fill()
			ctx.restore()
			
			ctx.font = "900 " + (PLAYER_HEIGHT * 0.65) + "px Roboto"
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
					ctx.drawImage(imgRank, PLAYER_RANK_X - PLAYER_RANK_ICON_WIDTH / 2, PLAYER_HEIGHT / 2 - PLAYER_RANK_ICON_WIDTH / 2, PLAYER_RANK_ICON_WIDTH, PLAYER_RANK_ICON_WIDTH)
			}
			/*else if (player.ranking == lowestRanking)
			{
				let imgRank = document.getElementById("imgRank4")
				if (imgRank != null && imgRank.imgLoaded == true)
					ctx.drawImage(imgRank, PLAYER_RANK_X - PLAYER_RANK_ICON_WIDTH / 2, PLAYER_HEIGHT / 2 - PLAYER_RANK_ICON_WIDTH / 2, PLAYER_RANK_ICON_WIDTH, PLAYER_RANK_ICON_WIDTH)
			}*/
			else
			{			
				let rankStr = player.ranking + "th"
				
				ctx.fillStyle = "#000000"
				ctx.globalAlpha = 0.6
				ctx.font = "900 " + (PLAYER_HEIGHT * 0.65 * 0.6) + "px Roboto"
				ctx.fillText(rankStr, PLAYER_RANK_X, PLAYER_HEIGHT / 2, PLAYER_RANK_WIDTH)
			}
			ctx.restore()
			
			if (player.flag != null)
			{
				let flagElem = document.getElementById("imgFlag_" + player.flag.toLowerCase())
				if (flagElem != null && flagElem.imgLoaded == true)
				{
					ctx.fillRect(PLAYER_FLAG_X - PLAYER_FLAG_ICON_WIDTH / 2 - 2, PLAYER_HEIGHT / 2 - PLAYER_FLAG_ICON_HEIGHT / 2 - 2, PLAYER_FLAG_ICON_WIDTH + 4, PLAYER_FLAG_ICON_HEIGHT + 4)
					ctx.fillStyle = "#ffffff"
					ctx.drawImage(flagElem, PLAYER_FLAG_X - PLAYER_FLAG_ICON_WIDTH / 2, PLAYER_HEIGHT / 2 - PLAYER_FLAG_ICON_HEIGHT / 2, PLAYER_FLAG_ICON_WIDTH, PLAYER_FLAG_ICON_HEIGHT)
				}
			}
			
			if (SCORE_COLUMNS > 1)
			{
				for (let i = 0; i < player.gpScores.length; i++)
				{
					ctx.save()
					ctx.translate(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * i, 0)
					ctx.scale(0.75, 1)
					ctx.font = (PLAYER_HEIGHT * 0.55) + "px Rubik Mono One"
					ctx.fillStyle = "#000000"
					ctx.globalAlpha = 0.8
					ctx.fillText(player.gpScores[i].toString(), 0, PLAYER_HEIGHT / 2 + 2, PLAYER_SCORE_WIDTH)
					ctx.restore()
					
					if (i > 0)
					{
						ctx.save()
						ctx.fillStyle = "#ffffff"
						ctx.globalAlpha = 0.3
						ctx.fillRect(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * (i - 0.5) - 1, PLAYER_HEIGHT / 2 - PLAYER_HEIGHT * 0.4, 2, PLAYER_HEIGHT * 0.8)
						ctx.restore()
					}
					
				}
			}
			
			if (SCORE_COLUMNS > 1)
			{
				ctx.save()
				ctx.fillStyle = "#ffffff"
				ctx.globalAlpha = 0.3
				ctx.fillRect(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * (SCORE_COLUMNS - 1 - 0.5) - 1, 2, PLAYER_SCORE_WIDTH, PLAYER_HEIGHT - 4)
				ctx.restore()
			}
			
			ctx.save()
			ctx.translate(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * (SCORE_COLUMNS - 1), 0)
			ctx.scale(0.75, 1)
			ctx.font = (PLAYER_HEIGHT * 0.65) + "px Rubik Mono One"
			ctx.fillStyle = "#000000"
			ctx.fillText(player.totalScoreWithoutPenalties.toString(), 0, PLAYER_HEIGHT / 2 + 2, PLAYER_SCORE_WIDTH)
			ctx.restore()
			
			if (player.penalties < 0)
			{
				ctx.save()
				ctx.translate(PLAYER_PENALTY_X, 0)
				ctx.scale(1, 1)
				ctx.font = (PLAYER_HEIGHT * 0.45) + "px Rubik Mono One"
				ctx.fillStyle = "#000000"
				ctx.textAlign = "center"
				ctx.fillText("(" + player.penalties.toString() + ")", 0, PLAYER_HEIGHT / 2 + 2, PLAYER_PENALTY_WIDTH)
				ctx.restore()
			}
			
			ctx.restore()
		}
		
		if (clan.penalty != 0)
		{
			ctx.save()
			ctx.translate(PLAYER_X, clan.h / 2 + (clan.players.length / 2 - (clan.penalty != 0 ? 0.5 : 0)) * PLAYER_HEIGHT)
			
			ctx.save()
			ctx.fillStyle = rgbToHex(hsvToRgb(clan.hue, clan.saturation - 0.1, clan.colorValue * 0.6))
			ctx.globalAlpha = 0.4
			ctx.roundRect(30, 2 + 5, PLAYER_WIDTH - 60, PLAYER_HEIGHT - 10, 5)
			ctx.fill()
			ctx.restore()
			
			ctx.font = "900 " + (PLAYER_HEIGHT * 0.45) + "px Roboto"
			ctx.textBaseline = "middle"
			ctx.fillStyle = "#000000"
			ctx.textAlign = "center"
			
			ctx.save()
			ctx.translate(PLAYER_NAME_X, 0)
			ctx.scale(0.95, 1)
			ctx.fillText("Penalty", 0, PLAYER_HEIGHT / 2 + 2, PLAYER_NAME_WIDTH)
			ctx.restore()
			
			ctx.save()
			ctx.translate(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * (SCORE_COLUMNS - 1), 0)
			ctx.scale(0.7, 1)
			ctx.font = (PLAYER_HEIGHT * 0.45) + "px Rubik Mono One"
			ctx.fillStyle = "#000000"
			ctx.fillText(clan.penalty.toString(), 0, PLAYER_HEIGHT / 2 + 2 + 2, PLAYER_SCORE_WIDTH)
			ctx.restore()
			
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
		
		ctx.font = "900 " + (PLAYER_HEIGHT * 0.75) + "px Roboto"
		ctx.textBaseline = "middle"
		ctx.fillStyle = "#000000"
		ctx.textAlign = "center"
		ctx.fillText("±" + (clans[c].score - clans[c + 1].score).toString(), TOTAL_WIDTH - 10 - 80, barY, 60)
	}
	
	ctx.restore()
}


function drawTableEvent(elem, totalElem, warningElem, gamedata, style)
{
	clearWarning()
	warningElem.innerHTML = ""
	totalElem.innerHTML = ""
	
	let clans = gamedata.clans || []
	
	let SCORE_COLUMNS = 1
	clans.forEach(clan => clan.players.forEach(p => SCORE_COLUMNS = Math.max(SCORE_COLUMNS, p.gpScores.length)))
	if (SCORE_COLUMNS > 1)
		SCORE_COLUMNS += 1
	
	let STANDARD_HEIGHT = 520
	let ROW_NUM = clans.reduce((accum, clan) => accum + clan.players.length, 0)
	let CLAN_PENALTY_ROW_NUM = clans.reduce((accum, clan) => accum + (clan.penalty != 0 ? 1 : 0), 0)
	
	let showClanRanks = false
	
	let HEADER_HEIGHT = STANDARD_HEIGHT / 13
	let CLAN_MARGIN_HEIGHT = STANDARD_HEIGHT / 13 / 2
	let PLAYER_HEIGHT = STANDARD_HEIGHT / 14
	
	let TOTAL_WIDTH = 860 + 40 * (SCORE_COLUMNS - 1)
	let TOTAL_HEIGHT = STANDARD_HEIGHT + (Math.max(12, ROW_NUM + CLAN_PENALTY_ROW_NUM) - 12) * PLAYER_HEIGHT
	
	elem.width = TOTAL_WIDTH
	elem.height = TOTAL_HEIGHT
	
	let x = 0
	let COLUMNS = 56 + SCORE_COLUMNS * 4
	let COLUMN = TOTAL_WIDTH / COLUMNS
	
	let CLAN_RANK_WIDTH = (showClanRanks ? COLUMN * 4 : 0)
	let CLAN_RANK_ICON_WIDTH = CLAN_RANK_WIDTH * 0.8
	let CLAN_RANK_X = x + CLAN_RANK_WIDTH / 2
	x += CLAN_RANK_WIDTH
	
	let CLAN_NAME_WIDTH = (showClanRanks ? COLUMN * 16 : COLUMN * 20)
	let CLAN_NAME_X = x + CLAN_NAME_WIDTH / 2
	x += CLAN_NAME_WIDTH
	
	let PLAYER_WIDTH = COLUMN * (COLUMNS - 40)
	let PLAYER_X = x
	x += PLAYER_WIDTH
	
	let CLAN_SCORE_WIDTH = COLUMN * 20
	let CLAN_SCORE_X = x + CLAN_SCORE_WIDTH / 2
	
	let PLAYER_COLUMNS = 16 + 4 * SCORE_COLUMNS
	let PLAYER_COLUMN = PLAYER_WIDTH / PLAYER_COLUMNS
	x = 0
	
	let PLAYER_NAME_WIDTH = PLAYER_COLUMN * 10
	let PLAYER_NAME_X = x + PLAYER_NAME_WIDTH / 2
	x += PLAYER_NAME_WIDTH
	
	let PLAYER_FLAG_WIDTH = PLAYER_COLUMN * 3
	let PLAYER_FLAG_ICON_WIDTH = PLAYER_HEIGHT * 0.6 * (needsPngFlags ? (4.25 / 3) : (4 / 3))
	let PLAYER_FLAG_ICON_HEIGHT = PLAYER_HEIGHT * 0.6
	let PLAYER_FLAG_X = x + PLAYER_FLAG_WIDTH / 2
	x += PLAYER_FLAG_WIDTH
	
	let PLAYER_SCORE_WIDTH = PLAYER_COLUMN * 4// PLAYER_WIDTH / PLAYER_SUBDIV * (4 * SCORE_COLUMNS)
	let PLAYER_SCORE_X = x + PLAYER_SCORE_WIDTH / 2// PLAYER_WIDTH / PLAYER_SUBDIV * (13.5 + (2 * SCORE_COLUMNS))
	x += PLAYER_SCORE_WIDTH * SCORE_COLUMNS
	
	let PLAYER_RANK_WIDTH = PLAYER_COLUMN * 3
	let PLAYER_RANK_X = x + PLAYER_RANK_WIDTH / 2
	let PLAYER_RANK_ICON_WIDTH = PLAYER_HEIGHT * 0.8
	x += PLAYER_RANK_WIDTH
	
	let PLAYER_PENALTY_WIDTH = PLAYER_COLUMN * 3.1
	let PLAYER_PENALTY_X = x + (PLAYER_COLUMN * 3) - PLAYER_COLUMN * 1.5
	
	// Calculate and sort clan scores
	clans.map(clan => Object.assign(clan, { score: clan.players.reduce((accum, p) => accum + p.totalScore, 0) + clan.penalty }))
	clans.map(clan => Object.assign(clan, { scoreWithoutPenalties: clan.players.reduce((accum, p) => accum + p.totalScoreWithoutPenalties, 0) }))
	clans.sort((a, b) => b.score - a.score)
	clans.forEach(clan => clan.players.sort((a, b) => b.totalScoreWithoutPenalties - a.totalScoreWithoutPenalties))
	
	// Calculate clan colors
	for (let c = 0; c < clans.length; c++)
	{
		let clan = clans[c]
		
		clan.fontColor = c % 2 == 0 ? style.color1 : style.color2
	}
	
	// Join all players into an array
	let players = []
	clans.forEach(clan => clan.players.forEach(player => players.push(player)))
	players.sort((a, b) => b.totalScore - a.totalScore)
	
	let hasAnyFlags = false
	players.forEach(p => hasAnyFlags |= (p.flag != null && p.flag != ""))
	
	if (!hasAnyFlags)
	{
		PLAYER_NAME_X += PLAYER_COLUMN * 1.5
		PLAYER_NAME_WIDTH += PLAYER_COLUMN * 3
	}
	
	// Load flag images
	let loadImage = (id, src) =>
	{
		let img = document.getElementById(id)
		if (img == null)
		{
			allFlagsLoaded = false
			let img = document.createElement("img")
			img.setAttribute("crossOrigin", "anonymous")
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
			
			allFlagsLoaded &= loadImage("imgFlag_" + player.flag.toLowerCase(),
				needsPngFlags ?
				("https://raw.githubusercontent.com/hjnilsson/country-flags/master/png100px/" + src + ".png") :
				("https://lipis.github.io/flag-icon-css/flags/4x3/" + src + ".svg"))
		}
	}
	
	if (!allFlagsLoaded)
		queueRefresh()
	
	// Load rank images
	let rankSrcs =
	[
		window.location.href.substr(0, window.location.href.lastIndexOf("/")) + "/assets/" + style.icon + ".png"
	]
	
	let allRanksLoaded = true
	for (let rankSrc of rankSrcs)
	for (let i = 0; i < rankSrcs.length; i++)
		allRanksLoaded &= loadImage("imgRank" + (i + 1), rankSrcs[i])
	
	if (!allRanksLoaded)
		queueRefresh()
	
	// Calculate clan rankings
	for (let p = 0; p < clans.length; p++)
	{
		if (p > 0 && clans[p].score == clans[p - 1].score)
			clans[p].ranking = clans[p - 1].ranking
		else
			clans[p].ranking = p + 1
	}
	
	// Calculate player rankings
	let lowestRanking = 1
	for (let p = 0; p < players.length; p++)
	{
		if (p > 0 && players[p].totalScore == players[p - 1].totalScore)
			players[p].ranking = players[p - 1].ranking
		else
			players[p].ranking = p + 1
		
		lowestRanking = players[p].ranking
	}
	
	// Calculate layout
	clans.forEach(clan => clan.h = Math.max(1, clan.players.length + (clan.penalty != 0 ? 1 : 0)) * PLAYER_HEIGHT)
	
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
			!document.fonts.check("300 1em Roboto") ||
			!document.fonts.check("900 1em Roboto")
		
		if (fontsMissing)
		{
			let text = "ƒšяαボ"
			
			ctx.font = "900 " + "30px Roboto"
			ctx.fillStyle = "#ffffff"
			ctx.fillText(text, 0, 0)
			ctx.font = "300 " + "30px Roboto"
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
	let totalScore = clans.reduce((accum, clan) => accum + clan.scoreWithoutPenalties, 0)
	totalElem.innerHTML = "Total Points: " + totalScore
	
	let raceNum = totalScore / raceScores[players.length]
	if (gamedata.gamemode == "mk8d")
	{
		if (raceScores[players.length] > 0)
		{
			if (Math.floor(raceNum) == raceNum)
				raceStr = "    •    " + Math.floor(raceNum) + " race" + (raceNum > 1 ? "s" : "")
			else
			{
				let nextWholeRaceNum = Math.ceil(raceNum)
				let missingPoints = (raceScores[players.length] * nextWholeRaceNum) - totalScore
				
				warningElem.innerHTML =
					"<br>⚠ Doesn't look like a proper result! Did someone disconnect? ⚠<br>" +
					"(Missing " + missingPoints + " point" + (missingPoints > 1 ? "s" : "") + " for " + nextWholeRaceNum + " race" + (nextWholeRaceNum > 1 ? "s" : "") + ")"
					
				flashWarning()
			}
		}
	}
	
	ctx.font = "300 " + (HEADER_HEIGHT * 0.65) + "px Roboto"
	ctx.textBaseline = "middle"
	ctx.fillStyle = "#ffffff"
	ctx.textAlign = "center"
	
	ctx.fillText(dateStr + "    •    " + style.name + raceStr, TOTAL_WIDTH / 2, HEADER_HEIGHT / 2, TOTAL_WIDTH)
	let imgRank = document.getElementById("imgRank1")
	if (imgRank != null && imgRank.imgLoaded == true)
	{
		let imgW = 32 * (imgRank.naturalWidth / imgRank.naturalHeight)
		ctx.drawImage(imgRank, 40 + imgW / 2, HEADER_HEIGHT / 2 - 32 / 2, imgW, 32)
	}
	
	let calcClanTagSize = (clan) => Math.floor(Math.min(clan.h * 1.5, CLAN_SCORE_WIDTH * 0.35))
	let calcClanScoreSize = (clan) => Math.floor(Math.min(clan.h * 1.5, CLAN_SCORE_WIDTH * 0.35))
	
	// Get clan tag widths
	let maxClanTagWidth = 0
	for (let clan of clans)
	{
		ctx.save()
		ctx.font = "300 " + calcClanTagSize(clan) + "px Roboto"
		ctx.textAlign = "center"
		ctx.textBaseline = "middle"
		ctx.fillStyle = "#000000"
		
		clan.tagWidth = 0
		
		if (clan.tag != null)
			clan.tagWidth = Math.min(ctx.measureText(clan.tag).width, CLAN_NAME_WIDTH - 20)
		
		maxClanTagWidth = Math.max(maxClanTagWidth, clan.tagWidth)
		ctx.restore()
	}
	
	// Draw clans
	for (let clan of clans)
	{
		ctx.save()
		ctx.translate(0, clan.y)
		
		ctx.fillStyle = "#111"
		ctx.fillRect(0, -CLAN_MARGIN_HEIGHT, TOTAL_WIDTH, clan.h + 1 + CLAN_MARGIN_HEIGHT * 2)
		
		ctx.save()
		ctx.fillStyle = "#333"
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
		
		
		if (clan.players.length > 1)//(clan.h > PLAYER_HEIGHT)
		{
			ctx.save()
			ctx.font = "300 " + calcClanScoreSize(clan) + "px Roboto"
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.fillStyle = clan.fontColor
			
			ctx.translate(CLAN_SCORE_X, 0)
			ctx.fillText(clan.score.toString(), 0, clan.h / 2, CLAN_SCORE_WIDTH - 20)
			ctx.restore()
			
			ctx.save()
			ctx.font = "300 " + calcClanTagSize(clan) + "px Roboto"
			ctx.textAlign = "center"
			ctx.textBaseline = "middle"
			ctx.fillStyle = clan.fontColor
			if (clan.tag != null)
				ctx.fillText(clan.tag, CLAN_NAME_X, clan.h / 2, CLAN_NAME_WIDTH - 20)
			
			if (clan.name != null)
			{
				ctx.font = "300 " + Math.floor(calcClanTagSize(clan) * 0.25) + "px Roboto"
				ctx.fillText(clan.name, CLAN_NAME_X, clan.h / 2 + calcClanTagSize(clan) * 0.8, CLAN_NAME_WIDTH - 20)
			}
			ctx.restore()
			
			if (showClanRanks)
			{
				ctx.save()
				if (clan.ranking <= 3)
				{
					let imgRank = document.getElementById("imgRank" + clan.ranking)
					if (imgRank != null && imgRank.imgLoaded == true)
						ctx.drawImage(imgRank, (CLAN_NAME_X - maxClanTagWidth / 2) / 2 - CLAN_RANK_ICON_WIDTH / 2, clan.h / 2 - CLAN_RANK_ICON_WIDTH / 2, CLAN_RANK_ICON_WIDTH, CLAN_RANK_ICON_WIDTH)
				}
				else
				{			
					let rankStr = clan.ranking + "th"
					
					ctx.fillStyle = clan.fontColor
					ctx.globalAlpha = 0.6
					ctx.font = "300 " + (PLAYER_HEIGHT * 0.95 * 0.6) + "px Roboto"
					ctx.textAlign = "center"
					ctx.textBaseline = "middle"
					ctx.fillText(rankStr, (CLAN_NAME_X - maxClanTagWidth / 2) / 2, clan.h / 2, CLAN_RANK_WIDTH)
				}
				ctx.restore()
			}
		}
			
		
		for (let p = 0; p < clan.players.length; p++)
		{
			let player = clan.players[p]
			
			ctx.save()
			ctx.translate(PLAYER_X, clan.h / 2 + (-clan.players.length / 2 + p - (clan.penalty != 0 ? 0.5 : 0)) * PLAYER_HEIGHT)
			
			ctx.save()
			ctx.fillStyle = "#000"
			ctx.globalAlpha = 0.4
			ctx.roundRect(0, 2, PLAYER_WIDTH, PLAYER_HEIGHT - 4, 5)
			ctx.fill()
			ctx.restore()
			
			ctx.font = "300 " + (PLAYER_HEIGHT * 0.65) + "px Roboto"
			ctx.textBaseline = "middle"
			ctx.fillStyle = clan.fontColor
			ctx.textAlign = "center"
			
			ctx.save()
			ctx.translate(PLAYER_NAME_X, 0)
			ctx.scale(0.95, 1)
			ctx.fillText(player.name, 0, PLAYER_HEIGHT / 2, PLAYER_NAME_WIDTH)
			ctx.restore()
			
			ctx.save()
			{			
				let rankStr = player.ranking + "th"
				if (player.ranking == 1) rankStr = "1st"
				if (player.ranking == 2) rankStr = "2nd"
				if (player.ranking == 3) rankStr = "3rd"
				
				ctx.fillStyle = "#ffffff"
				ctx.globalAlpha = 1
				ctx.font = "300 " + (PLAYER_HEIGHT * 0.65 * 0.6) + "px Roboto"
				ctx.fillText(rankStr, PLAYER_RANK_X, PLAYER_HEIGHT / 2, PLAYER_RANK_WIDTH)
			}
			ctx.restore()
			
			if (player.flag != null)
			{
				let flagElem = document.getElementById("imgFlag_" + player.flag.toLowerCase())
				if (flagElem != null && flagElem.imgLoaded == true)
				{
					//ctx.fillRect(PLAYER_FLAG_X - PLAYER_FLAG_ICON_WIDTH / 2 - 2, PLAYER_HEIGHT / 2 - PLAYER_FLAG_ICON_HEIGHT / 2 - 2, PLAYER_FLAG_ICON_WIDTH + 4, PLAYER_FLAG_ICON_HEIGHT + 4)
					ctx.drawImage(flagElem, PLAYER_FLAG_X - PLAYER_FLAG_ICON_WIDTH / 2, PLAYER_HEIGHT / 2 - PLAYER_FLAG_ICON_HEIGHT / 2, PLAYER_FLAG_ICON_WIDTH, PLAYER_FLAG_ICON_HEIGHT)
				}
			}
			
			if (SCORE_COLUMNS > 1)
			{
				for (let i = 0; i < player.gpScores.length; i++)
				{
					ctx.save()
					ctx.translate(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * i, 0)
					ctx.font = "300 " + (PLAYER_HEIGHT * 0.55) + "px Roboto"
					ctx.fillStyle = clan.fontColor
					ctx.globalAlpha = 0.8
					ctx.fillText(player.gpScores[i].toString(), 0, PLAYER_HEIGHT / 2, PLAYER_SCORE_WIDTH)
					ctx.restore()
					
					if (i > 0)
					{
						ctx.save()
						ctx.fillStyle = "#444"
						ctx.globalAlpha = 0.3
						ctx.fillRect(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * (i - 0.5) - 1, PLAYER_HEIGHT / 2 - PLAYER_HEIGHT * 0.4, 2, PLAYER_HEIGHT * 0.8)
						ctx.restore()
					}
					
				}
			}
			
			if (SCORE_COLUMNS > 1)
			{
				ctx.save()
				ctx.fillStyle = "#444"
				ctx.globalAlpha = 0.3
				ctx.fillRect(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * (SCORE_COLUMNS - 1 - 0.5) - 1, 2, PLAYER_SCORE_WIDTH, PLAYER_HEIGHT - 4)
				ctx.restore()
			}
			
			ctx.save()
			ctx.translate(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * (SCORE_COLUMNS - 1), 0)
			ctx.font = "300 " + (PLAYER_HEIGHT * 0.65) + "px Roboto"
			ctx.fillStyle = clan.fontColor
			ctx.fillText(player.totalScoreWithoutPenalties.toString(), 0, PLAYER_HEIGHT / 2, PLAYER_SCORE_WIDTH)
			ctx.restore()
			
			if (player.penalties < 0)
			{
				ctx.save()
				ctx.translate(PLAYER_PENALTY_X, 0)
				ctx.font = "300 " + (PLAYER_HEIGHT * 0.45) + "px Roboto"
				ctx.fillStyle = clan.fontColor
				ctx.textAlign = "center"
				ctx.fillText("(" + player.penalties.toString() + ")", 0, PLAYER_HEIGHT / 2, PLAYER_PENALTY_WIDTH)
				ctx.restore()
			}
			
			ctx.restore()
		}
		
		if (clan.penalty != 0)
		{
			ctx.save()
			ctx.translate(PLAYER_X, clan.h / 2 + (clan.players.length / 2 - (clan.penalty != 0 ? 0.5 : 0)) * PLAYER_HEIGHT)
			
			ctx.save()
			ctx.fillStyle = rgbToHex(hsvToRgb(clan.hue, clan.saturation, 0.6))
			ctx.globalAlpha = 0.4
			ctx.roundRect(30, 2 + 5, PLAYER_WIDTH - 60, PLAYER_HEIGHT - 10, 5)
			ctx.fill()
			ctx.restore()
			
			ctx.font = "300 " + (PLAYER_HEIGHT * 0.45) + "px Roboto"
			ctx.textBaseline = "middle"
			ctx.fillStyle = clan.fontColor
			ctx.textAlign = "center"
			
			ctx.save()
			ctx.translate(PLAYER_NAME_X, 0)
			ctx.fillText("Penalty", 0, PLAYER_HEIGHT / 2 + 2, PLAYER_NAME_WIDTH)
			ctx.restore()
			
			ctx.save()
			ctx.translate(PLAYER_SCORE_X + PLAYER_SCORE_WIDTH * (SCORE_COLUMNS - 1), 0)
			ctx.font = "300 " + (PLAYER_HEIGHT * 0.45) + "px Roboto"
			ctx.fillStyle = clan.fontColor
			ctx.fillText(clan.penalty.toString(), 0, PLAYER_HEIGHT / 2 + 2, PLAYER_SCORE_WIDTH)
			ctx.restore()
			
			ctx.restore()
		}
		
		ctx.restore()
	}
	
	for (let c = 0; c < clans.length - 1; c++)
	{
		let clan = clans[c]
		
		let barY = clan.y + clan.h + CLAN_MARGIN_HEIGHT
		
		ctx.fillStyle = "#000"
		ctx.globalAlpha = 0.5
		ctx.beginPath()
		ctx.rect(55, barY - 2, TOTAL_WIDTH - 180, 4)
		ctx.fill()
		
		ctx.globalAlpha = 1
		
		ctx.font = "300 " + (PLAYER_HEIGHT * 0.75) + "px Roboto"
		ctx.textBaseline = "middle"
		ctx.fillStyle = "#fff"
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
	
	s = Math.max(0, Math.min(1, s))
	
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


function rgbToHsv(r, g, b)
{
	r /= 255
	g /= 255
	b /= 255

	let max = Math.max(r, g, b)
	let min = Math.min(r, g, b)
	let h = max
	let s = max
	let v = max

	let d = max - min
	s = max == 0 ? 0 : d / max

	if (max == min)
		h = 0
	else
	{
		switch (max)
		{
			case r: h = (g - b) / d + (g < b ? 6 : 0); break
			case g: h = (b - r) / d + 2; break
			case b: h = (r - g) / d + 4; break
		}

		h /= 6
	}

	return { h, s, v }
}


function rgbToHex(r, g, b)
{
	if (g == undefined)
		return rgbToHex(r.r, r.g, r.b)
	
    return "#" + ((1 << 24) + (Math.floor(r) << 16) + (Math.floor(g) << 8) + Math.floor(b)).toString(16).slice(1)
}


function hexToRgb(str)
{
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(str)
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null
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

function getURLQueryParameter(name)
{
	var url = window.location.search;
	
	name = name.replace(/[\[\]]/g, "\\$&");
	
	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
	var results = regex.exec(url);
	
	if (!results)
		return null;
	
	if (!results[2])
		return "";
	
	return decodeURIComponent(results[2].replace(/\+/g, " "));
}