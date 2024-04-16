import { Migration } from '@mikro-orm/migrations';

export class Migration20240416195828 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "wallet" rename column "public_key" to "address";');
  }

  async down(): Promise<void> {
    this.addSql('alter table "wallet" rename column "address" to "public_key";');
  }

}
