import { CodeConverter } from "./codeconverter.mjs";
import { Chip8 } from "./chip8.mjs";
import { ChipScreen } from "./screen.mjs";
import { CodeScreen } from "./codescreen.mjs";

const chip = new Chip8();

ChipScreen.init()

chip.load_program('programs/test.ch8').then(() => {
    setInterval(() => {
        for(let i = 0; i < 100; i++) {
            chip.run_instruction()
        }
    }, 100);

    CodeScreen.loadHexCode(chip.get_memory())
})