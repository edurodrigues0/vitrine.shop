"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders-service";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Phone, Mail, Calendar, CheckCircle2, Clock, Truck, XCircle, Search } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";

const statusLabels: Record<string, string> = {
  PENDENTE: "Pendente",
  CONFIRMADO: "Confirmado",
  PREPARANDO: "Preparando",
  ENVIADO: "Enviado",
  ENTREGUE: "Entregue",
  CANCELADO: "Cancelado",
};

const statusIcons: Record<string, typeof Package> = {
  PENDENTE: Clock,
  CONFIRMADO: CheckCircle2,
  PREPARANDO: Package,
  ENVIADO: Truck,
  ENTREGUE: CheckCircle2,
  CANCELADO: XCircle,
};

export default function OrdersPage() {
  const { selectedStore, isLoading: isLoadingStore } = useSelectedStore();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [customerNameFilter, setCustomerNameFilter] = useState<string>("");
  const [customerPhoneFilter, setCustomerPhoneFilter] = useState<string>("");

  // Get orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders", "store", selectedStore?.id, statusFilter, customerNameFilter, customerPhoneFilter],
    queryFn: () =>
      ordersService.findAll({
        storeId: selectedStore?.id,
        status: statusFilter || undefined,
        customerName: customerNameFilter || undefined,
        customerPhone: customerPhoneFilter || undefined,
      }),
    enabled: !!selectedStore?.id,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: string; status: string }) =>
      ordersService.updateStatus(orderId, { status: status as any }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Status atualizado com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar status");
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const orders = ordersData?.orders || [];

  // Fetch order items for each order - deve ser chamado antes dos returns condicionais
  const { data: orderItemsMap } = useQuery({
    queryKey: ["order-items", orders.map((o) => o.id).join(",")],
    queryFn: async () => {
      const itemsMap: Record<string, any[]> = {};
      for (const order of orders) {
        try {
          const items = await ordersService.findItems(order.id);
          itemsMap[order.id] = items;
        } catch (error) {
          console.error(`Error fetching items for order ${order.id}:`, error);
          itemsMap[order.id] = [];
        }
      }
      return itemsMap;
    },
    enabled: orders.length > 0 && !!selectedStore?.id,
  });

  if (isLoadingStore || isLoadingOrders) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!selectedStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Pedidos</h1>
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">
            Você precisa criar uma loja para visualizar pedidos.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Pedidos</h1>
          <p className="text-muted-foreground">
            Gerencie todos os pedidos da sua loja
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Todos os status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="CONFIRMADO">Confirmado</option>
            <option value="PREPARANDO">Preparando</option>
            <option value="ENVIADO">Enviado</option>
            <option value="ENTREGUE">Entregue</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Search className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Filtros de Busca</h2>
        </div>
        <FieldGroup>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field>
              <FieldLabel htmlFor="customerName">Nome do Cliente</FieldLabel>
              <Input
                id="customerName"
                placeholder="Buscar por nome..."
                value={customerNameFilter}
                onChange={(e) => setCustomerNameFilter(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="customerPhone">WhatsApp</FieldLabel>
              <Input
                id="customerPhone"
                placeholder="Buscar por WhatsApp..."
                value={customerPhoneFilter}
                onChange={(e) => setCustomerPhoneFilter(e.target.value)}
              />
            </Field>
          </div>
        </FieldGroup>
      </Card>

      {orders.length === 0 ? (
        <Card className="p-12 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
          <h2 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h2>
          <p className="text-muted-foreground">
            {statusFilter
              ? "Não há pedidos com este status."
              : "Você ainda não recebeu nenhum pedido."}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const StatusIcon = statusIcons[order.status] || Package;
            const statusColors: Record<string, string> = {
              PENDENTE: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20",
              CONFIRMADO: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
              PREPARANDO: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20",
              ENVIADO: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20",
              ENTREGUE: "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20",
              CANCELADO: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
            };
            return (
              <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Main Content */}
                  <div className="flex-1 space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${statusColors[order.status] || statusColors.PENDENTE}`}>
                          <StatusIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">
                            Pedido #{order.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={`${statusColors[order.status] || statusColors.PENDENTE} border`}>
                        {statusLabels[order.status]}
                      </Badge>
                    </div>

                    {/* Customer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Cliente</p>
                        <p className="font-semibold">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Contato</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-semibold">{order.customerPhone}</span>
                        </div>
                        {order.customerEmail && (
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{order.customerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    {orderItemsMap && orderItemsMap[order.id] && orderItemsMap[order.id].length > 0 && (
                      <div>
                        <p className="text-sm font-semibold mb-3 flex items-center gap-2">
                          <Package className="h-4 w-4" />
                          Itens do Pedido ({orderItemsMap[order.id].length})
                        </p>
                        <div className="space-y-2">
                          {orderItemsMap[order.id].map((item: any, index: number) => (
                            <Card key={index} className="p-4 bg-muted/50">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm font-medium mb-1">
                                    Variação: {item.productVariationId?.slice(0, 8).toUpperCase() || "N/A"}
                                  </p>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Qtd: {item.quantity}</span>
                                    <span>•</span>
                                    <span>R$ {(item.price / 100).toFixed(2).replace(".", ",")} un.</span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                                    R$ {((item.price * item.quantity) / 100).toFixed(2).replace(".", ",")}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Notes */}
                    {order.notes && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="lg:w-64 space-y-4">
                    {/* Total */}
                    <Card className="p-4 bg-primary/5 border-primary/20">
                      <p className="text-xs text-muted-foreground mb-1">Total do Pedido</p>
                      <p className="text-2xl font-bold text-primary">
                        R$ {(order.total / 100).toFixed(2).replace(".", ",")}
                      </p>
                    </Card>

                    {/* Status Selector */}
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Alterar Status</p>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={updateStatusMutation.isPending}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <option value="PENDENTE">Pendente</option>
                        <option value="CONFIRMADO">Confirmado</option>
                        <option value="PREPARANDO">Preparando</option>
                        <option value="ENVIADO">Enviado</option>
                        <option value="ENTREGUE">Entregue</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

