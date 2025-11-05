"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersService } from "@/services/orders-service";
import { storesService } from "@/services/stores-service";
import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Package, Phone, Mail, Calendar, CheckCircle2, Clock, Truck, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("");

  // Get user's store
  const { data: storesData, isLoading: isLoadingStores } = useQuery({
    queryKey: ["stores", "user", user?.id],
    queryFn: () => storesService.findAll(),
    enabled: !!user,
  });

  const userStore = storesData?.stores.find(
    (store) => store.ownerId === user?.id,
  );

  // Get orders
  const { data: ordersData, isLoading: isLoadingOrders } = useQuery({
    queryKey: ["orders", "store", userStore?.id, statusFilter],
    queryFn: () =>
      ordersService.findAll({
        storeId: userStore?.id,
        status: statusFilter || undefined,
      }),
    enabled: !!userStore?.id,
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

  if (isLoadingStores || isLoadingOrders) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!userStore) {
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

  const orders = ordersData?.orders || [];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="flex h-10 w-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="">Todos</option>
          <option value="PENDENTE">Pendente</option>
          <option value="CONFIRMADO">Confirmado</option>
          <option value="PREPARANDO">Preparando</option>
          <option value="ENVIADO">Enviado</option>
          <option value="ENTREGUE">Entregue</option>
          <option value="CANCELADO">Cancelado</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <Card className="p-8 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
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
            return (
              <Card key={order.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <StatusIcon className="h-5 w-5 text-primary" />
                      <div>
                        <h3 className="text-lg font-semibold">
                          Pedido #{order.id.slice(0, 8)}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Cliente</p>
                        <p className="font-semibold">{order.customerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">Contato</p>
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          <span className="font-semibold">{order.customerPhone}</span>
                        </div>
                        {order.customerEmail && (
                          <div className="flex items-center gap-2 mt-1">
                            <Mail className="h-4 w-4" />
                            <span className="text-sm">{order.customerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Status</p>
                      <p className="font-semibold capitalize">{statusLabels[order.status]}</p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-muted-foreground mb-1">Total</p>
                      <p className="text-2xl font-bold">
                        R$ {(order.total / 100).toFixed(2).replace(".", ",")}
                      </p>
                    </div>

                    {order.notes && (
                      <div className="mb-4">
                        <p className="text-sm text-muted-foreground mb-1">Observações</p>
                        <p className="text-sm">{order.notes}</p>
                      </div>
                    )}
                  </div>

                  <div className="ml-4">
                    <select
                      value={order.status}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      disabled={updateStatusMutation.isPending}
                      className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

