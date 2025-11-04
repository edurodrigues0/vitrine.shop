import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Cookie, Settings, Shield, BarChart3 } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Cookies - Vitrine.shop",
  description: "Informações sobre o uso de cookies na plataforma Vitrine.shop",
};

export default function CookiesPage() {
  const cookieTypes = [
    {
      icon: Shield,
      title: "Cookies Essenciais",
      description: "Estes cookies são necessários para o funcionamento básico da plataforma e não podem ser desativados.",
      items: [
        "Autenticação: Mantém sua sessão ativa",
        "Segurança: Protege contra atividades fraudulentas",
        "Preferências básicas: Armazena configurações essenciais",
      ],
      color: "text-blue-600",
    },
    {
      icon: Settings,
      title: "Cookies de Funcionalidade",
      description: "Estes cookies permitem que a plataforma forneça funcionalidades e personalização aprimoradas.",
      items: [
        "Preferências do usuário: Lembra suas escolhas (tema claro/escuro, cidade selecionada)",
        "Carrinho de compras: Mantém os itens no carrinho durante a navegação",
        "Idioma: Armazena sua preferência de idioma",
      ],
      color: "text-green-600",
    },
    {
      icon: BarChart3,
      title: "Cookies de Análise",
      description: "Estes cookies nos ajudam a entender como os visitantes interagem com a plataforma, coletando informações de forma anônima.",
      items: [
        "Estatísticas de uso: Páginas visitadas, tempo de permanência",
        "Performance: Identificação de problemas técnicos",
        "Melhorias: Dados para otimizar a experiência do usuário",
      ],
      color: "text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen pt-20 pb-12 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-950/10 dark:via-purple-950/5 dark:to-pink-950/10">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        {/* Header */}
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Cookie className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Política de Cookies
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <Card className="p-8 md:p-12 bg-background/80 backdrop-blur-sm border-2 shadow-xl">
          <div className="space-y-8 prose prose-sm max-w-none">
            <section>
              <h2 className="text-2xl font-semibold mb-4">O que são Cookies?</h2>
              <p className="text-muted-foreground leading-relaxed">
                Cookies são pequenos arquivos de texto que são armazenados no seu dispositivo (computador, tablet ou celular) quando você visita um site. Eles permitem que o site reconheça seu dispositivo e armazene algumas informações sobre suas preferências ou ações passadas.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                A Vitrine.shop utiliza cookies para melhorar sua experiência de navegação, analisar o uso da plataforma e personalizar conteúdo. Esta política explica como utilizamos cookies e como você pode gerenciá-los.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Como Utilizamos Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos cookies para diversos propósitos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li><strong className="text-foreground">Funcionalidade essencial:</strong> Para garantir o funcionamento básico da plataforma</li>
                <li><strong className="text-foreground">Autenticação:</strong> Para manter você logado e garantir segurança</li>
                <li><strong className="text-foreground">Preferências:</strong> Para lembrar suas preferências (tema, cidade selecionada, etc.)</li>
                <li><strong className="text-foreground">Análise:</strong> Para entender como os usuários utilizam a plataforma</li>
                <li><strong className="text-foreground">Melhorias:</strong> Para melhorar nossos serviços e experiência do usuário</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6">Tipos de Cookies que Utilizamos</h2>
              
              <div className="space-y-6">
                {cookieTypes.map((type, index) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={index}
                      className="border-l-4 border-primary pl-6 py-6 bg-primary/5 rounded-r-lg hover:bg-primary/10 transition-colors"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center ${type.color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{type.title}</h3>
                          <p className="text-muted-foreground mb-4">{type.description}</p>
                          <ul className="list-disc pl-6 space-y-1 text-muted-foreground text-sm">
                            {type.items.map((item, itemIndex) => (
                              <li key={itemIndex}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Cookies de Terceiros</h2>
              <p className="text-muted-foreground leading-relaxed">
                Alguns cookies podem ser definidos por serviços de terceiros que aparecem em nossas páginas. Estes cookies são gerenciados por essas empresas e estão sujeitos às suas próprias políticas de privacidade.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Atualmente, podemos utilizar serviços de terceiros para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Análise de uso da plataforma (Google Analytics, se aplicável)</li>
                <li>Hospedagem e infraestrutura</li>
                <li>Ferramentas de suporte ao cliente</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Duração dos Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos dois tipos de cookies quanto à duração:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li><strong className="text-foreground">Cookies de sessão:</strong> Temporários, são excluídos quando você fecha o navegador</li>
                <li><strong className="text-foreground">Cookies persistentes:</strong> Permanecem no seu dispositivo por um período determinado ou até que você os exclua manualmente</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Como Gerenciar Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Você tem controle sobre os cookies. A maioria dos navegadores aceita cookies automaticamente, mas você pode modificar as configurações do navegador para recusar cookies. No entanto, isso pode afetar a funcionalidade da plataforma.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">Configurações por Navegador</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Google Chrome:</strong> Configurações → Privacidade e segurança → Cookies</li>
                <li><strong className="text-foreground">Mozilla Firefox:</strong> Opções → Privacidade e Segurança → Cookies e dados do site</li>
                <li><strong className="text-foreground">Safari:</strong> Preferências → Privacidade → Cookies</li>
                <li><strong className="text-foreground">Microsoft Edge:</strong> Configurações → Cookies e permissões do site</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Gerenciamento na Plataforma</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você pode gerenciar suas preferências de cookies através das configurações da plataforma ou entrar em contato conosco para solicitar a exclusão de cookies específicos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Consequências de Desabilitar Cookies</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você optar por desabilitar cookies, algumas funcionalidades da plataforma podem não funcionar corretamente:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Você precisará fazer login novamente a cada visita</li>
                <li>Suas preferências não serão salvas</li>
                <li>O carrinho de compras pode não funcionar corretamente</li>
                <li>Algumas funcionalidades podem estar indisponíveis</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Atualizações desta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Cookies periodicamente para refletir mudanças em nossas práticas ou em outros motivos operacionais, legais ou regulatórios. Recomendamos que você revise esta política regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Consentimento</h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao continuar utilizando a plataforma Vitrine.shop após ser informado sobre o uso de cookies, você concorda com o uso de cookies de acordo com esta política. Você pode retirar seu consentimento a qualquer momento através das configurações do navegador ou entrando em contato conosco.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre nossa Política de Cookies, entre em contato conosco:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong className="text-foreground">Email:</strong> <a href="mailto:privacidade@vitrine.shop" className="text-primary hover:underline font-medium">privacidade@vitrine.shop</a></li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
