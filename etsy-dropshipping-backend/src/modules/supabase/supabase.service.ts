import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;
    private readonly logger = new Logger(SupabaseService.name);

    constructor(private configService: ConfigService) {
        this.initSupabase();
    }

    private initSupabase() {
        const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
        const supabaseKey = this.configService.get<string>('SUPABASE_KEY');

        if (!supabaseUrl || !supabaseKey) {
            this.logger.error('Supabase URL or Key is missing in configuration');
            return;
        }

        this.supabase = createClient(supabaseUrl, supabaseKey);
        this.logger.log('Supabase client initialized');
    }

    getClient(accessToken?: string): SupabaseClient {
        if (accessToken) {
            // Create a scoped client for the user
            return createClient(
                this.configService.get<string>('SUPABASE_URL')!,
                this.configService.get<string>('SUPABASE_KEY')!,
                {
                    global: {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
                    }
                }
            );
        }
        return this.supabase;
    }

    getAdminClient(): SupabaseClient {
        const adminKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');
        if (!adminKey) {
            this.logger.error('SUPABASE_SERVICE_ROLE_KEY is missing');
            throw new Error('Server configuration error: Missing Admin Key');
        }
        return createClient(
            this.configService.get<string>('SUPABASE_URL')!,
            adminKey
        );
    }
}
