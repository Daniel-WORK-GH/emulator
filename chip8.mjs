import { Memory, PC, Registers } from "./components.mjs";
import { getByteArray } from "./filereader.mjs";
import { ChipScreen } from "./screen.mjs";

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

        /**
         * Key for the I register
         */
        this.I = 20;

        this.DT = 21;
        this.ST = 22;

        this.#registers = new Registers(16, [
            0, 1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12,
            13, 14, 15, this.I, 
            this.DT, this.ST
        ])

        this.#pc = new PC(16, 2, 0x200);

        setInterval(() => {
            ChipScreen.refresh()
        }, 1 / 60 * 1000);
    }

    load_program(program) {
        getByteArray(program, (array) => {
            let addr = 0x200;

            for(let i = 0; i < array.length; i++) {
                this.#memory.set(addr + i, array[i])
            }
        })
    }

    #get_next_instructions() {
        const addr = this.#pc.get()
        const upper = this.#memory.get(addr)
        const lower = this.#memory.get(addr + 1)
        const instruction = (upper << 8) | lower

        return instruction;
    }

    run_instruction() {
        const instruction = this.#get_next_instructions()
        
        // Get lower and upper bytes
        const upper = (instruction >> 8) & 0xFF 
        const lower = instruction & 0xFF 

        // Get instructions as nibbles
        const nib1 = (instruction >> 12) & 0xf
        const nib2 = (instruction >> 8) & 0xf
        const nib3 = (instruction >> 4) & 0xf
        const nib4 = instruction & 0xf

        if(instruction == 0x00e0) { // 00E0 - CLS
            ChipScreen.clear()
            this.#pc.inc()
            return;
        }
        else if(instruction == 0x00ee) { // 00EE - RET
            console.error('not imp');
            return;
        }

        switch(nib1) {
            case 0: // 0nnn - SYS addr
            case 1: // 1nnn - JP addr
                this.#pc.set(instruction & 0x0FFF)
                return;

            case 3: // 3xkk - SE Vx, byte
                var vx = this.#registers.get(nib2)
                if(vx == lower) this.#pc.inc()
                break;

            case 4: // 4xkk - SNE Vx, byte
                var vx = this.#registers.get(nib2)
                if(vx != lower) this.#pc.inc()
                break;

            case 5: // 5xy0 - SE Vx, Vy
                var vx = this.#registers.get(nib2)
                var vy = this.#registers.get(nib3)

                if(vx == vy) this.#pc.inc();
                break;

            case 6: // 6xkk - LD Vx, byte
                var vx = this.#registers.get(nib2)
                this.#registers.set(nib2, lower)
                break;

            case 7: // 7xkk - ADD Vx, byte
                var vx = this.#registers.get(nib2)
                this.#registers.set(nib2, vx + lower)
                break;

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
            
            case 9: // 9xy0 - SNE Vx, Vy
                var vx = this.#registers.get(nib2)
                var vy = this.#registers.get(nib3)

                if(vx != vy) this.#pc.inc()
                break;

            case 0xa: // Annn - LD I, addr
                this.#registers.set(this.I, instruction & 0x0FFF)
                break;

            case 0xb: // Bnnn - JP V0, addr
                var v0 = this.#registers.get(0)
                this.#pc.set(instruction & 0x0FFF + v0)
                break;

            case 0xc: // Cxkk - RND Vx, byte
                var vx = this.#registers.get(nib2)
                const rnd = Math.floor(Math.random() * maxFloored);
                
                this.#registers.set(nib2, rnd & lower)
                break;

            case 0xd: // Dxyn - DRW Vx, Vy, nibble
                var i = this.#registers.get(this.I)
                var starti = i;
                var vx = this.#registers.get(nib2)
                var vy = this.#registers.get(nib3)
                var erased = false;

                for(; i < starti + nib4; i++) {
                    var byte = this.#memory.get(i)
                    erased |= ChipScreen.drawByte(vx, vy + i - starti, byte)
                }

                if(erased) this.#registers.set(15, 1)
                else this.#registers.set(15, 0)
                break;

            case 0xF:
                switch(lower) { 
                    case 0x07:
                        var dt = this.#registers.get(this.DT)
                        this.#registers.set(nib2, dt)
                        break;

                    case 0x15: // Fx15 - LD DT, Vx
                        var vx = this.#registers.get(nib2)
                        this.#registers.set(this.DT, vx)
                        break;

                    case 0x18: // Fx18 - LD ST, Vx
                        var vx = this.#registers.get(nib2)
                        this.#registers.set(this.ST, vx)
                        break;

                    case 0x1e: // Fx1E - ADD I, Vx
                        var vx = this.#registers.get(nib2)
                        var i = this.#registers.get(this.I)

                        this.#registers.set(this.I, vx + i)
                        break;

                    case 0x29: // Fx29 - LD F, Vx
                        var vx = this.#registers.get(nib2)
                        this.#registers.set(this.I, vx)
                        
                        console.error('Add font support');
                        break;

                    case 0x33:
                        var i = this.#registers.get(this.I)

                        this.#memory.set(i, nib2)
                        this.#memory.set(i + 1, nib3)
                        this.#memory.set(i + 2, nib4)
                        break;

                    case 0x55:
                        var i = this.#registers.get(this.I)
                        for(let r = 0; r < 16; r++) {
                            var vr = this.#registers.get(r)
                            this.#memory.set(i + r, vr)
                        }
                        console.warn('Might cause an error');
                        break;

                    case 0x65:
                        var i = this.#registers.get(this.I)
                        for(let r = 0; r < 16; r++) {
                            var vr = this.#memory.get(i + r)
                            this.#registers.set(r, vr)
                        }
                        console.warn('Might cause an error');
                        break;

                    default: 
                        console.error('Unknown instruction : ' + instruction.toString(16));
                        break;
                }
                break;

            default: 
                console.error('Unknown instruction : ' + instruction.toString(16));
                break;
        }

        this.#pc.inc()
    }
}