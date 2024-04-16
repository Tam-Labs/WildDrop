import { Migration } from '@mikro-orm/migrations';

export class Migration20240416191435 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "wallet" add column "encrypted_passphrase" text not null;');
    this.addSql('alter table "wallet" rename column "private_key" to "encrypted_private_key";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "wallet" drop column "encrypted_passphrase";');

    this.addSql('alter table "wallet" rename column "encrypted_private_key" to "private_key";');
  }

}
