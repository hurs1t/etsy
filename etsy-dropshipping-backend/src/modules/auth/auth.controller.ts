import { Controller, Post, Body, Get, UseGuards, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AuthGuard } from '@nestjs/passport';

import { UsersService } from '../users/users.service';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        return this.authService.register(createUserDto);
    }

    @Get('google')
    @UseGuards(AuthGuard('google'))
    async googleAuth(@Req() req) { }

    @Get('google/callback')
    @UseGuards(AuthGuard('google'))
    async googleAuthRedirect(@Req() req, @Res() res) {
        const { access_token } = await this.authService.loginGoogle(req.user);
        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${access_token}`);
    }

    @Get('stats/users')
    async getUserStats() {
        const total = await this.usersService.getTotalUsers();
        return { total, limit: 100 };
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    async getProfile(@Req() req) {
        const userId = req.user.sub || req.user.userId || req.user.id;
        const rank = await this.usersService.getUserRank(userId);
        return {
            ...req.user,
            registrationRank: rank
        };
    }

    @UseGuards(JwtAuthGuard)
    @Post('update-password')
    async updatePassword(@Req() req, @Body() updatePasswordDto: UpdatePasswordDto) {
        // JwtStrategy returns { userId: sub, email: email }
        return this.authService.updatePassword(req.user.userId, updatePasswordDto.password);
    }
}
