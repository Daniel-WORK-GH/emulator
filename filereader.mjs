export async function getByteArray(filename) {
    var fileByteArray = [];

    var buffer = await fetch(filename)
    fileByteArray = await buffer.arrayBuffer();
    fileByteArray = new Uint8Array(fileByteArray)
    
    return fileByteArray
}

/**
 * 
 * @param {function(String)} func 
 */
export function openFile(func) {
	const  readFile = function(e) {
		var file = e.target.files[0];
		if (!file) {
			return;
		}
		var reader = new FileReader();
		reader.onload = function(e) {
			var contents = e.target.result;
			fileInput.func(contents)
			document.body.removeChild(fileInput)
		}
		reader.readAsArrayBuffer(file)
	}
    var fileInput = document.createElement('input');

	fileInput = document.createElement("input")
	fileInput.type='file'
	fileInput.style.display='none'
    fileInput.accept = ".ch8,.Ch8,.CH8"
	fileInput.onchange=readFile
	fileInput.func=func
	document.body.appendChild(fileInput)

    fileInput.click();
}