export async function DenormalizedAggregation(db, customerId) {
  const pipeline = [
    {
      $match: {
        "customerId.buffer": customerId,
      },
    },
    {
      $project: {
        _id: 0,
        customerId: 0,
      },
    },
    {
      $sort: {
        totalRevenue: -1,
      },
    },
  ];

  return await db.collection("orders_summary").aggregate(pipeline).toArray();
}
