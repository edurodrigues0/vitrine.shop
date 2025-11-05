import { hash } from "bcryptjs";
import { eq, sql } from "drizzle-orm";
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
		// Limpar storeId dos usuários antes de deletar as lojas
		await DrizzleORM.update(users).set({ storeId: null }).where(sql`1=1`);
		await DrizzleORM.delete(stores).where(sql`1=1`);
		await DrizzleORM.delete(users).where(sql`1=1`);
		await DrizzleORM.delete(categories).where(sql`1=1`);
		await DrizzleORM.delete(cities).where(sql`1=1`);

		// 1. Criar Cidades (até 10)
		console.log("🏙️ Criando cidades...");
		const createdCities = await DrizzleORM
			.insert(cities)
			.values([
				{ name: "São Paulo", state: "SP" },
				{ name: "Rio de Janeiro", state: "RJ" },
				{ name: "Belo Horizonte", state: "MG" },
				{ name: "Curitiba", state: "PR" },
				{ name: "Porto Alegre", state: "RS" },
				{ name: "Salvador", state: "BA" },
				{ name: "Brasília", state: "DF" },
				{ name: "Fortaleza", state: "CE" },
				{ name: "Recife", state: "PE" },
				{ name: "Manaus", state: "AM" },
			])
			.returning();
		if (createdCities.length < 10) {
			throw new Error("Erro ao criar cidades: quantidade insuficiente");
		}
		const [citySaoPaulo, cityRioDeJaneiro, cityBeloHorizonte, cityCuritiba, cityPortoAlegre, citySalvador, cityBrasilia, cityFortaleza, cityRecife, cityManaus] = createdCities;

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
		const [categoryRoupas, categoryEletronicos, categoryCasa, categoryBeleza, categoryEsportes, categoryLivros, categoryBrinquedos, categoryPet, categoryAlimentos, categoryAutomotivo] = createdCategories;

		// 3. Criar Usuários (até 10)
		console.log("👤 Criando usuários...");
		const passwordHash = await hash("12345678", BCRYPT_SALT_ROUNDS);

		const createdUsers = await DrizzleORM
			.insert(users)
			.values([
				{ name: "Admin Vitrine", email: "admin@vitrine.shop", passwordHash, role: "ADMIN" },
				{ name: "Maria Silva", email: "maria@exemplo.com", passwordHash, role: "OWNER" },
				{ name: "João Santos", email: "joao@exemplo.com", passwordHash, role: "OWNER" },
				{ name: "Ana Costa", email: "ana@exemplo.com", passwordHash, role: "OWNER" },
				{ name: "Carlos Oliveira", email: "carlos@exemplo.com", passwordHash, role: "OWNER" },
				{ name: "Julia Ferreira", email: "julia@exemplo.com", passwordHash, role: "OWNER" },
				{ name: "Pedro Alves", email: "pedro@exemplo.com", passwordHash, role: "OWNER" },
				{ name: "Fernanda Lima", email: "fernanda@exemplo.com", passwordHash, role: "OWNER" },
				{ name: "Roberto Souza", email: "roberto@exemplo.com", passwordHash, role: "OWNER" },
				{ name: "Camila Rocha", email: "camila@exemplo.com", passwordHash, role: "OWNER" },
			])
			.returning();
		if (createdUsers.length < 10) {
			throw new Error("Erro ao criar usuários: quantidade insuficiente");
		}
		const [adminUser, owner1, owner2, owner3, owner4, owner5, owner6, owner7, owner8, owner9] = createdUsers;

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
					theme: { primaryColor: "#FF69B4", secondaryColor: "#FFFFFF", tertiaryColor: "#FFB6C1" },
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
					theme: { primaryColor: "#0066CC", secondaryColor: "#FFFFFF", tertiaryColor: "#99CCFF" },
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
					theme: { primaryColor: "#8B4513", secondaryColor: "#FFFFFF", tertiaryColor: "#D2691E" },
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
					theme: { primaryColor: "#FF1493", secondaryColor: "#FFFFFF", tertiaryColor: "#FFB6C1" },
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
					theme: { primaryColor: "#00AA00", secondaryColor: "#FFFFFF", tertiaryColor: "#90EE90" },
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
					theme: { primaryColor: "#8B4513", secondaryColor: "#FFFFFF", tertiaryColor: "#DEB887" },
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
					theme: { primaryColor: "#FFA500", secondaryColor: "#FFFFFF", tertiaryColor: "#FFD700" },
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
					theme: { primaryColor: "#8B0000", secondaryColor: "#FFFFFF", tertiaryColor: "#DC143C" },
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
					theme: { primaryColor: "#000080", secondaryColor: "#FFFFFF", tertiaryColor: "#4169E1" },
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
					theme: { primaryColor: "#FF69B4", secondaryColor: "#FFFFFF", tertiaryColor: "#FFB6C1" },
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
		const [store1, store2, store3, store4, store5, store6, store7, store8, store9, store10] = createdStores;

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

		// 8. Criar Produtos (até 10, com price e quantity)
		console.log("🛍️ Criando produtos...");
		const createdProducts = await DrizzleORM
			.insert(products)
			.values([
				{
					name: "Vestido Floral Elegante",
					description: "Vestido longo com estampa floral, perfeito para ocasiões especiais. Tecido de alta qualidade e corte elegante.",
					categoryId: categoryRoupas.id,
					storeId: store1.id,
					price: 29900, // R$ 299,00 em centavos
					quantity: 35,
				},
				{
					name: "Bolsa de Couro Premium",
					description: "Bolsa feminina de couro legítimo, com acabamento impecável e alças ajustáveis. Disponível em várias cores.",
					categoryId: categoryRoupas.id,
					storeId: store1.id,
					price: 45000, // R$ 450,00
					quantity: 13,
				},
				{
					name: "Smartphone Galaxy Pro",
					description: "Smartphone de última geração com tela de 6.7 polegadas, câmera tripla de 108MP e processador de alta performance.",
					categoryId: categoryEletronicos.id,
					storeId: store2.id,
					price: 349900, // R$ 3.499,00
					quantity: 20,
				},
				{
					name: "Fone de Ouvido Bluetooth",
					description: "Fone de ouvido sem fio com cancelamento de ruído ativo, bateria de longa duração e som de alta qualidade.",
					categoryId: categoryEletronicos.id,
					storeId: store2.id,
					price: 39900, // R$ 399,00
					quantity: 25,
				},
				{
					name: "Conjunto de Almofadas Decorativas",
					description: "Conjunto com 4 almofadas decorativas em tecido macio, perfeitas para deixar sua sala mais aconchegante.",
					categoryId: categoryCasa.id,
					storeId: store3.id,
					price: 12900, // R$ 129,00
					quantity: 30,
				},
				{
					name: "Kit de Maquiagem Completo",
					description: "Kit com paleta de sombras, batons, máscara de cílios e pincéis. Tudo que você precisa para um look completo.",
					categoryId: categoryBeleza.id,
					storeId: store4.id,
					price: 8900, // R$ 89,00
					quantity: 40,
				},
				{
					name: "Tênis Esportivo Pro",
					description: "Tênis de corrida com tecnologia de amortecimento avançada. Ideal para atletas e praticantes de exercícios.",
					categoryId: categoryEsportes.id,
					storeId: store5.id,
					price: 29900, // R$ 299,00
					quantity: 50,
				},
				{
					name: "Livro: A Arte da Programação",
					description: "Guia completo sobre programação e desenvolvimento de software. Edição atualizada com as melhores práticas.",
					categoryId: categoryLivros.id,
					storeId: store6.id,
					price: 7900, // R$ 79,00
					quantity: 15,
				},
				{
					name: "Ração Premium para Cães",
					description: "Ração super premium para cães adultos. Nutrição balanceada com ingredientes naturais de alta qualidade.",
					categoryId: categoryPet.id,
					storeId: store7.id,
					price: 15900, // R$ 159,00
					quantity: 60,
				},
				{
					name: "Café Gourmet Especial",
					description: "Café especial torrado e moído na hora. Grãos selecionados com notas de chocolate e caramelo.",
					categoryId: categoryAlimentos.id,
					storeId: store8.id,
					price: 4500, // R$ 45,00
					quantity: 100,
				},
			])
			.returning();
		if (createdProducts.length < 10) {
			throw new Error("Erro ao criar produtos: quantidade insuficiente");
		}
		const [product1, product2, product3, product4, product5, product6, product7, product8, product9, product10] = createdProducts;

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
		console.log(`   - ${10} cidades`);
		console.log(`   - ${10} categorias`);
		console.log(`   - ${10} usuários`);
		console.log(`   - ${10} lojas`);
		console.log(`   - ${4} endereços`);
		console.log(`   - ${1} filial`);
		console.log(`   - ${2} assinaturas`);
		console.log(`   - ${10} produtos (com preço e quantidade)`);
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

