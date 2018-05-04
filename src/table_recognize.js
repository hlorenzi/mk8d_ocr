let working = false
let recognizedPlayers = []


function setup()
{
	document.onpaste = (event) =>
	{
		let items = (event.clipboardData || event.originalEvent.clipboardData).items
		
		for (index in items)
		{
			let item = items[index]
			if (item.kind === "file")
			{
				let blob = item.getAsFile()
				let reader = new FileReader()
				reader.onload = (event) =>
					{ setImageFromSrc(event.target.result) }
					
				reader.readAsDataURL(blob)
				startWorking()
			}
		}
	}
}


function setImageFromFile(input)
{
	setImageFromSrc(inputGetImageSrc(input))
}


function setImageFromLink(input)
{
	if (input.value.includes("youtube"))
		setYoutubeVideo(input.value)
	else
		setImageFromSrc(input.value)
}


function setImageFromSrc(src)
{
	let div = document.getElementById("divTable")
	
	let workers = []
	for (let i = 0; i < 6; i++)
	{
		let worker = new Worker("src/worker_name.js")
		worker.onmessage = (ev) => addResult(ev.data)
		workers.push(worker)
	}
	
	startWorking()
	
	ImageHelper.fromSrc(src, (img) =>
	{
		if (img == null)
			working = false
		else
		{
			document.getElementById("inputLink").blur()
			recognizeImage(workers, div, img)
		}
	})
}


let ytPlayer = null
function setYoutubeVideo(url)
{
	if (ytPlayer != null)
		return
	
	console.log("yt")
	console.log(ytPlayer)
	document.getElementById("inputLink").blur()
	
	let events = { }
	
	ytPlayer = new YT.Player("divVideo",
	{
		width: 1920 / 4,
		height: 1080 / 4,
		videoId: url.substr(url.indexOf("?v=") + 3),
		events:
		{
			"onReady": (ev) => events.onReady(ev),
			"onStateChange": (ev) => events.onStateChange(ev)
		}
	})
	
	console.log(ytPlayer)
	
	let handle = null
	
	events.onReady = (ev) =>
	{
		console.log("onReady")
		console.log(ev.target)
		ev.target.playVideo()
		ev.target.seekTo(6 * 60 + 13, true)
	}
	
	events.onStateChange = (ev) =>
	{
		console.log("onStateChange")
		console.log(ev.target)
		
		let time = !ev.target.getCurrentTime ? 0.0 : ev.target.getCurrentTime()
		console.log("state(" + ev.data + ") at " + time)
	}
}


let progressStep = 0
function setProgress(visible)
{
	let div = document.getElementById("divProgress")
	
	if (!visible)
		div.style.visibility = "hidden"
	else
	{
		div.style.visibility = "visible"
		div.innerHTML = "Working" + ".".repeat(progressStep)
		
		progressStep = (progressStep + 0.2) % 6
	}
}


function startWorking()
{
	if (!working)
	{
		working = true
		window.requestAnimationFrame(animateWorking)
	}
}


function animateWorking()
{
	if (working)
	{
		setProgress(true)
		window.requestAnimationFrame(animateWorking)
	}
	else
		setProgress(false)
}


function recognizeImage(workers, table, img)
{
	recognizedPlayers = []
	for (let i = 0; i < 12; i++)
		recognizedPlayers.push({ name: null, score: null, flag: null })
	
	refreshInputData()
	
	img = img.stretchTo(1280, 720)
	
	let canvas = document.getElementById("canvasInput")
	let ctx = canvas.getContext("2d")
	ctx.drawImage(img.makeCanvas(), 0, 0, 1280, 720)
	canvas.style.display = "block"
	
	let doneNum = 0
	
	for (let worker of workers)
	{
		worker.onmessage = (ev) =>
		{
			let index = ev.data.userdata.index
			
			doneNum += 1
			switch (ev.data.kind)
			{
				case "name":  recognizedPlayers[index].name  = ev.data.name; break
				case "score": recognizedPlayers[index].score = ev.data.score; break
				case "flag":  recognizedPlayers[index].flag  = ev.data.flag; break
			}
			
			refreshInputData()
			
			if (doneNum == 12 * 3)
			{
				working = false
				for (let worker of workers)
					worker.terminate()
			}
		}
	}
	
	let players = img.extractPlayers(false)
	let flags = img.extractFlags(false)
	let scores = img.extractScores(false)
	for (let p = 0; p < players.length; p++)
	{
		workers[p % workers.length].postMessage({ kind: "name",  img: players[p], nameGlyphs: nameGlyphs,   userdata: { index: p } })
		workers[p % workers.length].postMessage({ kind: "score", img: scores[p],  scoreGlyphs: scoreGlyphs, userdata: { index: p } })
		workers[p % workers.length].postMessage({ kind: "flag",  img: flags[p],   flagData: flagData,       userdata: { index: p } })
	}
}


function refreshInputData()
{
	let str = ""
	
	for (let player of recognizedPlayers)
	{
		let name = player.name || ""
		
		if (name.trim() == "")
			continue
		
		let score = ""
		if (player.score != null)
			score = player.score.toString()
		
		let flag = ""
		if (player.flag != null)
			flag = "[" + player.flag + "] "
		
		str += name + " " + flag + score.toString() + "\n"
	}
	
	document.getElementById("textareaData").value = str
	queueRefresh()
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