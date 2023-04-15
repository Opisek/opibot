import dotenv from "dotenv";
import { Client, REST, Routes } from "discord.js";
import * as commands from "./modules/commands";

dotenv.config();

const client = new Client({intents: []});

client.login(process.env.TOKEN);

client.on("ready", async () => {
    console.log(`${client.user.username} logged in.`);

    console.log("Registering commands");
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands.slash });

    console.log(`${client.user.username} started up successfully!`);
});

client.on("interactionCreate", interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (!commands.map.has(interaction.commandName)) return;
    commands.map.get(interaction.commandName).run(interaction);
});