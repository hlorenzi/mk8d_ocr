function main()
{
	let war = new War()
	
	for (let i = 1; i <= 9; i++)
		Image.load("tests/test" + i + ".jpg", (img) => war.addRace(img.extractPlayers()))
	
	setTimeout(() => war.buildTable(document.getElementById("divTable")), 1000)
}





class War
{
	constructor()
	{
		this.players = []
	}
	
	
	addRace(newPlayers)
	{
		let oldPlayerNum = this.players.length
		
		for (let newPlayer of newPlayers)
		{
			console.log("===")
			let foundMatch = false
			for (let p = 0; p < oldPlayerNum; p++)
			{
				let player = this.players[p]
				
				let comparison = player[0].compareBinary(newPlayer)
				console.log(comparison)
				if (comparison > 0.99)
				{
					player.push(newPlayer)
					foundMatch = true
					break
				}
			}
			
			if (!foundMatch)
				this.players.push([newPlayer])
		}
	}
	
	
	buildTable(elem)
	{
		while (elem.firstChild)
			elem.removeChild(elem.firstChild)
		
		let table = document.createElement("table")
		
		for (let player of this.players)
		{
			let tr = document.createElement("tr")
			for (let race of player)
			{
				let td = document.createElement("td")
				td.appendChild(race.makeCanvas())
				tr.appendChild(td)
			}
			
			table.appendChild(tr)
		}
		
		elem.appendChild(table)
	}
}