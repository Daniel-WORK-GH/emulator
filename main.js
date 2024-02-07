import { Chip8 } from "./chip8.mjs";
import { NBitNumber } from "./nbit.mjs";
import { ChipScreen } from "./screen.mjs";

const chip = new Chip8();

chip.load_program('programs/ibm_logo.ch8')

ChipScreen.init()

setTimeout(() => {
    setInterval(() => {
        for(let i = 0; i < 100; i++) {
            chip.run_instruction()
        }
    }, 100);    
}, 1000)