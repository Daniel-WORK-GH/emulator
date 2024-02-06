import { NBitArray, NBitMap, NBitNumber } from "./nbit.mjs"

const Memory = NBitArray;

const Registers = NBitMap

class PC extends NBitNumber {
    #instruction_length

    constructor({bits, instruction_length, inital_value=0}) {
        super(bits)

        this.set(value)

        this.#instruction_length = instruction_length
    }

    inc(amount = 1) {
        const current = this.get()
        this.set(current + this.#instruction_length * amount)
    }
}