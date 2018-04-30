importScripts("image.js")


nameGlyphs = null
scoreGlyphs = null
flagData = null


onmessage = (ev) =>
{
	let img = Object.assign(new ImageHelper(), ev.data.img)
	
	if (ev.data.debug)
		console.log("Debugging started...")
	
	switch (ev.data.kind)
	{
		case "name":
		{
			nameGlyphs = ev.data.nameGlyphs
			for (let i = 0; i < nameGlyphs.length; i++)
				nameGlyphs[i].data = Object.assign(new ImageHelper(), nameGlyphs[i].data)
			
			
			if (ev.data.debug)
				console.log("Recognition attempts:")
			
			let names = []
			for (let y = -3; y <= 3; y++)
				names.push(img.displace(0, y).recognizePlayer(ev.data.debug))
			
			let bestConfidence = -10000
			let chosenName = null
			for (let name of names)
			{
				if (ev.data.debug)
					console.log("-- " + name.str + " (confidence: " + name.confidence + ")") 
				
				if (name.confidence > bestConfidence)
				{
					chosenName = name.str
					bestConfidence = name.confidence
				}
			}
			
			postMessage({ imgOriginal: img.clone(), img: img, kind: ev.data.kind, name: chosenName, userdata: ev.data.userdata })
			break
		}
		
		case "score":
		{
			scoreGlyphs = ev.data.scoreGlyphs
			for (let i = 0; i < scoreGlyphs.length; i++)
				scoreGlyphs[i].data = Object.assign(new ImageHelper(), scoreGlyphs[i].data)
			
			postMessage({ imgOriginal: img.clone(), img: img, kind: ev.data.kind, score: img.recognizeScore(ev.data.debug), userdata: ev.data.userdata })
			break
		}
		
		case "flag":
		{
			flagData = ev.data.flagData
			for (let i = 0; i < flagData.length; i++)
				flagData[i].data = Object.assign(new ImageHelper(), flagData[i].data)
			
			postMessage({ img: img, kind: ev.data.kind, flag: img.recognizeFlag(), userdata: ev.data.userdata })
			break
		}
	}
}