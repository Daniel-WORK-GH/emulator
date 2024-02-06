import { Memory, PC, Registers } from "./components.mjs";

export class Chip8 {
    #memory;
    #registers;
    #pc;

    constructor() {
        this.#memory = new Memory(8, 4096)

        // this.#registers = new Registers(16,[
        //     "V0", "V1", "V2", "V3",
        //     "V4", "V5", "V6", "V7",
        //     "V8", "V9", "Va", "Vb",
        //     "Vc", "Vd", "Ve", "Vf",
        // ])

        this.#registers = new Registers(16, [
            0, 1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12,
            13, 14, 15
        ])

        this.#pc = new PC(8, 2, 0xFF);
    }

    #get_next_instructions() {
        const addr = this.#pc.get()
        const upper = this.#memory.get(addr)
        const lower = this.#memory.get(addr + 1)
        const instruction = upper << 8 | lower

        this.#pc.inc()

        return instruction;
    }

    run_instruction() {
        const instruction = this.#get_next_instructions()

        // Get lower and upper bytes
        const upper = (instruction >> 8) & 0xFF 
        const lower = instruction & 0xFF 

        // Get instructions as nibbles
        const nib1 = (instruction >> 12) & 0B1111
        const nib2 = (instruction >> 8) & 0B1111
        const nib3 = (instruction >> 4) & 0B1111
        const nib4 = instruction & 0B1111

        switch(nib1) {
            case 8: 
                switch (nib4) {
                    case 0: // 8xy0 - LD Vx, Vy
                        var vy = this.#registers.get(nib3)
                        this.#registers.set(nib2, vy)
                        break;

                    case 1: // 8xy1 - OR Vx, Vy
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)
                        var value = vx | vy
                        this.#registers.set(nib2, value)
                        break;
                
                    case 2: // 8xy2 - AND Vx, Vy
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)
                        var value = vx & vy
                        this.#registers.set(nib2, value)
                        break;

                    case 3: // 8xy3 - XOR Vx, Vy
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)
                        var value = vx ^ vy
                        this.#registers.set(nib2, value)
                        break;

                    case 4: // 8xy4 - ADD Vx, Vy
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)

                        this.#registers.set(nib2, vx + vy)

                        if(vx + vy > 0xFFFF) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)
                        break;

                    case 5: // 8xy5 - SUB Vx, Vy
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)
                        
                        this.#registers.set(nib2, vx - vy)

                        if(vx > vy) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)
                        break;

                    case 6: // 8xy6 - SHR Vx {, Vy}
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)

                        if(vy != 1) console.log('ADD SHR');

                        if(vx & 1 == 1) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)

                        this.#registers.set(nib2, vx >> 1)
                        break;

                    case 7: // 8xy7 - SUBN Vx, Vy
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)
                        
                        this.#registers.set(nib2, vy - vx)

                        if(vy > vx) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)
                        break;

                    case 0xe: // 8xyE - SHL Vx {, Vy}
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)

                        if(vy != 1) console.log('ADD SHL');

                        if(vx > 0x4FFF ) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)

                        this.#registers.set(nib2, vx << 1)
                        break;

                    default: 
                        console.error('Unknown instruction');
                        break;
                }
                break;

        }
    }
}

//#region ✅
// 00E0 - CLS
// 00EE - RET
// 0nnn - SYS addr
// 1nnn - JP addr
// 2nnn - CALL addr
// 3xkk - SE Vx, byte
// 4xkk - SNE Vx, byte
// 5xy0 - SE Vx, Vy
// 6xkk - LD Vx, byte
// 7xkk - ADD Vx, byte
// 8xy0 - LD Vx, Vy ✅
// 8xy1 - OR Vx, Vy ✅
// 8xy2 - AND Vx, Vy ✅
// 8xy3 - XOR Vx, Vy ✅
// 8xy4 - ADD Vx, Vy ✅
// 8xy5 - SUB Vx, Vy ✅
// 8xy6 - SHR Vx {, Vy} ✅
// 8xy7 - SUBN Vx, Vy ✅
// 8xyE - SHL Vx {, Vy} ✅
// 9xy0 - SNE Vx, Vy
// Annn - LD I, addr
// Bnnn - JP V0, addr
// Cxkk - RND Vx, byte
// Dxyn - DRW Vx, Vy, nibble
// Ex9E - SKP Vx
// ExA1 - SKNP Vx
// Fx07 - LD Vx, DT
// Fx0A - LD Vx, K
// Fx15 - LD DT, Vx
// Fx18 - LD ST, Vx
// Fx1E - ADD I, Vx
// Fx29 - LD F, Vx
// Fx33 - LD B, Vx
// Fx55 - LD [I], Vx
// Fx65 - LD Vx, [I]
// 3.2 - Super Chip-48 Instructions
// 00Cn - SCD nibble
// 00FB - SCR
// 00FC - SCL
// 00FD - EXIT
// 00FE - LOW
// 00FF - HIGH
// Dxy0 - DRW Vx, Vy, 0
// Fx30 - LD HF, Vx
// Fx75 - LD R, Vx
// Fx85 - LD Vx, R
//#endregion