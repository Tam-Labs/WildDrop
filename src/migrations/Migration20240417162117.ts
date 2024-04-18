import { Migration } from '@mikro-orm/migrations';

export class Migration20240417162117 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "auth_key" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "public_key" text not null);');

    this.addSql('create table "session" ("hash" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "auth_key_id" int not null, "expire" timestamptz not null, constraint "session_pkey" primary key ("hash"));');

    this.addSql('create table "wallet" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "address" text not null, "private_key" text not null);');

    this.addSql('alter table "session" add constraint "session_auth_key_id_foreign" foreign key ("auth_key_id") references "auth_key" ("id") on update cascade;');
  }

}
