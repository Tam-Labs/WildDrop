import { Migration } from '@mikro-orm/migrations';

export class Migration20240416195732 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "wallet" drop column "encrypted_passphrase";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "wallet" add column "encrypted_passphrase" text not null;');
  }

}
