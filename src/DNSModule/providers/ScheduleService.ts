import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DNSService } from './DNSService';

@Injectable()
export class ScheduleService {
  private logger = new Logger(ScheduleService.name);

  constructor(private readonly dnsService: DNSService) {}

  @Cron(process.env.DO_CRON_EXPRESSION || CronExpression.EVERY_30_MINUTES)
  async processSchedules() {
    this.logger.log('Checking domain IPs...');
    await this.dnsService.checkDomainRecords();
  }
}
