import { Injectable, ConflictException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { SupabaseService } from '../supabase/supabase.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private readonly supabaseService: SupabaseService) { }

    async create(createUserDto: CreateUserDto) {
        const { email, password, fullName } = createUserDto;
        const supabase = this.supabaseService.getClient();

        // Check if user exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Check 100 user registration limit
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (countError) throw new InternalServerErrorException('Failed to verify registration limits');
        if (count !== null && count >= 100) {
            throw new ForbiddenException('Platform registration limit (100 users) has been reached. No new accounts can be created at this time.');
        }

        // Hash password if provided
        let passwordHash: string | null = null;
        if (password) {
            const salt = await bcrypt.genSalt();
            passwordHash = await bcrypt.hash(password, salt);
        }

        // Create user in Supabase
        const { data, error } = await supabase
            .from('users')
            .insert({
                email,
                password_hash: passwordHash,
                full_name: fullName,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        return {
            id: data.id,
            email: data.email,
            fullName: data.full_name,
        };
    }

    async findOne(email: string) {
        const supabase = this.supabaseService.getClient();
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) return null;

        return {
            id: user.id,
            email: user.email,
            passwordHash: user.password_hash,
            fullName: user.full_name,
            ...user,
        };
    }
    async findFirst() {
        const supabase = this.supabaseService.getClient();
        const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .limit(1)
            .single();

        if (error || !user) {
            console.error('[UsersService] findFirst error:', error);
            return null;
        }

        return {
            id: user.id,
            email: user.email,
            passwordHash: user.password_hash,
            fullName: user.full_name,
            ...user,
        };
    }

    async findOrCreate(profile: any) {
        const { email, firstName, lastName, googleId, picture } = profile;
        const supabase = this.supabaseService.getClient();

        // 1. Try to find by google_id
        let { data: user } = await supabase
            .from('users')
            .select('*')
            .eq('google_id', googleId)
            .single();

        if (user) return this.mapUser(user);

        // 2. Try to find by email (if exists, link google_id)
        ({ data: user } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single());

        if (user) {
            // Update user with google_id
            await supabase
                .from('users')
                .update({ google_id: googleId, avatar_url: picture })
                .eq('id', user.id);
            return this.mapUser({ ...user, google_id: googleId, avatar_url: picture });
        }

        // Check 100 user registration limit before creating a new Google user
        const { count, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

        if (countError) throw new InternalServerErrorException('Failed to verify registration limits');
        if (count !== null && count >= 100) {
            throw new ForbiddenException('Platform registration limit (100 users) has been reached. No new accounts can be created at this time.');
        }

        // 3. Create new user
        const newUser = {
            email,
            full_name: `${firstName} ${lastName}`.trim(),
            google_id: googleId,
            avatar_url: picture,
            created_at: new Date().toISOString(),
            // No password hash for google users
        };

        const { data: createdUser, error } = await supabase
            .from('users')
            .insert(newUser)
            .select()
            .single();

        if (error) {
            throw new InternalServerErrorException(error.message);
        }

        return this.mapUser(createdUser);
    }


    async updatePassword(userId: string, password: string) {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);

        const supabase = this.supabaseService.getClient();
        const { error } = await supabase
            .from('users')
            .update({ password_hash: passwordHash })
            .eq('id', userId);

        if (error) {
            console.error('[UsersService] Password update error:', error);
            throw new InternalServerErrorException(`Failed to update password: ${error.message} (${error.code})`);
        }

        return { success: true };
    }

    async updateEtsyTokens(userId: string, tokens: any) {
        // Use Admin Client to bypass RLS, as this is a backend operation authenticated by Guard
        const supabase = this.supabaseService.getAdminClient();

        // Prepare update object
        const updateData: any = {
            etsy_access_token: tokens.access_token,
            etsy_refresh_token: tokens.refresh_token,
        };

        // Handle Expiry
        if (tokens.expires_in) {
            updateData.etsy_token_expires_at = new Date(Date.now() + (tokens.expires_in * 1000)).toISOString();
        } else {
            // If disconnecting (tokens are null), clear expiry
            updateData.etsy_token_expires_at = null;
        }

        // Handle Shop ID (if passed)
        if (tokens.shop_id !== undefined) {
            updateData.shop_id = tokens.shop_id;
        }

        const { error } = await supabase
            .from('users')
            .update(updateData)
            .eq('id', userId);

        if (error) {
            console.error('[UsersService] Etsy token update error:', error);
            throw new InternalServerErrorException(`Database Error: ${error.message}`);
        }
    }

    private mapUser(user: any) {
        return {
            id: user.id,
            email: user.email,
            passwordHash: user.password_hash,
            fullName: user.full_name,
            avatarUrl: user.avatar_url,
            googleId: user.google_id,
            ...user,
        };
    }
}
