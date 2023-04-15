import { simpleEmbed } from "../../modules/embeds";
import { Command, Category } from "../../types/command";

export default new Command("hello", "greets the user", Category.generic, interaction => {
    interaction.reply(simpleEmbed("Hello", `Hello, ${interaction.user}`).messageBody);
});