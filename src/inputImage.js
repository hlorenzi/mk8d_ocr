function inputGetImageSrc(input)
{
	if (input.files.length != 1)
		return
	
	let img = document.createElement("img")
	return window.URL.createObjectURL(input.files[0])
}