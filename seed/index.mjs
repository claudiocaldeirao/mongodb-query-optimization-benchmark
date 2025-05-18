import { MongoClient, ObjectId } from "mongodb";
import { faker } from "@faker-js/faker";

async function seedDatabase(uri, numDocs) {
  const client = new MongoClient(uri);

  try {
    client.connect();
    const db = client.db();

    const customers = [];
    const products = [];
    const shippingAddresses = [];
    const paymentTransactions = [];
    const orders = [];
    const orderItems = [];

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

    // Insert into collections
    await db.collection("customers").insertMany(customers);
    await db.collection("products").insertMany(products);
    await db.collection("shipping_addresses").insertMany(shippingAddresses);
    await db.collection("payment_transactions").insertMany(paymentTransactions);
    await db.collection("orders").insertMany(orders);
    await db.collection("order_items").insertMany(orderItems);

    console.log("✅ Database seeded successfully.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  } finally {
    await client.close();
  }
}

const uri = process.env.MONGO_URI || "mongodb://localhost:27017/shopDB";
seedDatabase(uri, 100);
