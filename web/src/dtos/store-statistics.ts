export interface StoreStatistics {
  totalOrders: number;
  ordersLast7Days: number;
  ordersLast30Days: number;
  totalRevenue: number; // Em centavos
  revenueLast7Days: number; // Em centavos
  revenueLast30Days: number; // Em centavos
  ordersByStatus: {
    PENDENTE: number;
    CONFIRMADO: number;
    PREPARANDO: number;
    ENVIADO: number;
    ENTREGUE: number;
    CANCELADO: number;
  };
}

