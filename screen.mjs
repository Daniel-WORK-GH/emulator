export class ChipScreen {
    static #container = document.querySelector('.container');

    static #width;
    static #height;

    static #screen;

    static #pixels;

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

    static clear(){
        for (let i = 0; i < this.#height; i++) {
            for(let j = 0; j < this.#width; j++) {
                const pixel = this.#pixels[i][j];
                this.#screen[i][j] = 0;

                pixel.style.backgroundColor = '#3d3d3d';
            } 
        }
    }
}