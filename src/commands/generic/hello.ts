import { commandCategory } from "../../types/commandCategories";
import { Command } from "../../types/command";

export default new Command("hello", commandCategory.generic, message => {
    message.reply(`Hello, ${message.author}`);
});