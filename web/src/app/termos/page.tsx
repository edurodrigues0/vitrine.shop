import type { Metadata } from "next";
import { Card } from "@/components/ui/card";
import { FileText, Shield, AlertCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Termos de Uso - Vitrine.shop",
  description: "Termos e condições de uso da plataforma Vitrine.shop",
};

export default function TermosPage() {
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
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-purple-600 to-primary bg-clip-text text-transparent">
            Termos de Uso
          </h1>
          <p className="text-sm text-muted-foreground">
            Última atualização: {new Date().toLocaleDateString("pt-BR")}
          </p>
        </div>

        <Card className="p-8 md:p-12 bg-background/80 backdrop-blur-sm border-2 shadow-xl">
          <div className="space-y-8 prose prose-sm max-w-none">
            <div className="bg-blue-50 dark:bg-blue-950/20 border-l-4 border-blue-500 p-4 rounded-r-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-blue-900 dark:text-blue-100 m-0">
                  Ao acessar e utilizar a plataforma Vitrine.shop, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.
                </p>
              </div>
            </div>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">1</span>
                Aceitação dos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Ao acessar e utilizar a plataforma Vitrine.shop, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não concordar com qualquer parte destes termos, não deve utilizar nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">2</span>
                Definições
              </h2>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
                <li><strong className="text-foreground">Plataforma:</strong> Refere-se ao site Vitrine.shop e todos os seus serviços relacionados.</li>
                <li><strong className="text-foreground">Usuário:</strong> Qualquer pessoa que acessa ou utiliza a plataforma.</li>
                <li><strong className="text-foreground">Lojista:</strong> Usuário que possui uma loja cadastrada na plataforma.</li>
                <li><strong className="text-foreground">Cliente:</strong> Usuário que utiliza a plataforma para visualizar e comprar produtos.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">3</span>
                Uso da Plataforma
              </h2>
              <h3 className="text-xl font-semibold mb-3 mt-6">3.1. Cadastro</h3>
              <p className="text-muted-foreground leading-relaxed">
                Para utilizar determinados recursos da plataforma, você precisará criar uma conta. Você é responsável por manter a confidencialidade de suas credenciais de acesso e por todas as atividades que ocorrem sob sua conta.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.2. Idade Mínima</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você declara ter pelo menos 18 anos de idade ou ter a autorização de um responsável legal para utilizar a plataforma.
              </p>

              <h3 className="text-xl font-semibold mb-3 mt-6">3.3. Uso Permitido</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você concorda em utilizar a plataforma apenas para fins legais e de acordo com estes termos. É proibido:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Utilizar a plataforma para qualquer atividade ilegal ou não autorizada;</li>
                <li>Violar qualquer lei ou regulamento aplicável;</li>
                <li>Infringir direitos de propriedade intelectual;</li>
                <li>Transmitir vírus, malware ou qualquer código malicioso;</li>
                <li>Tentar acessar áreas restritas da plataforma sem autorização;</li>
                <li>Interferir ou interromper o funcionamento da plataforma.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">4</span>
                Conta de Lojista
              </h2>
              <h3 className="text-xl font-semibold mb-3 mt-6">4.1. Responsabilidades do Lojista</h3>
              <p className="text-muted-foreground leading-relaxed">
                Ao criar uma loja na plataforma, você concorda em:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Fornecer informações precisas e atualizadas sobre sua loja;</li>
                <li>Manter a qualidade e precisão das informações dos produtos;</li>
                <li>Responder adequadamente às solicitações e pedidos dos clientes;</li>
                <li>Cumprir todas as obrigações legais relacionadas à venda de produtos;</li>
                <li>Manter a segurança e confidencialidade de sua conta.</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">4.2. Produtos e Conteúdo</h3>
              <p className="text-muted-foreground leading-relaxed">
                Você é responsável por todo o conteúdo que publica na plataforma, incluindo descrições de produtos, imagens e preços. Você garante que possui todos os direitos necessários sobre o conteúdo publicado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">5</span>
                Compras e Transações
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A plataforma Vitrine.shop atua como intermediária entre lojistas e clientes. As transações são realizadas diretamente entre o cliente e o lojista através do WhatsApp. A Vitrine.shop não é responsável por:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Qualidade, segurança ou legalidade dos produtos vendidos;</li>
                <li>Precisão das informações fornecidas pelos lojistas;</li>
                <li>Falhas na comunicação entre cliente e lojista;</li>
                <li>Problemas com pagamentos ou entregas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">6</span>
                Propriedade Intelectual
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Todo o conteúdo da plataforma, incluindo design, textos, gráficos, logos e software, é propriedade da Vitrine.shop ou de seus licenciadores e está protegido por leis de propriedade intelectual. Você não pode copiar, reproduzir ou distribuir qualquer conteúdo sem autorização prévia por escrito.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">7</span>
                Limitação de Responsabilidade
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                A Vitrine.shop não se responsabiliza por:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-muted-foreground mt-3">
                <li>Danos diretos, indiretos, incidentais ou consequenciais resultantes do uso da plataforma;</li>
                <li>Perda de dados ou informações;</li>
                <li>Interrupções no serviço ou indisponibilidade da plataforma;</li>
                <li>Ações de terceiros, incluindo outros usuários ou lojistas.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">8</span>
                Modificações dos Termos
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Reservamos o direito de modificar estes Termos de Uso a qualquer momento. As alterações entrarão em vigor imediatamente após a publicação. É sua responsabilidade revisar periodicamente estes termos. O uso continuado da plataforma após as alterações constitui aceitação dos novos termos.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">9</span>
                Rescisão
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Podemos suspender ou encerrar sua conta e acesso à plataforma a qualquer momento, sem aviso prévio, por violação destes Termos de Uso ou por qualquer outro motivo que consideremos apropriado. Você também pode encerrar sua conta a qualquer momento.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">10</span>
                Lei Aplicável
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Estes Termos de Uso são regidos pelas leis da República Federativa do Brasil. Qualquer disputa relacionada a estes termos será resolvida nos tribunais competentes do Brasil.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-bold">11</span>
                Contato
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                Se você tiver dúvidas sobre estes Termos de Uso, entre em contato conosco através do email: <a href="mailto:contato@vitrine.shop" className="text-primary hover:underline font-medium">contato@vitrine.shop</a>
              </p>
            </section>
          </div>
        </Card>
      </div>
    </div>
  );
}
