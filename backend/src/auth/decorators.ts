import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

// Decorator to mark routes as public (no auth required)
export const Public = () => SetMetadata('isPublic', true);

// Decorator to get current authenticated user
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
});
