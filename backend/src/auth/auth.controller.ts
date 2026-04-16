import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators';
import { FirebaseAuthGuard } from './firebase-auth.guard';

class RegisterDto {
    email: string;
    password: string;
    fullName: string;
    organizationName: string;
    stationName?: string;
}

class LoginDto {
    email: string;
    password: string;
}

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        return this.authService.register(dto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto.email, dto.password);
    }

    @Post('google')
    @HttpCode(HttpStatus.OK)
    @UseGuards(FirebaseAuthGuard)
    async googleLogin(@CurrentUser() user: any) {
        return this.authService.loginWithGoogle(user);
    }
}
