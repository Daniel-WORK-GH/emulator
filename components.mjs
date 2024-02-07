import { NBitArray, NBitMap, NBitNumber } from "./nbit.mjs"

export const Memory = NBitArray;

export const Registers = NBitMap

export class PC extends NBitNumber {
    #instruction_length

    constructor(bits, instruction_length, inital_value = 0) {
        super(bits)

        this.set(inital_value)

        this.#instruction_length = instruction_length
    }

    inc(amount = 1) {
        const current = this.get()
        this.set(current + this.#instruction_length * amount)
    }
}