import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { Shield, Lock, Eye, Key } from "lucide-react";

export const metadata: Metadata = {
  title: "Política de Privacidade - Vitrine.shop",
  description: "Política de privacidade e proteção de dados da plataforma Vitrine.shop",
};

export default function PrivacidadePage() {
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
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Política de Privacidade
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <Card className="p-8 md:p-12 bg-background/80 backdrop-blur-sm border-2 shadow-xl">
          <div className="space-y-8 prose prose-sm max-w-none">
            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Lock className="h-6 w-6 text-primary" />
                1. Introdução
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Vitrine.shop está comprometida em proteger a privacidade e segurança dos dados pessoais de nossos usuários. Esta Política de Privacidade descreve como coletamos, usamos, armazenamos e protegemos suas informações pessoais quando você utiliza nossa plataforma.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Eye className="h-6 w-6 text-primary" />
                2. Informações que Coletamos
              </h2>
              <h3 className="text-xl font-semibold mb-3 mt-6">2.1. Informações Fornecidas por Você</h3>
              <p className="text-muted-foreground leading-relaxed">
                Coletamos informações que você nos fornece diretamente, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li><strong className="text-foreground">Dados de cadastro:</strong> Nome, email, senha (criptografada)</li>
                <li><strong className="text-foreground">Dados da loja:</strong> Nome da loja, descrição, CNPJ/CPF, endereço, telefone/WhatsApp, redes sociais</li>
                <li><strong className="text-foreground">Dados de produtos:</strong> Informações sobre produtos cadastrados na plataforma</li>
                <li><strong className="text-foreground">Dados de comunicação:</strong> Mensagens e interações com o suporte</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">2.2. Informações Coletadas Automaticamente</h3>
              <p className="text-muted-foreground leading-relaxed">
                Coletamos automaticamente certas informações quando você utiliza a plataforma:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li><strong className="text-foreground">Dados de uso:</strong> Páginas visitadas, tempo de permanência, cliques</li>
                <li><strong className="text-foreground">Dados técnicos:</strong> Endereço IP, tipo de navegador, sistema operacional</li>
                <li><strong className="text-foreground">Cookies:</strong> Informações armazenadas em cookies (veja nossa Política de Cookies)</li>
                <li><strong className="text-foreground">Dados de localização:</strong> Cidade selecionada (quando disponível)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Key className="h-6 w-6 text-primary" />
                3. Como Utilizamos suas Informações
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Utilizamos suas informações pessoais para:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Fornecer e melhorar nossos serviços;</li>
                <li>Processar seu cadastro e gerenciar sua conta;</li>
                <li>Facilitar a comunicação entre lojistas e clientes;</li>
                <li>Enviar notificações importantes sobre a plataforma;</li>
                <li>Personalizar sua experiência na plataforma;</li>
                <li>Analisar o uso da plataforma para melhorias;</li>
                <li>Cumprir obrigações legais e regulatórias;</li>
                <li>Prevenir fraudes e garantir a segurança da plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. Compartilhamento de Informações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Não vendemos suas informações pessoais. Podemos compartilhar suas informações apenas nas seguintes situações:
              </p>
              <h3 className="text-xl font-semibold mb-3 mt-6">4.1. Com Outros Usuários</h3>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li>Informações da loja são visíveis para clientes que acessam sua página</li>
                <li>Informações de contato podem ser compartilhadas quando você inicia uma conversa via WhatsApp</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2. Com Prestadores de Serviços</h3>
              <p className="text-muted-foreground leading-relaxed">
                Podemos compartilhar informações com prestadores de serviços que nos ajudam a operar a plataforma (hospedagem, análise de dados, etc.), sempre sob acordos de confidencialidade.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.3. Por Obrigação Legal</h3>
              <p className="text-muted-foreground leading-relaxed">
                Podemos divulgar informações quando exigido por lei, ordem judicial ou processo legal.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. Segurança dos Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição. Isso inclui:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Criptografia de dados sensíveis (senhas);</li>
                <li>Uso de conexões seguras (HTTPS);</li>
                <li>Controles de acesso e autenticação;</li>
                <li>Monitoramento regular de segurança;</li>
                <li>Backups regulares dos dados.</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                No entanto, nenhum método de transmissão ou armazenamento é 100% seguro. Embora nos esforcemos para proteger suas informações, não podemos garantir segurança absoluta.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. Seus Direitos (LGPD)</h2>
              <p className="text-muted-foreground leading-relaxed">
                De acordo com a Lei Geral de Proteção de Dados (LGPD), você tem os seguintes direitos:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li><strong className="text-foreground">Confirmação e acesso:</strong> Saber se tratamos seus dados e acessá-los</li>
                <li><strong className="text-foreground">Correção:</strong> Solicitar correção de dados incompletos ou desatualizados</li>
                <li><strong className="text-foreground">Anonimização, bloqueio ou eliminação:</strong> Solicitar a remoção de dados desnecessários</li>
                <li><strong className="text-foreground">Portabilidade:</strong> Solicitar a transferência de seus dados para outro fornecedor</li>
                <li><strong className="text-foreground">Eliminação:</strong> Solicitar a exclusão de dados tratados com seu consentimento</li>
                <li><strong className="text-foreground">Revogação do consentimento:</strong> Retirar seu consentimento a qualquer momento</li>
                <li><strong className="text-foreground">Oposição:</strong> Opor-se ao tratamento de dados em certas circunstâncias</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Para exercer seus direitos, entre em contato conosco através do email: <a href="mailto:privacidade@vitrine.shop" className="text-primary hover:underline font-medium">privacidade@vitrine.shop</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. Retenção de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Mantemos suas informações pessoais apenas pelo tempo necessário para cumprir os propósitos descritos nesta política, a menos que um período de retenção mais longo seja exigido ou permitido por lei. Quando seus dados não forem mais necessários, serão excluídos ou anonimizados de forma segura.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. Alterações nesta Política</h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos atualizar esta Política de Privacidade periodicamente. Notificaremos você sobre mudanças significativas publicando a nova política nesta página e atualizando a data de "Última atualização". Recomendamos que você revise esta política periodicamente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. Contato</h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas ou preocupações sobre esta Política de Privacidade ou sobre como tratamos seus dados pessoais, entre em contato conosco:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong className="text-foreground">Email:</strong> <a href="mailto:privacidade@vitrine.shop" className="text-primary hover:underline">privacidade@vitrine.shop</a></li>
                <li><strong className="text-foreground">Encarregado de Proteção de Dados (DPO):</strong> <a href="mailto:dpo@vitrine.shop" className="text-primary hover:underline">dpo@vitrine.shop</a></li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
