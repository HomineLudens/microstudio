// Content token: thin wrapper exposing a user-facing view of a DB record
// (id/value/date_created/author) for the content/token API.
// Plain Node CommonJS module (not part of the browser concatenation
// bundles — required directly via server/content/content.coffee).
interface RecordLike {
  get(): { id: unknown; value: unknown; date_created: unknown; user: string };
}

interface ContentLike {
  users: { [userId: string]: unknown };
}

class Token {
  content: ContentLike;
  record: RecordLike;
  id: unknown;
  value: unknown;
  date_created: unknown;
  user: unknown;

  constructor(content: ContentLike, record: RecordLike) {
    this.content = content;
    this.record = record;
    const data = this.record.get();
    this.id = data.id;
    this.value = data.value;
    this.date_created = data.date_created;
    this.user = this.content.users[data.user];
  }
}

export = Token;
