import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { DNSService } from './providers/DNSService';
import { ScheduleService } from './providers/ScheduleService';

@Module({
  imports: [ScheduleModule.forRoot()],
  providers: [DNSService, ScheduleService],
})
export class DNSModule {}
