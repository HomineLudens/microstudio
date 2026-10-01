// A single row in a DB table: wraps JSON-serialized record data, keeping
// the in-memory representation as a string (re-parsed on read) and
// notifying the owning table/cluster of updates for indexing/persistence.
// Plain Node CommonJS module (not part of the browser concatenation
// bundles — required directly via server/db/table.coffee).
// `data` is intentionally `any`: it alternates between a plain object (as
// passed in/returned by get()/set()) and its JSON.stringify'd string form
// (as stored on `this.data`), matching the original untyped CoffeeScript.
interface TableLike {
  updateIndexes(record: Record, old_data: unknown, data: unknown): void;
}

interface ClusterLike {
  save_requested: boolean;
}

class Record {
  table: TableLike;
  cluster: ClusterLike;
  id: unknown;
  data: any;

  constructor(table: TableLike, cluster: ClusterLike, id: unknown, data: any) {
    this.table = table;
    this.cluster = cluster;
    this.id = id;
    this.data = data;
    this.data.id = this.id;
    this.data = JSON.stringify(this.data);
  }

  get(): any {
    return JSON.parse(this.data);
  }

  set(data: any): void {
    const old_data = this.data;
    this.data = data;
    this.data.id = this.id;
    this.data = JSON.stringify(this.data);
    this.cluster.save_requested = true;
    this.table.updateIndexes(this, old_data, data);
  }

  setField(field: string, value: unknown): void {
    const data = this.get();
    if (value == null) {
      delete data[field];
    } else {
      data[field] = value;
    }
    this.set(data);
  }

  getField(field: string): unknown {
    const data = this.get();
    return data[field];
  }
}

export = Record;
