import { Module } from '@nestjs/common';
import { CngController } from './cng.controller';
import { CngService } from './cng.service';

@Module({
    controllers: [CngController],
    providers: [CngService],
    exports: [CngService],
})
export class CngModule {}
