import { Migration } from '@mikro-orm/migrations';

export class Migration20240418153615 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "wallet" drop constraint "wallet_pkey";');
    this.addSql('alter table "wallet" drop column "id", drop column "address", drop column "private_key";');

    this.addSql('alter table "wallet" add column "public_key" text not null;');
    this.addSql('alter table "wallet" add constraint "wallet_pkey" primary key ("public_key");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "wallet" drop constraint "wallet_pkey";');

    this.addSql('alter table "wallet" add column "id" serial, add column "private_key" text not null;');
    this.addSql('alter table "wallet" rename column "public_key" to "address";');
    this.addSql('alter table "wallet" add constraint "wallet_pkey" primary key ("id");');
  }

}
