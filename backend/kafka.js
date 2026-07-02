import { Kafka } from "kafkajs";
import XLSX from "xlsx";
import ExcelRecord from "./models/excelRecord.js";

const kafka = new Kafka({
  clientId: "excelproj",
  brokers: ["kafka:9092"],
});

// -------------------- Producer --------------------
const producer = kafka.producer();

let producerConnected = false;

export async function connectProducer() {
  if (!producerConnected) {
    await producer.connect();
    producerConnected = true;
    console.log("✅ Kafka Producer Connected");
  }
}

export async function sendEvent(topic, message) {
  await connectProducer();

  await producer.send({
    topic,
    messages: [
      {
        value: JSON.stringify(message),
      },
    ],
  });

  console.log(`📤 Event sent to topic "${topic}"`);
}

// -------------------- Consumer --------------------
const consumer = kafka.consumer({
  groupId: "excelproj-group",
});

export async function startConsumer(topic) {
  await consumer.connect();

  console.log("✅ Kafka Consumer Connected");

  await consumer.subscribe({
    topic,
    fromBeginning: false,
  });

  console.log(`📡 Listening on topic: ${topic}`);

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      try {
        const event = JSON.parse(message.value.toString());

        console.log("\n==============================");
        console.log("📩 Kafka Message Received");
        console.log("==============================");
        console.log(event);

        if (event.action !== "parse") {
          console.log("Ignoring message");
          return;
        }

        // ---------------- Recreate Buffer ----------------
        const buffer = Buffer.from(event.buffer.data);

        console.log("Buffer Size:", buffer.length);

        // ---------------- Read Workbook ----------------
        const workbook = XLSX.read(buffer, {
          type: "buffer",
        });

        console.log("Workbook Sheets:", workbook.SheetNames);

        const sheetName = workbook.SheetNames[0];

        const worksheet = workbook.Sheets[sheetName];

        // Parse Excel
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        console.log("Rows Parsed:", jsonData.length);

        if (jsonData.length > 0) {
          console.log("First Row:");
          console.log(jsonData[0]);
        } else {
          console.log("⚠ Sheet is empty");
        }

        // ---------------- Mongo Update ----------------
        const updated = await ExcelRecord.findByIdAndUpdate(
          event.fileId,
          {
            $set: {
              data: jsonData,
              parsedAt: new Date(),
            },
          },
          {
            new: true,
            runValidators: true,
          }
        );

        console.log("\nMongo Update Result:");
        console.log(updated);

        // Verify
        const verify = await ExcelRecord.findById(event.fileId);

        console.log("\nMongo Verify:");
        console.log(JSON.stringify(verify, null, 2));

        console.log(
          "\nStored Rows:",
          verify?.data ? verify.data.length : "No data field"
        );

        console.log("\n✅ File parsed and saved successfully\n");
      } catch (err) {
        console.error("\n❌ Kafka Consumer Error");
        console.error(err);
      }
    },
  });
}