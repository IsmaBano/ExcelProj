import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "excelproj",
  brokers: ["kafka:9092"], // service name from docker-compose
});

// Producer
const producer = kafka.producer();
export async function sendEvent(topic, message) {
  await producer.connect();
  await producer.send({
    topic,
    messages: [{ value: JSON.stringify(message) }],
  });
}

// Consumer
const consumer = kafka.consumer({ groupId: "excelproj-group" });
export async function startConsumer(topic) {
  await consumer.connect();
  await consumer.subscribe({ topic, fromBeginning: true });
  await consumer.run({
    eachMessage: async ({ message }) => {
      console.log(`📩 Kafka received: ${message.value.toString()}`);
    },
  });
}
