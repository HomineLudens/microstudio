"use strict";
class Record {
    constructor(table, cluster, id, data) {
        this.table = table;
        this.cluster = cluster;
        this.id = id;
        this.data = data;
        this.data.id = this.id;
        this.data = JSON.stringify(this.data);
    }
    get() {
        return JSON.parse(this.data);
    }
    set(data) {
        const old_data = this.data;
        this.data = data;
        this.data.id = this.id;
        this.data = JSON.stringify(this.data);
        this.cluster.save_requested = true;
        this.table.updateIndexes(this, old_data, data);
    }
    setField(field, value) {
        const data = this.get();
        if (value == null) {
            delete data[field];
        }
        else {
            data[field] = value;
        }
        this.set(data);
    }
    getField(field) {
        const data = this.get();
        return data[field];
    }
}
module.exports = Record;
