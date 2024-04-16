import { Migration } from '@mikro-orm/migrations';

export class Migration20240416201733 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "wallet" rename column "encrypted_private_key" to "private_key";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "wallet" rename column "private_key" to "encrypted_private_key";');
  }

}
