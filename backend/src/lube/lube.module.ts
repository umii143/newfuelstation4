import { Module } from '@nestjs/common';
import { LubeController } from './lube.controller';
import { LubeService } from './lube.service';

@Module({
    controllers: [LubeController],
    providers: [LubeService],
    exports: [LubeService],
})
export class LubeModule {}
