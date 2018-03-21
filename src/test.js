let tests =
[
	{ src: "samples/sample (1).jpg",  expectedNames: ["ボノドゾゴォ","ざじずぜぞごげぐぎが","きしちにぴみりをあか","vƒ◆Yoshi-ぇ","[WUT]BenC★","Gamer Bro","[WUT]Jack","BRUC€ U","Maadi","Maadi","",""] },
	{ src: "samples/sample (2).jpg",  expectedNames: ["BL★Clarf♪","BL★Lorenzi","Nuru","Karii","tony28esco","D4","Hjortur","Player","Matthew","donglekang","Spaghetti","flapjacks"] },
	{ src: "samples/sample (5).jpg",  expectedNames: ["BL★Lorenzi","Dαγ","cafe","Ð¥◎アルフレド","BL★x² - UP","もぐ","らいらい♪","2nd!ひいらぎ","*.*","RomanDogg","ひ","☆Sal☆"] },
	{ src: "samples/sample (9).jpg",  expectedNames: ["ßεαst","IWant2Die","BL · Fox04k","GoBowserJr","BL★Lorenzi","BL 3-UP","PARMESAN","AU★Shii","Coco","Zeeker","pavel","James"] },
	{ src: "samples/sample (11).jpg", expectedNames: ["ze espurr","Red","Princess","BL★Lorenzi","Kimberly","Shelby","Mituo","オクト☆パスタ♪","Pauly P","JackAttack","",""] },
	{ src: "samples/sample (13).jpg", expectedNames: ["xı SHARK","xı GunShow","xı cynda","xı Kurumi","xı pyrus","ARC WOR A","ARC 【ケヴィン】","ARC Charly","ARC Sayan","ARC〃Jaкe","ARC hope","xı f"] },
	{ src: "samples/sample (15).jpg", expectedNames: ["Aλεξ","soepita","はるっち","こうすけ","いけめん","ちゅーりっぷ","ジャグラー","まんじですけど","てんしんらんまん","わたあめ","S★みく","りんゴ"] },
	{ src: "samples/sample (16).jpg", expectedNames: ["msv Pyrax","msv L.","msvLALINEA","ÐVP Twonk","msv Mars","ÐVP egirls","ÐVPolice","msv d","ÐVP Ayano","ÐVP Talent","msv◇ Bry","ÐVP Enel"] },
	{ src: "samples/sample (17).jpg", expectedNames: ["BL pb&j","м¢ brandon","BL Civil","м¢Bullseye","BL 3-UP","м¢★J","м¢ Leon","BL パップ","м¢ Squidz","м¢ DARKEEE","BL★Comic","BL"] },
	{ src: "samples/sample (51).jpg", expectedNames: ["Infinity.R","Infinity.ロ","Infinity.v","すーはーとるみかいし","てつやまん","Infinity.B","Dr.マシリト","Infinity.ア","ゆうにや","Infinity*ク","Mimi*Lunar","あらぶるとくも"] },
	{ src: "samples/sample (52).jpg", expectedNames: ["Ejy*Berry","Ejy*Kerry","3★LostLove","カオスなみつを","3★Lorenzi","カオスなチェリー","わくわく♪なおや","カオスなLiz","Ejy*Merry","3★KitKat","わくわくゆたか","わくわく♪ビートル"] },
	{ src: "samples/sample (53).jpg", expectedNames: ["iD Thimo","iD★Jουβακ","iD 3-UP","iD☆rubyy","iD j♪","И>Borjilet","И☆Aketx☆","{И}Kabkal","И★ *rams*","И★BooSnow","",""] },
]


let table = null
let testNum = 0
let testsCompleted = 0
let testsScore = 0


function beginTests(input)
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
		worker.onmessage = (ev) => addResult(ev.data)
		workers.push(worker)
	}
	
	testNum = 0
	testsCompleted = 0
	
	for (let test of tests)
	{
		ImageHelper.fromSrc(test.src, (img) => testImage(workers, table, img, test.expectedNames))
	}
	
	refreshInfo()
}


function testImage(workers, table, img, expectedNames)
{
	img = img.stretchTo(1280, 720)
	
	let players = img.extractPlayers(false)
	for (let p = 0; p < players.length; p++)
	{
		testNum += 1
		workers[p % workers.length].postMessage({ kind: "name", img: players[p], nameGlyphs: nameGlyphs, userdata: { expected: expectedNames[p] } })
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


function addResult(data)
{
	testsCompleted += 1
	
	let compareRecognized = data.name.replace(/ /g, "")
	let compareExpected = data.userdata.expected.replace(/ /g, "")
	
	let maxLen = Math.max(compareRecognized.length, compareExpected.length)
	let score = (maxLen == 0 ? 1 : 1 - levenshteinDistance(compareRecognized, compareExpected) / maxLen)
	
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
	span1.innerHTML = "[" + (score * 100).toFixed(2) + "%] " + data.name
	td2.appendChild(span1)
	tr.appendChild(td2)
	table.appendChild(tr)
	
	canvas.onclick = () =>
	{
		console.log("\"" + data.name + "\"")
		let worker = new Worker("src/worker_name.js")
		worker.postMessage({ kind: "name", img: imgOriginal, debug: true, nameGlyphs: nameGlyphs })
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