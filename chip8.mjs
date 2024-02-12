import { Memory, PC, Registers } from "./components.mjs";
import { getByteArray } from "./filereader.mjs";
import { Keyboard } from "./keyboard.mjs";
import { NBitArray, NBitNumber } from "./nbit.mjs";
import { ChipScreen } from "./screen.mjs";

function hexToBcd(hex)
{
    const bcd = []
    while(hex > 0) {
        bcd.push(hex % 10)
        hex = Math.floor(hex / 10)
        
    }
    return bcd
}

export class Chip8 {
    #memory;
    #registers;
    #pc;
    #keyboard;
    #stack;
    #stackptr;

    constructor() {
        this.#memory = new Memory(8, 4096)

        /**
         * Key for the I register
         */
        this.I = 20;

        this.DT = 21;
        this.ST = 22;

        this.#registers = new Registers(8, [
            0, 1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12,
            13, 14, 15, this.I, 
            this.DT, this.ST
        ])

        this.#registers.setBits(this.I, 12)
        
        this.#pc = new PC(16, 2, 0x200);

        this.#keyboard = new Keyboard([
            '0', '1', '2', '3',
            '4', '5', '6', '7',
            '8', '9', 'a', 'b',
            'c', 'd', 'e', 'f',
        ]);

        this.#stack = new NBitArray(16, 16)
        this.#stackptr = new NBitNumber(4);

        setInterval(() => {
            var dt = this.#registers.get(this.DT)
            var st = this.#registers.get(this.ST)

            if(dt > 0) {
                this.#registers.set(this.DT, dt - 1)
            }
            
            if(st > 0) {
                this.#registers.set(this.ST, st - 1)
            }

            ChipScreen.refresh()
        }, 1 / 60 * 1000);
    }

    restart() {
        const regs = [
            0, 1, 2, 3, 4, 5, 6,
            7, 8, 9, 10, 11, 12,
            13, 14, 15, this.I, 
            this.DT, this.ST
        ]

        for(let i = 0; i < regs.length; i++) {
            const reg = regs[i];

            this.#registers.set(reg, 0)
        }

        this.#pc.set(0x200)
        ChipScreen.clear();
    }

    get_memory() {
        return this.#memory;
    }

    async load_program(program) {
        let array = await getByteArray(program)
        
        let addr = 0x200;

        for(let i = 0; i < array.length; i++) {
            this.#memory.set(addr + i, array[i])
        }
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

        //console.log(`${this.#pc.get()} running : ` + instruction.toString(16));

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
            this.#stackptr.set(this.#stackptr.get() - 1)
            
            var addr = this.#stack.get(this.#stackptr.get())
            this.#pc.set(addr)

            //console.warn('setting addr to : ' + addr);
            return;
        }

        switch(nib1) {
            case 0: // 0nnn - SYS addr
            case 1: // 1nnn - JP addr
                this.#pc.set(instruction & 0x0FFF)
                return;

            case 2: // 2nnn - CALL addr
                var nnn = instruction & 0xfff

                this.#pc.inc()
                this.#stack.set(
                    this.#stackptr.get(),
                    this.#pc.get()
                )

                this.#pc.set(nnn)

                this.#stackptr.set(this.#stackptr.get() + 1)
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
                if(nib4 == 0) {
                    var vx = this.#registers.get(nib2)
                    var vy = this.#registers.get(nib3)

                    if(vx == vy) this.#pc.inc();
                }
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

                        if(vx + vy > 0xFF) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)
                        break;

                    case 5: // 8xy5 - SUB Vx, Vy
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)
                        
                        this.#registers.set(nib2, vx - vy)

                        if(vx >= vy) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)
                        break;

                    case 6: // 8xy6 - SHR Vx {, Vy}
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)

                        if(vx & 1 == 1) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)

                        this.#registers.set(nib2, vx >> 1)
                        break;

                    case 7: // 8xy7 - SUBN Vx, Vy
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)
                        
                        this.#registers.set(nib2, vy - vx)

                        if(vy >= vx) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)
                        break;

                    case 0xe: // 8xyE - SHL Vx {, Vy}
                        var vx = this.#registers.get(nib2)
                        var vy = this.#registers.get(nib3)

                        if(vx >= 0x4F) this.#registers.set(15, 1)
                        else this.#registers.set(15, 0)

                        this.#registers.set(nib2, vx << 1)
                        break;

                    default: 
                        console.error('Unknown instruction');
                        break;
                }
                break;
            
            case 9: // 9xy0 - SNE Vx, Vy
                if(nib4 == 0) {
                    var vx = this.#registers.get(nib2)
                    var vy = this.#registers.get(nib3)

                    if(vx != vy) this.#pc.inc()
                }
                else {
                    console.error('Unknown instruction : ' + instruction.toString(16));
                }
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
                const rnd = Math.floor(Math.random() * 255);
                
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

            case 0xe:
                var pressed = this.#registers.get(nib2)
                pressed = pressed.toString(16)

                if(lower == 0x9e) { // Ex9E - SKP Vx
                    if(this.#keyboard.isPressed(pressed)) {
                        this.#pc.inc();
                    }
                }else if(lower == 0xa1){ //  ExA1 - SKNP Vx
                    if(!this.#keyboard.isPressed(pressed)) {
                        this.#pc.inc();
                    }
                }else {
                    console.error('Unknown instruction : ' + instruction.toString(16));
                }
                break;

            case 0xF:
                switch(lower) { 
                    case 0x07: // Fx07 - LD Vx, DT
                        var dt = this.#registers.get(this.DT)
                        this.#registers.set(nib2, dt)
                        break;

                    case 0x0a: // Fx0A - LD Vx, K
                        if(this.#keyboard.waitPress()) {
                            var value = this.#keyboard.lastPress;
                            value = parseInt(value, 16)

                            this.#registers.set(nib2, value)
                        }else return;
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

                    case 0x33: // Fx33 - LD B, Vx
                        var i = this.#registers.get(this.I)
                        var vx = this.#registers.get(nib2)
                        var bcd = hexToBcd(vx)

                        this.#memory.set(i, bcd[2])
                        this.#memory.set(i + 1, bcd[1])
                        this.#memory.set(i + 2, bcd[0])
                        break;

                    case 0x55: // Fx55 - LD [I], Vx
                        var i = this.#registers.get(this.I)
                        for(let r = 0; r <= nib2; r++) {
                            var vr = this.#registers.get(r)
                            this.#memory.set(i + r, vr)
                        }
                        break;

                    case 0x65: // Fx65 - LD Vx, [I]
                        var i = this.#registers.get(this.I)
                        for(let r = 0; r <= nib2; r++) {
                            var vr = this.#memory.get(i + r)
                            this.#registers.set(r, vr)
                        }
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