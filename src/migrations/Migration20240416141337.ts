import { Migration } from '@mikro-orm/migrations';

export class Migration20240416141337 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "auth_key" ("id" serial primary key, "created_at" timestamptz not null, "updated_at" timestamptz not null, "public_key" text not null);');

    this.addSql('create table "session" ("hash" text not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, "public_key_id" int not null, "expire" timestamptz not null, constraint "session_pkey" primary key ("hash"));');

    this.addSql('alter table "session" add constraint "session_public_key_id_foreign" foreign key ("public_key_id") references "auth_key" ("id") on update cascade;');

    this.addSql('alter table "wallet" drop constraint "wallet_pkey";');

    this.addSql('alter table "wallet" add column "id" serial, add column "created_at" timestamptz not null, add column "updated_at" timestamptz not null;');
    this.addSql('alter table "wallet" alter column "public_key" type text using ("public_key"::text);');
    this.addSql('alter table "wallet" alter column "private_key" type text using ("private_key"::text);');
    this.addSql('alter table "wallet" add constraint "wallet_pkey" primary key ("id");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "session" drop constraint "session_public_key_id_foreign";');

    this.addSql('drop table if exists "auth_key" cascade;');

    this.addSql('drop table if exists "session" cascade;');

    this.addSql('alter table "wallet" drop constraint "wallet_pkey";');
    this.addSql('alter table "wallet" drop column "id", drop column "created_at", drop column "updated_at";');

    this.addSql('alter table "wallet" alter column "public_key" type varchar(255) using ("public_key"::varchar(255));');
    this.addSql('alter table "wallet" alter column "private_key" type varchar(255) using ("private_key"::varchar(255));');
    this.addSql('alter table "wallet" add constraint "wallet_pkey" primary key ("public_key");');
  }

}
