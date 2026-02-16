import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (!user) {
            console.log(`Login failed: User not found for email ${email}`);
            return null;
        }

        if (!user.passwordHash) {
            console.log(`Login failed: User ${email} has no password set (Google auth user?)`);
            return null;
        }

        const isMatch = await bcrypt.compare(pass, user.passwordHash);
        if (isMatch) {
            const { passwordHash, ...result } = user;
            return result;
        }
        console.log(`Login failed: Password mismatch for user ${email}`);
        return null;
    }

    async login(loginDto: LoginDto) {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async register(createUserDto: CreateUserDto) {
        const user = await this.usersService.create(createUserDto);
        const payload = { email: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
            user,
        };
    }

    async loginGoogle(user: any) {
        const dbUser = await this.usersService.findOrCreate(user);
        const payload = { email: dbUser.email, sub: dbUser.id };
        return {
            access_token: this.jwtService.sign(payload),
            user: dbUser,
        };
    }

    async updatePassword(userId: string, password: string) {
        return this.usersService.updatePassword(userId, password);
    }
}
