import { NBitArray } from "./nbit.mjs";

export class CodeScreen {
    /**
     * @param {NBitArray} memory 
     */
    static loadHexCode(memory) {
        /**
         * @type {HTMLTableElement}
         */

        var table = document.getElementById("hexcodeTable");

        for (let r = 1; r < table.rows.length; r++) {
            const row = table.rows[r];

            for(let c = 0; c < row.cells.length; c++) {
                const cell = row.cells[c]
                const addr = c * 16 + r - 1;
                const inst = memory.get(addr).toString(16)

                cell.innerHTML = inst
            }
        }
    }
}