export class CodeConverter {
    /**
     * Convert an opcode to readable code
     * @param {Number} opcode
     * @returns {String}
     */
    static translate_opcode(opcode) {
        // Get lower and upper bytes
        const upper = (opcode >> 8) & 0xFF 
        const lower = opcode & 0xFF 

        // Get instructions as nibbles
        const nib1 = (opcode >> 12) & 0xf
        const nib2 = (opcode >> 8) & 0xf
        const nib3 = (opcode >> 4) & 0xf
        const nib4 = opcode & 0xf

        const addr_str = (instruction & 0xfff).toString(16)
        const upper_str = upper.toString(16)
        const lower_str = lower.toString(16)
        const nib1_str = nib1.toString(16)
        const nib2_str = nib2.toString(16)
        const nib3_str = nib3.toString(16)
        const nib4_str = nib4.toString(16)

        if(instruction == 0x00e0) return 'CLS'
        else if(instruction == 0x00ee) return 'RET'

        switch(nib1) {
            case 0: return 'SYS ' + addr_str
            case 1: return 'JP ' + addr_str
            case 2: return 'CALL ' + addr_str
            case 3: return `SE ${nib2_str}, ${lower_str}`
            case 4: return `SNE ${nib2_str}, ${lower}`
            case 5: return `SE ${nib2_str}, ${nib3_str}`
            case 6: return `LD ${nib2_str}, ${lower}`
            case 7: return `ADD ${nib2_str}, ${lower}`
            case 8: 
                switch (nib4) {
                    case 0: return `LD ${nib2_str}, ${nib3_str}`
                    case 1: return `OR ${nib2_str}, ${nib3_str}`
                    case 2: return `AND ${nib2_str}, ${nib3_str}`
                    case 3: return `XOR ${nib2_str}, ${nib3_str}`
                    case 4: return `ADD ${nib2_str}, ${nib3_str}`
                    case 5: return `SUB ${nib2_str}, ${nib3_str}`
                    case 6: return `SHR ${nib2_str}`
                    case 7: return `SUBN ${nib2_str}, ${nib3_str}`
                    case 0xe: return `SHL ${nib2_str}`
                }
                break;
            
            case 9:
                if(nib4 == 0) return `SNE ${nib2_str}, ${nib3_str}`
                break;
                
            case 0xa: return `LD I, ${addr_str}`
            case 0xb: return `JP V0, ${addr_str}`
            case 0xc: return `RND ${nib2_str}, ${lower}`
            case 0xd: return `DRW ${nib2_str}, ${nib3_str}, ${nib4_str}`

            case 0xe:
                if(lower == 0x9e) return `SKP ${nib2_str}`
                else if(lower == 0xa1) return `SKNP ${nib2_str}`
                break;

            case 0xF:
                switch(lower) { 
                    case 0x07: return `LD ${nib2_str}, DT`
                    case 0x0a: return `LD ${nib2_str}, K`
                    case 0x15: return `LD DT, ${nib2_str}`
                    case 0x18: return `LD ST, ${nib2_str}`
                    case 0x1e: return `ADD I, ${nib2_str}`
                    case 0x29: return `LD F, ${nib2_str}`
                    case 0x33: return `LD B, ${nib2_str}`
                    case 0x55: return `LD [I], ${nib2_str}`
                    case 0x65: return `LD ${nib2_str}, [I]`
                }
                break;
        }
    }

    /**
     * Convert string to opcode
     * @param {String} str
     * @returns {Number}
     */
    static convert_string(str) {
        switch(nib1) {
            case 0: return 'SYS ' + addr_str
            case 1: return 'JP ' + addr_str
            case 2: return 'CALL ' + addr_str
            case 3: return `SE ${nib2_str}, ${lower_str}`
            case 4: return `SNE ${nib2_str}, ${lower}`
            case 5: return `SE ${nib2_str}, ${nib3_str}`
            case 6: return `LD ${nib2_str}, ${lower}`
            case 7: return `ADD ${nib2_str}, ${lower}`
            case 8: 
                switch (nib4) {
                    case 0: return `LD ${nib2_str}, ${nib3_str}`
                    case 1: return `OR ${nib2_str}, ${nib3_str}`
                    case 2: return `AND ${nib2_str}, ${nib3_str}`
                    case 3: return `XOR ${nib2_str}, ${nib3_str}`
                    case 4: return `ADD ${nib2_str}, ${nib3_str}`
                    case 5: return `SUB ${nib2_str}, ${nib3_str}`
                    case 6: return `SHR ${nib2_str}`
                    case 7: return `SUBN ${nib2_str}, ${nib3_str}`
                    case 0xe: return `SHL ${nib2_str}`
                }
                break;
            
            case 9:
                if(nib4 == 0) return `SNE ${nib2_str}, ${nib3_str}`
                break;
                
            case 0xa: return `LD I, ${addr_str}`
            case 0xb: return `JP V0, ${addr_str}`
            case 0xc: return `RND ${nib2_str}, ${lower}`
            case 0xd: return `DRW ${nib2_str}, ${nib3_str}, ${nib4_str}`

            case 0xe:
                if(lower == 0x9e) return `SKP ${nib2_str}`
                else if(lower == 0xa1) return `SKNP ${nib2_str}`
                break;

            case 0xF:
                switch(lower) { 
                    case 0x07: return `LD ${nib2_str}, DT`
                    case 0x0a: return `LD ${nib2_str}, K`
                    case 0x15: return `LD DT, ${nib2_str}`
                    case 0x18: return `LD ST, ${nib2_str}`
                    case 0x1e: return `ADD I, ${nib2_str}`
                    case 0x29: return `LD F, ${nib2_str}`
                    case 0x33: return `LD B, ${nib2_str}`
                    case 0x55: return `LD [I], ${nib2_str}`
                    case 0x65: return `LD ${nib2_str}, [I]`
                }
                break;
        }
    }
}