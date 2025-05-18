import { MongoClient, ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";
import { fileURLToPath } from "url";
import { Worker, isMainThread, workerData } from "worker_threads";

const numDocs = 50000;
const __filename = fileURLToPath(import.meta.url);
const uri = "mongodb://localhost:27017";
const stageDbNames = ["stage01", "stage02", "stage03", "stage04"];
const customers = [];
const products = [];
const shippingAddresses = [];
const paymentTransactions = [];
const orders = [];
const orderItems = [];

function generateFakeData(numDocs) {
  console.log("Generating fake data...");
  // Create customers
  for (let i = 0; i < numDocs; i++) {
    customers.push({
      _id: new ObjectId(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
    });
  }

  // Create products
  for (let i = 0; i < numDocs; i++) {
    products.push({
      _id: new ObjectId(),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price()),
      category: faker.commerce.department(),
    });
  }

  // Create shipping addresses
  for (let i = 0; i < numDocs; i++) {
    shippingAddresses.push({
      _id: new ObjectId(),
      street: faker.location.streetAddress(),
      city: faker.location.city(),
      country: faker.location.country(),
      postalCode: faker.location.zipCode(),
    });
  }

  // Create payment transactions
  for (let i = 0; i < numDocs; i++) {
    paymentTransactions.push({
      _id: new ObjectId(),
      status: faker.helpers.arrayElement(["pending", "completed", "failed"]),
      amount: parseFloat(faker.commerce.price()),
      method: faker.helpers.arrayElement([
        "credit_card",
        "paypal",
        "bank_transfer",
      ]),
      timestamp: faker.date.recent(),
    });
  }

  // Create orders and related order items
  for (let i = 0; i < numDocs; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const shipping = faker.helpers.arrayElement(shippingAddresses);
    const payment = faker.helpers.arrayElement(paymentTransactions);
    const orderId = new ObjectId();

    orders.push({
      _id: orderId,
      customerId: customer._id,
      shippingAddressId: shipping._id,
      paymentTransactionId: payment._id,
      orderDate: faker.date.recent(),
    });

    const numItems = faker.number.int({ min: 1, max: 5 });
    for (let j = 0; j < numItems; j++) {
      const product = faker.helpers.arrayElement(products);
      orderItems.push({
        _id: new ObjectId(),
        orderId,
        productId: product._id,
        quantity: faker.number.int({ min: 1, max: 10 }),
        unitPrice: product.price,
      });
    }
  }
}

function buildOrdersSummary(customers, products, orders, orderItems) {
  const customerMap = new Map(customers.map((c) => [c._id, c]));
  const productMap = new Map(products.map((p) => [p._id, p]));
  const itemsMap = new Map();
  const summaryMap = new Map();

  for (const item of orderItems) {
    if (!itemsMap.has(item.orderId)) {
      itemsMap.set(item.orderId, []);
    }

    itemsMap.get(item.orderId).push(item);
  }

  for (const order of orders) {
    const customer = customerMap.get(order.customerId);
    if (!customer) continue;

    const items = itemsMap.get(order._id);
    if (!items) continue;

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) continue;
      const key = `${customer.name}::${product.name}`;

      const current = summaryMap.get(key) || {
        customerId: customer._id,
        customerName: customer.name,
        productName: product.name,
        totalQuantity: 0,
        totalRevenue: 0,
      };
      current.totalQuantity += item.quantity;
      current.totalRevenue += item.quantity * item.unitPrice;
      summaryMap.set(key, current);
    }
  }

  return Array.from(summaryMap.values());
}

async function insertData(uri, { dbName, dataset }) {
  const client = new MongoClient(uri);
  const {
    customers,
    products,
    shippingAddresses,
    paymentTransactions,
    orders,
    orderItems,
  } = dataset;

  try {
    await client.connect();
    await client.db(dbName).dropDatabase();
    const db = client.db(dbName);

    if (dbName !== "stage04") {
      await db.collection("customers").insertMany(customers);
      await db.collection("products").insertMany(products);
      await db.collection("shipping_addresses").insertMany(shippingAddresses);
      await db
        .collection("payment_transactions")
        .insertMany(paymentTransactions);
      await db.collection("orders").insertMany(orders);
      await db.collection("order_items").insertMany(orderItems);
    }

    // indexes
    if (dbName === "stage03") {
      await db.collection("orders").createIndex({ customerId: 1 });
      await db.collection("order_items").createIndex({ orderId: 1 });
    }

    if (dbName === "stage04") {
      console.log("Generating orders summary...");
      const ordersSummary = buildOrdersSummary(
        customers,
        products,
        orders,
        orderItems
      );
      await db.collection("orders_summary").insertMany(ordersSummary);
      await db
        .collection("orders_summary")
        .createIndex({ "customerId.buffer": 1, totalRevenue: -1 });
    }
  } finally {
    await client.close();
  }
}

if (isMainThread) {
  generateFakeData(numDocs);

  console.log("Seeding databases...");
  const promises = stageDbNames.map((dbName) => {
    return new Promise((resolve, reject) => {
      const worker = new Worker(__filename, {
        workerData: {
          dbName,
          dataset: {
            customers,
            products,
            shippingAddresses,
            paymentTransactions,
            orders,
            orderItems,
          },
        },
      });

      worker.on("error", reject);
      worker.on("exit", (code) => {
        if (code !== 0)
          return reject(new Error(`Worker finalizou com código ${code}`));
        resolve();
      });
    });
  });

  Promise.all(promises)
    .then(() => console.log("✅ Seed proccess finished successfully."))
    .catch((err) => console.error("❌ Seed error:", err));
} else {
  await insertData(uri, workerData);
}
