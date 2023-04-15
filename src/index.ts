import dotenv from "dotenv";
import { Client, REST, Routes } from "discord.js";
import * as commands from "./modules/commands";
import { Database } from "./modules/database/database";
import { GuildSettings } from "./modules/database/models/guildSettings";

dotenv.config();

const database = new Database();
const client = new Client({ intents: [] });

(async () => {
    try {
        await database.init(
            process.env.DB_USERNAME,
            process.env.DB_PASSWORD,
            process.env.DB_HOST,
            Number.parseInt(process.env.DB_PORT),
            process.env.DB_DATABASE
        );
    } catch (error) {
        console.error(`Could not connect to the database: ${error}`);
        return;
    }

    client.login(process.env.TOKEN);
})();


client.on("ready", async () => {
    console.log(`${client.user.username} logged in.`);

    console.log("Registering commands");
    const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);
    await rest.put(Routes.applicationCommands(client.user.id), { body: commands.slash });

    console.log("Checking guild settings");
    await Promise.all((await client.guilds.fetch()).map(async guild => {
        const settings = await GuildSettings.findByPk(guild.id);
        if (settings == null) await GuildSettings.create({ guildId: guild.id });
    }));

    console.log(`${client.user.username} started up successfully!`);
});

client.on("interactionCreate", async interaction => {
    if (!interaction.isChatInputCommand()) return;
    if (!commands.map.has(interaction.commandName)) return;
    commands.map.get(interaction.commandName).run(interaction, await GuildSettings.findByPk(interaction.guild.id));
});

client.on("guildCreate", guild => {
    GuildSettings.create({ guildId: guild.id });
});