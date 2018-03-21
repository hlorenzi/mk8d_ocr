class ImageHelper
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
		let image = new ImageHelper()
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
		
		let image = new ImageHelper()
		image.imageData = ctx.getImageData(0, 0, img.width, img.height)
		
		return image
	}
	
	
	static fromCanvas(canvas)
	{
		let ctx = canvas.getContext("2d")
		ctx.drawImage(canvas, 0, 0, canvas.width, canvas.height)
		
		let image = new ImageHelper()
		image.imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
		
		return image
	}
	
	
	toJsonBinarized()
	{
		let str = "ImageHelper.fromJsonBinarized("
		str += this.imageData.width + ", "
		str += this.imageData.height + ", "
		str += "["
		
		let pixelNum = this.imageData.width * this.imageData.height
		let curState = false
		let curRunLength = 0
		let groups = 0
		
		for (let i = 0; i < pixelNum; i++)
		{
			if (this.imageData.data[i * 4 + 0] != (curState ? 255 : 0))
			{
				if (groups > 0)
					str += ","
				
				str += curRunLength.toString()
				
				curState = !curState
				curRunLength = 0
				groups += 1
			}
			
			curRunLength += 1
		}
		
		return str + "])"
	}
	
	
	static fromJsonBinarized(w, h, data)
	{
		let array = new Uint8ClampedArray(w * h * 4)
		let curState = 0
		let curPixel = 0
		for (let runLength of data)
		{
			for (let i = 0; i < runLength; i++)
			{
				let addr = curPixel * 4
				array[addr + 0] = curState
				array[addr + 1] = curState
				array[addr + 2] = curState
				array[addr + 3] = 255
				
				curPixel += 1
			}
			
			curState = (curState == 0 ? 255 : 0)
		}
		
		while (curPixel < w * h)
		{
			let addr = curPixel * 4
			array[addr + 0] = curState
			array[addr + 1] = curState
			array[addr + 2] = curState
			array[addr + 3] = 255
			
			curPixel += 1
		}
		
		let image = new ImageHelper()
		image.imageData = new ImageData(array, w, h)
		
		image.createCache()
		return image
	}
	
	
	toJson()
	{
		let str = "ImageHelper.fromJson("
		str += this.imageData.width + ", "
		str += this.imageData.height + ", "
		str += "["
		
		let pixelNum = this.imageData.width * this.imageData.height
		for (let i = 0; i < pixelNum; i++)
		{
			if (i > 0)
				str += ","
			
			str += this.imageData.data[i * 4 + 0] + ","
			str += this.imageData.data[i * 4 + 1] + ","
			str += this.imageData.data[i * 4 + 2]
		}
		
		return str + "])"
	}
	
	
	static fromJson(w, h, data)
	{
		let array = new Uint8ClampedArray(w * h * 4)
		
		for (let i = 0; i < w * h; i++)
		{
			array[i * 4 + 0] = data[i * 3 + 0]
			array[i * 4 + 1] = data[i * 3 + 1]
			array[i * 4 + 2] = data[i * 3 + 2]
			array[i * 4 + 3] = 255
		}
		
		let image = new ImageHelper()
		image.imageData = new ImageData(array, w, h)
		
		image.createCache()
		return image
	}
	
	
	clone()
	{
		let array = new Uint8ClampedArray(this.imageData.width * this.imageData.height * 4)
		
		for (let i = 0; i < this.imageData.width * this.imageData.height * 4; i++)
			array[i] = this.imageData.data[i]
		
		let image = new ImageHelper()
		image.imageData = new ImageData(array, this.imageData.width, this.imageData.height)
		
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
		
		return ImageHelper.fromCanvas(canvasAfter)
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
		
		let image = new ImageHelper()
		image.imageData = ctx.getImageData(0, 0, w, h)
		
		return image
	}
	
	
	letterbox(xTop, yTop, w, h)
	{
		let canvas = document.createElement("canvas")
		canvas.width = w
		canvas.height = h
		
		let ctx = canvas.getContext("2d")
		ctx.fillStyle = "black"
		ctx.fillRect(0, 0, w, h)
		ctx.putImageData(this.imageData, xTop, yTop)
		
		let image = new ImageHelper()
		image.imageData = ctx.getImageData(0, 0, w, h)
		
		return image
	}
	
	
	detectTrophyScreen()
	{
		let region = this.extractRegion(0, 0, 250, 20)
		let isRed = region.wholeImageProximity(220, 0, 0)
		
		return isRed > 0.9
	}
	
	
	extractPlayers(cache = true)
	{
		let players = []
		
		if (this.detectTrophyScreen())
		{
			for (let i = 0; i < 12; i++)
				players.push(this.extractRegion(150, 133 + 42 * i, 275, 34))
			
			for (let i = 0; i < 12; i++)
				players[i] = players[i].stretchTo(250, 31)
			
			for (let i = 0; i < 12; i++)
			{
				let isYellow = players[i].wholeImageProximity(241, 220, 15)
				
				if (isYellow > 0.7)
					players[i].binarize(77, 85, 64, 0.7)
				else
					players[i].binarize(202, 195, 187, 0.85)
			}
			
			for (let i = 0; i < 12; i++)
				players[i] = players[i].letterbox(0, 7, 275, 43)
		}
		else
		{
			for (let i = 0; i < 12; i++)
				players.push(this.extractRegion(680, 52 + 52 * i, 275, 43))
			
			for (let i = 0; i < 12; i++)
			{
				let isYellow = players[i].wholeImageProximity(241, 220, 15)
				
				if (isYellow > 0.7)
					players[i].binarize(77, 85, 64, 0.8)
				else
					players[i].binarize(255, 255, 255, 0.7)
			}
		}
		
		if (cache)
			for (let i = 0; i < 12; i++)
				players[i].createCache()
		
		return players
	}
	
	
	extractScores(cache = true)
	{
		let scores = []
		
		if (this.detectTrophyScreen())
		{
			for (let i = 0; i < 12; i++)
				scores.push(this.extractRegion(501, 133 + 42 * i, 86, 34))
			
			for (let i = 0; i < 12; i++)
				scores[i] = scores[i].stretchTo(71, 28)
			
			for (let i = 0; i < 12; i++)
			{
				let isYellow = scores[i].wholeImageProximity(241, 220, 15)
				
				if (isYellow > 0.7)
					scores[i].binarize(77, 85, 64, 0.7)
				else
					scores[i].binarize(202, 195, 187, 0.85)
			}
			
			for (let i = 0; i < 12; i++)
				scores[i] = scores[i].letterbox(21, 10, 92, 43)
		}
		else
		{
			for (let i = 0; i < 12; i++)
				scores.push(this.extractRegion(1126, 52 + 52 * i, 92, 43))
			
			for (let i = 0; i < 12; i++)
			{
				let isYellow = scores[i].wholeImageProximity(241, 220, 15)
				
				if (isYellow > 0.7)
					scores[i].binarize(77, 85, 64, 0.7)
				else
					scores[i].binarize(255, 255, 255, 0.7)
			}
		}
		
		if (cache)
			for (let i = 0; i < 12; i++)
				scores[i].createCache()
		
		return scores
	}
	
	
	extractFlags()
	{
		let flags = []
		
		if (this.detectTrophyScreen())
		{
			for (let i = 0; i < 12; i++)
				flags.push(ImageHelper.fromJsonBinarized(42, 28, []))
		}
		else
		{
			for (let i = 0; i < 12; i++)
				flags.push(this.extractRegion(958, 60 + 52 * i, 42, 28))
		}
		
		return flags
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
			result += ImageHelper.colorProximity(
				r, g, b,
				this.imageData.data[i * 4 + 0],
				this.imageData.data[i * 4 + 1],
				this.imageData.data[i * 4 + 2])
		}
		
		return result / (this.imageData.width * this.imageData.height)
	}
	
	
	binarize(r, g, b, threshold)
	{
		for (let i = 0; i < this.imageData.width * this.imageData.height; i++)
		{
			let factor = ImageHelper.colorProximity(
				r, g, b,
				this.imageData.data[i * 4 + 0],
				this.imageData.data[i * 4 + 1],
				this.imageData.data[i * 4 + 2])
			
			let binary = factor > threshold ? 255 : 0
			
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
		
		for (let layer = 0; layer <= 4; layer++)
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
					return layer + (layer > 0 ? step / layer : 0)
				}
			}
		}
		
		return 100
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
	
	
	getRegionFilling(xMin, yMin, w, h, divide = true)
	{
		let result = 0
		for (let y = 0; y < h; y++)
			for (let x = 0; x < w; x++)
				result += this.getBinaryPixel(x + xMin, y + yMin) ? 1 : 0
				
		return result / (divide ? (w * h) : 1)
	}
	
	
	scoreGlyph(glyph, xPen, forNames = true, debug = false)
	{
		/*let glyphMaxDist = 0
		let glyphAvgDist = 0
		let glyphAvgDistCount = 0
		
		for (let y = 0; y < glyph.data.imageData.height; y++)
		{
			for (let x = 0; x < glyph.data.imageData.width; x++)
			{
				if (!glyph.data.getBinaryPixel(x, y))
					continue
				
				let dist = this.getNearestBinaryPixel(xPen + x, y, xPen, 0, this.imageData.width, this.imageData.height)
				//this.cacheNearestBinaryPixel[y][xPen + x] //
				
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
		
		let truncateHalfNum = 4
		
		targetDists.sort()
		let targetAvgDistTruncated = 0
		for (let i = truncateHalfNum; i < targetDists.length - truncateHalfNum; i++)
			targetAvgDistTruncated += targetDists[i] / (targetDists.length - truncateHalfNum * 2)*/
		
		let nextColumn = this.cacheNextFilledColumn[xPen + 2] //this.findNextBinaryColumn(xPen + glyph.data.imageData.width - 2, false)
		let nextEmptyColumn = this.cacheNextEmptyColumn[xPen + glyph.data.imageData.width] //this.findNextBinaryColumn(xPen + glyph.data.imageData.width - 2, false)
		let endColumn = this.cacheNextFilledColumn[xPen + glyph.data.imageData.width + 4] //this.findNextBinaryColumn(xPen + glyph.data.imageData.width + 4, true)
		let prevColumn = this.cachePrevFilledColumn[xPen + glyph.data.imageData.width + 1] //this.findPreviousBinaryColumn(xPen + glyph.data.imageData.width + 1, true)
		
		if (forNames && (nextColumn == null || prevColumn == null))
			return null
		
		if (forNames && (nextColumn - xPen < 2 || (endColumn == null && prevColumn - xPen < 2)))
			return null
		
		if (forNames && (nextEmptyColumn == null || nextEmptyColumn - xPen > 80))
			return null
		
		let estimatedWidthDiff = Math.abs((nextEmptyColumn - xPen) - glyph.data.imageData.width)
		let estimatedWidthBonus = 1 / (estimatedWidthDiff + 1)
		
		let wrongColumns = 0
		for (let x = xPen; x < xPen + glyph.data.imageData.width; x++)
			wrongColumns += Math.abs(this.cacheColumnFilling[x] - glyph.data.cacheColumnFilling[x - xPen])
		
		if (glyph.data.imageData.width < 5)
			wrongColumns = 0
		else
			wrongColumns /= glyph.data.imageData.width
		
		let nonMatchingPixels = 0
		let glyphDistanceSum = 0
		let glyphDistanceMax = 0
		let glyphPixelNum = 0
		let targetDistanceSum = 0
		let targetDistanceNum = 0
		let targetDistanceMax = 0
		let targetPixelNum = 0
		for (let y = 0; y < this.imageData.height; y++)
		{
			for (let x = 0; x < glyph.data.imageData.width; x++)
			{
				if (glyph.data.cacheNearestBinaryPixel[y][x] == 0)
				{
					glyphPixelNum += 1
					
					let distance = this.cacheNearestBinaryPixel[y][x + xPen]
					glyphDistanceSum += distance
					glyphDistanceMax = Math.max(glyphDistanceMax, distance)
				}
				
				if (this.cacheNearestBinaryPixel[y][x + xPen] == 0)
				{
					targetPixelNum += 1
					
					let distance = glyph.data.cacheNearestBinaryPixel[y][x]
					targetDistanceSum += distance
					targetDistanceNum += 1
					targetDistanceMax = Math.max(targetDistanceMax, distance)
				}
					
				if ((this.cacheNearestBinaryPixel[y][x + xPen] <= 1) ^ (glyph.data.cacheNearestBinaryPixel[y][x] <= 1))
					nonMatchingPixels += 1
			}
		}
		
		let score = 0
		if (forNames)
		{
			let scoreParts =
			[
				-Math.pow(glyphDistanceMax <= 1 ? 0 : glyphDistanceMax, 1.5) * 5,
				-glyphDistanceSum / (glyphPixelNum * 0.1),
				-glyphDistanceSum * 0.05,
				-Math.pow(targetDistanceMax <= 1 ? 0 : targetDistanceMax, 1.5) * 10,
				-(targetDistanceSum / targetDistanceNum) * 25,
				-targetDistanceSum * 0.1,
				-nonMatchingPixels * 0.05,
				+(glyph.data.imageData.width < 8 ? -5 + (glyph.data.imageData.width * 0.5) : 20 + (glyph.data.imageData.width - 8) * 0.5),
				+estimatedWidthBonus * 19,
				(glyph.data.imageData.width < 8 && estimatedWidthBonus < 0.5) ? -10 : 0,
				(glyph.data.imageData.width < 8 && estimatedWidthBonus > 0.5) ? 10 : 0,
				glyphPixelNum * 0.075,
			]
			
			scoreParts.forEach(s => score += s)
			
			
			/*score += 1 / (glyphAvgDist + 1) / (glyphAvgDist + 1)
			score += 1 / (targetAvgDistTruncated + 1) / (targetAvgDistTruncated + 1) / (targetAvgDistTruncated + 1)
			score -= Math.pow(2, glyphMaxDist) * 0.205
			score -= Math.pow(3, targetMaxDist) * 0.2025
			score += estimatedWidthBonus
			//score *= 1 + glyph.data.imageData.width / 100
			score -= wrongColumns * 5
			score += Math.min(15, glyph.data.imageData.width) * 0.25*/
			
			/*score = glyph.data.imageData.width
			score /= (glyphMaxDist + 1)
			score /= (glyphMaxDist + 1)
			score /= (targetMaxDist + 1)
			score /= (targetMaxDist + 1)*/
			
			if (debug)
				console.log(
					"x(" + xPen.toString().padStart(3) + ") " +
					"\"" + glyph.c + "\" " +
					"score(" + score.toFixed(5).padStart(8) + ") " +
					"width(" + glyph.data.imageData.width.toString().padStart(2) + ") " +
					"glyphPixels(" + glyphPixelNum.toString().padStart(3) + ") " +
					"targetPixels(" + targetPixelNum.toString().padStart(3) + ") " +
					"glyphDist max(" + glyphDistanceMax.toFixed(2).padStart(6) + ") sum(" + glyphDistanceSum.toFixed(2).padStart(6) + ") " +
					"targetDist max(" + targetDistanceMax.toFixed(2).padStart(6) + ") sum(" + targetDistanceSum.toFixed(2).padStart(6) + ") avg(" + (targetDistanceSum / targetDistanceNum).toFixed(2).padStart(6) + ") " +
					"nonMatch(" + nonMatchingPixels.toFixed(2).padStart(6) + ") " +
					"wrongCols(" + wrongColumns.toFixed(2).padStart(6) + ") " +
					"estWidthDiff(" + estimatedWidthDiff + ") | " +
					"scores(" + scoreParts.map(s => s.toFixed(2).padStart(6)).join(",") + ")")
		}
		else
		{
			score = 1
			score /= (glyphDistanceMax + 1)
			score /= (targetDistanceMax + 1)
			score /= (targetDistanceMax + 1)
		}
		
		/*if (debug)
			console.log(
				"x(" + xPen.toString().padStart(3) + ") " +
				"\"" + glyph.c + "\" " +
				"score(" + score.toFixed(5).padStart(8) + ") " +
				"wrongCols(" + wrongColumns.toFixed(2).padStart(6) + ") " +
				"estWidth(" + estimatedWidthBonus + ") " +
				"{ maxDist(" + glyphMaxDist.toFixed(2).padStart(6) + ") avgDist(" + glyphAvgDist.toFixed(2).padStart(6) + ") } " +
				"target { maxDist(" + targetMaxDist.toFixed(2).padStart(6) + ") avgDist(" + targetAvgDist.toFixed(2).padStart(6) + ") avgDistTrunc(" + targetAvgDistTruncated.toFixed(2).padStart(6) + ") }")
		*/
		
		return score
	}
	
	
	disambiguateGlyphI(x, w, debug = false)
	{
		let width = 1
		for (let y = 0; y < this.imageData.height; y++)
			width = Math.max(width, this.getRegionFilling(x, y, w, 1, false))
		
		let smallISep =
			this.getRegionFilling(x, 17, w, 1, false) < Math.ceil(width / 2) ||
			this.getRegionFilling(x, 18, w, 1, false) < Math.ceil(width / 2) ||
			this.getRegionFilling(x, 19, w, 1, false) < Math.ceil(width / 2)
			
		let smallDotlessITittle =
			this.getRegionFilling(x, 12, w, 1, false) == 0 &&
			this.getRegionFilling(x, 13, w, 1, false) == 0 &&
			this.getRegionFilling(x, 14, w, 1, false) == 0 &&
			this.getRegionFilling(x, 15, w, 1, false) == 0
			
		let exclamationSep =
			this.getRegionFilling(x, 27, w, 1, false) < Math.ceil(width / 2) ||
			this.getRegionFilling(x, 28, w, 1, false) < Math.ceil(width / 2)
			
		if (debug)
		{
			console.log(
				"width(" + width + ") " +
				"smallISep(" + smallISep + ") " +
				"smallDotlessITittle(" + smallDotlessITittle + ") " +
				"exclamationSep(" + exclamationSep + ")")
		}
			
		if (exclamationSep && !smallISep)
			return "!"
			
		if (smallISep && smallDotlessITittle)
			return "ı"
		
		if (smallISep)
			return "i"
		
		return "l"
	}
	
	
	scoreFlag(flag, debug = false)
	{
		let result = 0
		for (let y = 0; y < this.imageData.height; y++)
		{
			for (let x = 0; x < this.imageData.width; x++)
			{
				let index = (y * this.imageData.width + x) * 4
				
				result += ImageHelper.colorProximity(
					this.imageData.data[index + 0],
					this.imageData.data[index + 1],
					this.imageData.data[index + 2],
					flag.data.imageData.data[index + 0],
					flag.data.imageData.data[index + 1],
					flag.data.imageData.data[index + 2])
			}
		}
		
		let score = result / (this.imageData.width * this.imageData.height)
		
		if (debug)
			console.log(
				"\"" + flag.c + "\" " +
				"score(" + score.toFixed(5).padStart(8) + ")")
			
		return score
	}
	
	
	recognizePlayer(debug = false)
	{
		this.createCache()
		
		let str = ""
		let x = 0
		while (true)
		{
			if (debug)
				console.log("\n\n\n\n")
			
			let scores = []
			
			for (let skip = -1; skip <= 1; skip++)
			{
				let xBegin = this.findNextBinaryColumn(x + skip, true)
				if (xBegin == null)
					break
				
				for (let glyph of nameGlyphs)
				{
					if (glyph.skip)
						continue
					
					let score = this.scoreGlyph(glyph, xBegin + skip, true)
					if (score == null)
						continue
					
					scores.push({ x: xBegin + skip, glyph: glyph, score: score })
				}
			}
			
			if (scores.length == 0)
				break
			
			scores.sort((a, b) => b.score - a.score)
			
			if (debug)
			{
				console.log(scores)
				for (let g = 0; g < 10; g++)
					this.scoreGlyph(scores[g].glyph, scores[g].x, true, true)
			}
			
			let chosen = scores[0]
			if (debug)
				console.log("Chosen: " + chosen.glyph.c)
			
			if (chosen.x - x > 6)
				str += " "
			
			let c = chosen.glyph.c
			if (c == "l" || c == "i" || c == "I" || c == "!" || c == "ı")
				c = this.disambiguateGlyphI(chosen.x, chosen.glyph.data.imageData.width, debug)
			
			str += c
			
			/*for (let x = 0; x < this.imageData.width; x++)
			{
				if (!this.getBinaryPixel(x, 13))
					this.setPixel(x, 13, 255, 0, 0)
				
				if (!this.getBinaryPixel(x, 31))
					this.setPixel(x, 31, 255, 0, 0)
			}*/
			
			for (let y = 0; y < this.imageData.height; y++)
				for (let xp = 0; xp < chosen.glyph.data.imageData.width; xp++)
				{
					if (chosen.glyph.data.getBinaryPixel(xp, y))
					{
						if (this.getBinaryPixel(chosen.x + xp, y))
							this.setPixel(chosen.x + xp, y, 0, 0, 255)
						else
							this.setPixel(chosen.x + xp, y, 255, 0, 255)
					}
					else
					{
						if (this.getBinaryPixel(chosen.x + xp, y))
							this.setPixel(chosen.x + xp, y, 255, 0, 0)
					}
				}
			
			for (let y = 0; y < this.imageData.height; y++)
			{
				if (!this.getBinaryPixel(chosen.x, y))
					this.setPixel(chosen.x, y, 0, 0, 255)
			}
			
			x = chosen.x + chosen.glyph.data.imageData.width + 1
		}
		
		let isUppercase = (c) =>
		{
			if (c == null)
				return false
			
			c = c.charCodeAt(0)
			
			return c >= "A".charCodeAt(0) && c <= "Z".charCodeAt(0)
		}
		
		let replaceChar = (str, index, c) =>
		{
			return str.substr(0, index) + c + str.substr(index + c.length)
		}
		
		for (let i = 0; i < str.length; i++)
		{
			let c = str[i]
			if (c != "l" && c != "I")
				continue
			
			let prev = (i > 0 ? str[i - 1] : null)
			let next = (i < str.length - 1 ? str[i + 1] : null)
			
			if ((c == "l" && prev == null) ||
				(isUppercase(prev) && isUppercase(next)))
				str = replaceChar(str, i, "I")
		}
		
		return str
	}
	
	
	recognizeScore()
	{
		this.createCache()
		
		let value = 0
		let x = this.imageData.width - 18 * 5
		while (x < this.imageData.width)
		{
			//console.log("\n\n\n\n")
			
			let regionFilling = this.getRegionFilling(x, 0, 18, this.imageData.height)
			if (regionFilling > 0.01)
			{
				let scores = []
				for (let disp = 0; disp <= 1; disp++)
				{
					for (let glyph of scoreGlyphs)
					{
						let score = this.scoreGlyph(glyph, x + disp, false)
						if (score == null)
							continue
						
						scores.push({ x: x + disp, glyph: glyph, score: score })
					}
				}
				
				if (scores.length == 0)
					break
				
				scores.sort((a, b) => b.score - a.score)

				let chosen = scores[0]
				value = (value * 10) + (chosen.glyph.c.charCodeAt(0) - "0".charCodeAt(0))
				
				//console.log(chosen.glyph.c)
				
				for (let y = 0; y < this.imageData.height; y++)
				{
					if (!this.getBinaryPixel(chosen.x, y))
						this.setPixel(chosen.x, y, 0, 0, 255)
				}
			}
			
			x += 18
		}
		
		return value
	}
	
	
	recognizeFlag()
	{
		this.createCache()
		
		//console.log("\n\n\n\n")
		
		let scores = []
		for (let flag of flagData)
		{
			let score = this.scoreFlag(flag)
			if (score == null)
				continue
			
			scores.push({ flag: flag, score: score })
		}
		
		scores.sort((a, b) => b.score - a.score)
		
		if (scores.length == 0 || scores[0].score < 0.75)
		{
			return ""
		}
		
		let chosen = scores[0]
		return chosen.flag.c
	}
}