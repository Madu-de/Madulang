const fs = require('fs');
const prompt = require('prompt-sync')();

fs.readFile('code.madulang', 'utf8', (err, data) => {
    if (err) throw err;
    compileAndRun(data);
});

let variables = new Map();

const KEYWORDS = [{
    keyword: 'PRINT',
    cb: (command) => {
        let outputString = command.split('"')[1];
        if (outputString == undefined) {
            outputString = command.slice(6);
        }
        console.log(outputString);
    }
}, {
    keyword: 'CLEAR',
    cb: (command) => {
        console.clear();
    }
}, {
    keyword: 'LOOP',
    cb: (command, codeblock) => {
        let count = command.split(' ')[1];
        for (let i = 0; i < count; i++) {
            for (let j = 0; j < codeblock.length; j++) {
                let element = codeblock[j];
                element = element.split(' ');
                if (element[1] === '$i') element[1] = `"${i + 1}"`;
                element = element.join(' ');
                compileAndRun(element);
            }
        }
    }
}, {
    keyword: 'BLOCK',
    cb: (command, codeblock) => {
        for (let j = 0; j < codeblock.length; j++) {
            let element = codeblock[j];
            element = element.split(' ');
            if (element[1] === 'i') element[1] = `"${i + 1}"`;
            element = element.join(' ');
            compileAndRun(element);
        }
    }
}, {
    keyword: 'JS',
    cb: (command) => {
        command = command.split('~')[1];
        eval(command);
    }
}, {
    keyword: 'VAR',
    cb: (command) => {
        let name = command.split(' ')[1];
        let value = command.split('"')[1];
        variables.set(name, value);
    }
}, {
    keyword: 'INPUT',
    cb: (command) => {
        let variable = command.split(' ')[1];
        variables.set(variable, prompt(''));
    }
}, {
    keyword: 'DEL',
    cb: (command) => {
        let name = command.split(' ')[1];
        variables.delete(name);
    }
}, {
    keyword: 'WAIT',
    cb: (command) => {
        let count = command.split(' ')[1];
        miliseconds = Number(count);
        let currentTime = new Date().getTime();
        while (currentTime + miliseconds >= new Date().getTime()) {}
    }
}, {
    keyword: '::',
    cb: (command) => {
        // Commands
    }
}];

function compileAndRun(input) {
    input = input.replaceAll(/(\r\n|\n|\r)/gm, '');
    input = input.replaceAll('{', '{;');
    input = input.replaceAll('}', '};');
    let commands = input.split(';');
    for (let i = 0; i < commands.length; i++) {
        while (commands[i].startsWith(' ')) {
            commands[i] = commands[i].substring(1);
        }
    }
    for (let i = 0; i < commands.length; i++) {
        const command = commands[i];
        if (command.includes('{')) {
            let codeblock = [...commands];
            for (let j = i + 1; j < commands.length; j++) {
                const element = commands[j];
                commands[j] = '';
                if (element.includes('}')) {
                    codeblock = codeblock.slice(i + 1, j);
                    commands[i + 1] = codeblock;
                    break;
                }
            }
        }
    }
    for (let i = 0; i < commands.length; i++) {
        let command = commands[i];
        if (command.includes('$')) {
            command = command.split(' ');
            for (let j = 0; j < command.length; j++) {
                let element = command[j];
                if (element.includes('$')) {
                    element = element.replaceAll('$', '');
                    let value = variables.get(element);
                    command[j] = value;
                }
            }
            commands[i] = command.join(' ');
        }
    }
    commands.forEach((command, index, array) => {
        try {
            const inputKeyword = command.split(' ')[0];
            let isAKeyWord = false;
            for (let i = 0; i < KEYWORDS.length; i++) {
                const keyword = KEYWORDS[i];
                if (inputKeyword === keyword.keyword) {
                    keyword.cb(command, array[index + 1]);
                    variables.set('allvariables', [...variables.keys()]);
                    isAKeyWord = true;
                }
            }
            if (!isAKeyWord && inputKeyword !== '') {
                console.log(`Error: Invalid keyword => ${inputKeyword}`);
            }
        } catch (e) {}
    });
}