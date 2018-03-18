class ImageData
{
	constructor()
	{
		this.imageData = null
		this.cacheNearestBinaryPixel = null
		this.cacheNextFilledColumn = null
		this.cachePrevFilledColumn = null
		this.cacheNextEmptyColumn = null
		this.cacheColumnFilling = null
	}
	
	
	static fromSrc(src, onload)
	{
		let image = new ImageData()
		image.imageData = null
		
		let img = document.createElement("img")
		
		img.onload = () =>
		{
			let canvas = document.createElement("canvas")
			canvas.width = img.width
			canvas.height = img.height
			
			let ctx = canvas.getContext("2d")
			ctx.drawImage(img, 0, 0, img.width, img.height)
			image.imageData = ctx.getImageData(0, 0, img.width, img.height)
			
			if (onload != null)
				onload(image)
		}
		
		img.src = src
		
		return image
	}
	
	
	static fromImage(img)
	{
		let canvas = document.createElement("canvas")
		canvas.width = img.width
		canvas.height = img.height
		
		let ctx = canvas.getContext("2d")
		ctx.drawImage(img, 0, 0, img.width, img.height)
		
		let image = new ImageData()
		image.imageData = ctx.getImageData(0, 0, img.width, img.height)
		
		return image
	}
	
	
	static fromCanvas(canvas)
	{
		let ctx = canvas.getContext("2d")
		ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height)
		
		let image = new ImageData()
		image.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		
		return image
	}
	
	
	toJsonBinarized()
	{
		let str = "ImageData.fromJsonBinarized("
		str += this.imageData.width + ", "
		str += this.imageData.height + ", "
		str += "["
		
		let pixelNum = this.imageData.width * this.imageData.height
		for (let i = 0; i < pixelNum; i++)
		{
			if (i > 0)
				str += ","
			
			str += (this.imageData.data[i * 4 + 0] != 0) ? "1" : "0"
		}
		
		return str + "])"
	}
	
	
	static fromJsonBinarized(w, h, data)
	{
		let canvas = document.createElement("canvas")
		canvas.width = w
		canvas.height = h
		
		let ctx = canvas.getContext("2d")
		ctx.fillStyle = "#ffffff"
		ctx.fillRect(0, 0, w, h)
		
		let image = new ImageData()
		image.imageData = ctx.getImageData(0, 0, w, h)
		
		for (let i = 0; i < w * h; i++)
		{
			image.imageData.data[i * 4 + 0] = data[i] * 255
			image.imageData.data[i * 4 + 1] = data[i] * 255
			image.imageData.data[i * 4 + 2] = data[i] * 255
			image.imageData.data[i * 4 + 3] = 255
		}
		
		image.createCache()
		return image
	}
	
	
	getBinaryPixel(x, y)
	{
		return this.imageData.data[(y * this.imageData.width + x) * 4] != 0
	}
	
	
	setPixel(x, y, r, g, b)
	{
		let index = (y * this.imageData.width + x)
		this.imageData.data[index * 4 + 0] = r
		this.imageData.data[index * 4 + 1] = g
		this.imageData.data[index * 4 + 2] = b
	}
	
	
	stretchTo(w, h)
	{
		let canvasBefore = this.makeCanvas()
		
		let canvasAfter = document.createElement("canvas")
		canvasAfter.width = w
		canvasAfter.height = h
		
		let ctx = canvasAfter.getContext("2d")
		ctx.drawImage(canvasBefore, 0, 0, w, h)
		
		return ImageData.fromCanvas(canvasAfter)
	}
	
	
	makeCanvas()
	{
		let canvas = document.createElement("canvas")
		canvas.width = this.imageData.width
		canvas.height = this.imageData.height
		
		let ctx = canvas.getContext("2d")
		ctx.putImageData(this.imageData, 0, 0)
		
		return canvas
	}
	
	
	extractRegion(x, y, w, h)
	{
		let canvas = document.createElement("canvas")
		canvas.width = w
		canvas.height = h
		
		let ctx = canvas.getContext("2d")
		ctx.putImageData(this.imageData, -x, -y)
		
		let image = new ImageData()
		image.imageData = ctx.getImageData(0, 0, w, h)
		
		return image
	}
	
	
	extractPlayers()
	{
		let players = []
		for (let i = 0; i < 12; i++)
			players.push(this.extractRegion(680, 52 + 52 * i, 275, 43))
		
		for (let i = 0; i < 12; i++)
		{
			let isYellow = players[i].wholeImageProximity(241, 220, 15)
			
			if (isYellow > 0.7)
				players[i].binarize(77, 85, 64)
			else
				players[i].binarize(255, 255, 255)
		}
		
		for (let i = 0; i < 12; i++)
			players[i].createCache()
		
		return players
	}
	
	
	extractScores()
	{
		let scores = []
		for (let i = 0; i < 12; i++)
			scores.push(this.extractRegion(1126, 52 + 52 * i, 92, 43))
		
		for (let i = 0; i < 12; i++)
		{
			let isYellow = scores[i].wholeImageProximity(241, 220, 15)
			
			if (isYellow > 0.7)
				scores[i].binarize(77, 85, 64)
			else
				scores[i].binarize(255, 255, 255)
		}
		
		for (let i = 0; i < 12; i++)
			scores[i].createCache()
		
		return scores
	}
	
	
	static colorProximity(r1, g1, b1, r2, g2, b2)
	{
		let rFactor = Math.abs(r1 - r2) / 255
		let gFactor = Math.abs(g1 - g2) / 255
		let bFactor = Math.abs(b1 - b2) / 255
		
		return 1 - Math.max(0, Math.min(1, ((rFactor + gFactor + bFactor) / 3)))
	}
	
	
	wholeImageProximity(r, g, b)
	{
		let result = 0
		for (let i = 0; i < this.imageData.width * this.imageData.height; i++)
		{
			result += ImageData.colorProximity(
				r, g, b,
				this.imageData.data[i * 4 + 0],
				this.imageData.data[i * 4 + 1],
				this.imageData.data[i * 4 + 2])
		}
		
		return result / (this.imageData.width * this.imageData.height)
	}
	
	
	binarize(r, g, b)
	{
		for (let i = 0; i < this.imageData.width * this.imageData.height; i++)
		{
			let factor = ImageData.colorProximity(
				r, g, b,
				this.imageData.data[i * 4 + 0],
				this.imageData.data[i * 4 + 1],
				this.imageData.data[i * 4 + 2])
			
			let binary = factor > 0.7 ? 255 : 0
			
			this.imageData.data[i * 4 + 0] = binary
			this.imageData.data[i * 4 + 1] = binary
			this.imageData.data[i * 4 + 2] = binary
			this.imageData.data[i * 4 + 3] = 255
		}
	}
	
	
	compareBinary(other)
	{
		let result = 0
		for (let i = 0; i < this.imageData.width * this.imageData.height; i++)
			result += 1 - Math.abs(other.imageData.data[i * 4 + 0] - this.imageData.data[i * 4 + 0]) / 255
		
		return result / (this.imageData.width * this.imageData.height)
	}
	
	
	findNextBinaryColumn(x, filled)
	{
		if (x == null || x < 0)
			x = 0
		
		while (x < this.imageData.width)
		{
			let columnFilled = false
			
			for (let y = 0; y < this.imageData.height; y++)
			{
				if (this.getBinaryPixel(x, y))
				{
					columnFilled = true
					break
				}
			}
				
			if (filled == columnFilled)
				return x
			
			x += 1
		}
		
		return null
	}
	
	
	findPreviousBinaryColumn(x, filled)
	{
		while (x >= 0)
		{
			let columnFilled = false
			
			for (let y = 0; y < this.imageData.height; y++)
			{
				if (this.getBinaryPixel(x, y))
				{
					columnFilled = true
					break
				}
			}
				
			if (filled == columnFilled)
				return x
			
			x -= 1
		}
		
		return null
	}
	
	
	getNearestBinaryPixel(x, y, xMin, yMin, xMax, yMax)
	{
		let testPixel = (x, y) =>
		{
			if (x < xMin || x >= xMax || y < yMin || y >= yMax)
				return false
			
			return this.getBinaryPixel(x, y)
		}
		
		for (let layer = 0; layer <= 20; layer++)
		{
			for (let step = 0; step <= layer; step++)
			{
				if (testPixel(x - layer, y - step) ||
					testPixel(x - layer, y + step) ||
					testPixel(x + layer, y - step) ||
					testPixel(x + layer, y + step) ||
					testPixel(x - step, y - layer) ||
					testPixel(x + step, y - layer) ||
					testPixel(x - step, y + layer) ||
					testPixel(x + step, y + layer))
				{
					return layer * layer + (layer > 0 ? step / layer : 0)
				}
			}
		}
		
		return 10000
	}
	
	
	createCache()
	{
		if (this.cacheNearestBinaryPixel != null)
			return
		
		this.cacheNearestBinaryPixel = []
		for (let y = 0; y < this.imageData.height; y++)
		{
			this.cacheNearestBinaryPixel.push([])
			for (let x = 0; x < this.imageData.width; x++)
			{
				this.cacheNearestBinaryPixel[y].push(
					this.getNearestBinaryPixel(x, y, 0, 0, this.imageData.width, this.imageData.height))
			}
		}
		
		this.cacheNextFilledColumn = []
		this.cacheNextEmptyColumn = []
		this.cachePrevFilledColumn = []
		this.cacheColumnFilling = []
		for (let x = 0; x < this.imageData.width; x++)
		{
			this.cacheNextFilledColumn.push(this.findNextBinaryColumn(x, true))
			this.cacheNextEmptyColumn.push(this.findNextBinaryColumn(x, false))
			this.cachePrevFilledColumn.push(this.findPreviousBinaryColumn(x, true))
			this.cacheColumnFilling.push(this.getColumnFilling(x))
		}
	}
	
	
	getColumnFilling(x)
	{
		let filling = 0
		for (let y = 0; y < this.imageData.height; y++)
		{
			if (this.getBinaryPixel(x, y))
				filling += 1
		}
		
		return filling / this.imageData.height
	}
	
	
	getRegionFilling(xMin, yMin, w, h)
	{
		let result = 0
		for (let y = 0; y < h; y++)
			for (let x = 0; x < w; x++)
				result += this.getBinaryPixel(x + xMin, y + yMin) ? 1 : 0
				
		return result / (w * h)
	}
	
	
	scoreGlyph(glyph, xPen, forNames = true, debug = false)
	{
		let glyphMaxDist = 0
		let glyphAvgDist = 0
		let glyphAvgDistCount = 0
		
		for (let y = 0; y < glyph.data.imageData.height; y++)
		{
			for (let x = 0; x < glyph.data.imageData.width; x++)
			{
				if (!glyph.data.getBinaryPixel(x, y))
					continue
				
				let dist = this.cacheNearestBinaryPixel[y][xPen + x] //this.getNearestBinaryPixel(xPen + x, y, xPen, 0, this.imageData.width, this.imageData.height)
				
				glyphMaxDist = Math.max(glyphMaxDist, dist)
				glyphAvgDist += dist
				glyphAvgDistCount += 1
			}
		}
		
		if (glyphAvgDistCount > 0)
			glyphAvgDist /= glyphAvgDistCount
		
		
		let targetMaxDist = 0
		let targetAvgDist = 0
		let targetAvgDistCount = 0
		let targetDists = []
		
		for (let y = 0; y < glyph.data.imageData.height; y++)
		{
			for (let x = xPen; x < xPen + glyph.data.imageData.width; x++)
			{
				if (!this.getBinaryPixel(x, y))
					continue
				
				let dist = glyph.data.cacheNearestBinaryPixel[y][x - xPen] //glyph.data.getNearestBinaryPixel(x - xPen, y, 0, 0, glyph.data.imageData.width, glyph.data.imageData.height)
				
				targetMaxDist = Math.max(targetMaxDist, dist)
				targetAvgDist += dist
				targetAvgDistCount += 1
				
				targetDists.push(dist)
			}
		}
		
		if (targetAvgDistCount > 0)
			targetAvgDist /= targetAvgDistCount
		
		targetDists.sort()
		let targetAvgDistTruncated = 0
		for (let i = 10; i < targetDists.length - 10; i++)
			targetAvgDistTruncated += targetDists[i] / (targetDists.length - 20)
		
		let nextColumn = this.cacheNextFilledColumn[xPen + glyph.data.imageData.width - 2] //this.findNextBinaryColumn(xPen + glyph.data.imageData.width - 2, false)
		let endColumn = this.cacheNextFilledColumn[xPen + glyph.data.imageData.width + 4] //this.findNextBinaryColumn(xPen + glyph.data.imageData.width + 4, true)
		let prevColumn = this.cachePrevFilledColumn[xPen + glyph.data.imageData.width + 1] //this.findPreviousBinaryColumn(xPen + glyph.data.imageData.width + 1, true)
		
		if (forNames && (nextColumn == null || prevColumn == null))
			return null
		
		if (forNames && (nextColumn - xPen < 2 || (endColumn == null && prevColumn - xPen < 2)))
			return null
		
		let estimatedWidthBonus = nextColumn - xPen
		estimatedWidthBonus = Math.abs(estimatedWidthBonus - glyph.data.imageData.width)
		estimatedWidthBonus = (estimatedWidthBonus < 3 ? 2 : 0)
		
		let wrongColumns = 0
		for (let x = xPen; x < xPen + glyph.data.imageData.width; x++)
			wrongColumns += Math.abs(this.cacheColumnFilling[x] - glyph.data.cacheColumnFilling[x - xPen])
		
		if (glyph.data.imageData.width < 5)
			wrongColumns = 0
		else
			wrongColumns /= glyph.data.imageData.width
		
		let score = 0
		score += 1 / (glyphAvgDist + 1) / (glyphAvgDist + 1)
		score += 1 / (targetAvgDistTruncated + 1) / (targetAvgDistTruncated + 1)
		score -= glyphMaxDist * 0.05
		score -= targetMaxDist * 0.025
		score += estimatedWidthBonus
		score *= 1 + glyph.data.imageData.width / 100
		score -= wrongColumns * 5
		score += Math.min(15, glyph.data.imageData.width) * 0.05
		
		if (!forNames)
		{
			score /= (glyphMaxDist + 1) * 0.1
			score /= (targetMaxDist + 1) * 0.1
		}
		
		if (debug)
			console.log(
				"x(" + xPen.toString().padStart(3) + ") " +
				"\"" + glyph.c + "\" " +
				"score(" + score.toFixed(5).padStart(8) + ") " +
				"wrongCols(" + wrongColumns.toFixed(2).padStart(6) + ") " +
				"estWidth(" + estimatedWidthBonus + ") " +
				"{ maxDist(" + glyphMaxDist.toFixed(2).padStart(6) + ") avgDist(" + glyphAvgDist.toFixed(2).padStart(6) + ") } " +
				"target { maxDist(" + targetMaxDist.toFixed(2).padStart(6) + ") avgDist(" + targetAvgDist.toFixed(2).padStart(6) + ") avgDistTrunc(" + targetAvgDistTruncated.toFixed(2).padStart(6) + ") }")
			
		return score
	}
	
	
	*recognizePlayerIterable(resultObj)
	{
		let str = ""
		let x = 0
		while (true)
		{
			//console.log("\n\n\n\n")
			let scores = []
			
			for (let skip = -1; skip <= 1; skip++)
			{
				let xBegin = this.findNextBinaryColumn(x + skip, true)
				if (xBegin == null)
					break
				
				for (let glyph of nameGlyphs)
				{
					let score = this.scoreGlyph(glyph, xBegin + skip)
					if (score == null)
						continue
					
					if (skip < 0)
						score -= 0.03
					
					scores.push({ x: xBegin + skip, glyph: glyph, score: score })
				}
				
				yield null
			}
			
			if (scores.length == 0)
				break
			
			scores.sort((a, b) => b.score - a.score)
			
			if (false)
			{
				for (let g = 0; g < 10; g++)
					this.scoreGlyph(scores[g].glyph, scores[g].x, true)
			}
			
			let chosen = scores[0]
			
			if (chosen.x - x > 6)
				str += " "
			
			str += chosen.glyph.c
			
			for (let y = 0; y < this.imageData.height; y++)
			{
				if (!this.getBinaryPixel(chosen.x, y))
					this.setPixel(chosen.x, y, 0, 0, 255)
			}
			
			x = chosen.x + chosen.glyph.data.imageData.width + 1
			
			yield null
		}
		
		resultObj.name = str
	}
	
	
	*recognizeScoreIterable(resultObj)
	{
		let value = 0
		let x = this.imageData.width - 18 * 5
		while (x < this.imageData.width)
		{
			//console.log("\n\n\n\n")
			
			let regionFilling = this.getRegionFilling(x, 0, 18, this.imageData.height)
			if (regionFilling > 0.05)
			{
				let scores = []
				for (let glyph of scoreGlyphs)
				{
					let score = this.scoreGlyph(glyph, x, false)
					if (score == null)
						continue
					
					scores.push({ x: x, glyph: glyph, score: score })
				}
				
				if (scores.length == 0)
					break
				
				scores.sort((a, b) => b.score - a.score)

				let chosen = scores[0]
				value = (value * 10) + (chosen.glyph.c.charCodeAt(0) - "0".charCodeAt(0))
				
				for (let y = 0; y < this.imageData.height; y++)
				{
					if (!this.getBinaryPixel(chosen.x, y))
						this.setPixel(chosen.x, y, 0, 0, 255)
				}
			}
			
			x += 18
			
			yield null
		}
		
		resultObj.score = value
	}
}