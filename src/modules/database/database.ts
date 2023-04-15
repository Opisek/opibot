import { Sequelize } from "sequelize";
import * as GuildSettings from "./models/guildSettings";

export class Database { 
    sequelize: Sequelize;

    async init (user: string, password: string, host: string, port: number, database: string): Promise<void> {
        this.sequelize = new Sequelize(
            `postgres://${user}:${password}@${host}:${port}/${database}`,
            { logging:false }
        );
        await this.sequelize.authenticate();

        GuildSettings.initialize(this.sequelize);

        await this.sequelize.sync({ alter:true });
    }
}