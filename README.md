# DigitalOcean Dynamic DNS Service

This is a small node application that periodically checks to see if your external IP address has changed, and if so, updates a DNS record on DigitalOcean.

This application uses the [ipify.org API](https://www.ipify.org/) to fetch external IP addresses. They say you can use it as much as you like, but please be kind and refrain from pummelling it.

Also, be aware of [DigitalOcean's API rate-limiting](https://docs.digitalocean.com/reference/api/api-reference/#section/Introduction/Rate-Limit). This application will make a single query for every domain passed in `DO_CHECK_DOMAINS` per cron cycle. If your external IP address and the address at DigitalOcean do not match, it will make another query to update the record.

## Installation

### Manual Installation

Clone this repository, then:

```sh
cd do-dyndns
pnpm i
pnpm start:prod
```

### Docker/Kubernetes

Deploy with image `jblyberg/do-dyndns:latest` and configure with the variables below

## Environmental Variables

- `DO_CRON_EXPRESSION` Optional. Default: `0 */30 * * * *` (30 minutes) Cron expression for how often to check.
- `DO_CHECK_DOMAINS` List of domains to check. Should be space-separated domain/record ID pairs. Example: `mydomain1.com:63546274 mydomain2.com:54726483`
- `DO_API_TOKEN` Digitalocean API token. Needs to have write access.
