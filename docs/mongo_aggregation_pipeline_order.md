# MongoDB Aggregation Pipeline: Recommended Stage Order

Understanding the optimal sequence of aggregation stages in MongoDB helps improve performance and memory efficiency. Here's a recommended order with explanations:

| Order | Stage                 | Purpose                                                                 |
| ----- | --------------------- | ----------------------------------------------------------------------- |
| 1     | `$match`              | Filter documents as early as possible — ideally on **indexed** fields.  |
| 2     | `$project`            | Include/exclude only necessary fields to reduce document size.          |
| 3     | `$unwind`             | Expand arrays, but only **after filtering and projection**.             |
| 4     | `$lookup`             | Perform joins after reducing input volume with `$match` and `$project`. |
| 5     | `$addFields` / `$set` | Add computed fields or enrich data as needed.                           |
| 6     | `$group`              | Perform aggregation (sum, count, etc.) after data has been trimmed.     |
| 7     | `$sort`               | Sort results only after grouping or filtering.                          |
| 8     | `$limit` / `$skip`    | Apply for pagination or result size control **after sorting**.          |

## 🔍 Stage Descriptions and Rationale

### `$match`

Used to filter documents at the beginning of the pipeline. Placing this stage first ensures that only relevant documents are passed through subsequent stages. Performance is greatly improved when using **indexed fields** here.

### `$project`

Reduces the document size by selecting only the necessary fields. This helps lower the memory usage in later stages, especially beneficial before expensive operations like `$lookup` and `$group`.

### `$unwind`

Deconstructs arrays into individual documents. Since this operation can multiply the number of documents, it should be applied only after filtering and projection to minimize impact.

### `$lookup`

Performs a join with another collection. Since it is an expensive operation, it's best used after the dataset has been reduced and streamlined using `$match` and `$project`.

### `$addFields` / `$set`

Adds or modifies fields in the documents. Useful for enriching or restructuring data after the document set has been optimized.

### `$group`

Groups documents and performs aggregations such as `$sum`, `$avg`, or `$count`. Since it can be memory-intensive, it should follow data-reducing stages like `$match`, `$project`, and `$unwind`.

### `$sort`

Orders the documents. Sorting large datasets is expensive, so it's best applied after filtering and grouping. Indexes can be leveraged here when sorting is done early and on indexed fields.

### `$limit` / `$skip`

Used to control result size or for pagination. These should be placed as late as possible, especially after sorting, to ensure correct ordering and reduced computation.

## 💡 Summary

The general principle is: **reduce early, expand/join/aggregate later**. Prioritize filtering and trimming the data before executing stages that are CPU or memory-intensive.

For best performance:

- Use **indexed fields** in `$match` and `$sort`.
- Keep early stages lean using `$project`.
- Delay expensive operations (`$lookup`, `$group`, `$sort`) as much as possible.
