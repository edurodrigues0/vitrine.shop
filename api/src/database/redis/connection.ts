import Redis from "ioredis";

const redis = new Redis({
	host: process.env.REDIS_HOST || "localhost",
	port: Number(process.env.REDIS_PORT) || 6379,
	password: process.env.REDIS_PASSWORD,
	retryStrategy: (times) => {
		const delay = Math.min(times * 50, 2000);
		return delay;
	},
	maxRetriesPerRequest: 3,
	lazyConnect: true,
});

redis.on("connect", () => {
	console.log("✅ Redis conectado com sucesso");
});

redis.on("error", (error) => {
	console.error("❌ Erro na conexão Redis:", error);
});

redis.connect().catch((error) => {
	console.error("❌ Falha ao conectar ao Redis:", error);
});

export { redis };
export default redis;
