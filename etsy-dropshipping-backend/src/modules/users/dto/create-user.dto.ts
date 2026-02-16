import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsOptional()
    @MinLength(6)
    password?: string;

    @IsString()
    @IsNotEmpty()
    fullName: string;

    @IsString()
    @IsOptional()
    googleId?: string;

    @IsString()
    @IsOptional()
    avatarUrl?: string;
}
