import { Controller, Get, UseGuards } from '@nestjs/common';
import { CurrentUser } from './decorators';
import { FirebaseAuthGuard } from './firebase-auth.guard';

@Controller('auth-verify')
export class AuthVerifyController {
    @Get('me')
    @UseGuards(FirebaseAuthGuard)
    async getProfile(@CurrentUser() user: any) {
        // Using any temporarily for linting if Prisma client is not reloaded
        return {
            message: 'You are authenticated with Firebase!',
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                firebaseUid: user.firebaseUid,
                authMethod: user.authMethod,
            },
        };
    }
}
