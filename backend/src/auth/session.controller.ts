import { Controller, Delete, Get, Param, UseGuards } from '@nestjs/common';
import { User } from '@prisma/client';
import { AuditAction, AuditService } from './audit.service';
import { CurrentUser } from './decorators';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { SessionService } from './session.service';

@Controller('sessions')
@UseGuards(FirebaseAuthGuard)
export class SessionController {
    constructor(
        private sessionService: SessionService,
        private auditService: AuditService
    ) {}

    @Get()
    async getMySessions(@CurrentUser() user: User) {
        return await this.sessionService.getUserSessions(user.id);
    }

    @Delete(':id')
    async terminateSession(@Param('id') sessionId: string, @CurrentUser() user: User) {
        const session = await this.sessionService.deactivateSession(sessionId);

        await this.auditService.log({
            userId: user.id,
            email: user.email,
            action: AuditAction.SESSION_TERMINATED,
            status: 'SUCCESS',
            metadata: { sessionId },
        });

        return { message: 'Session terminated successfully', session };
    }
}
