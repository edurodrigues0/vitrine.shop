import { redis } from "~/database/redis/connection";

export class RedisImageCacheService {
	private readonly PREFIX = "product-image:";
	private readonly TTL = 60 * 60 * 24 * 7; // 7 dias em segundos

	/**
	 * Armazena a URL de uma imagem no Redis
	 */
	async setImageUrl(productImageId: string, url: string): Promise<void> {
		const key = `${this.PREFIX}${productImageId}`;
		await redis.setex(key, this.TTL, url);
	}

	/**
	 * Recupera a URL de uma imagem do Redis
	 */
	async getImageUrl(productImageId: string): Promise<string | null> {
		const key = `${this.PREFIX}${productImageId}`;
		return await redis.get(key);
	}

	/**
	 * Armazena múltiplas URLs de imagens
	 */
	async setMultipleImageUrls(
		images: Array<{ id: string; url: string }>,
	): Promise<void> {
		const pipeline = redis.pipeline();

		for (const image of images) {
			const key = `${this.PREFIX}${image.id}`;
			pipeline.setex(key, this.TTL, image.url);
		}

		await pipeline.exec();
	}

	/**
	 * Recupera múltiplas URLs de imagens
	 */
	async getMultipleImageUrls(
		productImageIds: string[],
	): Promise<Map<string, string | null>> {
		const pipeline = redis.pipeline();
		const keys = productImageIds.map((id) => `${this.PREFIX}${id}`);

		for (const key of keys) {
			pipeline.get(key);
		}

		const results = await pipeline.exec();
		const imageMap = new Map<string, string | null>();

		if (results) {
			productImageIds.forEach((id, index) => {
				const result = results[index];
				const url = result?.[1] as string | null;
				imageMap.set(id, url);
			});
		}

		return imageMap;
	}

	/**
	 * Remove a URL de uma imagem do cache
	 */
	async deleteImageUrl(productImageId: string): Promise<void> {
		const key = `${this.PREFIX}${productImageId}`;
		await redis.del(key);
	}

	/**
	 * Remove múltiplas URLs do cache
	 */
	async deleteMultipleImageUrls(productImageIds: string[]): Promise<void> {
		const keys = productImageIds.map((id) => `${this.PREFIX}${id}`);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	}

	/**
	 * Verifica se uma imagem está em cache
	 */
	async exists(productImageId: string): Promise<boolean> {
		const key = `${this.PREFIX}${productImageId}`;
		const result = await redis.exists(key);
		return result === 1;
	}

	/**
	 * Limpa todas as URLs de imagens do cache (cuidado em produção!)
	 */
	async clearAll(): Promise<void> {
		const keys = await redis.keys(`${this.PREFIX}*`);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	}
}

export const redisImageCacheService = new RedisImageCacheService();