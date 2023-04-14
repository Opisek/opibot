import hello from "../commands/generic/hello";

const commands = [
    hello    
];

export default new Map(commands.map(command => [ command.name, command ]));