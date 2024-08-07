export class NBitNumber {
    #max;
    #value;

    /**
     * @param {Number} bits 
     */
    constructor(bits) {
        this.#max = Math.pow(2, bits) - 1;
        this.#value = 0;
    }

    /**
     * Get an n bit value
     * @returns {Number}
     */
    get() {
        return this.#value;
    }

    /**
     * Set an n bit value,
     * If the value overflwos it will ignore the upper bits
     * @param {Number} value
     */
    set(value) {
        this.#value = value & this.#max
    }

    /**
     * Add to the current value
     * @param {Number} value 
     */
    add(value) {
        this.set(this.#value + value)
    }
}

export class NBitArray {
    /**
     * @type {NBitNumber[]}
     */
    #array;
    #bits;
    #size;
    
    /**
     * @param {Number} bits 
     * @param {Number} size 
     */
    constructor(bits, size) {
        this.#bits = bits
        this.#size = size

        this.#array = new Array(size).fill(null).map(() => 
            new NBitNumber(bits)
        )
    }

    /**
     * Get n bit number at index
     * @param {Number} index 
     * @return {Number}
     */
    get(index) {
        const element = this.#array[index];
        return element.get();
    }

    /**
     * Set n bit number at index
     * @param {Number} index 
     * @param {Number} value 
     */
    set(index, value) {
        const element = this.#array[index];
        element.set(value);
    }
}

export class NBitMap {
    /**
     * @type {Map<*, NBitNumber>}
     */
    #dict;

    /**
     * @param {String[]} dict 
     */
    constructor(bits, keys = []) {
        this.#dict = new Map();

        for(let i = 0; i < keys.length; i++) {
            const key = keys[i];
            this.#dict.set(key, new NBitNumber(bits))
        }
    }

    setBits(key, bits) {
        this.#dict.set(key, new NBitNumber(bits))
    }

    /**
     * Set value at key
     * @param {*} key 
     * @returns {Number}
     */
    get(key) {
        const element = this.#dict.get(key)
        return element.get()
    }

    /**
     * Set the value of an n bit nuber at key
     * @param {*} key 
     * @param {Number} value 
     */
    set(key, value) {
        const element = this.#dict.get(key)
        element.set(value)
    }
}

