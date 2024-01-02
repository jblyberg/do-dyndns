# DigitalOcean Dynamic DNS Service

This is a small node application that periodically checks to see if your external IP address has changed, and if so, updates a DNS record on DigitalOcean

## Installation

### Manual Installation

Clone this repository, then:

```sh
cd do-dyndns
pnpm i
pnpm start:prod
```

## Environmental Variables

`DO_CRON_EXPRESSION` Optional. Default: `0 */30 * * * *` (30 minutes) Cron expression for how often to check.
`DO_CHECK_DOMAINS` List of domains to check. Should be space-separated domain/record ID pairs. Example: `mydomain1.com:63546274 mydomain2.com:54726483`
`DO_API_TOKEN` Digitalocean API token. Needs to have write access.
