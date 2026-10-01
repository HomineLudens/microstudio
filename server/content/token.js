"use strict";
class Token {
    constructor(content, record) {
        this.content = content;
        this.record = record;
        const data = this.record.get();
        this.id = data.id;
        this.value = data.value;
        this.date_created = data.date_created;
        this.user = this.content.users[data.user];
    }
}
module.exports = Token;
