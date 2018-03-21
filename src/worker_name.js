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
			
			postMessage({ imgOriginal: img.clone(), img: img, kind: ev.data.kind, name: img.recognizePlayer(ev.data.debug), userdata: ev.data.userdata })
			break
		}
		
		case "score":
		{
			scoreGlyphs = ev.data.scoreGlyphs
			for (let i = 0; i < scoreGlyphs.length; i++)
				scoreGlyphs[i].data = Object.assign(new ImageHelper(), scoreGlyphs[i].data)
			
			postMessage({ img: img, kind: ev.data.kind, score: img.recognizeScore(), userdata: ev.data.userdata })
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