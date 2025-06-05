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
		
		img.onerror = () =>
		{
			if (onload != null)
				onload(null)
		}
		
		img.setAttribute("crossOrigin", "anonymous")
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
	
	
	static empty(w, h)
	{
		let array = new Uint8ClampedArray(w * h * 4)
		
		for (let i = 0; i < w * h; i++)
		{
			array[i * 4 + 0] = 0
			array[i * 4 + 1] = 0
			array[i * 4 + 2] = 0
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
		x = Math.floor(x)
		y = Math.floor(y)
		if (x < 0 || y < 0 || x >= this.imageData.width || y >= this.imageData.height)
			return false

		return this.imageData.data[(y * this.imageData.width + x) * 4] != 0
	}
	
	
	getPixel(x, y)
	{
		if (x < 0 || y < 0 || x >= this.imageData.width || y >= this.imageData.height)
			return { r: 0, g: 0, b: 0, a: 0 }
		
		let index = (y * this.imageData.width + x)
		return {
			r: this.imageData.data[index * 4 + 0],
			g: this.imageData.data[index * 4 + 1],
			b: this.imageData.data[index * 4 + 2],
			a: this.imageData.data[index * 4 + 3]
		}
	}
	
	
	setPixel(x, y, r, g, b, a = 255)
	{
		if (x < 0 || y < 0 || x >= this.imageData.width || y >= this.imageData.height)
			return
		
		let index = (y * this.imageData.width + x)
		this.imageData.data[index * 4 + 0] = r
		this.imageData.data[index * 4 + 1] = g
		this.imageData.data[index * 4 + 2] = b
		this.imageData.data[index * 4 + 3] = a
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
	
	
	displace(xTop, yTop)
	{
		let newImage = this.clone()
		
		for (let y = 0; y < this.imageData.height; y++)
			for (let x = 0; x < this.imageData.width; x++)
				newImage.setPixel(x, y, 0, 0, 0, 255)
		
		for (let y = 0; y < this.imageData.height; y++)
		{
			for (let x = 0; x < this.imageData.width; x++)
			{
				let fromPixel = this.getPixel(x, y)
				newImage.setPixel(xTop + x, yTop + y, fromPixel.r, fromPixel.g, fromPixel.b, 255)
			}
		}
		
		return newImage
	}
	
	
	detectTrophyScreen()
	{
		let region = this.extractRegion(0, 0, 250, 20)
		let isRed = region.wholeImageProximity(220, 0, 0)
		
		return isRed > 0.9
	}
	
	
	detectOnlineRace()
	{
		let region1 = this.extractRegion(1144, 615, 5, 5)
		let isWhite1 = region1.wholeImageProximity(255, 255, 255)
		
		let region2 = this.extractRegion(1100, 615, 5, 5)
		let isWhite2 = region2.wholeImageProximity(255, 255, 255)
		
		return isWhite2 > isWhite1
	}
	
	
	findProbableLetterBase()
	{
		let heights = []
		for (let y = this.imageData.height - 5; y >= this.imageData.height / 3 * 2; y--)
			heights[y] = 0
		
		for (let x = 0; x < this.imageData.width; x++)
		{
			let y = this.imageData.height - 1
			while (y >= this.imageData.height / 2)
			{
				if (this.getBinaryPixel(x, y))
					break
				
				y--
			}
			
			if (y <= this.imageData.height / 2)
				continue
			
			heights[y]++
		}
		
		let maxCount = 0
		let result = 0
		for (let y = this.imageData.height - 5; y >= this.imageData.height / 3 * 2; y--)
		{
			//console.log("height[" + y + "] = " + heights[y])
			if (heights[y] > maxCount)
			{
				maxCount = heights[y]
				result = y
			}
		}
		
		//console.log("letterbase: " + result)
		return result
		
		/*let accum = 0
		let count = 0
		for (let y = this.imageData.height - 5; y >= this.imageData.height / 3 * 2; y--)
		{
			accum += y * heights[y]
			count += heights[y]
		}
		
		return Math.round(accum / count)*/
	}
	
	
	extractPlayers(cache = true)
	{
		let players = []

		if (this.detectOnlineRace())
		{
			for (let i = 0; i < 13; i++)
				players.push(this.extractRegion(1227, 54 + 77 * i, 380, 48))
			
		}
		else
		{
			for (let i = 0; i < 13; i++)
				players.push(this.extractRegion(1272, 54 + 77 * i, 380, 48))
			
		}
		
		for (let i = 0; i < players.length; i++)
		{
			let isYellow = players[i].regionProximity(0, 0, 170, 5, 255, 214, 32)
			
			if (false)//isYellow > 0.8)
				players[i].binarize(255, 255, 255, 0.8)
			else
				players[i].binarize(255, 255, 255, 0.7)
		}
		
		if (cache)
			for (let i = 0; i < players.length; i++)
				players[i].createCache()
		
		return players
	}
	
	
	extractScores(cache = true)
	{
		let scores = []
		
		if (this.detectOnlineRace())
		{
			for (let i = 0; i < 13; i++)
				scores.push(this.extractRegion(1725, 54 + 77 * i, 126, 48))
			
		}
		else
		{
			for (let i = 0; i < 13; i++)
				scores.push(this.extractRegion(1725, 54 + 77 * i, 90, 48))
			
		}
		
		for (let i = 0; i < scores.length; i++)
		{
			scores[i].binarize(255, 255, 255, 0.7)
		}
		
		if (cache)
			for (let i = 0; i < scores.length; i++)
				scores[i].createCache()
		
		return scores
	}


	extractPlayerGlyphs()
	{
		let glyphs = []

		let x = 0
		while (true)
		{
			let pBegin = this.findNextBinaryColumn(x, true, -0.1)
			if (pBegin == null)
				break

			let pixels = this.findConnectedRegion(pBegin.x, pBegin.y, 1, -0.1, 12)
			let charImage = this.extractPixels(pixels)
			if (charImage == null)
				break
			
			if (pBegin.x > x + 6 + 15)
				glyphs.push(null)

			glyphs.push(charImage)
			this.fillPixels(pixels, 0, 0, 0)

			x = pBegin.x + charImage.imageData.width - 15
		}

		return glyphs
	}


	extractScoreGlyphs()
	{
		let glyphs = []

		let x = 0
		while (true)
		{
			let pBegin = this.findNextBinaryColumn(x, true, 0)
			if (pBegin == null)
				break

			let pixels = this.findConnectedRegion(pBegin.x, pBegin.y, 1, 0, 40)
			let charImage = this.extractPixels(pixels)
			if (charImage == null)
				break

			glyphs.push(charImage)
			this.fillPixels(pixels, 0, 0, 0)
			
			x = pBegin.x + charImage.imageData.width - 15
		}

		return glyphs
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
	
	
	regionProximity(x1, y1, x2, y2, r, g, b)
	{
		let result = 0
		for (let yy = y1; yy < y2; yy++)
		for (let xx = x1; xx < x2; xx++)
		{
			let i = (yy * this.imageData.width + xx)
			
			result += ImageHelper.colorProximity(
				r, g, b,
				this.imageData.data[i * 4 + 0],
				this.imageData.data[i * 4 + 1],
				this.imageData.data[i * 4 + 2])
		}
		
		return result / ((x2 - x1) * (y2 - y1))
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


	dataIndex(x, y)
	{
		x = Math.floor(x)
		y = Math.floor(y)
		return (y * this.imageData.width + x) * 4
	}


	findConnectedRegion(x, y, initialRadius, slant = 0, lookUp = 0)
	{
		let seen = new Set()
		let pixelPositions = []
		let remaining = []

		for (let i = -initialRadius; i <= initialRadius; i++)
		for (let j = -initialRadius; j <= initialRadius; j++)
			remaining.push({ x: x + i, y: y + j })

		while (remaining.length > 0)
		{
			let p = remaining.pop()
			if (p.x < 0 || p.y < 0 || p.x >= this.imageData.width || p.y >= this.imageData.height)
				continue

			let key = this.dataIndex(p.x, p.y)
			if (seen.has(key))
				continue

			seen.add(key)

			if (this.getBinaryPixel(p.x, p.y))
			{
				pixelPositions.push(p)

				for (let i = 0; i <= 0; i++)
				for (let j = -lookUp; j < 0; j++)
					remaining.push({ x: p.x + i + Math.round(j * slant), y: p.y + j })

				for (let i = -1; i <= 1; i++)
				for (let j = -1; j <= 1; j++)
					remaining.push({ x: p.x + i, y: p.y + j })
			}
		}

		return pixelPositions
	}

	
	extractPixels(pixelPositions)
	{
		let xMin = 10000
		let yMin = 10000
		let xMax = -1
		let yMax = -1

		for (const p of pixelPositions)
		{
			xMin = Math.min(xMin, p.x)
			yMin = Math.min(yMin, p.y)
			xMax = Math.max(xMax, p.x)
			yMax = Math.max(yMax, p.y)
		}

		if (xMax < 0 ||
			yMax < 0 ||
			xMax - xMin <= 0 ||
			yMax - yMin <= 0)
			return null

		let region = ImageHelper.empty(xMax - xMin, this.imageData.height)//yMax - yMin)
		for (const p of pixelPositions)
		{
			let pixel = this.getPixel(p.x, p.y)
			region.setPixel(p.x - xMin, p.y, pixel.r, pixel.g, pixel.b, pixel.a)
		}

		return region
	}

	
	fillPixels(pixelPositions, r, g, b, a = 255)
	{
		for (const p of pixelPositions)
		{
			this.setPixel(p.x, p.y, r, g, b, a)
		}
	}


	thinOut(maxDist)
	{
		this.createCache()

		for (let y = 0; y < this.imageData.height; y++)
		{
			for (let x = 0; x < this.imageData.width; x++)
			{
				if (this.cacheDistanceToEdge[y][x] < maxDist)
					this.setPixel(x, y, 0, 0, 0)
			}
		}
	}
	
	
	findNextBinaryColumn(x, filled, slant = 0)
	{
		if (x == null || x < 0)
			x = 0
		
		while (x < this.imageData.width)
		{
			let columnFilled = false
			let filledY = 0
			
			for (let y = 0; y < this.imageData.height; y++)
			{
				if (this.getBinaryPixel(x + slant * y, y))
				{
					columnFilled = true
					filledY = y
					break
				}
			}
				
			if (filled == columnFilled)
				return { x, y: filledY }
			
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
	
	
	getNearestBinaryPixel(x, y, xMin, yMin, xMax, yMax, value)
	{
		let testPixel = (x, y) =>
		{
			if (x < xMin || x >= xMax || y < yMin || y >= yMax)
				return false
			
			return this.getBinaryPixel(x, y) === value
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
	
	
	getDistanceToEdge(x, y, xMin, yMin, xMax, yMax)
	{
		let value = this.getBinaryPixel(x, y)

		let testPixel = (x, y) =>
		{
			if (x < xMin || x >= xMax || y < yMin || y >= yMax)
				return true
			
			return this.getBinaryPixel(x, y) !== value
		}

		let dist = 100
		let searchDist = 4
		for (let i = -searchDist; i <= searchDist; i++)
		for (let j = -searchDist; j <= searchDist; j++)
		{
			if (testPixel(x + i, y + j))
				dist = Math.min(dist, Math.sqrt(i * i + j * j))
		}
		
		return dist
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
					this.getNearestBinaryPixel(x, y, 0, 0, this.imageData.width, this.imageData.height, true))
			}
		}
		
		this.cacheDistanceToEdge = []
		for (let y = 0; y < this.imageData.height; y++)
		{
			this.cacheDistanceToEdge.push([])
			for (let x = 0; x < this.imageData.width; x++)
			{
				this.cacheDistanceToEdge[y].push(
					this.getDistanceToEdge(x, y, 0, 0, this.imageData.width, this.imageData.height))
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
	
	
	scoreGlyph(glyph, debug = false)
	{
		let estimatedWidthDiff = Math.abs(this.imageData.width - glyph.data.imageData.width)
		let estimatedWidthBonus = 1 / (estimatedWidthDiff + 1)
		
		let totalPixels = 0
		let matchingPixels = 0
		let nonMatchingPixels = 0

		for (let y = 0; y < Math.max(glyph.data.imageData.height, this.imageData.height); y++)
		{
			for (let x = 0; x < Math.max(glyph.data.imageData.width, this.imageData.width); x++)
			{
				let dist1 = this.cacheDistanceToEdge[y][x]
				if (x < 0 || y < 0 || x >= this.imageData.width || y >= this.imageData.height)
					dist1 = 0

				let dist2 = glyph.data.cacheDistanceToEdge[y][x]
				if (x < 0 || y < 0 || x >= glyph.data.imageData.width || y >= glyph.data.imageData.height)
					dist2 = 0

				let factor = Math.min(4, Math.max(dist1, dist2))

				totalPixels += factor

				if (this.getBinaryPixel(x, y) === glyph.data.getBinaryPixel(x, y))
					matchingPixels += factor
				else
					nonMatchingPixels += factor
			}
		}
		
		let score =
			matchingPixels / totalPixels -
			nonMatchingPixels / totalPixels
		
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
	
	
	recognizeDigit(xPen, debug = false)
	{
		let scores = []
		
		for (let x = -1; x <= 3; x++)
		{
			let u   = this.getRegionFilling(x + xPen + 6,  16, 7, 3)
			let ul  = this.getRegionFilling(x + xPen + 3,  18, 3, 7)
			let ur  = this.getRegionFilling(x + xPen + 14, 18, 3, 7)
			let m   = this.getRegionFilling(x + xPen + 6,  25, 7, 3)
			let bl  = this.getRegionFilling(x + xPen + 3,  27, 3, 7)
			let br  = this.getRegionFilling(x + xPen + 14, 27, 3, 7)
			let b   = this.getRegionFilling(x + xPen + 6,  34, 7, 3)
			let one = this.getRegionFilling(x + xPen + 9,  18, 4, 14)
			
			let max = Math.max(u, ul, ur, m, bl, br, b, one)
			
			if (debug)
				console.log(
					"max: " + max.toFixed(2) + ", " +
					"segments: [" +
					" u: " + (u  .toFixed(2)) + ", " +
					"ul: " + (ul .toFixed(2)) + ", " +
					"ur: " + (ur .toFixed(2)) + ", " +
					" m: " + (m  .toFixed(2)) + ", " +
					"bl: " + (bl .toFixed(2)) + ", " +
					"br: " + (br .toFixed(2)) + ", " +
					" b: " + (b  .toFixed(2)) + ", " +
					" 1: " + (one.toFixed(2)) + "]")
					
			let has = (x) => x
			let not = (x) => 1 - x
			
			scores.push({ x: x, digit: 0, score: has(u) + has(ul) + has(ur) + not(m) + has(bl) + has(br) + has(b) + not(one) })
			scores.push({ x: x, digit: 1, score: not(u) + not(ul) + not(ur) + not(m) + not(bl) + not(br) + not(b) + has(one) - 1 })
			scores.push({ x: x, digit: 2, score: has(u) + not(ul) + has(ur) + has(m) + has(bl) + not(br) + has(b) + not(one) })
			scores.push({ x: x, digit: 3, score: has(u) + not(ul) + has(ur) + has(m) + not(bl) + has(br) + has(b) + not(one) })
			scores.push({ x: x, digit: 4, score: not(u) + has(ul) + has(ur) + has(m) + not(bl) + has(br) + not(b) + not(one) })
			scores.push({ x: x, digit: 5, score: has(u) + has(ul) + not(ur) + has(m) + not(bl) + has(br) + has(b) + not(one) })
			scores.push({ x: x, digit: 6, score: has(u) + has(ul) + not(ur) + has(m) + has(bl) + has(br) + has(b) + not(one) })
			scores.push({ x: x, digit: 7, score: has(u) + not(ul) + has(ur) + not(m) + not(bl) + has(br) + not(b) + not(one) })
			scores.push({ x: x, digit: 8, score: has(u) + has(ul) + has(ur) + has(m) + has(bl) + has(br) + has(b) + not(one) })
			scores.push({ x: x, digit: 9, score: has(u) + has(ul) + has(ur) + has(m) + not(bl) + has(br) + has(b) + not(one) })
		}
		
		scores.sort((a, b) => b.score - a.score)
		
		if (debug)
		{
			for (let entry of scores)
				console.log("x(" + entry.x.toString().padStart(2) + "), digit " + entry.digit + ", score: " + entry.score.toFixed(2).padStart(5))
		}
		
		return scores[0].digit
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
		let confidence = 0

		let chars = this.extractPlayerGlyphs()
		for (const char of chars)
		{
			if (char === null)
			{
				str += " "
				continue
			}

			let scores = []

			for (let glyph of nameGlyphs)
			{
				if (glyph.skip)
					continue
				
				let score = char.scoreGlyph(glyph, debug)
				if (score == null)
					continue
				
				scores.push({ glyph: glyph, score: score })
			}

			if (scores.length == 0)
				break
			
			scores.sort((a, b) => b.score - a.score)
			
			let chosen = scores[0]

			if (debug)
			{
				console.log("\n")
				console.log("chosen:", chosen.glyph.c)
				for (let i = 0; i < Math.min(10, scores.length); i++)
					console.log(scores[i].glyph.c, scores[i].score)
			}
			
			str += chosen.glyph.c
			confidence += (chosen.score)
		}
		
		return { str: str, confidence: confidence }
	}
	
	
	recognizeScore(debug = false)
	{
		this.createCache()
		
		let str = ""
		let confidence = 0

		let chars = this.extractScoreGlyphs()
		for (const char of chars)
		{
			if (char === null)
				continue

			let scores = []

			for (let glyph of scoreGlyphs)
			{
				if (glyph.skip)
					continue
				
				let score = char.scoreGlyph(glyph, debug)
				if (score == null)
					continue
				
				scores.push({ glyph: glyph, score: score })
			}

			if (scores.length == 0)
				break
			
			scores.sort((a, b) => b.score - a.score)
			
			let chosen = scores[0]

			if (debug)
			{
				console.log("\n")
				console.log("chosen:", chosen.glyph.c)
				for (let i = 0; i < Math.min(10, scores.length); i++)
					console.log(scores[i].glyph.c, scores[i].score)
			}
			
			str += chosen.glyph.c
			confidence += (chosen.score)
		}
		
		let value = parseInt(str)
		if (!isFinite(value))
			return 0

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