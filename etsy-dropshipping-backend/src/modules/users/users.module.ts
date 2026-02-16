import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AirtableModule } from '../airtable/airtable.module';

@Module({
    imports: [AirtableModule],
    providers: [UsersService],
    exports: [UsersService],
})
export class UsersModule { }
