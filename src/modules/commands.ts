import hello from "../commands/generic/hello";

const commands = [
    hello    
];

export const array = commands;
export const map = new Map(commands.map(command => [ command.name, command ]));
export const slash = commands.map(command => ({ name: command.name, description: command.description }));