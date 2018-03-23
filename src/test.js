let table = null
let testNum = 0
let testsCompleted = 0
let testsScore = 0


function beginTests(kind)
{
	let div = document.getElementById("divTable")
	
	while (div.firstChild)
		div.removeChild(div.firstChild)
	
	table = document.createElement("table")
	div.appendChild(table)
	
	let workers = []
	for (let i = 0; i < 6; i++)
	{
		let worker = new Worker("src/worker_name.js")
		worker.onmessage = (ev) => addResult(ev.data, kind)
		workers.push(worker)
	}
	
	testNum = 0
	testsCompleted = 0
	testsScore = 0
	
	for (let sample of samples)
	{
		ImageHelper.fromSrc(sample.src, (img) => testImage(workers, table, img, sample, kind))
	}
	
	refreshInfo()
}


function testImage(workers, table, img, sample, kind)
{
	img = img.stretchTo(1280, 720)
	
	switch (kind)
	{
		case "name":
			let players = img.extractPlayers(false)
			for (let p = 0; p < players.length; p++)
			{
				testNum += 1
				workers[p % workers.length].postMessage({ kind: "name", img: players[p], nameGlyphs: nameGlyphs, userdata: { expected: sample.names[p] } })
			}
			break
			
		case "score":
			let scores = img.extractScores(false)
			for (let p = 0; p < scores.length; p++)
			{
				testNum += 1
				workers[p % workers.length].postMessage({ kind: "score", img: scores[p], scoreGlyphs: scoreGlyphs, userdata: { expected: sample.scores[p] } })
			}
			break
	}
}


function levenshteinDistance(s, t)
{
	// From https://stackoverflow.com/questions/11919065/sort-an-array-by-the-levenshtein-distance-with-best-performance-in-javascript
    var d = []

    var n = s.length
    var m = t.length

    if (n == 0) return m
    if (m == 0) return n

    for (var i = n; i >= 0; i--)
		d[i] = []

    for (var i = n; i >= 0; i--)
		d[i][0] = i
	
    for (var j = m; j >= 0; j--)
		d[0][j] = j

    for (var i = 1; i <= n; i++)
	{
        var s_i = s.charAt(i - 1)

        for (var j = 1; j <= m; j++)
		{
            if (i == j && d[i][j] > 4)
				return n

            var t_j = t.charAt(j - 1);
            var cost = (s_i == t_j) ? 0 : 1

            var mi = d[i - 1][j] + 1
            var b = d[i][j - 1] + 1
            var c = d[i - 1][j - 1] + cost

            if (b < mi)
				mi = b
			
            if (c < mi)
				mi = c

            d[i][j] = mi

            if (i > 1 && j > 1 && s_i == t.charAt(j - 2) && s.charAt(i - 2) == t_j)
                d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + cost)
        }
    }

    return d[n][m]
}


function addResult(data, kind)
{
	testsCompleted += 1
	
	let score = 0
	let str = ""
	
	switch (kind)
	{
		case "name":
		{
			let compareRecognized = data.name.replace(/ /g, "")
			let compareExpected = data.userdata.expected.replace(/ /g, "")
			
			let maxLen = Math.max(compareRecognized.length, compareExpected.length)
			score = (maxLen == 0 ? 1 : 1 - levenshteinDistance(compareRecognized, compareExpected) / maxLen)
			str = data.name
			break
		}
		
		case "score":
		{
			score = (data.score == data.userdata.expected) ? 1 : 0
			str = data.score.toString()
			break
		}
	}
	
	testsScore += score
	refreshInfo()
	
	let img = Object.assign(new ImageHelper(), data.img)
	let imgOriginal = Object.assign(new ImageHelper(), data.imgOriginal)
	
	let tr = document.createElement("tr")
	
	let td1 = document.createElement("td")
	let canvas = img.makeCanvas()
	td1.appendChild(canvas)
	tr.appendChild(td1)
	
	let td2 = document.createElement("td")
	let span1 = document.createElement("span")
	span1.style.backgroundColor = rgbToHex(255 - score * 255, score * 230, 120)
	span1.style.fontSize = "2em"
	span1.innerHTML = "[" + (score * 100).toFixed(2) + "%] " + str
	td2.appendChild(span1)
	tr.appendChild(td2)
	table.appendChild(tr)
	
	switch (kind)
	{
		case "name":
			canvas.onclick = () =>
			{
				console.log("\"" + data.name + "\"")
				let worker = new Worker("src/worker_name.js")
				worker.postMessage({ kind: "name", img: imgOriginal, debug: true, nameGlyphs: nameGlyphs })
			}
			break
			
		case "score":
			canvas.onclick = () =>
			{
				console.log("\"" + data.score + "\"")
				let worker = new Worker("src/worker_name.js")
				worker.postMessage({ kind: "score", img: imgOriginal, debug: true, scoreGlyphs: scoreGlyphs })
			}
			break
	}
}


function rgbToHex(r, g, b)
{
	return "#" + (0x1000000 + Math.floor(r) * 0x10000 + Math.floor(g) * 0x100 + Math.floor(b)).toString(16).substring(1)
}


function refreshInfo()
{
	let div = document.getElementById("divInfo")
	
	div.innerHTML =
		"Completed: " + testsCompleted + "/" + testNum + "<br>" +
		"Score: " + testsScore.toFixed(2) + "/" + testsCompleted + " (" + (testsScore / testsCompleted * 100).toFixed(2) + "%)"
}