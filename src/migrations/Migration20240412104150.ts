import { Migration } from '@mikro-orm/migrations';

export class Migration20240412104150 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "auth_key" alter column "public_key" type text using ("public_key"::text);');
  }

  async down(): Promise<void> {
    this.addSql('alter table "auth_key" alter column "public_key" type varchar(255) using ("public_key"::varchar(255));');
  }

}
