export class ChipScreen {
    static #container = document.querySelector('.container');

    static #width;
    static #height;

    static #screen;

    static #pixels;

    /**
     * Create the screen object, handles drawing 
     * to screen like in the original chip8
     * @param {Number} width Width of the screen
     * @param {Number} height Height of the screen
     */
    static init(width = 64, height = 32){
        this.#width = width;
        this.#height = height;

        this.#screen = Array.apply(null, Array(this.#height)).map(
            (x, i) => Array.apply(null, Array(this.#width)).map(
                (x, i) => 0
            )
        );

        this.#populate(width, height);
    }

    /**
     * Fill the 'screen' with 'pixels'
     * @param {Number} width Number of pixels [width]
     * @param {Number} height Number of pixels [height]
     */
    static #populate(width, height) {
        const pixelsize = this.#container.clientWidth / width;
    
        if(this.#container == null) throw Error("Screen container wasnt found.");
    
        // Updating the --size CSS variable
        this.#container.style.setProperty('--width', width)
        this.#container.style.setProperty('--height', height)
    
        this.#container.style.height = `${height * pixelsize}px`;
    
        this.#pixels = [];

        for (let i = 0; i < height; i++) {
            this.#pixels.push([]);

            for(let j = 0; j < width; j++) {
                const div = document.createElement('div')
                div.classList.add('pixel')
                
                this.#container.appendChild(div)

                this.#pixels[i].push(div);
            }
        }
    };

    /**
     * Draw a byte value at (x, y) position,
     * each bit will be xor'd into the screen
     * @param {Number} vx X position
     * @param {Number} vy Y position
     * @param {Number} byte Byte to draw
     * @returns {Boolean} Returns true if a pixel was
     *      turned off and wasn't supposed to
     */
    static drawByte(vx, vy, byte) {
        let erased = false;

        for (let i = 0; i < 8; i++) {
            let x = (vx + i) % this.#width
            let y = vy % this.#height

            const bit = (byte >> (7 - i)) & 0B1;
            
            erased |= bit == this.#screen[y][x] && bit == 1

            this.#screen[y][x] = bit != this.#screen[y][x] ? 1 : 0; 
        }

        return erased
    }

    /**
     * Update the screen from the pixel array
     */
    static refresh() {
        for (let i = 0; i < this.#height; i++) {
            for(let j = 0; j < this.#width; j++) {
                const pixel = this.#pixels[i][j];
                pixel.style.backgroundColor = this.#screen[i][j] == 1 ? 'white' : '#3d3d3d';
            } 
        }
    }

    /**
     * Crear the data of the screen
     */
    static clear() {
        for (let i = 0; i < this.#height; i++) {
            for(let j = 0; j < this.#width; j++) {
                const pixel = this.#pixels[i][j];
                this.#screen[i][j] = 0;

                pixel.style.backgroundColor = '#3d3d3d';
            } 
        }
    }
}