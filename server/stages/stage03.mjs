/*
 * Same stage as stage02 but with an index on customerId.
 * The index is created at seed time.
 */
export async function AggregationWithIndex(db, customerId) {
  const pipeline = [
    // 1. Match orders for the given customer (matched fields should always be indexed)
    {
      $match: {
        "customerId.buffer": customerId,
      },
    },

    // 2. Lookup customer details
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },

    // 3. Lookup order items (foreignFields also takes advantage of the index)
    {
      $lookup: {
        from: "order_items",
        localField: "_id",
        foreignField: "orderId",
        as: "items",
      },
    },
    { $unwind: "$items" },

    // 4. Lookup product details for each item
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 5. Project and group merged toghether to reduce pipeline overhead
    {
      $group: {
        _id: {
          customerName: "$customer.name",
          productName: "$product.name",
        },
        totalQuantity: { $sum: "$items.quantity" },
        totalRevenue: {
          $sum: { $multiply: ["$items.quantity", "$items.unitPrice"] },
        },
      },
    },

    // 6. Sort by revenue descending
    {
      $sort: { totalRevenue: -1 },
    },
  ];

  return await db.collection("orders").aggregate(pipeline).toArray();
}
