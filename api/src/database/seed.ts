import { hash } from "bcryptjs";
import { sql } from "drizzle-orm";
import { DrizzleORM } from "./connection";
import {
	addresses,
	categories,
	cities,
	products,
	productsImages,
	productsVariations,
	storeBranches,
	stores,
	subscriptions,
	users,
} from "./schema";
import { BCRYPT_SALT_ROUNDS } from "../config/constants";

async function seed() {
	console.log("🌱 Iniciando seed do banco de dados...");

	try {
		// Limpar dados existentes (em ordem inversa de dependências)
		console.log("🧹 Limpando dados existentes...");
		await DrizzleORM.delete(productsImages).where(sql`1=1`);
		await DrizzleORM.delete(productsVariations).where(sql`1=1`);
		await DrizzleORM.delete(products).where(sql`1=1`);
		await DrizzleORM.delete(subscriptions).where(sql`1=1`);
		await DrizzleORM.delete(storeBranches).where(sql`1=1`);
		await DrizzleORM.delete(addresses).where(sql`1=1`);
		await DrizzleORM.delete(stores).where(sql`1=1`);
		await DrizzleORM.delete(users).where(sql`1=1`);
		await DrizzleORM.delete(categories).where(sql`1=1`);
		await DrizzleORM.delete(cities).where(sql`1=1`);

		// 1. Criar Cidades
		console.log("🏙️ Criando cidades...");
		const [citySaoPaulo, cityRioDeJaneiro, cityBeloHorizonte, cityCuritiba] =
			await DrizzleORM
				.insert(cities)
				.values([
					{
						name: "São Paulo",
						state: "SP",
					},
					{
						name: "Rio de Janeiro",
						state: "RJ",
					},
					{
						name: "Belo Horizonte",
						state: "MG",
					},
					{
						name: "Curitiba",
						state: "PR",
					},
				])
				.returning();

		// 2. Criar Categorias
		console.log("📦 Criando categorias...");
		const [categoryRoupas, categoryEletronicos, categoryCasa, categoryBeleza] =
			await DrizzleORM
				.insert(categories)
				.values([
					{
						name: "Roupas e Acessórios",
						slug: "roupas-e-acessorios",
					},
					{
						name: "Eletrônicos",
						slug: "eletronicos",
					},
					{
						name: "Casa e Decoração",
						slug: "casa-e-decoracao",
					},
					{
						name: "Beleza e Cosméticos",
						slug: "beleza-e-cosmeticos",
					},
				])
				.returning();

		// 3. Criar Usuários
		console.log("👤 Criando usuários...");
		const passwordHash = await hash("12345678", BCRYPT_SALT_ROUNDS);

		const [adminUser, owner1, owner2, owner3] = await DrizzleORM
			.insert(users)
			.values([
				{
					name: "Admin Vitrine",
					email: "admin@vitrine.shop",
					passwordHash,
					role: "ADMIN",
				},
				{
					name: "Maria Silva",
					email: "maria@exemplo.com",
					passwordHash,
					role: "OWNER",
				},
				{
					name: "João Santos",
					email: "joao@exemplo.com",
					passwordHash,
					role: "OWNER",
				},
				{
					name: "Ana Costa",
					email: "ana@exemplo.com",
					passwordHash,
					role: "OWNER",
				},
			])
			.returning();

		// 4. Criar Lojas
		console.log("🏪 Criando lojas...");
		const [store1, store2, store3] = await DrizzleORM
			.insert(stores)
			.values([
				{
					name: "Moda Elegante",
					description:
						"Loja especializada em roupas femininas elegantes e modernas. Trabalhamos com as melhores marcas e tendências da moda.",
					cnpjcpf: "12345678000190",
					slug: "moda-elegante",
					whatsapp: "5511999999999",
					instagramUrl: "https://instagram.com/modaelegante",
					facebookUrl: "https://facebook.com/modaelegante",
					logoUrl: "https://exemplo.com/logo-moda-elegante.jpg",
					bannerUrl: "https://exemplo.com/banner-moda-elegante.jpg",
					theme: {
						primaryColor: "#FF69B4",
						secondaryColor: "#FFFFFF",
						tertiaryColor: "#FFB6C1",
					},
					cityId: citySaoPaulo.id,
					ownerId: owner1.id,
					status: "ACTIVE",
					isPaid: true,
				},
				{
					name: "Tech Store",
					description:
						"Loja de eletrônicos com os melhores produtos tecnológicos. Smartphones, notebooks, acessórios e muito mais.",
					cnpjcpf: "98765432000110",
					slug: "tech-store",
					whatsapp: "5521988888888",
					instagramUrl: "https://instagram.com/techstore",
					logoUrl: "https://exemplo.com/logo-tech-store.jpg",
					bannerUrl: "https://exemplo.com/banner-tech-store.jpg",
					theme: {
						primaryColor: "#0066CC",
						secondaryColor: "#FFFFFF",
						tertiaryColor: "#99CCFF",
					},
					cityId: cityRioDeJaneiro.id,
					ownerId: owner2.id,
					status: "ACTIVE",
					isPaid: true,
				},
				{
					name: "Casa & Lar",
					description:
						"Decoração e itens para casa com estilo único. Transforme seu lar com nossos produtos exclusivos.",
					cnpjcpf: "11223344000150",
					slug: "casa-e-lar",
					whatsapp: "5531777777777",
					instagramUrl: "https://instagram.com/casaelar",
					theme: {
						primaryColor: "#8B4513",
						secondaryColor: "#FFFFFF",
						tertiaryColor: "#D2691E",
					},
					cityId: cityBeloHorizonte.id,
					ownerId: owner3.id,
					status: "ACTIVE",
					isPaid: false,
				},
			])
			.returning();

		// Atualizar usuários com storeId
		await DrizzleORM
			.update(users)
			.set({ storeId: store1.id })
			.where({ id: owner1.id });
		await DrizzleORM
			.update(users)
			.set({ storeId: store2.id })
			.where({ id: owner2.id });
		await DrizzleORM
			.update(users)
			.set({ storeId: store3.id })
			.where({ id: owner3.id });

		// 5. Criar Endereços
		console.log("📍 Criando endereços...");
		await DrizzleORM.insert(addresses).values([
			{
				storeId: store1.id,
				cityId: citySaoPaulo.id,
				street: "Rua das Flores",
				number: "123",
				complement: "Loja 1",
				neighborhood: "Centro",
				zipCode: "01310100",
				country: "Brasil",
				isMain: true,
			},
			{
				storeId: store2.id,
				cityId: cityRioDeJaneiro.id,
				street: "Avenida Atlântica",
				number: "456",
				neighborhood: "Copacabana",
				zipCode: "22021000",
				country: "Brasil",
				isMain: true,
			},
			{
				storeId: store3.id,
				cityId: cityBeloHorizonte.id,
				street: "Rua da Bahia",
				number: "789",
				neighborhood: "Centro",
				zipCode: "30160012",
				country: "Brasil",
				isMain: true,
			},
		]);

		// 6. Criar Filiais
		console.log("🏬 Criando filiais...");
		const [branch1] = await DrizzleORM
			.insert(storeBranches)
			.values([
				{
					parentStoreId: store1.id,
					name: "Moda Elegante - Filial Shopping",
					cityId: citySaoPaulo.id,
					whatsapp: "5511999999998",
					description: "Nossa filial no shopping center",
					isMain: false,
				},
			])
			.returning();

		// Endereço da filial
		await DrizzleORM.insert(addresses).values([
			{
				branchId: branch1.id,
				cityId: citySaoPaulo.id,
				street: "Avenida Paulista",
				number: "1000",
				complement: "Shopping Center - Loja 205",
				neighborhood: "Bela Vista",
				zipCode: "01310100",
				country: "Brasil",
				isMain: false,
			},
		]);

		// 7. Criar Assinaturas
		console.log("💳 Criando assinaturas...");
		await DrizzleORM.insert(subscriptions).values([
			{
				storeId: store1.id,
				planName: "Plano Premium",
				planId: "premium-monthly",
				provider: "stripe",
				currentPeriodStart: new Date(),
				currentPeriodEnd: new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000,
				), // 30 dias
				price: "99.90",
				status: "PAID",
				nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			},
			{
				storeId: store2.id,
				planName: "Plano Básico",
				planId: "basic-monthly",
				provider: "stripe",
				currentPeriodStart: new Date(),
				currentPeriodEnd: new Date(
					Date.now() + 30 * 24 * 60 * 60 * 1000,
				),
				price: "49.90",
				status: "PAID",
				nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
			},
		]);

		// 8. Criar Produtos
		console.log("🛍️ Criando produtos...");
		const [product1, product2, product3, product4, product5, product6] =
			await DrizzleORM
				.insert(products)
				.values([
					{
						name: "Vestido Floral Elegante",
						description:
							"Vestido longo com estampa floral, perfeito para ocasiões especiais. Tecido de alta qualidade e corte elegante.",
						categoryId: categoryRoupas.id,
						storeId: store1.id,
					},
					{
						name: "Bolsa de Couro Premium",
						description:
							"Bolsa feminina de couro legítimo, com acabamento impecável e alças ajustáveis. Disponível em várias cores.",
						categoryId: categoryRoupas.id,
						storeId: store1.id,
					},
					{
						name: "Smartphone Galaxy Pro",
						description:
							"Smartphone de última geração com tela de 6.7 polegadas, câmera tripla de 108MP e processador de alta performance.",
						categoryId: categoryEletronicos.id,
						storeId: store2.id,
					},
					{
						name: "Fone de Ouvido Bluetooth",
						description:
							"Fone de ouvido sem fio com cancelamento de ruído ativo, bateria de longa duração e som de alta qualidade.",
						categoryId: categoryEletronicos.id,
						storeId: store2.id,
					},
					{
						name: "Conjunto de Almofadas Decorativas",
						description:
							"Conjunto com 4 almofadas decorativas em tecido macio, perfeitas para deixar sua sala mais aconchegante.",
						categoryId: categoryCasa.id,
						storeId: store3.id,
					},
					{
						name: "Kit de Maquiagem Completo",
						description:
							"Kit com paleta de sombras, batons, máscara de cílios e pincéis. Tudo que você precisa para um look completo.",
						categoryId: categoryBeleza.id,
						storeId: store1.id,
					},
				])
				.returning();

		// 9. Criar Variações de Produtos
		console.log("🎨 Criando variações de produtos...");
		const [
			variation1,
			variation2,
			variation3,
			variation4,
			variation5,
			variation6,
			variation7,
			variation8,
		] = await DrizzleORM
			.insert(productsVariations)
			.values([
				{
					productId: product1.id,
					size: "P",
					color: "Rosa",
					price: 29900, // R$ 299,00 em centavos
					discountPrice: 24900, // R$ 249,00 em centavos
					stock: 15,
					weight: "0.5",
					dimensions: {
						length: "80",
						width: "40",
						height: "2",
						unit: "cm",
					},
				},
				{
					productId: product1.id,
					size: "M",
					color: "Rosa",
					price: 29900,
					discountPrice: 24900,
					stock: 20,
					weight: "0.5",
				},
				{
					productId: product2.id,
					size: "Único",
					color: "Preto",
					price: 45000, // R$ 450,00
					stock: 8,
					weight: "0.8",
				},
				{
					productId: product2.id,
					size: "Único",
					color: "Marrom",
					price: 45000,
					stock: 5,
					weight: "0.8",
				},
				{
					productId: product3.id,
					size: "128GB",
					color: "Preto",
					price: 349900, // R$ 3.499,00
					discountPrice: 319900, // R$ 3.199,00
					stock: 12,
					weight: "0.2",
				},
				{
					productId: product3.id,
					size: "256GB",
					color: "Azul",
					price: 399900, // R$ 3.999,00
					stock: 8,
					weight: "0.2",
				},
				{
					productId: product4.id,
					size: "Único",
					color: "Branco",
					price: 39900, // R$ 399,00
					stock: 25,
					weight: "0.3",
				},
				{
					productId: product5.id,
					size: "40x40cm",
					color: "Bege",
					price: 12900, // R$ 129,00
					stock: 30,
					weight: "0.4",
				},
			])
			.returning();

		// 10. Criar Imagens de Produtos
		console.log("📸 Criando imagens de produtos...");
		await DrizzleORM.insert(productsImages).values([
			{
				productVariationId: variation1.id,
				url: "https://exemplo.com/imagens/vestido-floral-rosa-p.jpg",
				isMain: true,
			},
			{
				productVariationId: variation1.id,
				url: "https://exemplo.com/imagens/vestido-floral-rosa-p-2.jpg",
				isMain: false,
			},
			{
				productVariationId: variation2.id,
				url: "https://exemplo.com/imagens/vestido-floral-rosa-m.jpg",
				isMain: true,
			},
			{
				productVariationId: variation3.id,
				url: "https://exemplo.com/imagens/bolsa-couro-preto.jpg",
				isMain: true,
			},
			{
				productVariationId: variation4.id,
				url: "https://exemplo.com/imagens/bolsa-couro-marrom.jpg",
				isMain: true,
			},
			{
				productVariationId: variation5.id,
				url: "https://exemplo.com/imagens/smartphone-galaxy-pro-128gb.jpg",
				isMain: true,
			},
			{
				productVariationId: variation5.id,
				url: "https://exemplo.com/imagens/smartphone-galaxy-pro-128gb-2.jpg",
				isMain: false,
			},
			{
				productVariationId: variation6.id,
				url: "https://exemplo.com/imagens/smartphone-galaxy-pro-256gb.jpg",
				isMain: true,
			},
			{
				productVariationId: variation7.id,
				url: "https://exemplo.com/imagens/fone-bluetooth-branco.jpg",
				isMain: true,
			},
			{
				productVariationId: variation8.id,
				url: "https://exemplo.com/imagens/almofadas-bege.jpg",
				isMain: true,
			},
		]);

		console.log("✅ Seed concluído com sucesso!");
		console.log("\n📊 Resumo dos dados criados:");
		console.log(`   - ${4} cidades`);
		console.log(`   - ${4} categorias`);
		console.log(`   - ${4} usuários`);
		console.log(`   - ${3} lojas`);
		console.log(`   - ${4} endereços`);
		console.log(`   - ${1} filial`);
		console.log(`   - ${2} assinaturas`);
		console.log(`   - ${6} produtos`);
		console.log(`   - ${8} variações de produtos`);
		console.log(`   - ${10} imagens de produtos`);
		console.log("\n🔑 Credenciais de acesso:");
		console.log("   Admin: admin@vitrine.shop / 12345678");
		console.log("   Owner 1: maria@exemplo.com / 12345678");
		console.log("   Owner 2: joao@exemplo.com / 12345678");
		console.log("   Owner 3: ana@exemplo.com / 12345678");
	} catch (error) {
		console.error("❌ Erro ao executar seed:", error);
		throw error;
	}
}

export { seed };

