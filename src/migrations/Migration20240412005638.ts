import { Migration } from '@mikro-orm/migrations';

export class Migration20240412005638 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "wallet" ("public_key" varchar(255) not null, "private_key" varchar(255) not null, constraint "wallet_pkey" primary key ("public_key"));');
  }

}
