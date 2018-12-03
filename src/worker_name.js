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
			
			let names = []
			names.push(img.recognizePlayer(ev.data.debug))
			
			if (names[0].confidence <= 0)
			{
				for (let y = -3; y <= 3; y++)
				{
					if (y == 0)
						continue
					
					names.push(img.displace(0, y).recognizePlayer(ev.data.debug))
				}
			}
			
			names.sort((a, b) => b.confidence - a.confidence)
			
			if (ev.data.debug)
				console.log("Recognition attempts:")
			
			if (ev.data.debug)
				for (let name of names)
					console.log("-- " + name.str + " (confidence: " + name.confidence + ")")
						
			postMessage({ imgOriginal: img.clone(), img: img, kind: ev.data.kind, name: names[0].str, userdata: ev.data.userdata })
			break
		}
		
		case "score":
		{
			for (let i = 0; i < scoreGlyphs.length; i++)
				scoreGlyphs[i].data = Object.assign(new ImageHelper(), scoreGlyphs[i].data)
			
			postMessage({ imgOriginal: img.clone(), img: img, kind: ev.data.kind, score: img.recognizeScore(ev.data.debug), userdata: ev.data.userdata })
			break
		}
		
		case "flag":
		{
			for (let i = 0; i < flagData.length; i++)
				flagData[i].data = Object.assign(new ImageHelper(), flagData[i].data)
			
			postMessage({ img: img, kind: ev.data.kind, flag: img.recognizeFlag(), userdata: ev.data.userdata })
			break
		}
	}
}