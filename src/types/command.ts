import { commandCategory } from "./commandCategories";

export class Command {
    name: string;
    category: commandCategory;
    run: () => void;

    constructor(name: string, category: commandCategory, callback: () => void) {
        this.name = name;
        this.category = category;
        this.run = callback;
    }
}