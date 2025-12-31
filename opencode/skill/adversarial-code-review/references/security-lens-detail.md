# Security Lens Detail

Deep dive on the Malicious User lens for security-critical code review. Use this reference when reviewing authentication, authorization, user input handling, cryptography, or payment processing.

## When to Use This Reference

Escalate to this detailed security review when code touches:

- Authentication (login, session, tokens)
- Authorization (permissions, access control)
- User input that reaches databases, file systems, or external services
- Cryptographic operations
- Payment or financial transactions
- Personal data handling (PII, PHI)
- External API integrations with secrets

## Security Review Mindset

Assume the attacker:

- Has read your source code
- Knows your dependencies and their vulnerabilities
- Can send any input, in any format, at any time
- Will try millions of requests automatically
- Is patient and will chain small issues into big exploits

## Vulnerability Categories

Organized by attack surface, not by severity. All categories matter.

### 1. Injection Flaws

**The Pattern:** Untrusted data treated as code or commands.

| Type     | Dangerous Pattern               | Safe Alternative           |
| -------- | ------------------------------- | -------------------------- |
| SQL      | String concatenation in queries | Parameterized queries, ORM |
| Command  | User input in shell commands    | Avoid shell; use libraries |
| XSS      | Unescaped output in HTML        | Context-aware escaping     |
| LDAP     | User input in LDAP filters      | Escape special characters  |
| Template | User input in template strings  | Sandboxed templates        |

**Review Questions:**

- Is user input ever concatenated into queries/commands?
- Is output escaped appropriately for its context (HTML, JS, URL)?
- Are template engines configured to auto-escape?

### 2. Authentication Weaknesses

**The Pattern:** Flawed identity verification.

| Weakness            | What to Look For                              |
| ------------------- | --------------------------------------------- |
| Credential exposure | Passwords in logs, URLs, error messages       |
| Weak hashing        | MD5, SHA1, or unsalted hashes for passwords   |
| Session fixation    | Session ID doesn't regenerate on login        |
| Brute force         | No rate limiting on login endpoints           |
| Token leakage       | JWTs in URLs, localStorage without protection |

**Review Questions:**

- Are passwords hashed with bcrypt/scrypt/argon2?
- Is session ID regenerated after authentication?
- Is there rate limiting on authentication endpoints?
- Where are tokens stored? How are they transmitted?

### 3. Authorization Failures

**The Pattern:** Accessing resources without proper permission checks.

| Failure              | Example                                             |
| -------------------- | --------------------------------------------------- |
| Missing check        | Endpoint assumes caller is authorized               |
| IDOR                 | `/api/users/123` accessible without owning user 123 |
| Privilege escalation | Regular user accessing admin functions              |
| Path traversal       | `../` in file paths bypasses restrictions           |

**Review Questions:**

- Is authorization checked on EVERY endpoint, not just UI?
- Are object references validated against the current user?
- Is the authorization check close to the data access?
- Can path/ID manipulation access unauthorized resources?

### 4. Data Exposure

**The Pattern:** Sensitive data leaked through various channels.

| Channel   | What Leaks                                     |
| --------- | ---------------------------------------------- |
| Logs      | Passwords, tokens, PII in log statements       |
| Errors    | Stack traces, internal paths, query details    |
| Responses | Extra fields in API responses                  |
| Caches    | Sensitive data in browser/CDN caches           |
| Timing    | Password validity via response time difference |

**Review Questions:**

- Are sensitive fields excluded from logging?
- Are error messages generic to external users?
- Do API responses include only necessary fields?
- Are cache headers set correctly for sensitive responses?

### 5. Cryptographic Failures

**The Pattern:** Misused or weak cryptography.

| Failure            | Problem                                    |
| ------------------ | ------------------------------------------ |
| Weak algorithms    | DES, RC4, MD5 for security purposes        |
| Hard-coded keys    | Secrets in source code                     |
| Poor randomness    | `Math.random()` for security tokens        |
| Missing encryption | Sensitive data transmitted/stored in clear |
| Key management     | Keys stored alongside encrypted data       |

**Review Questions:**

- Are approved algorithms used (AES-256, RSA-2048+, SHA-256+)?
- Are secrets loaded from environment/secrets manager, not code?
- Is `crypto.randomBytes()` or equivalent used for tokens?
- Is sensitive data encrypted at rest and in transit?

### 6. Insecure Dependencies

**The Pattern:** Vulnerable third-party code.

| Risk                  | What to Check                          |
| --------------------- | -------------------------------------- |
| Known vulnerabilities | CVEs in dependencies                   |
| Outdated versions     | Unmaintained packages                  |
| Typosquatting         | Misspelled package names               |
| Excessive permissions | Packages requesting unnecessary access |

**Review Questions:**

- When was `npm audit` / `pip audit` / equivalent last run?
- Are there dependencies with known CVEs?
- Are dependencies pinned to specific versions?
- Is the supply chain verified (checksums, signatures)?

### 7. Business Logic Flaws

**The Pattern:** Abuse of legitimate functionality.

| Flaw                 | Example                                      |
| -------------------- | -------------------------------------------- |
| Race condition       | Double-submit creates duplicate transactions |
| State manipulation   | Skipping steps in multi-step process         |
| Negative values      | Negative quantity in cart = credit           |
| Unbounded operations | No limit on bulk operations                  |

**Review Questions:**

- Can operations be repeated to gain advantage?
- Can steps be skipped or reordered?
- Are all numeric inputs validated for sign and range?
- Are bulk operations bounded and rate-limited?

## Security Review Checklist

Use this checklist for security-critical code:

```
Security Review Progress:
- [ ] Input Handling
  - [ ] All inputs validated and sanitized
  - [ ] No string concatenation in queries/commands
  - [ ] Output escaped for context
- [ ] Authentication
  - [ ] Passwords properly hashed
  - [ ] Sessions properly managed
  - [ ] Rate limiting in place
- [ ] Authorization
  - [ ] Every endpoint has auth check
  - [ ] Object-level authorization verified
  - [ ] No privilege escalation paths
- [ ] Data Protection
  - [ ] Sensitive data not logged
  - [ ] Errors don't expose internals
  - [ ] Encryption for sensitive data
- [ ] Cryptography
  - [ ] Strong algorithms only
  - [ ] No hard-coded secrets
  - [ ] Proper randomness
- [ ] Dependencies
  - [ ] No known vulnerabilities
  - [ ] Versions pinned
- [ ] Business Logic
  - [ ] Race conditions considered
  - [ ] Numeric inputs bounded
  - [ ] Operations rate-limited
```

## Context-Specific Patterns

### Web Applications

| Area      | What to Check                                                        |
| --------- | -------------------------------------------------------------------- |
| CSRF      | State-changing requests require CSRF token                           |
| CORS      | `Access-Control-Allow-Origin` not wildcard for credentialed requests |
| Cookies   | `HttpOnly`, `Secure`, `SameSite` flags set                           |
| Headers   | Security headers present (CSP, X-Frame-Options, etc.)                |
| Redirects | Open redirect via unvalidated URL parameter                          |

### APIs

| Area               | What to Check                        |
| ------------------ | ------------------------------------ |
| Authentication     | Token validation on every request    |
| Rate limiting      | Per-user and per-endpoint limits     |
| Input validation   | Schema validation for request bodies |
| Response filtering | No extra fields leaked               |
| Versioning         | Old vulnerable versions disabled     |

### CLI Tools

| Area               | What to Check                    |
| ------------------ | -------------------------------- |
| Argument injection | User input in shell commands     |
| File operations    | Path traversal in file arguments |
| Environment        | Sensitive env vars not logged    |
| Temp files         | Secure permissions, cleaned up   |

### Background Jobs

| Area        | What to Check                               |
| ----------- | ------------------------------------------- |
| Input trust | Job payloads validated, not blindly trusted |
| Idempotency | Safe to retry without side effects          |
| Isolation   | Jobs can't affect each other                |
| Secrets     | Credentials not in job payloads             |

## Severity Classification for Security Issues

| Severity     | Criteria                                          | Examples                                 |
| ------------ | ------------------------------------------------- | ---------------------------------------- |
| **Critical** | Immediate exploitation possible, high impact      | SQL injection, auth bypass, RCE          |
| **High**     | Exploitation likely, significant impact           | XSS, IDOR, weak crypto                   |
| **Medium**   | Exploitation requires conditions, moderate impact | CSRF, information disclosure             |
| **Low**      | Exploitation unlikely or low impact               | Missing security headers, verbose errors |

## When to Stop and Escalate

Escalate beyond code review when you find:

- Any critical severity issue
- Multiple high severity issues
- Patterns suggesting systemic security gaps
- Cryptographic implementations (don't review—require expert audit)
- Payment processing logic (require PCI compliance review)

Security review is not a substitute for:

- Penetration testing
- Security audits by specialists
- Automated vulnerability scanning
- Threat modeling

## Red Flags That Indicate Deeper Problems

| Red Flag                     | What It Suggests            |
| ---------------------------- | --------------------------- |
| "We'll add auth later"       | Security as afterthought    |
| Custom crypto implementation | NIH syndrome, likely flawed |
| Disabled security features   | Shortcuts that persist      |
| No input validation anywhere | Missing security culture    |
| Secrets in source control    | Broken secrets management   |

When you see these patterns, the issue isn't this code—it's the process that produced it.
