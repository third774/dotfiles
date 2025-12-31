# Edge Case Domains

Systematic edge case generation by input domain. This approach is **generative** not exhaustive—learn to ask the right questions, not memorize lists.

## The Five Input Domains

For any input, systematically consider these five domains:

| Domain            | Core Question                   | What It Reveals                      |
| ----------------- | ------------------------------- | ------------------------------------ |
| **Boundary**      | What are the limits?            | Off-by-one, overflow, underflow      |
| **Malformed**     | What if it's broken?            | Parsing failures, type coercion bugs |
| **Adversarial**   | What if it's hostile?           | Injection, DoS, resource exhaustion  |
| **Concurrent**    | What if it happens twice?       | Race conditions, deadlocks           |
| **Environmental** | What if the world is different? | Network failures, resource limits    |

## Domain 1: Boundary Values

Test the edges of valid input ranges.

### Questions to Ask

- What's the minimum valid value? What about min - 1?
- What's the maximum valid value? What about max + 1?
- What happens at zero?
- What happens with negative values?
- What happens with empty collections/strings?
- What happens with single-element collections?

### Common Boundary Bugs

| Type       | Boundary                       | Common Bug                               |
| ---------- | ------------------------------ | ---------------------------------------- |
| Arrays     | Empty, single, max size        | Index out of bounds, null pointer        |
| Strings    | Empty, single char, max length | Off-by-one in substring, buffer overflow |
| Numbers    | 0, -1, MAX_INT, MIN_INT        | Division by zero, overflow wrap          |
| Dates      | Epoch, far future, leap years  | Timezone bugs, Y2K-style issues          |
| Pagination | Page 0, page 1, last page      | Off-by-one, empty last page              |

### Boundary Checklist

```
For this input:
- [ ] Minimum value tested
- [ ] Maximum value tested
- [ ] Zero/empty tested
- [ ] Negative (if applicable) tested
- [ ] One-off from boundaries tested
```

## Domain 2: Malformed Data

Test inputs that violate expected format or type.

### Questions to Ask

- What if the type is wrong? (string where number expected)
- What if encoding is wrong? (UTF-8 vs Latin-1)
- What if structure is incomplete? (missing required fields)
- What if structure is extra? (unexpected additional fields)
- What if data is truncated mid-stream?

### Common Malformed Input Bugs

| Input Type | Malformed Variant     | Common Bug                       |
| ---------- | --------------------- | -------------------------------- |
| JSON       | Missing closing brace | Uncaught parse exception         |
| Strings    | Mixed encodings       | Mojibake, length miscalculation  |
| Numbers    | "123abc"              | Partial parsing, NaN propagation |
| Dates      | "2024-13-45"          | Invalid date accepted or crashes |
| Objects    | Null nested fields    | Null pointer on deep access      |

### Malformed Checklist

```
For this input:
- [ ] Wrong type tested
- [ ] Partial/truncated data tested
- [ ] Extra unexpected fields tested
- [ ] Encoding variations tested
- [ ] Null where object expected tested
```

## Domain 3: Adversarial Input

Test inputs designed to exploit or break the system.

### Questions to Ask

- What if I send the maximum allowed size?
- What if I send way more than expected?
- What if I include special characters that have meaning? (quotes, semicolons, angle brackets)
- What if I include escape sequences?
- What if I include path traversal sequences? (`../`)

### Common Adversarial Patterns

| Attack Vector     | Payload Example              | What It Exploits                |
| ----------------- | ---------------------------- | ------------------------------- |
| SQL Injection     | `'; DROP TABLE users;--`     | Unescaped SQL concatenation     |
| XSS               | `<script>alert(1)</script>`  | Unescaped HTML output           |
| Path Traversal    | `../../etc/passwd`           | Unvalidated file paths          |
| Command Injection | `; rm -rf /`                 | Shell command concatenation     |
| ReDoS             | `aaaaaaaaaaaaaaaaaaaaaaaaa!` | Catastrophic regex backtracking |
| Billion Laughs    | Nested entity expansion      | XML parser resource exhaustion  |

### Adversarial Checklist

```
For this input:
- [ ] Maximum size tested
- [ ] Over-maximum size tested
- [ ] Special characters tested (quotes, brackets, semicolons)
- [ ] Escape sequences tested
- [ ] Known attack patterns tested (if applicable)
```

## Domain 4: Concurrent Access

Test what happens when multiple operations occur simultaneously.

### Questions to Ask

- What if this operation runs twice at the exact same time?
- What if a read happens during a write?
- What if the order of operations is reversed?
- What if an operation is interrupted midway?
- What if a long operation overlaps with a short one?

### Common Concurrency Bugs

| Pattern        | Symptom                    | Root Cause                           |
| -------------- | -------------------------- | ------------------------------------ |
| Lost Update    | Last write wins, data lost | No locking on read-modify-write      |
| Dirty Read     | Reading uncommitted data   | No isolation between transactions    |
| Race Condition | Intermittent wrong results | Shared state without synchronization |
| Deadlock       | System hangs               | Circular lock dependencies           |
| Double Submit  | Duplicate records created  | No idempotency protection            |

### Concurrency Checklist

```
For this operation:
- [ ] Simultaneous identical requests tested
- [ ] Interleaved read/write tested
- [ ] Partial completion (interrupted) tested
- [ ] Lock acquisition order analyzed
- [ ] Idempotency verified
```

## Domain 5: Environmental Variance

Test behavior under different environmental conditions.

### Questions to Ask

- What if the network is slow or unavailable?
- What if disk is full?
- What if memory is exhausted?
- What if the clock is wrong or jumps?
- What if a dependent service is down?

### Common Environmental Bugs

| Condition       | Common Bug              | Proper Handling                       |
| --------------- | ----------------------- | ------------------------------------- |
| Network timeout | Hangs forever           | Timeout + retry with backoff          |
| Disk full       | Corrupted partial write | Atomic write or check before          |
| Clock skew      | Invalid timestamps      | Use monotonic clock or server time    |
| Service down    | Uncaught exception      | Circuit breaker, graceful degradation |
| High latency    | Timeout cascade         | Independent timeouts per service      |

### Environmental Checklist

```
For this system:
- [ ] Network failure handling tested
- [ ] Timeout behavior verified
- [ ] Resource exhaustion handled
- [ ] Clock dependency identified
- [ ] Dependent service failures handled
```

## Using Domains During Review

When reviewing code, apply domains to each input point:

1. **Identify inputs** — Parameters, request bodies, file contents, environment variables
2. **For each input, ask domain questions:**
   - Boundary: What are the limits?
   - Malformed: What if it's broken?
   - Adversarial: What if it's hostile?
   - Concurrent: What if it happens twice?
   - Environmental: What if the world is different?
3. **Note missing handling** — These become review findings

### Quick Reference

```
Input: [identify the input]

Boundary:    min? max? zero? empty? negative?
Malformed:   wrong type? truncated? encoding?
Adversarial: oversized? special chars? injection?
Concurrent:  simultaneous? interleaved? interrupted?
Environmental: network? disk? memory? clock? dependencies?
```

## Not Everything Needs Every Domain

Prioritize based on context:

| Code Type           | Priority Domains                   |
| ------------------- | ---------------------------------- |
| User input          | Adversarial, Boundary, Malformed   |
| Internal APIs       | Boundary, Concurrent               |
| Background jobs     | Concurrent, Environmental          |
| File processing     | Malformed, Boundary, Environmental |
| Database operations | Concurrent, Boundary               |

Don't exhaustively test every domain for every input. Focus where risk is highest.
