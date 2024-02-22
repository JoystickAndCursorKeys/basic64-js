//const fs = require('fs');
//const path = require('path');

class C64BasicProgram {
    constructor() {

        this.tokens = [];
        var tokens = this.tokens;

        tokens[0x80] = 'END';
        tokens[0x81] = 'FOR';
        tokens[0x82] = 'NEXT';
        tokens[0x83] = 'DATA';
        tokens[0x84] = 'INPUT#';
        tokens[0x85] = 'INPUT';
        tokens[0x86] = 'DIM';
        tokens[0x87] = 'READ';
        tokens[0x88] = 'LET';
        tokens[0x89] = 'GOTO';
        tokens[0x8A] = 'RUN';
        tokens[0x8B] = 'IF';
        tokens[0x8C] = 'RESTORE';
        tokens[0x8D] = 'GOSUB';
        tokens[0x8E] = 'RETURN';
        tokens[0x8F] = 'REM';
        tokens[0x90] = 'STOP';
        tokens[0x91] = 'ON';
        tokens[0x92] = 'WAIT';
        tokens[0x93] = 'LOAD';
        tokens[0x94] = 'SAVE';
        tokens[0x95] = 'VERIFY';
        tokens[0x96] = 'DEF';
        tokens[0x97] = 'POKE';
        tokens[0x98] = 'PRINT#';
        tokens[0x99] = 'PRINT';
        tokens[0x9A] = 'CONT';
        tokens[0x9B] = 'LIST';
        tokens[0x9C] = 'CLR';
        tokens[0x9D] = 'CMD';
        tokens[0x9E] = 'SYS';
        tokens[0x9F] = 'OPEN';
        tokens[0xA0] = 'CLOSE';
        tokens[0xA1] = 'GET';
        tokens[0xA2] = 'NEW';
        tokens[0xA3] = 'TAB(';
        tokens[0xA4] = 'TO';
        tokens[0xA5] = 'FN';
        tokens[0xA6] = 'SPC(';
        tokens[0xA7] = 'THEN';
        tokens[0xA8] = 'NOT';
        tokens[0xA9] = 'STEP';
        tokens[0xAA] = '+';
        tokens[0xAB] = '-';
        tokens[0xAC] = '*';
        tokens[0xAD] = '/';
        tokens[0xAE] = '^';
        tokens[0xAF] = 'AND';
        tokens[0xB0] = 'OR';
        tokens[0xB1] = '>';
        tokens[0xB2] = '=';
        tokens[0xB3] = '<';
        tokens[0xB4] = 'SGN';
        tokens[0xB5] = 'INT';
        tokens[0xB6] = 'ABS';
        tokens[0xB7] = 'USR';
        tokens[0xB8] = 'FRE';
        tokens[0xB9] = 'POS';
        tokens[0xBA] = 'SQR';
        tokens[0xBB] = 'RND';
        tokens[0xBC] = 'LOG';
        tokens[0xBD] = 'EXP';
        tokens[0xBE] = 'COS';
        tokens[0xBF] = 'SIN';
        tokens[0xC0] = 'TAN';
        tokens[0xC1] = 'ATN';
        tokens[0xC2] = 'PEEK';
        tokens[0xC3] = 'LEN';
        tokens[0xC4] = 'STR$';
        tokens[0xC5] = 'VAL';
        tokens[0xC6] = 'ASC';
        tokens[0xC7] = 'CHR$';
        tokens[0xC8] = 'LEFT$';
        tokens[0xC9] = 'RIGHT$';
        tokens[0xCA] = 'MID$';
        tokens[0xCB] = 'GO';

    }


    // Parse BASIC lines
    parseBasicProgram(data) {
        let offset = 2; // Start after the load address
        let lines = [];
        this.lines = lines;

        if (!(data[0] === 0x01 && data[1] === 0x08)) {
            throw ('This is not a BASIC program');
        }

        while (offset < data.length) {
            
            const nextLineAddr = data[offset] + (data[offset + 1] << 8);
            const lineNumber = data[offset+2] + (data[offset + 3] << 8);
            
            if( nextLineAddr == 0) break;   

            offset += 4; // Move past the pointer and line number

            let symbols = [];
            while (data[offset] !== 0x00 && offset < data.length) { // 0x00 marks the end of a line
                symbols.push(data[offset]);
                offset++;
            }

            lines.push({ nextLineAddr, lineNumber, symbols });
            offset++; // Move past the 0x00 byte
        }
    }

    convertLines(lines, escapePetscii = false) {
        var tokens = this.tokens;

        var printedLines = lines.map(line => {
            const lineNumberStr = line.lineNumber.toString();
            const next = line.nextLineAddr.toString();
            let inString = false; // Flag to track if we are inside a string
            const symbolsStr = line.symbols.map(symbol => {
                // Check if we're entering or exiting a string
                if (symbol === 0x22) { // 0x22 is the ASCII code for "
                    inString = !inString;
                    return '"';
                }

                // If we're inside a string, or the symbol is unknown, convert to ASCII character
                if (inString || !tokens[symbol]) {
                    if (inString && (symbol < 32 || symbol > 127)) {
                        if( escapePetscii ) { 
                            return `\\x${symbol.toString(16).padStart(2, '0')}`;
                        }
                        return String.fromCharCode(symbol);
                        //return String.fromCharCode(symbol);
                    }
                    return String.fromCharCode(symbol);
                }

                // If it's a known token and we're not in a string, convert to the token representation
                return tokens[symbol];
            }).join('');

            return `${lineNumberStr} ${symbolsStr}`;
        });


        return printedLines;
    }

    // Print the program
    getTextProgramLines( escapePetscii = false) {

        var printedLines =
            this.convertLines(this.lines, escapePetscii );

        return printedLines;
    }


}




// Add more tokens as needed...

// Load and parse the PRG file
function loadPrgFile(filePath, action) {
    fs.readFile(filePath, (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        action(data);
        // Check if it's a BASIC program

    });
}

/*
var pgm = new C64BasicProgram();

// Replace 'your-program.prg' with the path to your actual PRG file
loadPrgFile(path.join(__dirname, 'bombardement.prg')
    , (data) => {
        pgm.parseBasicProgram(data);

        pgm.printProgram(pgm.printedLines);
    }
);
*/

