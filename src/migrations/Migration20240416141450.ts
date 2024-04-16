import { Migration } from '@mikro-orm/migrations';

export class Migration20240416141450 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "session" drop constraint "session_public_key_id_foreign";');

    this.addSql('alter table "session" rename column "public_key_id" to "auth_key_id";');
    this.addSql('alter table "session" add constraint "session_auth_key_id_foreign" foreign key ("auth_key_id") references "auth_key" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "session" drop constraint "session_auth_key_id_foreign";');

    this.addSql('alter table "session" rename column "auth_key_id" to "public_key_id";');
    this.addSql('alter table "session" add constraint "session_public_key_id_foreign" foreign key ("public_key_id") references "auth_key" ("id") on update cascade;');
  }

}
