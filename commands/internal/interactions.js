class Interaction {
    constructor(resolver) {
        this.resolver = resolver;
    }
    start(startMessage) {
        this.message = startMessage;
        this.channel = startMessage.channel;
        this.guild = startMessage.guild;
        this.member = startMessage.member;
        this.user = startMessage.member.user;
    }
    async sendEmbed(embed, options = []) {
        let id = Date.now();
        let message = formulateContent(embed, options, id);
        if (this.editable == null) this.editable = await this.message.reply(message);
        else await this.editable.edit(message);
        if (options.length == 0) return null;
        return await new Promise(res => {this.resolver.add(id, res, this.user.id, options);})
        
    }
    async sendText(text) {
        return await this.message.reply(text);
    }
    stop() {}
}

function sendEmbedToChannel(channel, embed) {
    channel.send(formulateContent(embed, []));
}

function formulateComponent(component, id) {
    let content = {"custom_id": id};
    switch (component.type) {
        case "select":
            content.type = 3;
            content.options = [];
            for (const [i, option] of component.content.entries()) {
                option.value = i.toString();
                content.options.push(option);
            }
            break;
        case "button":
            component.content.custom_id = id;
            component.content.type = 2;
            content = component.content;
            if ("query" in component) content.query = component.query;
            break;
        case "text":
            break;
        default:
    }
    return content;
}

function formulateContent(embed, rows, id = null) {
    let content = {embeds: [embed], components: []};
    for (const [i, elements] of rows.entries()) {
        let row = {"type": 1, "components": []};
        for (const [j, element] of elements.entries()) row.components.push(formulateComponent(element, `${id};${i};${j}`));
        content.components.push(row);
    }
    return content;
}

class InteractionResolver {
    constructor() {
        this.pending = {};
    }
    add(id, resolve, user, options) {
        this.pending[id] = {"callback": resolve, "user": user, "options": options};
    }
    query(id, row, column) {
        if (!(id in this.pending)) return null;
        let obj = this.pending[id].options[row][column];
        if ("query" in obj) return obj.query;
        else return null;
    }
    resolve(id, value, user) {
        if (id in this.pending) {
            let obj = this.pending[id];
            if (user.id == obj.user) {
                obj.callback(value);
                delete this.pending[id];
            }
            return true;
        }
        return false;
    }
}

module.exports = {
    Interaction,
    InteractionResolver,
    sendEmbedToChannel
};