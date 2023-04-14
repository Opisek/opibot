import { commandCategory } from "../../types/commandCategories";
import { Command } from "../../types/command";

export default new Command("hello", commandCategory.generic, () => {
    console.log("hello");
});