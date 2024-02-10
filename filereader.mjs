export async function getByteArray(filename) {
    var fileByteArray = [];

    var buffer = await fetch(filename)
    fileByteArray = await buffer.arrayBuffer();
    fileByteArray = new Uint8Array(fileByteArray)
    
    return fileByteArray
}