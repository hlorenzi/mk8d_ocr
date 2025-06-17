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
		canvas.style.width = `${canvas.width / window.devicePixelRatio}px`
		canvas.style.height = `${canvas.height / window.devicePixelRatio}px`

		let ctx = canvas.getContext("2d")
		ctx.putImageData(this.imageData, 0, 0)

		/*let cloned = this.clone()
		this.createCache()
		for (let y = 0; y < this.imageData.height; y++)
		{
			for (let x = 0; x < this.imageData.width; x++)
			{
				if (this.cacheDistanceToEdge[y][x] < 100)
					cloned.setPixel(x, y, Math.min(255, Math.floor(this.cacheDistanceToEdge[y][x] * (255 / 4))), 0, 0, 255)
			}
		}

		let ctx = canvas.getContext("2d")
		ctx.putImageData(cloned.imageData, 0, 0)*/
		
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
		let newImage = ImageHelper.empty(this.imageData.width, this.imageData.height)//this.clone()
		
		//for (let y = 0; y < this.imageData.height; y++)
		//	for (let x = 0; x < this.imageData.width; x++)
		//		newImage.setPixel(x, y, 0, 0, 0, 255)
		
		for (let y = 0; y < this.imageData.height; y++)
		{
			for (let x = 0; x < this.imageData.width; x++)
			{
				const srcIndex = this.dataIndex(x, y)

				const destX = xTop + x
				const destY = yTop + y
				const destIndex = newImage.dataIndex(destX, destY)
				
				if (destX < 0 || destY < 0 || destX >= newImage.imageData.width || destY >= newImage.imageData.height)
					continue
				
				newImage.imageData.data[destIndex + 0] = this.imageData.data[srcIndex + 0]
				newImage.imageData.data[destIndex + 1] = this.imageData.data[srcIndex + 1]
				newImage.imageData.data[destIndex + 2] = this.imageData.data[srcIndex + 2]
				newImage.imageData.data[destIndex + 3] = this.imageData.data[srcIndex + 3]

				//let fromPixel = this.getPixel(x, y)
				//newImage.setPixel(xTop + x, yTop + y, fromPixel.r, fromPixel.g, fromPixel.b, 255)
			}
		}
		
		return newImage
	}


	detectTeamMatch()
	{
		let score = 0

		for (let i = 0; i < 4; i++)
		{
			const isRed = this.regionProximity(1080, 54 + 77 * i, 10, 48, 194, 29, 0) > 0.9
			const isBlue = this.regionProximity(1080, 54 + 77 * i, 10, 48, 20, 95, 212) > 0.9

			score += isRed || isBlue ? 1 : 0
		}

		return score >= 2
	}
	
	
	detectOnlineMatch()
	{
		const factor1stYellowOnline = this.regionProximity(1098, 65, 10, 10, 240, 224, 68)
		const factor1stYellowLocal = this.regionProximity(1142, 65, 10, 10, 240, 224, 68)

		console.log("factor1stYellow online/local", factor1stYellowOnline, factor1stYellowLocal)

		return factor1stYellowLocal < 0.8 && factor1stYellowOnline > factor1stYellowLocal
	}
	
	
	findProbableLetterBase()
	{
		let heights = []
		for (let y = this.imageData.height - 1; y >= this.imageData.height / 3 * 2; y--)
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
		for (let y = this.imageData.height - 1; y >= this.imageData.height / 3 * 2; y--)
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
	}
	
	
	extractRegionsOfInterest(cache = false)
	{
		const img = this.stretchTo(1920, 1080)

		const players = []
		const scores = []

		const isOnlineMatch = img.detectOnlineMatch()
		console.log("isOnlineMatch", isOnlineMatch)

		const isTeamMatch = img.detectTeamMatch()
		console.log("isTeamMatch", isTeamMatch)

		if (isOnlineMatch)
		{
			for (let i = 0; i < 13; i++)
			{
				players.push(img.extractRegion(1229, 54 + 77 * i, 350, 48))
				scores.push(img.extractRegion(1725, 54 + 77 * i, 126, 48))
			}
			
		}
		else
		{
			for (let i = 0; i < 13; i++)
			{
				players.push(img.extractRegion(1272, 54 + 77 * i, 350, 48))
				scores.push(img.extractRegion(1725, 54 + 77 * i, 90, 48))
			}
		}
		
		for (let i = 0; i < players.length; i++)
		{
			const isYellowBkg = players[i].regionProximity(0, 0, 170, 5, 255, 214, 32) > 0.8
			const redBkgFactor = players[i].regionProximity(0, 0, 170, 5, 194, 29, 0)
			const isRedBkg = redBkgFactor > 0.8
			const isBlueBkg = players[i].regionProximity(0, 0, 170, 5, 20, 95, 212) > 0.8
			const whiteLetterFactor = players[i].regionContains(6, 24, 16, 16, 255, 255, 255, 0.8)
			const isWhiteLetters = whiteLetterFactor > 0
			console.log("player", i, "color", isYellowBkg, isRedBkg, redBkgFactor, isBlueBkg, isWhiteLetters, whiteLetterFactor)
			
			if (isYellowBkg)
			{
				players[i].binarize(255, 255, 255, 0.775)
				scores[i].binarize(255, 255, 255, 0.7)
			}
			else if (isRedBkg)
			{
				if (isWhiteLetters)
				{
					players[i].binarize(255, 255, 255, 0.7)
					scores[i].binarize(255, 255, 255, 0.7)
				}
				else
				{
					players[i].binarize(122, 0, 10, 0.9)
					scores[i].binarize(122, 0, 10, 0.9)
				}
			}
			else if (isBlueBkg)
			{
				if (isWhiteLetters)
				{
					players[i].binarize(255, 255, 255, 0.7)
					scores[i].binarize(255, 255, 255, 0.7)
				}
				else
				{
					players[i].binarize(7, 54, 106, 0.9)
					scores[i].binarize(7, 54, 106, 0.9)
				}
			}
			else
			{
				players[i].binarize(255, 255, 255, 0.7)
				scores[i].binarize(255, 255, 255, 0.7)
			}
		}
		
		if (cache)
		{
			for (let i = 0; i < players.length; i++)
			{
				players[i].createCache()
				scores[i].createCache()
			}
		}
		
		return { players, scores }
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

			let pixels = this.findConnectedRegion(pBegin.x, pBegin.y, 1, -0.1, 40)
			if (pixels.length === 0)
				break

			if (pixels.length < 10)
			{
				this.fillPixels(pixels, 0, 0, 0)
				x = pBegin.x - 15
				continue
			}

			let charImage = this.extractPixels(pixels)
			if (charImage == null)
				break

			if (pBegin.x > x + 7 + 15)
				glyphs.push([null])

			let advance = charImage.imageData.width
			let entry = [charImage]

			{
				let x2 = pBegin.x + charImage.imageData.width - 15
				let image2 = this.clone()
				image2.fillPixels(pixels, 0, 0, 0)

				let pBegin2 = image2.findNextBinaryColumn(x2, true, -0.1)
				if (pBegin2 != null)
				{
					let pixels2 = image2.findConnectedRegion(pBegin2.x, pBegin2.y, 1, -0.1, 40)
					let charImage2 = this.extractPixels([...pixels, ...pixels2])
					if (charImage2 != null)
						entry = [charImage, charImage2]
				}
			}

			glyphs.push(entry)
			this.fillPixels(pixels, 0, 0, 0)

			x = pBegin.x + advance - 15
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
			if (pixels.length === 0)
				break
			
			if (pixels.length < 10)
			{
				this.fillPixels(pixels, 0, 0, 0)
				x = pBegin.x - 15
				continue
			}

			let charImage = this.extractPixels(pixels)
			if (charImage == null)
				break

			if (pBegin.x > x + 7 + 15)
				glyphs.push([null])

			let advance = charImage.imageData.width
			let entry = [charImage]

			{
				let x2 = pBegin.x + charImage.imageData.width - 15
				let image2 = this.clone()
				image2.fillPixels(pixels, 0, 0, 0)

				let pBegin2 = image2.findNextBinaryColumn(x2, true, 0)
				if (pBegin2 != null)
				{
					let pixels2 = image2.findConnectedRegion(pBegin2.x, pBegin2.y, 1, 0, 40)
					let charImage2 = this.extractPixels([...pixels, ...pixels2])
					if (charImage2 != null)
						entry = [charImage, charImage2]
				}
			}

			glyphs.push(entry)
			this.fillPixels(pixels, 0, 0, 0)

			x = pBegin.x + advance - 15
		}

		return glyphs
	}
	
	
	static colorProximity(r1, g1, b1, r2, g2, b2)
	{
		let rFactor = Math.abs(r1 - r2) / 255
		let gFactor = Math.abs(g1 - g2) / 255
		let bFactor = Math.abs(b1 - b2) / 255
		
		return 1 - Math.max(0, Math.min(1, ((rFactor + gFactor + bFactor) / 3)))
	}
	
	
	regionProximity(x1, y1, w, h, r, g, b)
	{
		let result = 0
		for (let yy = y1; yy < y1 + h; yy++)
		for (let xx = x1; xx < x1 + w; xx++)
		{
			let i = (yy * this.imageData.width + xx)
			
			result += ImageHelper.colorProximity(
				r, g, b,
				this.imageData.data[i * 4 + 0],
				this.imageData.data[i * 4 + 1],
				this.imageData.data[i * 4 + 2])
		}
		
		return result / (w * h)
	}
	
	
	regionContains(x1, y1, w, h, r, g, b, threshold)
	{
		let result = 0
		for (let yy = y1; yy < y1 + h; yy++)
		for (let xx = x1; xx < x1 + w; xx++)
		{
			let i = (yy * this.imageData.width + xx)
			
			const proximity = ImageHelper.colorProximity(
				r, g, b,
				this.imageData.data[i * 4 + 0],
				this.imageData.data[i * 4 + 1],
				this.imageData.data[i * 4 + 2])

			if (proximity > threshold)
				result += 1
		}
		
		return result
	}
	
	
	regionCountBinary(x1, y1, w, h, value)
	{
		let result = 0
		for (let yy = y1; yy < y1 + h; yy++)
		for (let xx = x1; xx < x1 + w; xx++)
		{
			let i = (yy * this.imageData.width + xx)
			
			if (this.imageData.data[i * 4 + 0] === (value ? 255 : 0))
				result += 1
		}
		
		return result
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
				for (let j = -lookUp; j <= -1; j++)
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
			xMax = Math.max(xMax, p.x + 1)
			yMax = Math.max(yMax, p.y + 1)
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
			
			for (let y = this.imageData.height; y >= 0; y--)
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

		let dist = 100
		let searchDist = 4
		for (let i = -searchDist; i <= searchDist; i++)
		for (let j = -searchDist; j <= searchDist; j++)
		{
			if (this.getBinaryPixel(x + i, y + j) !== value)
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

		/*this.cacheBoundaryPoints = []
		for (let y = 0; y < this.imageData.height; y++)
		{
			for (let x = 0; x < this.imageData.width; x++)
			{
				var myColor = this.getBinaryPixel(x, y)
				if (!myColor)
					continue

				var isBoundary = false

				for (let j = -1; j <= 1; j++)
				for (let i = -1; i <= 1; i++)
				{
					if (this.getBinaryPixel(x + i, y + j) !== myColor)
						isBoundary = true
				}

				if (isBoundary)
					this.cacheBoundaryPoints.push({ x, y })
			}
		}

		this.cacheMinDistToBoundaryPoint = []
		for (let y = 0; y < this.imageData.height; y++)
		{
			this.cacheMinDistToBoundaryPoint.push([])
			for (let x = 0; x < this.imageData.width; x++)
			{
				var minDist = 1000
				for (let p of this.cacheBoundaryPoints)
				{
					var xx = p.x - x
					var yy = p.y - y
					var dist = Math.sqrt(xx * xx + yy * yy)
					minDist = Math.min(minDist, dist)
				}

				this.cacheMinDistToBoundaryPoint[y].push(minDist)				
			}
		}*/
		
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
		/*this.createCache()
		glyph.data.createCache()

		var totalDist = 0
		for (const p of glyph.data.cacheBoundaryPoints)
		{
			totalDist += this.cacheDistanceToEdge[p.y][p.x] ?? 100
		}
		totalDist /= glyph.data.cacheBoundaryPoints.length
		return 1 / (totalDist + 1)

		
		var totalDist = 0
		for (let y = 0; y < Math.max(glyph.data.imageData.height, this.imageData.height); y++)
		{
			for (let x = 0; x < Math.max(glyph.data.imageData.width, this.imageData.width); x++)
			{
				totalDist +=
					(this.cacheDistanceToEdge[y][x] ?? 100) *
					(glyph.data.cacheDistanceToEdge[y][x] ?? 100)
			}
		}
		totalDist /= Math.max(glyph.data.imageData.height, this.imageData.height) * Math.max(glyph.data.imageData.width, this.imageData.width)
		return -totalDist
		*/

		let estimatedWidthDiff = Math.max(0, Math.abs(this.imageData.width - glyph.data.imageData.width) - 4)
		let estimatedWidthBonus = (1 / (estimatedWidthDiff + 1)) * 0.1
		
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

				let factor = Math.min(2, Math.max(1, dist1)) * Math.min(2, Math.max(1, dist2))
				//Math.min(4, Math.max(0, Math.max(dist1, dist2) - 2))

				totalPixels += factor

				if (this.getBinaryPixel(x, y) === glyph.data.getBinaryPixel(x, y))
					matchingPixels += factor
				else
					nonMatchingPixels += factor * 4
			}
		}

		let score =
			(matchingPixels - nonMatchingPixels) / totalPixels +
			estimatedWidthBonus
		
		//console.log(glyph.c, score, matchingPixels, nonMatchingPixels, totalPixels, estimatedWidthBonus)
		
		return score
	}
	

	recognizePlayer(nameGlyphs, debug = false)
	{
		this.createCache()
		
		let str = ""
		let confidence = 0

		let chars = this.clone().extractPlayerGlyphs()
		for (let c = 0; c < chars.length; c++)
		{
			const char = chars[c]

			if (char[0] === null)
			{
				str += " "
				continue
			}

			let scores = []

			for (let glyph of nameGlyphs)
			{
				if (glyph.skip)
					continue
				
				for (let s = 0; s < char.length; s++)
				{
					const subchar = char[s]

					let score = subchar.scoreGlyph(glyph, debug)
					if (score == null)
						continue
					
					scores.push({ glyph: glyph, advance: s, score: score })
				}
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
			c += chosen.advance
		}


		if (confidence < 0)
			return { str: "", confidence: 0 }

		const filledPixels = this.regionCountBinary(0, 0, this.imageData.width, this.imageData.height, true)
		if (confidence > 0 && confidence / filledPixels < 0.0005)
			return { str: "", confidence: filledPixels / 500 }


		let isUppercase = (c) => {
			if (c == null)
				return false
			
			c = c.charCodeAt(0)
			
			return c >= "A".charCodeAt(0) && c <= "Z".charCodeAt(0)
		}
		
		let replaceChar = (str, index, c) => {
			return str.substr(0, index) + c + str.substr(index + c.length)
		}
		
		for (let i = 0; i < str.length; i++)
		{
			let c = str[i]
			if (c != "l" && c != "I")
				continue
			
			let prev = (i > 0 ? str[i - 1] : null)
			let next = (i < str.length - 1 ? str[i + 1] : null)
			
			if (c == "l" && isUppercase(next))
				str = replaceChar(str, i, "I")
			
			else if (c == "I" && (!isUppercase(prev) || !isUppercase(next)))
				str = replaceChar(str, i, "l")
		}

		return { str: str, confidence: confidence }
	}
	
	
	recognizeScore(scoreGlyphs, debug = false)
	{
		this.createCache()
		
		let str = ""
		let confidence = 0

		let chars = this.clone().extractScoreGlyphs()
		for (let c = 0; c < chars.length; c++)
		{
			const char = chars[c]

			if (char[0] === null)
				continue

			let scores = []

			for (let glyph of scoreGlyphs)
			{
				if (glyph.skip)
					continue
				
				for (let s = 0; s < char.length; s++)
				{
					const subchar = char[s]

					let score = subchar.scoreGlyph(glyph, debug)
					if (score == null)
						continue
					
					scores.push({ glyph: glyph, advance: s, score: score })
				}
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
			c += chosen.advance
		}
		
		let value = parseInt(str)
		if (!isFinite(value) || confidence < 0)
			return { value: 0, confidence: 0 }

		const filledPixels = this.regionCountBinary(0, 0, this.imageData.width, this.imageData.height, true)
		//console.log(value, confidence, filledPixels, confidence / filledPixels)
		if (confidence > 0 && confidence / filledPixels < 0.00001)
			return { value: 0, confidence: filledPixels / 200 }

		return { value: value, confidence: confidence }
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