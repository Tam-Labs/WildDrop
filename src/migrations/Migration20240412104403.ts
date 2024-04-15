import { Migration } from '@mikro-orm/migrations';

export class Migration20240412104403 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "wallet" alter column "public_key" type text using ("public_key"::text);');
    this.addSql('alter table "wallet" alter column "private_key" type text using ("private_key"::text);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "wallet" alter column "public_key" type varchar(255) using ("public_key"::varchar(255));');
    this.addSql('alter table "wallet" alter column "private_key" type varchar(255) using ("private_key"::varchar(255));');
  }

}
