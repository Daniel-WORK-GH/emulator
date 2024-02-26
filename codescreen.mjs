import { Chip8 } from "./chip8.mjs";
import { openFile } from "./filereader.mjs";
import { NBitArray } from "./nbit.mjs";

function isHex(h) {
    var a = parseInt(h,16);
    return (a.toString(16) === h)
}

const tablediv = document.getElementById("opcodeTable");
//const programdiv = document.getElementById("programContainer");

export class HexCodeScreen {
    static {
        this.table = document.getElementById("hexcodeTable");

        this.downloadBtn = document.getElementById("downloadBtn")
        this.openBtn = document.getElementById("openfileBtn")
        this.loadBtn = document.getElementById("loadchipBtn")

        this.opcodeTab = document.getElementById("opcodeTab")

        this.opcodeTab.onclick = () => {
            tablediv.style.display = ''
            //programdiv.style.display = 'none'
        }

        this.downloadBtn.onclick = () => {
            this.#downloadHexfile() 
        }

        this.loadBtn.onclick = () => {
            this.#loadToChip()
        }

        this.openBtn.onclick = () => {
            this.#openCh8File();
        }

        this.selectedHex = undefined;

        this.memory;
        this.chip;

        document.addEventListener("keydown", (e) => {
            const key = e.key.toLowerCase()
            const code = e.code;

            if(isHex(key) && HexCodeScreen.selectedHex) {
                const html = HexCodeScreen.selectedHex.innerHTML;
            
                if(html == '0' || html == '_') {
                    HexCodeScreen.selectedHex.innerHTML = key
                }
                else if(html.length < 2) {
                    HexCodeScreen.selectedHex.innerHTML += key
                }
            }

            if(code == 'Backspace') {
                const str = HexCodeScreen.selectedHex.innerHTML;
                if(str.length == 1) {
                    HexCodeScreen.selectedHex.innerHTML = '_'
                }else {
                    HexCodeScreen.selectedHex.innerHTML = 
                        str.substring(0, str.length - 1);
                }
            }

            if(code == 'Enter') {
                this.#unselectHexCell()
            }
        })
    }

    /**
     * @param {Chip8} chip
     * @param {NBitArray} memory 
     */
    static init(chip, memory) {
        this.chip = chip;
        this.memory = memory;

        this.#foreachCell((r, c, cell) => {
            const addr = r * 16 + c - 1;
                
            if(addr < 0x200) {
                cell.innerHTML = 'xx'
                return;
            }

            cell.onclick = () => {
                if(HexCodeScreen.selectedHex) {
                    this.#unselectHexCell();
                }

                if(HexCodeScreen.selectedHex == cell) {
                    HexCodeScreen.selectedHex = undefined;
                }else {
                    cell.classList.remove('invalid')

                    cell.classList.add('editing')

                    HexCodeScreen.selectedHex = cell;
                }
            };
        })
    }

    /**
     * Call a function for each cell in the hex table
     * @param {function(Number, Number, HTMLTableRowElement)} action (row, col, cell) 
     */
    static #foreachCell(action) {
        for (let r = 1; r < HexCodeScreen.table.rows.length; r++) {
            const row = HexCodeScreen.table.rows[r];

            for(let c = 0; c < row.cells.length; c++) {
                const cell = row.cells[c]
                action(c, r, cell)
            }
        }
    }

    /**
     * Handels the process of unselecting a cell
     * Adds the 'invalid' tag if necessery
     */
    static #unselectHexCell() {
        if(HexCodeScreen.selectedHex) {
            if(HexCodeScreen.selectedHex.innerHTML == '_') {
                HexCodeScreen.selectedHex.classList.add('invalid')
            }

            HexCodeScreen.selectedHex.classList.remove('editing')
        }
    }

    static #openCh8File() {
        openFile((contents) => { 
            var u8bit = new Uint8Array(contents)
            this.chip.load_code(u8bit)
            this.chip.restart()
            this.loadHexCode();
        })
    }

    static #downloadHexfile() {
        const offset = 0x200
        let array = new Uint8Array(4096 - offset)
        
        this.#foreachCell((r, c, cell) => {
            const addr = r * 16 + c - 1;

            if(addr < 0x200) {
                return;
            }

            const inst = this.memory.get(addr) 

            array[addr - offset] = inst;
        })

        let endfile = array.length - 1;
        for(; endfile >= 0 && array[endfile] == 0; endfile--);

        array = array.slice(0, endfile + 1)

        const link = document.createElement('a');
        link.style.display = 'none';
        document.body.appendChild( link );
        
        const blob = new Blob([array], {type: "application/octet-stream"});	
        const objectURL = URL.createObjectURL(blob);
         
        link.href = objectURL;
        link.href = URL.createObjectURL(blob);
        link.download = 'data.ch8';
        link.click();
    }

    static #loadToChip() {
        this.#foreachCell((r, c, cell) => {
            const addr = r * 16 + c - 1;

            if(addr < 0x200) {
                return;
            }

            const inst = parseInt(cell.innerHTML, 16)

            this.memory.set(addr, inst);
        })

        this.chip.restart()
    }

    /**
     * Load hex memory into the hex table
     */
    static loadHexCode() {
        /**
         * @type {HTMLTableElement}
         */

        this.#foreachCell((r, c, cell) => {
            const addr = r * 16 + c - 1;

            if(addr < 0x200) {
                cell.innerHTML = 'xx'
                return;
            }

            const inst = this.memory.get(addr).toString(16)
            cell.innerHTML = inst
        })
    }
}