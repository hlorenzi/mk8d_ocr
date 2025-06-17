importScripts("image.js")
importScripts("nameGlyphs.js")
importScripts("scoreGlyphs.js")
importScripts("flags.js")


onmessage = (ev) =>
{
	let img = Object.assign(new ImageHelper(), ev.data.img)
	
	if (ev.data.debug)
		console.log("Debugging started...")
	
	switch (ev.data.kind)
	{
		case "name":
		{
			for (let i = 0; i < nameGlyphs.length; i++)
				nameGlyphs[i].data = Object.assign(new ImageHelper(), nameGlyphs[i].data)
			
			let letterBase = img.findProbableLetterBase()
			let letterBaseOffset = letterBase - 36
			
			let yDisplacements = new Set()
			for (let y = -2; y <= 2; y++)
				yDisplacements.add(y)
				
			for (let y = letterBaseOffset - 2; y <= letterBaseOffset + 2; y++)
				yDisplacements.add(y)

			let attempts = []
			for (let y of yDisplacements)
				attempts.push(img.displace(0, y).recognizePlayer(nameGlyphs, ev.data.debug))

			attempts.sort((a, b) => b.confidence - a.confidence)
			
			if (ev.data.debug)
			{
				console.log("Recognition attempts:")
				for (let attempt of attempts)
					console.log("-- " + attempt.str + " (confidence: " + attempt.confidence + ")")
			}
						
			postMessage({ img: img.clone(), kind: ev.data.kind, name: attempts[0].str, userdata: ev.data.userdata })
			break
		}
		
		case "score":
		{
			for (let i = 0; i < scoreGlyphs.length; i++)
				scoreGlyphs[i].data = Object.assign(new ImageHelper(), scoreGlyphs[i].data)

			let letterBase = img.findProbableLetterBase()
			let letterBaseOffset = letterBase - 37
			
			let yDisplacements = new Set()
			for (let y = -2; y <= 2; y++)
				yDisplacements.add(y)
				
			for (let y = letterBaseOffset - 2; y <= letterBaseOffset + 2; y++)
				yDisplacements.add(y)

			let attempts = []
			for (let y of yDisplacements)
				attempts.push(img.displace(0, y).recognizeScore(scoreGlyphs, ev.data.debug))

			attempts.sort((a, b) => b.confidence - a.confidence)
			
			if (ev.data.debug)
			{
				console.log("Recognition attempts:")
				for (let attempt of attempts)
					console.log("-- " + attempt.value + " (confidence: " + attempt.confidence + ")")
			}

			postMessage({ img: img.clone(), kind: ev.data.kind, score: attempts[0].value, userdata: ev.data.userdata })
			break
		}
	}
}