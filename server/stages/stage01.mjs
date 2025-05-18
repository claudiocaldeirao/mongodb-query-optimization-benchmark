export async function BadAggregation(db, customerId) {
  const pipeline = [
    // 1. Lookup customer details
    {
      $lookup: {
        from: "customers",
        localField: "customerId",
        foreignField: "_id",
        as: "customer",
      },
    },
    { $unwind: "$customer" },

    // 2. Lookup order items
    {
      $lookup: {
        from: "order_items",
        localField: "_id",
        foreignField: "orderId",
        as: "items",
      },
    },
    { $unwind: "$items" },

    // 3. Lookup product details for each item
    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "product",
      },
    },
    { $unwind: "$product" },

    // 4. Lookup shipping address (not used in final object, could be removed)
    {
      $lookup: {
        from: "shipping_addresses",
        localField: "shippingAddressId",
        foreignField: "_id",
        as: "shippingAddress",
      },
    },
    { $unwind: "$shippingAddress" },

    // 5. Lookup payment transaction (not used in final object, could be removed)
    {
      $lookup: {
        from: "payment_transactions",
        localField: "paymentTransactionId",
        foreignField: "_id",
        as: "payment",
      },
    },
    { $unwind: "$payment" },

    // 6. Match orders for the given customer (should be done earlier)
    {
      $match: {
        "customer._id.buffer": customerId,
      },
    },

    // 7. Project only needed fields
    {
      $project: {
        orderId: "$_id",
        customerName: "$customer.name",
        productName: "$product.name",
        quantity: "$items.quantity",
        totalPrice: { $multiply: ["$items.quantity", "$items.unitPrice"] },
        shippingCity: "$shippingAddress.city",
        paymentStatus: "$payment.status",
        orderDate: 1,
      },
    },

    // 8. Group by customer and product (could be merged with the previous stage)
    {
      $group: {
        _id: {
          customerName: "$customerName",
          productName: "$productName",
        },
        totalQuantity: { $sum: "$quantity" },
        totalRevenue: { $sum: "$totalPrice" },
      },
    },

    // 9. Sort by revenue descending
    {
      $sort: { totalRevenue: -1 },
    },
  ];

  return await db.collection("orders").aggregate(pipeline).toArray();
}
