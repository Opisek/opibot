import { Command, Category } from "../../types/command";

export default new Command("hello", Category.generic, message => {
    message.reply(`Hello, ${message.author}`);
});