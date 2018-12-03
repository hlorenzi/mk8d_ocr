async function cacheTeamRegistry()
{
	console.log("cacheTeamRegistry")
	const page = await fetch("https://www.mariokartcentral.com/mkc/teams/category/150cc", { mode: "no-cors" })
	console.log(page)
}