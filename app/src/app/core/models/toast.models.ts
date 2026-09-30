export type TipoToast = 'info' | 'sucesso' | 'aviso' | 'erro';

export interface AcaoToast {
  rotulo: string;
  executar: () => void;
}

export interface OpcoesToast {
  detalhe?: string;
  acao?: AcaoToast;
  // com duas ações, elas descem para baixo do texto
  acaoSecundaria?: AcaoToast;
  // avisos com a mesma chave se substituem em vez de empilhar
  chave?: string;
  // chamado uma vez quando o aviso começa a sair, por tempo, X, ação ou limite
  aoFechar?: () => void;
}

export interface Toast extends OpcoesToast {
  id: number;
  tipo: TipoToast;
  titulo: string;
  // 0 = só sai quando o usuário fecha
  duracao: number;
  saindo: boolean;
}

// a mesma ordem do espectro, sempre as sete
export const ESPECTRO = ['#45417C', '#2880A8', '#78C4C4', '#F0E0C5', '#ECA352', '#D85057', '#942548'];

// trecho do espectro que cada tipo acende, do frio (calmo) ao quente (urgente)
export const ZONA_DO_TIPO: Record<TipoToast, number[]> = {
  info: [0, 1],
  sucesso: [2, 3],
  aviso: [4],
  erro: [5, 6],
};

// cor do ícone: a principal de cada trecho
export const COR_DO_TIPO: Record<TipoToast, string> = {
  info: ESPECTRO[1],
  sucesso: ESPECTRO[2],
  aviso: ESPECTRO[4],
  erro: ESPECTRO[5],
};

export const DURACAO_DO_TIPO: Record<TipoToast, number> = {
  info: 4900,
  sucesso: 6300,
  aviso: 7700,
  erro: 0,
};
