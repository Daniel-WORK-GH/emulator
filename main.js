import { CodeConverter } from "./codeconverter.mjs";
import { Chip8 } from "./chip8.mjs";
import { ChipScreen } from "./screen.mjs";
import { HexCodeScreen } from "./codescreen.mjs";

const chip = new Chip8();

ChipScreen.init()

HexCodeScreen.init(chip, chip.get_memory())

chip.load_program('programs/ibm_logo.ch8').then(() => {
    setInterval(() => {
        for(let i = 0; i < 100; i++) {
            chip.run_instruction()
        }
    }, 100);

    HexCodeScreen.loadHexCode()
})