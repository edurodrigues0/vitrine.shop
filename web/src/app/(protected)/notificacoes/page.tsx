"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Palette, ShoppingBag, Package, AlertTriangle, Store, Info } from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";

export default function NotificacoesPage() {
  const [preferences, setPreferences] = useState({
    newOrder: true,
    orderStatusChanged: true,
    lowStock: true,
    productAdded: false,
    storeUpdated: false,
    system: true,
    emailNotifications: false,
    browserNotifications: true,
  });

  useEffect(() => {
    // Carregar preferências do localStorage
    const saved = localStorage.getItem("notificationPreferences");
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    }
  }, []);

  const handleToggle = (key: keyof typeof preferences) => {
    const newPreferences = {
      ...preferences,
      [key]: !preferences[key],
    };
    setPreferences(newPreferences);
    localStorage.setItem("notificationPreferences", JSON.stringify(newPreferences));
    toast.success("Preferência atualizada!");
  };

  const handleSave = () => {
    localStorage.setItem("notificationPreferences", JSON.stringify(preferences));
    toast.success("Preferências salvas com sucesso!");
  };

  const handleReset = () => {
    const defaultPreferences = {
      newOrder: true,
      orderStatusChanged: true,
      lowStock: true,
      productAdded: false,
      storeUpdated: false,
      system: true,
      emailNotifications: false,
      browserNotifications: true,
    };
    setPreferences(defaultPreferences);
    localStorage.setItem("notificationPreferences", JSON.stringify(defaultPreferences));
    toast.success("Preferências resetadas para o padrão!");
  };

  const notificationTypes = [
    {
      key: "newOrder" as const,
      label: "Novos Pedidos",
      description: "Receba notificações quando um novo pedido for realizado",
      icon: ShoppingBag,
      color: "text-green-600 dark:text-green-400 bg-green-500/10 dark:bg-green-500/20",
    },
    {
      key: "orderStatusChanged" as const,
      label: "Mudanças de Status",
      description: "Notificações quando o status de um pedido for alterado",
      icon: ShoppingBag,
      color: "text-blue-600 dark:text-blue-400 bg-blue-500/10 dark:bg-blue-500/20",
    },
    {
      key: "lowStock" as const,
      label: "Estoque Baixo",
      description: "Alertas quando produtos estiverem com estoque baixo",
      icon: AlertTriangle,
      color: "text-orange-600 dark:text-orange-400 bg-orange-500/10 dark:bg-orange-500/20",
    },
    {
      key: "productAdded" as const,
      label: "Novos Produtos",
      description: "Notificações quando novos produtos forem adicionados",
      icon: Package,
      color: "text-purple-600 dark:text-purple-400 bg-purple-500/10 dark:bg-purple-500/20",
    },
    {
      key: "storeUpdated" as const,
      label: "Atualizações da Loja",
      description: "Notificações sobre mudanças nas configurações da loja",
      icon: Store,
      color: "text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 dark:bg-indigo-500/20",
    },
    {
      key: "system" as const,
      label: "Notificações do Sistema",
      description: "Mensagens importantes do sistema",
      icon: Info,
      color: "text-gray-600 dark:text-gray-400 bg-gray-500/10 dark:bg-gray-500/20",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold mb-2">Notificações</h1>
        <p className="text-muted-foreground">
          Configure como você recebe notificações e atualizações
        </p>
      </div>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-primary/10 dark:bg-primary/20">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">Preferências de Notificações</h2>
            <p className="text-sm text-muted-foreground">Configure como você recebe notificações</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Canais de Notificação */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Canais de Notificação</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Bell className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Notificações no Navegador</p>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações em tempo real no navegador
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("browserNotifications")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.browserNotifications ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.browserNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Palette className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-medium">Notificações por E-mail</p>
                    <p className="text-sm text-muted-foreground">
                      Receba notificações importantes por e-mail
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleToggle("emailNotifications")}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    preferences.emailNotifications ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      preferences.emailNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Tipos de Notificação */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Tipos de Notificação</h3>
            <div className="space-y-3">
              {notificationTypes.map((type) => {
                const Icon = type.icon;
                const isEnabled = preferences[type.key];
                return (
                  <div
                    key={type.key}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`p-2 rounded-lg ${type.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{type.label}</p>
                        <p className="text-sm text-muted-foreground">{type.description}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleToggle(type.key)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        isEnabled ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          isEnabled ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex gap-4 pt-4 border-t">
            <Button onClick={handleSave} className="flex-1">
              Salvar Preferências
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Restaurar Padrão
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

