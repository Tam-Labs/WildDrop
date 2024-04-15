import { Migration } from '@mikro-orm/migrations';

export class Migration20240412104025 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "auth_key" ("public_key" varchar(255) not null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "auth_key_pkey" primary key ("public_key"));');

    this.addSql('alter table "wallet" add column "updated_at" timestamptz not null;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "auth_key" cascade;');

    this.addSql('alter table "wallet" drop column "updated_at";');
  }

}
