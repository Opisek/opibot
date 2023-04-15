import { DataTypes, Model, Sequelize } from "sequelize";
import { Color } from "../../../types/embeds";

export class GuildSettings extends Model {
    declare guildId: number;
    declare primaryColor: number;
    declare successColor: number;
    declare failureColor: number;
    declare warningColor: number;

    getColor(color: Color) {
        switch (color) {
            case Color.primary:
                return this.primaryColor;
            case Color.success:
                return this.successColor;
            case Color.failure:
                return this.failureColor;
            case Color.warning:
                return this.warningColor;
        }
    }
}

export function initialize (sequelize: Sequelize) {
    GuildSettings.init({
        guildId: {
            type: DataTypes.BIGINT,
            primaryKey: true
        },
        primaryColor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0xb71fb2
        },
        successColor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0x40ed10
        },
        failureColor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0xef2a10
        },
        warningColor: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0xef9a10
        }
    }, {
        sequelize,
        modelName: "GuildSettings"
    });
}