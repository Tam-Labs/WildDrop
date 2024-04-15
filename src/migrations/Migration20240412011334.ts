import { Migration } from '@mikro-orm/migrations';

export class Migration20240412011334 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "wallet" add column "created_at" timestamptz not null;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "wallet" drop column "created_at";');
  }

}
