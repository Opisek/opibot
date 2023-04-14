import { Message } from "discord.js";

import { commandCategory } from "./commandCategories";

export class Command {
    name: string;
    category: commandCategory;
    run: (message: Message<boolean>) => void;

    constructor(name: string, category: commandCategory, callback: (message: Message<boolean>) => void) {
        this.name = name;
        this.category = category;
        this.run = callback;
    }
}