import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Airtable from 'airtable';

@Injectable()
export class AirtableService {
    private base: Airtable.Base;
    private readonly logger = new Logger(AirtableService.name);

    constructor(private configService: ConfigService) {
        const apiKey = this.configService.get<string>('AIRTABLE_API_KEY');
        const baseId = this.configService.get<string>('AIRTABLE_BASE_ID');

        if (!apiKey || !baseId) {
            this.logger.warn('Airtable API Key or Base ID not configured');
            return;
        }

        const airtable = new Airtable({ apiKey });
        this.base = airtable.base(baseId);
    }

    // Users Table Operations
    async createUser(userData: any): Promise<any> {
        try {
            return await this.base('Users').create(userData);
        } catch (error) {
            this.logger.error(`Error creating user: ${error.message}`, error.stack);
            throw error;
        }
    }

    async findUserByEmail(email: string) {
        try {
            const records = await this.base('Users')
                .select({ filterByFormula: `{email} = '${email}'` })
                .firstPage();
            return records[0];
        } catch (error) {
            this.logger.error(`Error finding user: ${error.message}`, error.stack);
            throw error;
        }
    }

    // Generic Create
    async createRecord(tableName: string, data: any) {
        try {
            return await this.base(tableName).create(data);
        } catch (error) {
            this.logger.error(`Error creating record in ${tableName}: ${error.message}`, error.stack);
            throw error;
        }
    }

    // Generic Find One
    async findRecord(tableName: string, recordId: string) {
        try {
            return await this.base(tableName).find(recordId);
        } catch (error) {
            this.logger.error(`Error finding record in ${tableName}: ${error.message}`, error.stack);
            throw error;
        }
    }

    // Generic Find
    async findRecords(tableName: string, filterByFormula?: string) {
        try {
            const selectOptions: any = {};
            if (filterByFormula) {
                selectOptions.filterByFormula = filterByFormula;
            }
            return await this.base(tableName).select(selectOptions).all();
        } catch (error) {
            this.logger.error(`Error finding records in ${tableName}: ${error.message}`, error.stack);
            throw error;
        }
    }
}
