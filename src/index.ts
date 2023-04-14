import dotenv from "dotenv";
import { Client, IntentsBitField } from "discord.js";
import commands from "./modules/commands";

dotenv.config();

const client = new Client({intents: new IntentsBitField(32767)});

client.login(process.env.TOKEN);

client.on("ready", () => {
    console.log(`${client.user.username} started up successfully!`);
    console.log(commands);
});