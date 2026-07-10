---
title: 'The Hidden "firstOrCreate()" Case-Sensitivity Trap in Laravel'
description: 'Laravel''s firstOrCreate() returned the wrong record due to MySQL''s case-insensitive collation. Learn how collations work and 5 production-ready fixes.'
date: '2026-07-10'
tags: ['Laravel', 'MySQL', 'Eloquent', 'Database Collation', 'Debugging', 'Backend']
category: 'Backend'
difficulty: 'Intermediate'
tech: ['Laravel', 'SQL']
learn:
    - 'How firstOrCreate() actually works under the hood, and why its equality check is decided entirely by the database, not by Laravel or PHP.'
    - 'What MySQL collations are and how to read them, including the meaning of _ci, _cs, _ai, _as, and _bin suffixes, and how common collations like utf8mb4_unicode_ci and utf8mb4_bin compare strings differently.'
    - 'Why case-insensitive collations silently break case-sensitive business rules, and how to diagnose this class of bug using query logging and SHOW FULL COLUMNS.'
    - 'How MySQL, PostgreSQL, and SQLite differ in string comparison defaults, and why MySQL is the outlier that is loose by default while the others are strict.'
    - 'Five production-ready solutions, from quick hotfix to bulletproof, covering case-sensitive collations, unique indexes, and the constraint-plus-try/catch pattern that survives race conditions.'
    - 'Why database constraints, not application code, must be the source of truth for uniqueness, and how to design for duplicate key errors instead of pretending they cannot happen.'
---

A few days ago I spent the better part of an afternoon chasing a bug that, in hindsight, was not a bug at all. Laravel did exactly what it was told. MySQL did exactly what it was configured to do. The problem was that nobody had told either of them about a business rule that lived only in our heads.

This article walks through the incident, explains how `firstOrCreate()` actually works under the hood, and covers how MySQL, PostgreSQL, and SQLite compare strings differently. If you store any kind of case-sensitive identifier in a relational database, this is worth ten minutes of your time.

## The setup

Our application has a `bills` table. When a user creates a Task, they type the bill name manually into a free-text field. Bill names are short codes like `HR123` or `FIN042`, and they matter because a downstream system consumes them. That external system treats bill codes as case-sensitive: `HR123` and `hr123` are two completely different bills as far as it is concerned.

Before saving a task, the application checks whether the bill already exists. If it does, we attach the existing record. If not, we create a new one. The original implementation was the obvious one:

```php
$bill = Bill::firstOrCreate([
    'name' => $name,
]);
```

Clean, idiomatic, and it passed every test we had written. It ran in production for months without complaint.

## The incident

One day a user created a task and typed the bill code as `HR123`. Shortly after, they realized the code was wrong. The correct code, the one the external system expected, was `hr123`. Lowercase.

No problem, they thought. They created another task and typed `hr123` this time, expecting the system to either create a new bill or store the corrected value.

Instead, the task was silently attached to the old `HR123` bill. No new record. No update. The wrong code kept flowing to the external system, and the external system kept rejecting it.

## The investigation

The bug report read: "I typed hr123 but the system keeps using HR123."

My first instinct was to blame the frontend. Maybe some input normalization, an `uppercase` CSS transform leaking into the submitted value, or a stale cached response. I checked the request payload in the network tab. The payload was correct: `"name": "hr123"`.

Next suspect: some mutator or observer on the `Bill` model transforming the value. I grepped for `strtoupper`, `strtolower`, `Str::upper`, accessors, casts, saving hooks. Nothing. The model was boring, exactly as a model should be.

Then I enabled query logging and reproduced the issue locally:

```php
DB::enableQueryLog();

Bill::firstOrCreate(['name' => 'hr123']);

dd(DB::getQueryLog());
```

The log showed a single query:

```sql
select * from `bills` where (`name` = 'hr123') limit 1
```

One SELECT. No INSERT. Laravel found a match and returned it. That was the moment the problem stopped being a Laravel problem and became a database problem. I ran the query directly in MySQL:

```sql
SELECT * FROM bills WHERE name = 'hr123';
```

It returned the `HR123` row.

Then I checked the column definition:

```sql
SHOW FULL COLUMNS FROM bills;
```

The `name` column was `varchar(255)` with collation `utf8mb4_unicode_ci`. That `_ci` suffix stands for case-insensitive. To MySQL, `HR123` and `hr123` were the same string. Laravel had asked "does this bill exist?", MySQL had answered "yes, here it is", and Laravel had handed it back. Every component behaved correctly. The system as a whole was wrong.

## How firstOrCreate() works internally

To understand why this happened, it helps to know exactly what `firstOrCreate()` does. There is no magic in it. Conceptually, Laravel performs these steps:

1. Run a SELECT using the attributes you passed as the WHERE clause.
2. If a row comes back, hydrate it into a model and return it.
3. If no row comes back, run an INSERT with the attributes (merged with any second-argument values).
4. Return the freshly created model.

A simplified version of the implementation looks like this:

```php
public function firstOrCreate(array $attributes = [], array $values = [])
{
    // Step 1 and 2: try to find an existing row
    if (! is_null($instance = $this->where($attributes)->first())) {
        return $instance;
    }

    // Step 3 and 4: nothing found, insert a new row
    return $this->create(array_merge($attributes, $values));
}
```

Two details matter here.

First, the comparison in step 1 is not performed by PHP. Laravel builds a `WHERE name = ?` clause and hands it to the database. Whether `'hr123'` matches `'HR123'` is decided entirely by the database, according to the collation of that column. Laravel performs no case conversion, no normalization, no trimming. It is a thin translator between your PHP code and SQL.

Second, whether the following is true or false:

```
HR123 == hr123
```

is not a property of your application. It is a property of your schema. Change the collation and the answer changes, without touching a single line of PHP.

> **Note:** Newer Laravel versions also ship `firstOrCreate()` variants and `createOrFirst()` with slightly different ordering to reduce race conditions, but the fundamental point stands: the equality check happens in the database, under the database's rules.

### Limitations of firstOrCreate()

`firstOrCreate()` is a convenience method, not a correctness guarantee. Its limitations are worth spelling out:

* **It depends entirely on database comparison rules.** The lookup is a plain SQL equality check. Collation, character set, and trailing-space handling all influence what "exists" means.
* **It is not aware of case-sensitive business rules.** If your business considers `HR123` and `hr123` different but your column collation does not, `firstOrCreate()` will happily return the "wrong" row. It has no way to know better.
* **It cannot fix incorrect collations.** No amount of application code changes how the database compares strings. The fix belongs in the schema.
* **It is not concurrency safe by itself.** The SELECT and the INSERT are two separate statements. Between them, another request can insert the same value.
* **Two simultaneous requests can still create duplicates** unless a unique constraint exists at the database level. Under load, both requests can run the SELECT, both can see no row, and both can INSERT.
* **Database constraints should always be considered the source of truth.** Application-level checks are a user experience feature. Integrity is the database's job.

> **Warning:** If uniqueness matters, add a unique index. `firstOrCreate()` without a unique constraint is a race condition waiting for traffic.

## Understanding MySQL collations

A collation is a set of rules the database uses to compare and sort strings. The character set (like `utf8mb4`) defines how characters are encoded as bytes. The collation defines which of those characters count as equal and how they order relative to each other.

The suffixes tell you the rules:

| Suffix | Meaning |
|--------|---------|
| `_ci` | Case-insensitive: `A` equals `a` |
| `_cs` | Case-sensitive: `A` does not equal `a` |
| `_ai` | Accent-insensitive: `é` equals `e` |
| `_as` | Accent-sensitive: `é` does not equal `e` |
| `_bin` | Binary: compares raw code points, sensitive to everything |

Some names omit part of the story. For example, `utf8mb4_unicode_ci` does not say `_ai`, but it is accent-insensitive in practice for most comparisons. `utf8mb4_0900_ai_ci` is explicit about being both accent-insensitive and case-insensitive.

Here is how the common collations behave:

| Collation | Case-sensitive | Accent-sensitive | Notes |
|-----------|----------------|------------------|-------|
| `utf8mb4_general_ci` | No | No | Legacy, fast, less accurate Unicode rules |
| `utf8mb4_unicode_ci` | No | No | Better Unicode handling (UCA based) |
| `utf8mb4_0900_ai_ci` | No | No | MySQL 8.0 default, Unicode 9.0 rules |
| `utf8mb4_0900_as_cs` | Yes | Yes | Linguistic sorting with full sensitivity |
| `utf8mb4_bin` | Yes | Yes | Raw binary comparison of code points |

And concrete comparisons:

| Comparison | `general_ci` | `unicode_ci` | `0900_ai_ci` | `utf8mb4_bin` |
|------------|--------------|--------------|--------------|----------------|
| `HR123` = `hr123` | Equal | Equal | Equal | Not equal |
| `ABC` = `abc` | Equal | Equal | Equal | Not equal |
| `Résumé` = `Resume` | Equal | Equal | Equal | Not equal |
| `ä` = `a` | Equal | Equal | Equal | Not equal |

You can verify this yourself without creating a table:

```sql
SELECT 'HR123' = 'hr123' COLLATE utf8mb4_0900_ai_ci AS ai_ci_result;
-- 1 (equal)

SELECT 'HR123' = 'hr123' COLLATE utf8mb4_bin AS bin_result;
-- 0 (not equal)

SELECT 'Résumé' = 'Resume' COLLATE utf8mb4_0900_ai_ci AS accent_result;
-- 1 (equal)
```

> **Note:** The differences between `general_ci` and `unicode_ci` show up with more complex characters. For example, `unicode_ci` treats the German `ß` as equal to `ss`, while `general_ci` does not. For plain ASCII identifiers they behave the same, but `general_ci` is considered legacy and should generally be avoided in new schemas.

Case-insensitive defaults exist for good reason. For human-facing text like names, emails, and search terms, users expect `John` and `john` to match. The defaults optimize for the common case. Identifiers consumed by machines are the exception, and exceptions need explicit configuration.

## Why the issue happened

With the collation knowledge in place, the incident explains itself.

The `name` column used `utf8mb4_unicode_ci`. When Laravel executed:

```sql
SELECT * FROM bills WHERE name = 'hr123' LIMIT 1;
```

MySQL applied case-insensitive comparison rules and matched the existing `HR123` row. Laravel received a result, so `firstOrCreate()` returned it and never reached the INSERT branch.

No update happened, because `firstOrCreate()` never updates. No insert happened, because a "matching" row existed. The user's correction was silently absorbed.

The behavior was completely expected once the collation was understood. The mismatch was between our business rule (bill codes are case-sensitive) and our schema (the column said they are not).

## My practical solution

The immediate production fix needed to be small, safe, and shippable the same day. Here is exactly what went out:

```php
$bill = Bill::firstOrCreate([
    'name' => $name,
]);

if ($bill->name !== $name) {
    $bill->update([
        'name' => $name,
    ]);
}

return $bill;
```

The trick is that PHP's `!==` operator is byte-exact. Even when MySQL considers `HR123` and `hr123` equal and returns the existing row, PHP does not. The strict comparison detects the casing difference and issues an UPDATE that rewrites the stored value with the exact string the user typed.

In other words: let the database do the fuzzy matching to find the record, then let PHP enforce the exact spelling.

This solution intentionally updates the stored value whenever only the letter casing differs. The most recently typed casing wins. That was acceptable for us because:

* Bill codes are unique within the system, so there was no risk of colliding with a different legitimate record.
* Users occasionally fix typing mistakes, and "last write wins" matched how they expected corrections to behave.
* This endpoint has relatively low traffic, so the extra query cost was negligible.
* Simplicity was preferred. The whole fix is four lines and requires no migration, no downtime, and no coordination with other teams.

### Tradeoffs

Be honest about what this fix does not do:

* It performs one additional UPDATE whenever the casing differs. On a hot path this doubles the write load for corrected values.
* It is not enough for high concurrency systems. Two simultaneous requests can still race between the SELECT and the INSERT and produce duplicates, and two concurrent corrections can overwrite each other.
* It treats the symptom in one code path. Any other query against `bills.name` still uses case-insensitive matching. The schema is still lying about the business rule.

That last point is why the practical fix was a patch, not the destination.

## Production-ready solutions

Here are the approaches I would consider, ordered from simplest to strongest. In a mature system you often end up combining several.

### Solution 1: The application-level fix

The `firstOrCreate()` plus strict-comparison update shown above.

Where it works well: low-traffic endpoints, systems where you cannot easily run schema migrations, or as a same-day hotfix while the proper schema change goes through review. It is also useful when you deliberately want case-insensitive lookup with exact-case storage, which is a legitimate pattern for some domains.

Where it falls short: it does nothing for concurrency, and it only protects the code paths that use it.

### Solution 2: Case-sensitive database collation

Change the column so the database itself considers `HR123` and `hr123` different values:

```sql
ALTER TABLE bills
MODIFY name VARCHAR(255)
COLLATE utf8mb4_bin
NOT NULL;
```

With `utf8mb4_bin`, comparison happens on raw code points. `H` (U+0048) and `h` (U+0068) are different code points, so:

```sql
SELECT * FROM bills WHERE name = 'hr123';
```

no longer matches `HR123`. The original `firstOrCreate()` call starts behaving correctly with zero application changes, because the database's definition of equality now matches the business rule.

In a Laravel migration:

```php
Schema::table('bills', function (Blueprint $table) {
    $table->string('name')
        ->collation('utf8mb4_bin')
        ->change();
});
```

> **Warning:** Changing a collation affects every query against that column: WHERE clauses, JOINs, GROUP BY, ORDER BY, and index usage. Audit existing queries before migrating. Sorting under `utf8mb4_bin` is by code point, so `Z` sorts before `a`, which may surprise users if the column feeds a sorted UI.

### Solution 3: Unique index with case-sensitive collation

Combine the case-sensitive collation with a unique constraint:

```sql
ALTER TABLE bills
MODIFY name VARCHAR(255)
COLLATE utf8mb4_bin
NOT NULL;

ALTER TABLE bills
ADD UNIQUE INDEX bills_name_unique (name);
```

Now duplicates become impossible, not just unlikely. Even if two concurrent requests both pass the SELECT check in `firstOrCreate()`, the second INSERT fails with a duplicate key error instead of silently creating a second `hr123` row.

This is the core argument for letting the database enforce integrity: application code runs in many concurrent processes that cannot see each other. The database is the single point where all writes converge, so it is the only place a uniqueness rule can actually be guaranteed. Application checks improve error messages; constraints prevent corruption.

One consequence of adding the constraint: your code must now be prepared for the duplicate key error instead of assuming the INSERT always succeeds. Solution 5 below shows the full pattern for handling it gracefully.

### Solution 4: Application validation plus database constraints

The strongest posture uses both layers, each doing the job it is good at.

The application layer validates early and produces friendly feedback:

```php
$request->validate([
    'name' => [
        'required',
        'string',
        'max:255',
        'regex:/^[A-Za-z]{2,4}\d{1,5}$/',
    ],
]);
```

The database layer guarantees the invariants: case-sensitive collation so equality matches the business rule, and a unique index so duplicates are structurally impossible.

Why both? Because they fail differently. Validation catches mistakes at the edge, where you can return a 422 with a helpful message. Constraints catch everything validation missed: race conditions, background jobs, artisan commands, manual SQL run during an incident, and the bug someone ships next year. Validation is a courtesy. Constraints are a contract.

### Solution 5: Database constraint plus try/catch (the most bulletproof)

This is the approach I would ship for any high-traffic or business-critical endpoint. It combines everything above into one pattern: the schema enforces the rule, and the code is written to survive the race instead of pretending it cannot happen.

Step 1 is the schema. Case-sensitive collation so equality matches the business rule, and a unique constraint so the database physically rejects duplicates:

```php
Schema::table('bills', function (Blueprint $table) {
    $table->string('name')
        ->collation('utf8mb4_bin')
        ->change();

    $table->unique('name');
});
```

Step 2 is code that treats the duplicate key error as a normal, expected branch rather than an exception in the "something went wrong" sense:

```php
use Illuminate\Database\UniqueConstraintViolationException;

public function resolveBill(string $name): Bill
{
    // Fast path: the bill usually already exists
    $bill = Bill::where('name', $name)->first();

    if ($bill !== null) {
        return $bill;
    }

    try {
        // Slow path: attempt to create it
        return Bill::create([
            'name' => $name,
        ]);
    } catch (UniqueConstraintViolationException $e) {
        // A concurrent request created it between our SELECT and INSERT.
        // The row is guaranteed to exist now, so fetch it.
        return Bill::where('name', $name)->firstOrFail();
    }
}
```

Walk through why every failure mode is covered:

* **The original casing bug is impossible.** With `utf8mb4_bin`, the SELECT for `hr123` no longer matches `HR123`. The database's definition of equality is the business definition.
* **Duplicates are impossible, not just unlikely.** If two requests race past the SELECT and both attempt the INSERT, exactly one succeeds. The other receives a `UniqueConstraintViolationException`, and the catch block resolves it by fetching the row the winner just created.
* **The catch block cannot fail to find the row.** The only way to enter it is that a unique violation occurred, which means a row with that exact name exists. `firstOrFail()` is there as a loud safety net, not an expected path.
* **No lock contention.** This pattern needs no `SELECT ... FOR UPDATE`, no advisory locks, and no serializable transactions. The unique index is the synchronization point, and the database is already very good at that job.

> **Note:** This is essentially what Laravel's `createOrFirst()` does internally, and modern `firstOrCreate()` falls back to it on a unique violation. Writing it out explicitly is still worth doing at least once: it makes the concurrency reasoning visible in code review, and it works on older Laravel versions that predate `UniqueConstraintViolationException`. On those versions, catch `Illuminate\Database\QueryException` and check for SQLSTATE `23000` (MySQL error 1062) before falling back to the SELECT.

```php
use Illuminate\Database\QueryException;

try {
    return Bill::create(['name' => $name]);
} catch (QueryException $e) {
    if (($e->errorInfo[1] ?? null) === 1062) {
        return Bill::where('name', $name)->firstOrFail();
    }

    throw $e;
}
```

> **Warning:** Rethrow anything that is not a duplicate key error. Swallowing every `QueryException` and answering with a SELECT will hide real failures like connection drops or column truncation behind a misleading "not found" error.

The reason this pattern is bulletproof is philosophical as much as technical: it stops treating the application as the guardian of uniqueness. The database guarantees the invariant, and the application merely reacts to the two outcomes the database allows. There is no window, however small, in which the rule can be violated.

## How SQLite handles this

SQLite takes a different default position from MySQL. Its standard comparison uses the `BINARY` collation, which compares strings byte by byte. Out of the box:

```sql
SELECT 'HR123' = 'hr123';
-- 0 (not equal)
```

So the original `firstOrCreate()` bug would never have happened on SQLite. This has a sneaky consequence for Laravel developers: if your test suite runs on SQLite while production runs on MySQL, tests for this exact class of bug will pass locally and fail in production. Comparison semantics are part of what you should test against a production-like database.

SQLite ships three built-in collations:

* `BINARY`: byte-for-byte comparison, sensitive to everything. The default.
* `NOCASE`: case-insensitive, but only for the 26 ASCII letters. `HR123` equals `hr123`, but `Ä` does not equal `ä`.
* `RTRIM`: like `BINARY` but ignores trailing spaces.

> **Warning:** `NOCASE` being ASCII-only surprises people. It is not a Unicode-aware case fold. If you need real case-insensitive Unicode comparison in SQLite, you need an extension like ICU or you handle normalization in the application.

For a bill codes table, be explicit rather than relying on defaults:

```sql
CREATE TABLE bills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL COLLATE BINARY
);

CREATE UNIQUE INDEX bills_name_unique
ON bills (name);
```

You can also force the collation per query when a column was declared differently:

```sql
SELECT * FROM bills
WHERE name = 'hr123' COLLATE BINARY;
```

`COLLATE BINARY` is the safest choice for identifiers because it makes no linguistic assumptions at all. Two strings are equal only if their bytes are equal, which is exactly the contract a machine-consumed code needs.

## How PostgreSQL handles this

PostgreSQL compares text case-sensitively by default. Standard collations in PostgreSQL are deterministic, meaning strings must be byte-identical (after encoding) to be considered equal:

```sql
SELECT 'HR123' = 'hr123';
-- false

SELECT 'Résumé' = 'Resume';
-- false
```

So on PostgreSQL, this incident also would not have happened. `WHERE name = 'hr123'` finds only `hr123`. The collation still controls sorting order (`ORDER BY` follows linguistic rules for your locale), but equality stays strict.

A bill codes table on PostgreSQL needs nothing exotic:

```sql
CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT bills_name_unique UNIQUE (name)
);
```

### The citext extension

When you actually want case-insensitive behavior in PostgreSQL, the idiomatic tool is the `citext` extension:

```sql
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    email CITEXT NOT NULL,
    CONSTRAINT users_email_unique UNIQUE (email)
);
```

With `citext`, comparisons fold case automatically:

```sql
SELECT 'John@Example.com'::citext = 'john@example.com'::citext;
-- true
```

Use `citext` for human-facing identifiers where case is noise: email addresses, usernames, tags. The unique constraint on a `citext` column prevents both `John@example.com` and `john@example.com` from existing at once, which is almost always what you want for emails.

Do not use `citext` for machine-consumed, case-sensitive codes like our bill identifiers. That would recreate the MySQL incident in reverse: the database would collapse values the business considers distinct. Also note that `citext` comparisons cost slightly more than plain `text` because of the internal case folding, and pattern matching operators have some caveats.

The general rule: choose the column type or collation that encodes the business rule, then let every query inherit it for free.

## Database comparison table

| Database | Default comparison | Case-sensitive by default | Case-insensitive option | Recommended for bill codes |
|----------|--------------------|----------------------------|--------------------------|-----------------------------|
| MySQL 8.0 | `utf8mb4_0900_ai_ci` collation | No | Already the default | `utf8mb4_bin` column collation plus unique index |
| PostgreSQL | Deterministic, byte-based equality | Yes | `citext` extension or `ILIKE` per query | Plain `text`/`varchar` plus unique constraint |
| SQLite | `BINARY` collation | Yes | `NOCASE` (ASCII only) | Explicit `COLLATE BINARY` plus unique index |

The pattern worth noticing: MySQL is the outlier. PostgreSQL and SQLite are strict by default and let you opt into looseness. MySQL is loose by default and makes you opt into strictness. If your team moves between databases, this asymmetry is exactly where bugs like ours breed.

## Best practices checklist

* **Know your column collation.** Run `SHOW FULL COLUMNS FROM your_table;` on MySQL before assuming anything about string equality. Do this during code review for any column holding an identifier.
* **Always use database constraints.** Unique indexes, foreign keys, NOT NULL. If a rule must never be violated, the database must enforce it.
* **Never rely only on application logic.** Every application-level check has a race window. Constraints do not.
* **Understand how your ORM translates queries.** `firstOrCreate()`, `updateOrCreate()`, and `exists()` all delegate equality to the database. Read the generated SQL when behavior surprises you. `DB::enableQueryLog()` costs nothing and answers most questions.
* **Consider concurrency.** Any check-then-act pattern (SELECT then INSERT) can race. Design for the duplicate key error instead of pretending it cannot happen.
* **Write tests for case-sensitive identifiers.** A test that creates `HR123`, then calls the endpoint with `hr123`, and asserts the outcome would have caught this bug before deployment. Run those tests against the same database engine as production.
* **Keep business rules close to the database.** "Bill codes are case-sensitive" is a data rule. Encode it in the schema where every query, job, and script inherits it, instead of scattering it across application code.

## Final thoughts

The bug was not caused by Laravel. `firstOrCreate()` did precisely what its implementation promises: it asked the database whether a matching row exists and trusted the answer. The bug was a mismatch between a business requirement (bill codes are case-sensitive) and a schema decision (the column collation said they are not). Once those two agreed, the code that had looked broken turned out to be fine.

The durable lesson is that ORMs inherit the behavior of the underlying database. Eloquent does not define what string equality means; your collation does. The same PHP line can behave three different ways on MySQL, PostgreSQL, and SQLite, and all three behaviors are correct by each engine's rules.

When an identifier column goes into a schema, spend the extra few minutes: decide whether it is case-sensitive, set the collation to match, and add the unique constraint. Those few minutes of intention are dramatically cheaper than an afternoon of query logs, a confused user, and an external system rejecting data. I know the exchange rate personally now.
