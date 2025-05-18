
# Understanding Compound Indexes in MongoDB

## ✅ What is a Compound Index?

A **compound index** indexes **multiple fields** in a **specified order**. For example:

```js
db.collection.createIndex({ customerId: 1, totalRevenue: -1 });
```

This creates an index on:

1. `customerId` (ascending)
2. then `totalRevenue` (descending)

---

## 🔍 How Does the Order Affect Queries?

MongoDB can **only use the index efficiently** if your query **matches the prefix fields in the correct order**.

### Prefix Rule:
> MongoDB can only use the index for a query if the **first field(s)** of the index are used in `$match`, `$sort`, or `$group`.

### Example:

Given this index:

```js
{ customerId: 1, totalRevenue: -1 }
```

| Query | Index Used? | Notes |
|-------|-------------|-------|
| `{ customerId: X }` | ✅ Yes | Matches the prefix |
| `{ customerId: X, totalRevenue: { $gt: 100 } }` | ✅ Yes | Uses both fields |
| `{ totalRevenue: { $gt: 100 } }` | ❌ No | Skips prefix field |
| `{ customerId: X }`, sorted by `totalRevenue` | ✅ Yes | Index supports sort too |
| Sorted by `totalRevenue` only | ❌ No | Skips prefix field |

---

## ⚠️ Why Order Matters

The index:

```js
{ customerId: 1, totalRevenue: -1 }
```

Is **not** the same as:

```js
{ totalRevenue: -1, customerId: 1 }
```

Each supports **different query patterns**.

---

## 🔧 Index Design Tip

Design compound indexes by analyzing:

1. **Which field you filter first** (usually `$match`)
2. **Which field you sort on next** (e.g., `$sort`)
3. **Field cardinality** (more selective fields first = better)

---

## ✅ Good Rule of Thumb

For a query like:

```js
db.collection.aggregate([
  { $match: { customerId: X } },
  { $sort: { totalRevenue: -1 } }
])
```

The ideal index is:

```js
{ customerId: 1, totalRevenue: -1 }
```

It allows MongoDB to:

- Use the index to filter `customerId`
- Then continue scanning sorted by `totalRevenue`
- Without needing in-memory sort

---

## 🔍 How to Confirm Index Usage

Use the explain plan:

```js
db.collection.explain("executionStats").aggregate([...])
```

Look for `"stage": "IXSCAN"` in the plan to confirm index usage.
