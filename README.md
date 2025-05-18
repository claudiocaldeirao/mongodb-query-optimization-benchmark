# MongoDB Query Optimization Benchmark

This project benchmarks the performance of a MongoDB query across four progressive stages of optimization. The goal is to demonstrate the performance gains achieved by applying aggregation best practices, indexing, and data modeling improvements.

## 📊 Goal

Compare the response time of the same data-fetching use case under four different scenarios:

1. ❌ **Poorly structured query**: excessive use of `$lookup`, no indexes, highly normalized SQL-style collections.
2. ⚙️ **Optimized aggregation**: improved pipeline (reordered stages, reduced complexity), but using the same data model.
3. 🧭 **With indexes**: strategic indexing on join and filter fields.
4. 🧱 **Restructured data**: new denormalized data model using embedded documents, eliminating the need for most lookups.

---

## 🛠️ Technologies

- **Node.js** with **Express** — Lightweight API exposing a single `GET` route.
- **MongoDB** — The database used for all benchmarks.
- **Artillery** — Load testing tool for measuring HTTP performance.
- **Faker.js** — Used to generate random realistic test data.

---

## 🚀 Getting Started

### 1. Clone the project

```bash
git clone https://github.com/your-user/mongodb-query-optimization-benchmark.git
cd mongodb-query-optimization-benchmark
```

### 2. Install dependencies

```bash
npm install
```

### 3. Seed the database with test data

```bash
node seed.js  # Inserts random documents into all collections
```

### 4. Start the server

```bash
npm start
```

The API will be available at:

```bash
GET /orders
```

## 🧪 Load Testing with Artillery

```bash
# install globally
npm install artillery -g

# run
artillery run artillery/artillery-config.yml
```

## 📈 Expected Results

Stage 1: High latency due to unoptimized joins.

Stage 2: Moderate improvements from aggregation optimization.

Stage 3: Significant gains from index usage.

Stage 4: Best performance with minimal aggregation and direct document reads.

## 📂 Project Structure

```bash
.
├── seed
│   └── index.mjs         # Script to generate and insert test data
├── server
│   └── index.mjs         # Express API with a single route
├── stages/
│   ├── stage1.mjs        # Unoptimized query
│   ├── stage2.mjs        # Optimized aggregation
│   ├── stage3.mjs        # With indexes
│   └── stage4.mjs        # With restructured data
├── artillery/
│   └── artillery-config.yml    # Artillery config (one per stage)
└── README.md

```

## 📚 About MongoDB Features

- [Preffered stage order into aggregation pipelines](docs/mongo_aggregation_pipeline_order.md)
- [About Compond indexes](docs/mongodb_compound_indexes.md)

## 📄 License

This project is licensed under the [MIT License](LISCENCE).
