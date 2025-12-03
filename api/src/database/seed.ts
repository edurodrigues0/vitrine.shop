import { hash } from "bcryptjs";
import { randomUUID } from "crypto";
import { eq, sql } from "drizzle-orm";
import { DrizzleORM } from "./connection";
import {
	account,
	addresses,
	categories,
	cities,
	notifications,
	orderItems,
	orders,
	products,
	productsImages,
	productsVariations,
	sessions,
	storeVisits,
	stores,
	subscriptions,
	users,
	verifications,
} from "./schema";
import { BCRYPT_SALT_ROUNDS } from "../config/constants";

/**
 * Limpa todos os dados do banco de dados, respeitando as dependências de foreign keys.
 * A ordem de exclusão é inversa à ordem de criação (tabelas dependentes primeiro).
 */
export async function clearDatabase() {
	console.log("🧹 Limpando banco de dados...");

	try {
		// 1. Tabelas mais dependentes (com mais foreign keys)
		await DrizzleORM.delete(orderItems).where(sql`1=1`);
		console.log("   ✓ order_items limpo");

		await DrizzleORM.delete(productsImages).where(sql`1=1`);
		console.log("   ✓ products_images limpo");

		await DrizzleORM.delete(productsVariations).where(sql`1=1`);
		console.log("   ✓ products_variations limpo");

		await DrizzleORM.delete(orders).where(sql`1=1`);
		console.log("   ✓ orders limpo");

		await DrizzleORM.delete(products).where(sql`1=1`);
		console.log("   ✓ products limpo");

		await DrizzleORM.delete(notifications).where(sql`1=1`);
		console.log("   ✓ notifications limpo");

		await DrizzleORM.delete(storeVisits).where(sql`1=1`);
		console.log("   ✓ store_visits limpo");

		await DrizzleORM.delete(subscriptions).where(sql`1=1`);
		console.log("   ✓ subscriptions limpo");

		await DrizzleORM.delete(addresses).where(sql`1=1`);
		console.log("   ✓ addresses limpo");

		// Tabelas do Better Auth (devem ser deletadas antes de users)
		await DrizzleORM.delete(account).where(sql`1=1`);
		console.log("   ✓ account limpo");

		await DrizzleORM.delete(sessions).where(sql`1=1`);
		console.log("   ✓ sessions limpo");

		await DrizzleORM.delete(verifications).where(sql`1=1`);
		console.log("   ✓ verifications limpo");

		// Limpar storeId dos usuários antes de deletar as lojas
		await DrizzleORM.update(users).set({ storeId: null }).where(sql`1=1`);
		console.log("   ✓ storeId dos usuários limpo");

		await DrizzleORM.delete(stores).where(sql`1=1`);
		console.log("   ✓ stores limpo");

		await DrizzleORM.delete(users).where(sql`1=1`);
		console.log("   ✓ users limpo");

		await DrizzleORM.delete(categories).where(sql`1=1`);
		console.log("   ✓ categories limpo");

		await DrizzleORM.delete(cities).where(sql`1=1`);
		console.log("   ✓ cities limpo");

		console.log("✅ Banco de dados limpo com sucesso!");
	} catch (error) {
		console.error("❌ Erro ao limpar banco de dados:", error);
		throw error;
	}
}

async function seed() {
	console.log("🌱 Iniciando seed do banco de dados...");

	try {
		// Limpar dados existentes
		await clearDatabase();

		// 1. Criar Cidades (até 10)
		console.log("🏙️ Criando cidades...");
		const createdCities = await DrizzleORM
			.insert(cities)
			.values([
				{ name: "São Paulo", state: "SP", slug: "sao-paulo" },
				{ name: "Rio de Janeiro", state: "RJ", slug: "rio-de-janeiro" },
				{ name: "Belo Horizonte", state: "MG", slug: "belo-horizonte" },
				{ name: "Curitiba", state: "PR", slug: "curitiba" },
				{ name: "Porto Alegre", state: "RS", slug: "porto-alegre" },
				{ name: "Salvador", state: "BA", slug: "salvador" },
				{ name: "Brasília", state: "DF", slug: "brasilia" },
				{ name: "Fortaleza", state: "CE", slug: "fortaleza" },
				{ name: "Recife", state: "PE", slug: "recife" },
				{ name: "Manaus", state: "AM", slug: "manaus" },
			])
			.returning();
		if (createdCities.length < 10) {
			throw new Error("Erro ao criar cidades: quantidade insuficiente");
		}
		const citySaoPaulo = createdCities[0]!;
		const cityRioDeJaneiro = createdCities[1]!;
		const cityBeloHorizonte = createdCities[2]!;
		const cityCuritiba = createdCities[3]!;
		const cityPortoAlegre = createdCities[4]!;
		const citySalvador = createdCities[5]!;
		const cityBrasilia = createdCities[6]!;
		const cityFortaleza = createdCities[7]!;
		const cityRecife = createdCities[8]!;
		const cityManaus = createdCities[9]!;

		// 2. Criar Categorias (até 10)
		console.log("📦 Criando categorias...");
		const createdCategories = await DrizzleORM
			.insert(categories)
			.values([
				{ name: "Roupas e Acessórios", slug: "roupas-e-acessorios" },
				{ name: "Eletrônicos", slug: "eletronicos" },
				{ name: "Casa e Decoração", slug: "casa-e-decoracao" },
				{ name: "Beleza e Cosméticos", slug: "beleza-e-cosmeticos" },
				{ name: "Esportes e Fitness", slug: "esportes-e-fitness" },
				{ name: "Livros e Mídia", slug: "livros-e-midia" },
				{ name: "Brinquedos e Jogos", slug: "brinquedos-e-jogos" },
				{ name: "Pet Shop", slug: "pet-shop" },
				{ name: "Alimentos e Bebidas", slug: "alimentos-e-bebidas" },
				{ name: "Automotivo", slug: "automotivo" },
			])
			.returning();
		if (createdCategories.length < 10) {
			throw new Error("Erro ao criar categorias: quantidade insuficiente");
		}
		const categoryRoupas = createdCategories[0]!;
		const categoryEletronicos = createdCategories[1]!;
		const categoryCasa = createdCategories[2]!;
		const categoryBeleza = createdCategories[3]!;
		const categoryEsportes = createdCategories[4]!;
		const categoryLivros = createdCategories[5]!;
		const categoryBrinquedos = createdCategories[6]!;
		const categoryPet = createdCategories[7]!;
		const categoryAlimentos = createdCategories[8]!;
		const categoryAutomotivo = createdCategories[9]!;

		// 3. Criar Usuários (até 10)
		console.log("👤 Criando usuários...");
		const passwordHash = await hash("12345678", BCRYPT_SALT_ROUNDS);

		const createdUsers = await DrizzleORM
			.insert(users)
			.values([
				{ id: randomUUID(), name: "Admin Vitrine", email: "admin@vitrine.shop", passwordHash, role: "ADMIN" },
				{ id: randomUUID(), name: "Maria Silva", email: "maria@exemplo.com", passwordHash, role: "OWNER" },
				{ id: randomUUID(), name: "João Santos", email: "joao@exemplo.com", passwordHash, role: "OWNER" },
				{ id: randomUUID(), name: "Ana Costa", email: "ana@exemplo.com", passwordHash, role: "OWNER" },
				{ id: randomUUID(), name: "Carlos Oliveira", email: "carlos@exemplo.com", passwordHash, role: "OWNER" },
				{ id: randomUUID(), name: "Julia Ferreira", email: "julia@exemplo.com", passwordHash, role: "OWNER" },
				{ id: randomUUID(), name: "Pedro Alves", email: "pedro@exemplo.com", passwordHash, role: "OWNER" },
				{ id: randomUUID(), name: "Fernanda Lima", email: "fernanda@exemplo.com", passwordHash, role: "OWNER" },
				{ id: randomUUID(), name: "Roberto Souza", email: "roberto@exemplo.com", passwordHash, role: "OWNER" },
				{ id: randomUUID(), name: "Camila Rocha", email: "camila@exemplo.com", passwordHash, role: "OWNER" },
			])
			.returning();
		if (createdUsers.length < 10) {
			throw new Error("Erro ao criar usuários: quantidade insuficiente");
		}
		const adminUser = createdUsers[0]!;
		const owner1 = createdUsers[1]!;
		const owner2 = createdUsers[2]!;
		const owner3 = createdUsers[3]!;
		const owner4 = createdUsers[4]!;
		const owner5 = createdUsers[5]!;
		const owner6 = createdUsers[6]!;
		const owner7 = createdUsers[7]!;
		const owner8 = createdUsers[8]!;
		const owner9 = createdUsers[9]!;

		// 4. Criar Lojas (até 10)
		console.log("🏪 Criando lojas...");
		const createdStores = await DrizzleORM
			.insert(stores)
			.values([
				{
					name: "Moda Elegante",
					description: "Loja especializada em roupas femininas elegantes e modernas. Trabalhamos com as melhores marcas e tendências da moda.",
					cnpjcpf: "12345678000190",
					slug: "moda-elegante",
					whatsapp: "5511999999999",
					instagramUrl: "https://instagram.com/modaelegante",
					facebookUrl: "https://facebook.com/modaelegante",
					logoUrl: "https://exemplo.com/logo-moda-elegante.jpg",
					bannerUrl: "https://exemplo.com/banner-moda-elegante.jpg",
					theme: {
						primary: "#FF69B4",
						secondary: "#FFFFFF",
						bg: "#FFF0F5",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#FFB6C1",
						border: "#FFE4E1",
						hover: "#FF1493",
					},
					cityId: citySaoPaulo.id,
					ownerId: owner1.id,
					status: "ACTIVE",
					isPaid: true,
				},
				{
					name: "Tech Store",
					description: "Loja de eletrônicos com os melhores produtos tecnológicos. Smartphones, notebooks, acessórios e muito mais.",
					cnpjcpf: "98765432000110",
					slug: "tech-store",
					whatsapp: "5521988888888",
					instagramUrl: "https://instagram.com/techstore",
					logoUrl: "https://exemplo.com/logo-tech-store.jpg",
					bannerUrl: "https://exemplo.com/banner-tech-store.jpg",
					theme: {
						primary: "#0066CC",
						secondary: "#FFFFFF",
						bg: "#F0F8FF",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#99CCFF",
						border: "#B0C4DE",
						hover: "#0052A3",
					},
					cityId: cityRioDeJaneiro.id,
					ownerId: owner2.id,
					status: "ACTIVE",
					isPaid: true,
				},
				{
					name: "Casa & Lar",
					description: "Decoração e itens para casa com estilo único. Transforme seu lar com nossos produtos exclusivos.",
					cnpjcpf: "11223344000150",
					slug: "casa-e-lar",
					whatsapp: "5531777777777",
					instagramUrl: "https://instagram.com/casaelar",
					theme: {
						primary: "#8B4513",
						secondary: "#FFFFFF",
						bg: "#FAF0E6",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#D2691E",
						border: "#DEB887",
						hover: "#A0522D",
					},
					cityId: cityBeloHorizonte.id,
					ownerId: owner3.id,
					status: "ACTIVE",
					isPaid: false,
				},
				{
					name: "Beleza Total",
					description: "Cosméticos e produtos de beleza das melhores marcas. Tudo para você se sentir linda!",
					cnpjcpf: "22334455000160",
					slug: "beleza-total",
					whatsapp: "5511888888888",
					instagramUrl: "https://instagram.com/belezatotal",
					theme: {
						primary: "#FF1493",
						secondary: "#FFFFFF",
						bg: "#FFF5F8",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#FFB6C1",
						border: "#FFC0CB",
						hover: "#C71585",
					},
					cityId: cityCuritiba.id,
					ownerId: owner4.id,
					status: "ACTIVE",
					isPaid: true,
				},
				{
					name: "Sport Life",
					description: "Equipamentos esportivos e roupas de academia. Melhore sua performance com qualidade!",
					cnpjcpf: "33445566000170",
					slug: "sport-life",
					whatsapp: "5511777777777",
					instagramUrl: "https://instagram.com/sportlife",
					theme: {
						primary: "#00AA00",
						secondary: "#FFFFFF",
						bg: "#F0FFF0",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#90EE90",
						border: "#98FB98",
						hover: "#008000",
					},
					cityId: cityPortoAlegre.id,
					ownerId: owner5.id,
					status: "ACTIVE",
					isPaid: true,
				},
				{
					name: "Livraria Cultural",
					description: "Livros, HQs, mangás e muito mais. Amplie seus horizontes com conhecimento!",
					cnpjcpf: "44556677000180",
					slug: "livraria-cultural",
					whatsapp: "5511666666666",
					instagramUrl: "https://instagram.com/livrariacultural",
					theme: {
						primary: "#8B4513",
						secondary: "#FFFFFF",
						bg: "#FFFAF0",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#DEB887",
						border: "#F5DEB3",
						hover: "#A0522D",
					},
					cityId: citySalvador.id,
					ownerId: owner6.id,
					status: "ACTIVE",
					isPaid: false,
				},
				{
					name: "Pet Shop Amor",
					description: "Tudo para seu pet! Rações, brinquedos, acessórios e muito carinho.",
					cnpjcpf: "55667788000190",
					slug: "pet-shop-amor",
					whatsapp: "5511555555555",
					instagramUrl: "https://instagram.com/petshopamor",
					theme: {
						primary: "#FFA500",
						secondary: "#FFFFFF",
						bg: "#FFFFF0",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#FFD700",
						border: "#F0E68C",
						hover: "#FF8C00",
					},
					cityId: cityBrasilia.id,
					ownerId: owner7.id,
					status: "ACTIVE",
					isPaid: true,
				},
				{
					name: "Gourmet Express",
					description: "Produtos gourmet e importados. Sabores únicos para paladares exigentes.",
					cnpjcpf: "66778899000100",
					slug: "gourmet-express",
					whatsapp: "5511444444444",
					instagramUrl: "https://instagram.com/gourmetexpress",
					theme: {
						primary: "#8B0000",
						secondary: "#FFFFFF",
						bg: "#FFF5EE",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#DC143C",
						border: "#FFC1C1",
						hover: "#800000",
					},
					cityId: cityFortaleza.id,
					ownerId: owner8.id,
					status: "ACTIVE",
					isPaid: true,
				},
				{
					name: "Auto Peças Premium",
					description: "Peças e acessórios automotivos de qualidade. Seu carro merece o melhor!",
					cnpjcpf: "77889900000110",
					slug: "auto-pecas-premium",
					whatsapp: "5511333333333",
					instagramUrl: "https://instagram.com/autopecaspremium",
					theme: {
						primary: "#000080",
						secondary: "#FFFFFF",
						bg: "#F0F8FF",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#4169E1",
						border: "#B0C4DE",
						hover: "#0000CD",
					},
					cityId: cityRecife.id,
					ownerId: owner9.id,
					status: "ACTIVE",
					isPaid: false,
				},
				{
					name: "Brinquedos & Cia",
					description: "Brinquedos educativos e divertidos para todas as idades. Alegria garantida!",
					cnpjcpf: "88990011000120",
					slug: "brinquedos-e-cia",
					whatsapp: "5511222222222",
					instagramUrl: "https://instagram.com/brinquedosecia",
					theme: {
						primary: "#FF69B4",
						secondary: "#FFFFFF",
						bg: "#FFF0F5",
						surface: "#FFFFFF",
						text: "#333333",
						textSecondary: "#666666",
						highlight: "#FFB6C1",
						border: "#FFE4E1",
						hover: "#FF1493",
					},
					cityId: cityManaus.id,
					ownerId: owner1.id,
					status: "ACTIVE",
					isPaid: true,
				},
			])
			.returning();
		if (createdStores.length < 10) {
			throw new Error("Erro ao criar lojas: quantidade insuficiente");
		}
		const store1 = createdStores[0]!;
		const store2 = createdStores[1]!;
		const store3 = createdStores[2]!;
		const store4 = createdStores[3]!;
		const store5 = createdStores[4]!;
		const store6 = createdStores[5]!;
		const store7 = createdStores[6]!;
		const store8 = createdStores[7]!;
		const store9 = createdStores[8]!;
		const store10 = createdStores[9]!;

		// Atualizar usuários com storeId
		await DrizzleORM.update(users).set({ storeId: store1.id }).where(eq(users.id, owner1.id));
		await DrizzleORM.update(users).set({ storeId: store2.id }).where(eq(users.id, owner2.id));
		await DrizzleORM.update(users).set({ storeId: store3.id }).where(eq(users.id, owner3.id));
		await DrizzleORM.update(users).set({ storeId: store4.id }).where(eq(users.id, owner4.id));
		await DrizzleORM.update(users).set({ storeId: store5.id }).where(eq(users.id, owner5.id));
		await DrizzleORM.update(users).set({ storeId: store6.id }).where(eq(users.id, owner6.id));
		await DrizzleORM.update(users).set({ storeId: store7.id }).where(eq(users.id, owner7.id));
		await DrizzleORM.update(users).set({ storeId: store8.id }).where(eq(users.id, owner8.id));
		await DrizzleORM.update(users).set({ storeId: store9.id }).where(eq(users.id, owner9.id));

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

		// 6. Criar Assinaturas
		console.log("💳 Criando assinaturas...");
		await DrizzleORM.insert(subscriptions).values([
			{
				userId: owner1.id, // Usar ownerId em vez de storeId
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
				userId: owner2.id, // Usar ownerId em vez de storeId
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

		// 8. Criar Produtos (até 10, sem price e quantity)
		console.log("🛍️ Criando produtos...");
		const createdProducts = await DrizzleORM
			.insert(products)
			.values([
				{
					name: "Vestido Floral Elegante",
					description: "Vestido longo com estampa floral, perfeito para ocasiões especiais. Tecido de alta qualidade e corte elegante.",
					categoryId: categoryRoupas.id,
					storeId: store1.id,
				},
				{
					name: "Bolsa de Couro Premium",
					description: "Bolsa feminina de couro legítimo, com acabamento impecável e alças ajustáveis. Disponível em várias cores.",
					categoryId: categoryRoupas.id,
					storeId: store1.id,
				},
				{
					name: "Smartphone Galaxy Pro",
					description: "Smartphone de última geração com tela de 6.7 polegadas, câmera tripla de 108MP e processador de alta performance.",
					categoryId: categoryEletronicos.id,
					storeId: store2.id,
				},
				{
					name: "Fone de Ouvido Bluetooth",
					description: "Fone de ouvido sem fio com cancelamento de ruído ativo, bateria de longa duração e som de alta qualidade.",
					categoryId: categoryEletronicos.id,
					storeId: store2.id,
				},
				{
					name: "Conjunto de Almofadas Decorativas",
					description: "Conjunto com 4 almofadas decorativas em tecido macio, perfeitas para deixar sua sala mais aconchegante.",
					categoryId: categoryCasa.id,
					storeId: store3.id,
				},
				{
					name: "Kit de Maquiagem Completo",
					description: "Kit com paleta de sombras, batons, máscara de cílios e pincéis. Tudo que você precisa para um look completo.",
					categoryId: categoryBeleza.id,
					storeId: store4.id,
				},
				{
					name: "Tênis Esportivo Pro",
					description: "Tênis de corrida com tecnologia de amortecimento avançada. Ideal para atletas e praticantes de exercícios.",
					categoryId: categoryEsportes.id,
					storeId: store5.id,
				},
				{
					name: "Livro: A Arte da Programação",
					description: "Guia completo sobre programação e desenvolvimento de software. Edição atualizada com as melhores práticas.",
					categoryId: categoryLivros.id,
					storeId: store6.id,
				},
				{
					name: "Ração Premium para Cães",
					description: "Ração super premium para cães adultos. Nutrição balanceada com ingredientes naturais de alta qualidade.",
					categoryId: categoryPet.id,
					storeId: store7.id,
				},
				{
					name: "Café Gourmet Especial",
					description: "Café especial torrado e moído na hora. Grãos selecionados com notas de chocolate e caramelo.",
					categoryId: categoryAlimentos.id,
					storeId: store8.id,
				},
			])
			.returning();
		if (createdProducts.length < 10) {
			throw new Error("Erro ao criar produtos: quantidade insuficiente");
		}
		const product1 = createdProducts[0]!;
		const product2 = createdProducts[1]!;
		const product3 = createdProducts[2]!;
		const product4 = createdProducts[3]!;
		const product5 = createdProducts[4]!;
		const product6 = createdProducts[5]!;
		const product7 = createdProducts[6]!;
		const product8 = createdProducts[7]!;
		const product9 = createdProducts[8]!;
		const product10 = createdProducts[9]!;

		// 9. Criar Variações de Produtos
		console.log("🎨 Criando variações de produtos...");
		const createdVariations = await DrizzleORM
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

		const variation1 = createdVariations[0]!;
		const variation2 = createdVariations[1]!;
		const variation3 = createdVariations[2]!;
		const variation4 = createdVariations[3]!;
		const variation5 = createdVariations[4]!;
		const variation6 = createdVariations[5]!;
		const variation7 = createdVariations[6]!;
		const variation8 = createdVariations[7]!;

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
		console.log(`   - ${10} cidades`);
		console.log(`   - ${10} categorias`);
		console.log(`   - ${10} usuários`);
		console.log(`   - ${10} lojas`);
		console.log(`   - ${3} endereços`);
		console.log(`   - ${2} assinaturas`);
		console.log(`   - ${10} produtos`);
		console.log(`   - ${8} variações de produtos`);
		console.log(`   - ${10} imagens de produtos`);
		console.log("\n🔑 Credenciais de acesso:");
		console.log("   Admin: admin@vitrine.shop / 12345678");
		console.log("   Owner 1: maria@exemplo.com / 12345678");
		console.log("   Owner 2: joao@exemplo.com / 12345678");
		console.log("   Owner 3: ana@exemplo.com / 12345678");
		console.log("   Owner 4: carlos@exemplo.com / 12345678");
		console.log("   Owner 5: julia@exemplo.com / 12345678");
		console.log("   Owner 6: pedro@exemplo.com / 12345678");
		console.log("   Owner 7: fernanda@exemplo.com / 12345678");
		console.log("   Owner 8: roberto@exemplo.com / 12345678");
		console.log("   Owner 9: camila@exemplo.com / 12345678");
	} catch (error) {
		console.error("❌ Erro ao executar seed:", error);
		throw error;
	}
}

export { seed };
