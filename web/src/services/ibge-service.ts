/**
 * Serviço para buscar dados da API do IBGE (Instituto Brasileiro de Geografia e Estatística)
 * API pública e gratuita: https://servicodados.ibge.gov.br/api/docs/localidades
 */

interface IBGEMunicipio {
  id: number;
  nome: string;
  microrregiao: {
    id: number;
    nome: string;
    mesorregiao: {
      id: number;
      nome: string;
      UF: {
        id: number;
        sigla: string;
        nome: string;
      };
    };
  };
}

export interface IBGECity {
  id: number; // ID do IBGE
  name: string;
  state: string;
}

export const ibgeService = {
  /**
   * Busca todos os municípios de um estado usando a API do IBGE
   * @param uf - Sigla do estado (ex: "SP", "RJ", "MG")
   * @returns Array de cidades do estado
   */
  getMunicipiosByEstado: async (uf: string): Promise<IBGECity[]> => {
    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro ao buscar municípios: ${response.status} ${response.statusText}`);
      }

      const data: IBGEMunicipio[] = await response.json();
      
      // Mapear dados do IBGE para formato simplificado
      return data.map((municipio) => ({
        id: municipio.id,
        name: municipio.nome,
        state: municipio.microrregiao.mesorregiao.UF.sigla,
      }));
    } catch (error) {
      console.error("Erro ao buscar municípios do IBGE:", error);
      throw error;
    }
  },
};


