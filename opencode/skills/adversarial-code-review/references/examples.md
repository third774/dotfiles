# Adversarial Code Review Examples

Real examples showing the difference between valuable adversarial feedback and unhelpful pedantry. Study these patterns to calibrate your reviews.

## Good vs Bad Findings

### Example 1: Race Condition

**The Code:**

```javascript
async function incrementCounter(userId) {
  const current = await db.get(`counter:${userId}`);
  await db.set(`counter:${userId}`, current + 1);
  return current + 1;
}
```

**Bad Finding:**

> "This could have race conditions."

Why it's bad:

- No specific location
- No explanation of impact
- No demonstration of the problem
- Author doesn't learn anything

**Good Finding:**

> **Location:** `incrementCounter()` lines 2-3
>
> **Lens:** Data Integrity
>
> **Issue:** Read-modify-write without atomicity. If two requests call `incrementCounter` simultaneously for the same user, both read the same value (e.g., 5), both write 6, and one increment is lost.
>
> **Impact:** Counter will undercount in production under load. For rate limiting or billing, this could mean allowing overuse or undercharging.
>
> **Suggestion:** Use atomic increment (`INCR` in Redis) or optimistic locking with retry.

Why it's good:

- Specific location
- Clear explanation with concrete scenario
- Real-world impact stated
- Actionable suggestion

---

### Example 2: Input Validation

**The Code:**

```python
def get_user_file(filename):
    path = f"/uploads/{filename}"
    return open(path, 'r').read()
```

**Bad Finding:**

> "You should validate the filename."

Why it's bad:

- Doesn't explain why
- Doesn't show the attack
- Sounds like generic advice

**Good Finding:**

> **Location:** `get_user_file()` line 2
>
> **Lens:** Malicious User
>
> **Issue:** Path traversal vulnerability. An attacker can pass `filename="../../../etc/passwd"` to read arbitrary files on the server.
>
> **Impact:** Complete file system read access. Attacker could read config files, secrets, source code.
>
> **Severity:** Must Fix
>
> **Suggestion:** Validate filename contains no path separators, or use `os.path.basename()` and verify the resolved path is within `/uploads/`.

---

### Example 3: Error Handling

**The Code:**

```typescript
async function processPayment(orderId: string) {
  const order = await getOrder(orderId);
  await chargeCard(order.customerId, order.total);
  await markOrderPaid(orderId);
}
```

**Bad Finding:**

> "What if `chargeCard` fails?"

Why it's bad:

- Asks a question instead of stating the problem
- Doesn't explain the consequence
- Leaves author to figure out the issue

**Good Finding:**

> **Location:** `processPayment()` lines 3-4
>
> **Lens:** Ops/On-Call
>
> **Issue:** No error handling between charge and order update. If `chargeCard` succeeds but `markOrderPaid` fails (network error, database timeout), the customer is charged but order shows unpaid.
>
> **Impact:** Customer charged twice on retry, or order stuck in inconsistent state requiring manual intervention.
>
> **Severity:** Must Fix
>
> **Suggestion:** Wrap in transaction, or use idempotency key for charge, or mark order pending-paid before charging and confirm after.

---

### Example 4: Unhelpful Pedantry

**The Code:**

```javascript
const MAX_RETRIES = 3;

function fetchWithRetry(url) {
  let attempts = 0;
  while (attempts < MAX_RETRIES) {
    // ...
  }
}
```

**Bad Finding (pedantic):**

> "Consider using `const` for `attempts` since you're not reassigning... wait, you are. Never mind. But you could use a for loop instead of while, it's more idiomatic."

Why it's bad:

- Style preference, not a bug
- No impact on correctness
- "More idiomatic" is subjective
- Wastes author's time

**Why you shouldn't report this:**

- Both while and for loops work correctly
- This is a linter's job, not a reviewer's
- Author time is valuable
- Trust builds when you focus on real issues

---

### Example 5: Severity Calibration

**The Code:**

```javascript
// Internal admin CLI tool, not exposed to network
function formatOutput(data) {
  return `<div>${data.name}</div>`;
}
```

**Overcalibrated Finding:**

> **Severity:** CRITICAL
>
> "XSS vulnerability! User input is not escaped before rendering in HTML!"

Why severity is wrong:

- This is an internal CLI tool
- No browser rendering
- No external user input
- Theoretical, not practical risk

**Properly Calibrated Finding:**

> **Severity:** Consider
>
> **Location:** `formatOutput()` line 2
>
> **Lens:** Future Maintainer
>
> **Issue:** Unescaped output in HTML-like string. Currently safe in CLI context, but if this code is ever reused in a web context, it would be an XSS vulnerability.
>
> **Suggestion:** Low priority, but consider escaping as defensive practice, or add a comment noting CLI-only use.

---

## Complete Review Example

Here's what a well-structured review looks like:

### Code Under Review

```typescript
// user-service.ts
export async function updateUserEmail(userId: string, newEmail: string) {
  const user = await db.users.findById(userId);

  if (user.email === newEmail) {
    return user;
  }

  user.email = newEmail;
  user.emailVerified = false;
  await db.users.save(user);

  await emailService.sendVerification(newEmail);

  return user;
}
```

### Review Output

---

## Summary

Email update function with one must-fix race condition and one should-fix error handling gap. Overall clean implementation.

### What's Done Well

- Correctly resets `emailVerified` flag when email changes
- Short-circuits if email unchanged (good optimization)
- Sends verification email after update

### Must Fix

#### Race Condition on Concurrent Updates

**Location:** `updateUserEmail()` lines 2-10

**Lens:** Data Integrity

**Issue:** Read-modify-write pattern without locking. If user submits email change twice quickly (double-click, network retry), both requests read the same initial state, and second update may overwrite first without re-verifying.

**Impact:** User could end up with unverified email they didn't intend, or verification email sent to wrong address.

**Suggestion:** Add optimistic locking (version field) or use atomic update operation.

### Should Fix

#### Partial Failure State

**Location:** `updateUserEmail()` lines 9-11

**Lens:** Ops/On-Call

**Issue:** If `db.users.save()` succeeds but `emailService.sendVerification()` fails, user's email is changed but no verification email is sent. User cannot verify the new email.

**Impact:** User stuck with unverified email, requires manual support intervention.

**Suggestion:** Either: (a) queue verification email to retry on failure, or (b) wrap in transaction and rollback if email fails, or (c) add background job to detect and retry failed verifications.

### Consider

- Add input validation for email format before database operation (fail fast)

---

## Anti-Pattern Examples

### The Dump Truck

Reviewing who lists every possible issue without filtering:

> - Line 2: Could use destructuring
> - Line 3: Consider early return pattern
> - Line 4: Magic string "email" could be constant
> - Line 5: Prefer strict equality
> - Line 6: Variable name could be more descriptive
> - Line 7: Consider using optional chaining
> - [... 20 more items]

**Problem:** Overwhelms author, buries important issues in noise, destroys reviewer credibility.

**Fix:** Apply impact filter. Report 2-5 important issues, not 25 trivial ones.

---

### The Question Asker

Reviewer who only asks questions:

> - What happens if the user is null?
> - Have you considered the race condition case?
> - Is this function tested?
> - What about error handling?

**Problem:** Makes author do all the analysis. Lazy reviewing.

**Fix:** State the issue, explain impact, suggest solution. Questions are for clarification, not findings.

---

### The Rewriter

Reviewer who would implement everything differently:

> I would have structured this completely differently. First, I'd extract the email validation into a separate service, then create an event-driven architecture for the verification flow, use dependency injection for the database layer, and...

**Problem:** Imposes personal preferences, discourages author, not actionable.

**Fix:** Review the code that was written, not the code you would have written. Focus on bugs, not architecture preferences (unless there's a real problem).

---

### The Theorist

Reviewer who finds theoretical issues that won't happen:

> In a distributed system with eventual consistency, if we had multiple data centers with bi-directional replication, and a user updated their email from both locations within the replication window, we could theoretically see...

**Problem:** Theoretical risk in a system that isn't distributed. Wastes time on non-existent problems.

**Fix:** Review the actual system, not an imaginary future system. Focus on likely issues, not theoretical edge cases in different architectures.

---

## Calibration Questions

Before reporting a finding, ask yourself:

1. **Is this likely to happen?** If probability is near zero, reconsider.
2. **What's the actual impact?** Not theoretical worst case.
3. **Would the author learn something?** If it's obvious, skip it.
4. **Am I helping or showing off?** Reviews should help, not demonstrate cleverness.
5. **Would I want to receive this feedback?** Apply the golden rule.

If a finding doesn't pass these questions, don't report it.
