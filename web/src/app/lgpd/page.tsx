import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { FileCheck, CheckCircle2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "LGPD - Lei Geral de Proteção de Dados - Vitrine.shop",
  description: "Informações sobre a conformidade com a LGPD na plataforma Vitrine.shop",
};

export default function LGPDPage() {
  const rights = [
    {
      number: "1",
      title: "Confirmação da Existência de Tratamento",
      description: "Você tem o direito de saber se tratamos seus dados pessoais.",
    },
    {
      number: "2",
      title: "Acesso aos Dados",
      description: "Você pode solicitar uma cópia dos dados pessoais que temos sobre você.",
    },
    {
      number: "3",
      title: "Correção de Dados",
      description: "Você pode solicitar a correção de dados incompletos, inexatos ou desatualizados.",
    },
    {
      number: "4",
      title: "Anonimização, Bloqueio ou Eliminação",
      description: "Você pode solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.",
    },
    {
      number: "5",
      title: "Portabilidade dos Dados",
      description: "Você pode solicitar a portabilidade de seus dados para outro fornecedor de serviço ou produto, mediante requisição expressa.",
    },
    {
      number: "6",
      title: "Eliminação dos Dados",
      description: "Você pode solicitar a eliminação dos dados pessoais tratados com base no seu consentimento.",
    },
    {
      number: "7",
      title: "Informação sobre Compartilhamento",
      description: "Você tem o direito de obter informações sobre entidades públicas e privadas com as quais compartilhamos seus dados.",
    },
    {
      number: "8",
      title: "Informação sobre Possibilidade de Não Consentir",
      description: "Você tem o direito de ser informado sobre a possibilidade de não fornecer consentimento e sobre as consequências da negativa.",
    },
    {
      number: "9",
      title: "Revogação do Consentimento",
      description: "Você pode revogar seu consentimento a qualquer momento, mediante manifestação expressa.",
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
            <FileCheck className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Conformidade com a LGPD
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <Card className="p-8 md:p-12 bg-background/80 backdrop-blur-sm border-2 shadow-xl">
          <div className="space-y-8 prose prose-sm max-w-none">
            <section>
              <h2 className="text-2xl font-semibold mb-4">O que é a LGPD?</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Lei Geral de Proteção de Dados (Lei nº 13.709/2018) estabelece regras sobre coleta, armazenamento, tratamento e compartilhamento de dados pessoais, impondo maior proteção e penalidades para o descumprimento.
              </p>
              <p className="text-muted-foreground leading-relaxed mt-4">
                A Vitrine.shop está totalmente comprometida em cumprir todas as disposições da LGPD e garantir que seus dados pessoais sejam tratados de forma segura, transparente e em conformidade com a legislação brasileira.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-6">Seus Direitos Garantidos pela LGPD</h2>
              
              <div className="space-y-4">
                {rights.map((right) => (
                  <div
                    key={right.number}
                    className="border-l-4 border-primary pl-6 py-4 bg-primary/5 rounded-r-lg hover:bg-primary/10 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {right.number}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2">{right.title}</h3>
                        <p className="text-muted-foreground">{right.description}</p>
                      </div>
                      <CheckCircle2 className="h-6 w-6 text-primary flex-shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Como Exercer seus Direitos</h2>
              <p className="text-muted-foreground leading-relaxed">
                Para exercer qualquer um dos direitos mencionados acima, você pode:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Enviar um email para <a href="mailto:lgpd@vitrine.shop" className="text-primary hover:underline font-medium">lgpd@vitrine.shop</a></li>
                <li>Entrar em contato com nosso Encarregado de Proteção de Dados (DPO) em <a href="mailto:dpo@vitrine.shop" className="text-primary hover:underline font-medium">dpo@vitrine.shop</a></li>
                <li>Utilizar o formulário de solicitação disponível em sua conta</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                Responderemos sua solicitação no prazo máximo de 15 (quinze) dias, conforme estabelecido pela LGPD.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Base Legal para o Tratamento de Dados</h2>
              <p className="text-muted-foreground leading-relaxed">
                Tratamos seus dados pessoais com base nas seguintes bases legais previstas na LGPD:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li><strong className="text-foreground">Consentimento:</strong> Quando você nos fornece consentimento explícito</li>
                <li><strong className="text-foreground">Execução de contrato:</strong> Para cumprir nossos serviços e atender suas solicitações</li>
                <li><strong className="text-foreground">Cumprimento de obrigação legal:</strong> Quando necessário para cumprir obrigações legais</li>
                <li><strong className="text-foreground">Legítimo interesse:</strong> Para melhorar nossos serviços e segurança da plataforma</li>
                <li><strong className="text-foreground">Proteção da vida:</strong> Em situações de proteção à vida ou à incolumidade física</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Medidas de Segurança</h2>
              <p className="text-muted-foreground leading-relaxed">
                Implementamos medidas técnicas e organizacionais adequadas para proteger seus dados pessoais, incluindo:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Criptografia de dados sensíveis</li>
                <li>Controles de acesso e autenticação</li>
                <li>Monitoramento de segurança</li>
                <li>Backups regulares</li>
                <li>Treinamento de equipe sobre proteção de dados</li>
                <li>Auditorias regulares de segurança</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Encarregado de Proteção de Dados (DPO)</h2>
              <p className="text-muted-foreground leading-relaxed">
                A Vitrine.shop possui um Encarregado de Proteção de Dados (Data Protection Officer - DPO) responsável por:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Receber comunicações dos titulares e da Autoridade Nacional de Proteção de Dados (ANPD)</li>
                <li>Orientar funcionários sobre práticas de proteção de dados</li>
                <li>Executar ações de conformidade com a LGPD</li>
                <li>Atuar como canal de comunicação entre a empresa, titulares e ANPD</li>
              </ul>
              <p className="text-muted-foreground leading-relaxed mt-4">
                <strong className="text-foreground">Contato do DPO:</strong> <a href="mailto:dpo@vitrine.shop" className="text-primary hover:underline font-medium">dpo@vitrine.shop</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Autoridade Nacional de Proteção de Dados (ANPD)</h2>
              <p className="text-muted-foreground leading-relaxed">
                Caso você tenha alguma reclamação sobre o tratamento de seus dados pessoais, você pode entrar em contato com a Autoridade Nacional de Proteção de Dados (ANPD):
              </p>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong className="text-foreground">Site:</strong> <a href="https://www.gov.br/anpd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">www.gov.br/anpd</a></li>
                <li><strong className="text-foreground">Email:</strong> <a href="mailto:ouvidoria@anpd.gov.br" className="text-primary hover:underline">ouvidoria@anpd.gov.br</a></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">Alterações e Atualizações</h2>
              <p className="text-muted-foreground leading-relaxed">
                Esta página pode ser atualizada periodicamente para refletir mudanças em nossas práticas de conformidade com a LGPD ou alterações na legislação. Recomendamos que você revise esta página regularmente.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary" />
                Contato
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Para questões relacionadas à LGPD e proteção de dados, entre em contato:
              </p>
              <ul className="list-none space-y-2 text-muted-foreground mt-4">
                <li><strong className="text-foreground">Email LGPD:</strong> <a href="mailto:lgpd@vitrine.shop" className="text-primary hover:underline font-medium">lgpd@vitrine.shop</a></li>
                <li><strong className="text-foreground">DPO:</strong> <a href="mailto:dpo@vitrine.shop" className="text-primary hover:underline font-medium">dpo@vitrine.shop</a></li>
              </ul>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
