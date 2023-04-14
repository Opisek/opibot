import dotenv from "dotenv";
import { Client, GatewayIntentBits } from "discord.js";
import commands from "./modules/commands";

dotenv.config();

const client = new Client({intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
]});

client.login(process.env.TOKEN);

client.on("ready", () => {
    console.log(`${client.user.username} started up successfully!`);
});

const prefix = "!";

client.on("messageCreate", message => {
    if (!message.content.startsWith(prefix)) return;
    const command = message.content.substring(prefix.length).trim().split(" ")[0];
    if (!commands.has(command)) return;
    commands.get(command).run(message);
});