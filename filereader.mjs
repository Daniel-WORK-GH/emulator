export function getByteArray(filename, onload) {
    var fileByteArray = [];

    fetch(filename)
    .then((res) => res.arrayBuffer())
    .then((buffer) => {
        fileByteArray = new Uint8Array(buffer)

        onload(fileByteArray);
    })
}