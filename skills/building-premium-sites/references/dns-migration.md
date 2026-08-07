# Migrating a domain to Vercel + email fix (Brevo)

Goal: point `example.com` at Vercel **while keeping Google Workspace mail working**, and **authenticate the domain with Brevo** so form emails are delivered.

Runbook written for DNS hosted at **Infomaniak** (nameservers ns41/ns42.infomaniak.com). The nameservers stay where they are; only the records change. Any other registrar works the same way — the record types and values below are what matter.

---

## Current state (audit the zone first, record what you find)

| Type | Name | Value | Fate |
|------|------|-------|------|
| A | @ | current host IPv4 | Replace |
| AAAA | @ | current host IPv6 | **DELETE** |
| A | www | current host IPv4 | Replace |
| AAAA | www | current host IPv6 | **DELETE** (blocks the CNAME) |
| MX | @ | 1 smtp.google.com / 15 …mx-verification.google.com | **KEEP** |
| TXT (SPF) | @ | `v=spf1 include:_spf.google.com ~all` | Extend |
| TXT | @ | `google-site-verification=<token>` | **KEEP** |
| DKIM/DMARC | — | (none) | Create |

> **AAAA = the IPv6 address** (twin of the IPv4 A record). Both point at the old host. Delete the AAAA records, otherwise IPv6 visitors keep seeing the old site. A name carrying a CNAME can hold no other record — the `www` AAAA is what makes the registrar refuse the CNAME.

---

## 1. Site -> Vercel

1. Vercel -> project `<your-project>` -> Settings -> Domains -> add **example.com** AND **www.example.com**. Vercel displays the exact records it expects (the values below are the standard ones; when in doubt, follow what Vercel shows).
2. At the DNS host (zone for example.com):

| Action | Type | Name | Value | TTL |
|--------|------|------|-------|-----|
| Delete | A + AAAA | @ | (old host) | — |
| Delete | A + AAAA | www | (old host) | — |
| Add | A | @ | `76.76.21.21` | 3600 |
| Add | CNAME | www | `cname.vercel-dns.com` | 3600 |

   - Delete the **AAAA** (IPv6) records on @ and www: IPv6 visitors would otherwise land on the old site, and the www AAAA blocks the CNAME.
   - Leave the apex without an AAAA (Vercel provides none; dual-stack handles it).
   - If the registrar still refuses the CNAME on www after the AAAA is gone, use an A record `www -> 76.76.21.21` instead.
3. Vercel issues the SSL certificate automatically once propagation completes.
4. `proxy.ts` marks only `*.vercel.app` as `noindex` -> **example.com will be indexed** (the canonical already points at example.com through `site.url`).

> Mail is untouched: neither the MX (Google) nor the google-site-verification record changes.

---

## 2. Email fix — authenticate the domain with Brevo

Cause of "message sent but nothing received": Brevo accepts the mail (`250 OK queued`) but sends from Brevo servers "on behalf of" example.com, while SPF authorises Google only and no Brevo DKIM exists -> Google Workspace files it as **spam** or rejects it.

### a) In Brevo
1. Brevo -> **Senders, domains & IPs -> Domains** -> add and **authenticate `example.com`**. Brevo generates 2 DKIM records (TXT) plus a verification code.
2. Validate the sender `hello@example.com` (Brevo's validation email arrives, since it is sent from Brevo's own authenticated infrastructure).

### b) In DNS

| Type | Name | Value | Note |
|------|------|-------|------|
| TXT (SPF) | @ | `v=spf1 include:_spf.google.com include:spf.brevo.com ~all` | **Replace** the old SPF. Exactly ONE SPF line allowed. |
| TXT (DKIM 1) | (given by Brevo) | (given by Brevo) | Copy-paste from Brevo |
| TXT (DKIM 2) | (given by Brevo) | (given by Brevo) | Copy-paste from Brevo |
| TXT (DMARC) | `_dmarc` | `v=DMARC1; p=none; rua=mailto:hello@example.com` | Recommended |

3. Go back to Brevo and click **Authenticate / Verify** once the records have propagated (15 min to 24 h).

---

## 3. Checks after propagation

```bash
dig +short example.com A            # must return the Vercel IP
dig +short www.example.com CNAME    # cname.vercel-dns.com
dig +short example.com MX           # still smtp.google.com (unchanged)
dig +short example.com TXT          # SPF with include:spf.brevo.com
dig +short brevo._domainkey.example.com TXT   # Brevo DKIM present
dig +short _dmarc.example.com TXT   # DMARC present
```

Then **re-test the contact form**: the mail must land in `hello@example.com` (check spam too for the first few sends).

> While propagation is pending, test emails are most likely in the **spam/quarantine folder** of hello@example.com (Google Workspace).

---

## Pitfalls
- Keep a single SPF record (`v=spf1 …`): merge Google + Brevo into one line.
- Keep the Google MX and the google-site-verification record.
- The diagnostic logging in `app/api/contact/route.ts` (`[contact] …`) confirms delivery in the Vercel logs; remove it once email is validated.
