"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders-service";
import { useSelectedStore } from "@/hooks/use-selected-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, Phone, Mail, Calendar, CheckCircle2, Clock, Truck, XCircle, Search, MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { OrderStatusTimeline } from "@/components/order-status-timeline";
import { useState } from "react";
import { showError, showSuccess } from "@/lib/toast";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    orderId: string;
    status: string;
  } | null>(null);
  const [lastUpdatedOrderId, setLastUpdatedOrderId] = useState<string | null>(null);

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
    onMutate: ({ orderId, status }) => {
      setPendingStatusUpdate({ orderId, status });
      setLastUpdatedOrderId(null);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      showSuccess("Status atualizado com sucesso!");
      setLastUpdatedOrderId(variables.orderId);
    },
    onError: (error: Error) => {
      showError(error.message || "Erro ao atualizar status");
    },
    onSettled: () => {
      setPendingStatusUpdate(null);
    },
  });

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ orderId, status: newStatus });
  };

  const toggleOrder = (orderId: string) => {
    setExpandedOrders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orderId)) {
        newSet.delete(orderId);
      } else {
        newSet.add(orderId);
      }
      return newSet;
    });
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

  // Mostrar loading enquanto está carregando as lojas
  if (isLoadingStore) {
    return (
      <div>
        <h1 className="text-3xl font-bold mb-8">Pedidos</h1>
        <Card className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </Card>
      </div>
    );
  }

  // Só mostrar mensagem de "criar loja" se não estiver carregando e realmente não tiver loja
  if (!selectedStore && !isLoadingStore) {
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
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TODOS">Todos os status</SelectItem>
              <SelectItem value="PENDENTE">Pendente</SelectItem>
              <SelectItem value="CONFIRMADO">Confirmado</SelectItem>
              <SelectItem value="PREPARANDO">Preparando</SelectItem>
              <SelectItem value="ENVIADO">Enviado</SelectItem>
              <SelectItem value="ENTREGUE">Entregue</SelectItem>
              <SelectItem value="CANCELADO">Cancelado</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="space-y-4">
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
            const isExpanded = expandedOrders.has(order.id);
            
            return (
              <Card key={order.id} className="overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-border/60 dark:hover:border-border">
                {/* Header - Sempre visível */}
                <button
                  onClick={() => toggleOrder(order.id)}
                  className="w-full p-6 flex items-center justify-between hover:bg-muted/50 transition-colors"
                  aria-expanded={isExpanded}
                  aria-controls={`order-${order.id}`}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`p-2 rounded-lg ${statusColors[order.status] || statusColors.PENDENTE} flex-shrink-0`}>
                      <StatusIcon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold truncate">
                          Pedido #{order.id.slice(0, 8).toUpperCase()}
                        </h3>
                        <Badge className={`${statusColors[order.status] || statusColors.PENDENTE} border flex-shrink-0`}>
                          {statusLabels[order.status]}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                        <div className="flex items-center gap-1.5">
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
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-foreground">{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone className="h-4 w-4" />
                          <span>{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-primary">
                            R$ {(order.total / 100).toFixed(2).replace(".", ",")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground mb-1">Total</p>
                      <p className="text-lg font-bold text-primary">
                        R$ {(order.total / 100).toFixed(2).replace(".", ",")}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Conteúdo expandido */}
                {isExpanded && (
                  <div
                    id={`order-${order.id}`}
                    className="border-t border-border p-6"
                  >
                    <div className="flex flex-col lg:flex-row gap-6">
                      {/* Main Content */}
                      <div className="flex-1 space-y-4">
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
                              <a
                                href={`https://wa.me/${order.customerPhone.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="font-semibold text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 transition-colors flex items-center gap-1"
                                title="Abrir WhatsApp com o cliente"
                              >
                                {order.customerPhone}
                                <MessageCircle className="h-3 w-3" />
                              </a>
                            </div>
                            {order.customerEmail && (
                              <div className="flex items-center gap-2 mt-1">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <a
                                  href={`mailto:${order.customerEmail}`}
                                  className="link-text text-sm font-medium"
                                  title="Enviar e-mail para o cliente"
                                >
                                  {order.customerEmail}
                                </a>
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
                                      <p className="text-sm font-semibold mb-1">
                                        {item.productName || "Produto"}
                                      </p>
                                      {item.productVariation && (
                                        <p className="text-xs text-muted-foreground mb-2">
                                          {item.productVariation.color && item.productVariation.size
                                            ? `${item.productVariation.color} / ${item.productVariation.size}`
                                            : item.productVariation.color || item.productVariation.size || ""}
                                        </p>
                                      )}
                                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <span>Qtd: {item.quantity}</span>
                                        <span>•</span>
                                        <span>R$ {(item.price / 100).toFixed(2).replace(".", ",")} un.</span>
                                        {item.productVariationId && (
                                          <>
                                            <span>•</span>
                                            <span className="text-xs">ID: {item.productVariationId.slice(0, 8).toUpperCase()}</span>
                                          </>
                                        )}
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
                      <div className="lg:w-80 space-y-4">
                        {/* Total */}
                        <Card className="p-4 bg-primary/5 border-primary/20">
                          <p className="text-xs text-muted-foreground mb-1">Total do Pedido</p>
                          <p className="text-2xl font-bold text-primary">
                            R$ {(order.total / 100).toFixed(2).replace(".", ",")}
                          </p>
                        </Card>

                        {/* Status Timeline */}
                        <Card className="p-4">
                          <OrderStatusTimeline
                            currentStatus={order.status}
                            createdAt={order.createdAt}
                            updatedAt={order.updatedAt}
                          />
                        </Card>

                        {/* Status Selector */}
                        <Card className="p-4">
                          <p className="text-xs text-muted-foreground mb-3 font-semibold">Alterar Status</p>
                          <div className="grid grid-cols-2 gap-2">
                            {Object.entries(statusLabels).map(([status, label]) => {
                              const isSelected = order.status === status;
                              const StatusIcon = statusIcons[status] || Package;
                              const statusColor = statusColors[status] || statusColors.PENDENTE;
                              
                              const isLoadingButton =
                                updateStatusMutation.isPending &&
                                pendingStatusUpdate?.orderId === order.id &&
                                pendingStatusUpdate?.status === status;

                              const isDisabled =
                                isSelected ||
                                (updateStatusMutation.isPending && !isLoadingButton);

                              return (
                                <Button
                                  key={status}
                                  variant={isSelected ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleStatusChange(order.id, status)}
                                  isLoading={isLoadingButton}
                                  loadingText="Atualizando..."
                                  disabled={isDisabled}
                                  className={`${isSelected ? "" : "hover:bg-accent"} transition-all max-w-full`}
                                  title={isSelected ? "Status atual" : `Alterar para ${label}`}
                                >
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  <span className="text-xs">{label}</span>
                                </Button>
                              );
                            })}
                          </div>
                          {updateStatusMutation.isPending && pendingStatusUpdate?.orderId === order.id && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Atualizando status...</span>
                            </div>
                          )}
                          {updateStatusMutation.isError && pendingStatusUpdate?.orderId === order.id && (
                            <p className="mt-2 text-xs text-destructive" aria-live="assertive">
                              Não foi possível atualizar o status. Tente novamente.
                            </p>
                          )}
                          {updateStatusMutation.isSuccess && !updateStatusMutation.isPending && lastUpdatedOrderId === order.id && (
                            <p className="mt-2 text-xs text-success" aria-live="polite">
                              Status atualizado com sucesso.
                            </p>
                          )}
                        </Card>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}