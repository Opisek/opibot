import { Command, Category } from "../../types/command";

export default new Command("hello", "greets the user", Category.generic, interaction => {
    interaction.reply(`Hello, ${interaction.user}`);
});