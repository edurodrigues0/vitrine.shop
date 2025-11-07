"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { storesService } from "@/services/stores-service";
import { productsService } from "@/services/products-service";
import { citiesService } from "@/services/cities-service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { StoreCard } from "@/components/store-card";
import { Loader2, Search, Store, MapPin, Package, X } from "lucide-react";
import { createSlug } from "@/lib/slug";
import Image from "next/image";

export default function AllStoresPage() {
	const [storeNameFilter, setStoreNameFilter] = useState("");
	const [productFilter, setProductFilter] = useState("");
	const [selectedCityId, setSelectedCityId] = useState<string>("");
	const [citySearchTerm, setCitySearchTerm] = useState("");
	const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
	const [page, setPage] = useState(1);
	const itemsPerPage = 12;
	const cityInputRef = useRef<HTMLDivElement>(null);

	// Buscar todas as lojas
	const { data: storesData, isLoading: isLoadingStores } = useQuery({
		queryKey: ["stores", "all", storeNameFilter, selectedCityId, page],
		queryFn: () =>
			storesService.findAll({
				page,
				limit: itemsPerPage,
				name: storeNameFilter || undefined,
				cityId: selectedCityId || undefined,
			}),
	});

	// Buscar todos os produtos para filtro por produto
	const { data: productsData, isLoading: isLoadingProducts } = useQuery({
		queryKey: ["products", "all", productFilter],
		queryFn: async () => {
			const response = await productsService.findAll({
				page: 1,
				limit: 100,
				name: productFilter || undefined,
			});
			return response;
		},
		enabled: productFilter.length >= 2,
	});

	// Buscar cidades
	const { data: citiesData } = useQuery({
		queryKey: ["cities"],
		queryFn: () => citiesService.findAll(),
		staleTime: 1000 * 60 * 60,
	});

	const stores = storesData?.stores || [];
	const products = productsData?.products || [];
	const cities = citiesData?.cities || [];

	// Filtrar cidades por termo de busca
	const filteredCities = useMemo(() => {
		if (!citySearchTerm) return cities;
		const search = citySearchTerm.toLowerCase();
		return cities.filter(
			(city) =>
				city.name.toLowerCase().includes(search) ||
				city.state.toLowerCase().includes(search)
		);
	}, [cities, citySearchTerm]);

	// Fechar dropdown ao clicar fora
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				cityInputRef.current &&
				!cityInputRef.current.contains(event.target as Node)
			) {
				setIsCityDropdownOpen(false);
			}
		};

		if (isCityDropdownOpen) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [isCityDropdownOpen]);

	// Filtrar lojas por produtos
	const filteredStores = useMemo(() => {
		let filtered = stores;

		// Se houver filtro por produto, mostrar apenas lojas que têm esse produto
		if (productFilter.length >= 2 && products.length > 0) {
			const storeIdsWithProduct = new Set(
				products.map((product) => product.storeId),
			);
			filtered = filtered.filter((store) =>
				storeIdsWithProduct.has(store.id),
			);
		}

		return filtered;
	}, [stores, products, productFilter]);

	const isLoading = isLoadingStores || isLoadingProducts;

	return (
		<div className="min-h-screen py-8 px-4">
			<div className="container mx-auto max-w-7xl">
				{/* Header */}
				<div className="mb-8">
					<h1 className="text-4xl font-bold mb-2">Todas as Lojas</h1>
					<p className="text-muted-foreground">
						Descubra lojas incríveis e encontre os produtos que você procura
					</p>
				</div>

				{/* Filtros */}
				<Card className="p-6 mb-8">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						{/* Filtro por nome da loja */}
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Store className="h-4 w-4" />
								Buscar por nome da loja
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="text"
									placeholder="Digite o nome da loja"
									value={storeNameFilter}
									onChange={(e) => {
										setStoreNameFilter(e.target.value);
										setPage(1);
									}}
									className="pl-10"
								/>
								{storeNameFilter && (
									<Button
										variant="ghost"
										size="icon"
										className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
										onClick={() => {
											setStoreNameFilter("");
											setPage(1);
										}}
									>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>
						</div>

						{/* Filtro por produto */}
						<div className="space-y-2">
							<label className="text-sm font-medium flex items-center gap-2">
								<Package className="h-4 w-4" />
								Buscar por produto
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
								<Input
									type="text"
									placeholder="Digite o nome do produto"
									value={productFilter}
									onChange={(e) => {
										setProductFilter(e.target.value);
										setPage(1);
									}}
									className="pl-10"
								/>
								{productFilter && (
									<Button
										variant="ghost"
										size="icon"
										className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
										onClick={() => {
											setProductFilter("");
											setPage(1);
										}}
									>
										<X className="h-4 w-4" />
									</Button>
								)}
							</div>
							{/* Dropdown de produtos sugeridos */}
							{productFilter.length >= 2 && products.length > 0 && (
								<div className="absolute z-10 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
									<div className="p-2 space-y-1">
										{products.slice(0, 5).map((product) => (
											<button
												key={product.id}
												type="button"
												onClick={() => {
													setProductFilter(product.name);
												}}
												className="w-full text-left px-3 py-2 hover:bg-accent rounded-md text-sm"
											>
												{product.name}
											</button>
										))}
									</div>
								</div>
							)}
						</div>

						{/* Filtro por cidade */}
						<div className="space-y-2 relative" ref={cityInputRef}>
							<label className="text-sm font-medium flex items-center gap-2">
								<MapPin className="h-4 w-4" />
								Filtrar por cidade
							</label>
							<div className="relative">
								<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
								<Input
									type="text"
									placeholder="Buscar cidade..."
									value={
										selectedCityId
											? cities.find((c) => c.id === selectedCityId)?.name || ""
											: citySearchTerm
									}
									onChange={(e) => {
										setCitySearchTerm(e.target.value);
										setIsCityDropdownOpen(true);
										if (e.target.value === "") {
											setSelectedCityId("");
											setPage(1);
										}
									}}
									onFocus={() => {
										setIsCityDropdownOpen(true);
									}}
									className="pl-10"
								/>
								{(selectedCityId || citySearchTerm) && (
									<Button
										variant="ghost"
										size="icon"
										className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
										onClick={() => {
											setSelectedCityId("");
											setCitySearchTerm("");
											setPage(1);
										}}
									>
										<X className="h-4 w-4" />
									</Button>
								)}
								{/* Dropdown de cidades */}
								{isCityDropdownOpen && (
									<div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto backdrop-blur-0">
										<div className="p-2 space-y-1">
											<button
												type="button"
												onClick={() => {
													setSelectedCityId("");
													setCitySearchTerm("");
													setIsCityDropdownOpen(false);
													setPage(1);
												}}
												className={`w-full text-left px-3 py-2 hover:bg-accent rounded-md text-sm ${
													!selectedCityId ? "bg-accent" : ""
												}`}
											>
												Todas as cidades
											</button>
											{filteredCities.map((city) => (
												<button
													key={city.id}
													type="button"
													onClick={() => {
														setSelectedCityId(city.id);
														setCitySearchTerm(city.name);
														setIsCityDropdownOpen(false);
														setPage(1);
													}}
													className={`w-full text-left px-3 py-2 hover:bg-accent rounded-md text-sm ${
														selectedCityId === city.id ? "bg-accent" : ""
													}`}
												>
													{city.name} - {city.state}
												</button>
											))}
											{filteredCities.length === 0 && citySearchTerm && (
												<div className="px-3 py-2 text-sm text-muted-foreground text-center">
													Nenhuma cidade encontrada
												</div>
											)}
										</div>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Limpar filtros */}
					{(storeNameFilter || productFilter || selectedCityId || citySearchTerm) && (
						<div className="mt-4 pt-4 border-t">
							<Button
								variant="outline"
								size="sm"
								onClick={() => {
									setStoreNameFilter("");
									setProductFilter("");
									setSelectedCityId("");
									setCitySearchTerm("");
									setPage(1);
								}}
							>
								<X className="h-4 w-4 mr-2" />
								Limpar filtros
							</Button>
						</div>
					)}
				</Card>

				{/* Resultados */}
				{isLoading ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="h-8 w-8 animate-spin text-primary" />
					</div>
				) : filteredStores.length === 0 ? (
					<Card className="p-12 text-center">
						<Store className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
						<p className="text-lg font-semibold mb-2">Nenhuma loja encontrada</p>
						<p className="text-muted-foreground">
							Tente ajustar os filtros ou buscar por outros termos
						</p>
					</Card>
				) : (
					<>
						<div className="mb-4">
							<p className="text-sm text-muted-foreground">
								{filteredStores.length}{" "}
								{filteredStores.length === 1 ? "loja encontrada" : "lojas encontradas"}
							</p>
						</div>

						{/* Grid de lojas */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
							{filteredStores.map((store) => {
								const city = cities.find((c) => c.id === store.cityId);
								const citySlug = city ? createSlug(city.name) : "";
								return (
									<StoreCard
										key={store.id}
										store={store}
										citySlug={citySlug}
									/>
								);
							})}
						</div>

						{/* Paginação */}
						{storesData?.pagination && storesData.pagination.totalPages > 1 && (
							<div className="flex items-center justify-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setPage((p) => Math.max(1, p - 1))}
									disabled={page === 1}
								>
									Anterior
								</Button>
								<span className="text-sm text-muted-foreground">
									Página {page} de {storesData.pagination.totalPages}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={() =>
										setPage((p) =>
											Math.min(storesData.pagination.totalPages, p + 1),
										)
									}
									disabled={page === storesData.pagination.totalPages}
								>
									Próxima
								</Button>
							</div>
						)}
					</>
				)}
			</div>
		</div>
	);
}

