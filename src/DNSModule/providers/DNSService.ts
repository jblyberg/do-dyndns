import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { createApiClient } from 'dots-wrapper';
import { GetDnsRecordArguments } from 'src/types/GetDnsRecordArguments';
import { UpdateDnsRecordArguments } from 'src/types/UpdateDnsRecordArguments';

@Injectable()
export class DNSService {
  private logger = new Logger(DNSService.name);
  private client: ReturnType<typeof createApiClient>;
  private domains = process.env.DO_CHECK_DOMAINS;
  private do_api_token = process.env.DO_API_TOKEN || '';

  constructor() {
    this.client = createApiClient({ token: this.do_api_token });
  }

  public async checkDomainRecords() {
    const domains_to_check = this.parseDomainEnvString(this.domains);

    if (!domains_to_check) {
      throw new InternalServerErrorException('Application is not configured correctly.');
    }

    let real_ip: string;

    try {
      real_ip = await this.getExternalIp();
    } catch (error) {
      this.logger.error('Cannot get external IP address', error);
      return;
    }

    for (const domain of domains_to_check) {
      let do_ip = '';

      try {
        const domain_record = await this.getDoDnsRecord(domain);
        do_ip = domain_record.data;
      } catch (error) {
        this.logger.error(`${domain.domain_name}: Could not check IP address from domain record`, error);
        continue;
      }

      if (!real_ip || !do_ip) {
        this.logger.error(`${domain.domain_name}: Unable to determine IP addresses. Exiting.`);
        continue;
      }

      if (real_ip === do_ip) {
        this.logger.log(`IP address for ${domain.domain_name} unchanged. Skipping.`);
        continue;
      }

      try {
        const updateDnsRecordArguments = {
          domain_name: domain.domain_name,
          domain_record_id: domain.domain_record_id,
          data: real_ip,
        };

        await this.updateDoDnsRecord(updateDnsRecordArguments);

        this.logger.log(`${domain.domain_name}: IP address changed from ${do_ip} to ${real_ip}. Record updated.`);
      } catch (error) {
        this.logger.error(
          `${domain.domain_name}: IP address changed, but could not update DNS record. Skipping.`,
          error,
        );
        continue;
      }
    }
  }

  public async getDoDnsRecord(getDnsRecordArguments: GetDnsRecordArguments) {
    const {
      data: { domain_record },
    } = await this.client.domain.getDomainRecord(getDnsRecordArguments);

    return domain_record;
  }

  public async updateDoDnsRecord(updateDnsRecordArguments: UpdateDnsRecordArguments) {
    const {
      data: { domain_record },
    } = await this.client.domain.updateDomainRecord(updateDnsRecordArguments);

    return domain_record;
  }

  public async getExternalIp() {
    const ip = await fetch('https://api.ipify.org/');
    return ip.text();
  }

  private parseDomainEnvString(environmentString?: string): GetDnsRecordArguments[] | undefined {
    if (!environmentString) {
      throw new InternalServerErrorException('DO_CHECK_DOMAINS is not configured.');
    }

    return environmentString.split(' ').map((section: string) => {
      const section_split = section.split(':');

      if (!section_split[0] || !section_split[1]) {
        throw new InternalServerErrorException('DO_CHECK_DOMAINS is not configured properly.');
      }

      return {
        domain_name: section_split[0],
        domain_record_id: Number(section_split[1]),
      };
    });
  }
}
