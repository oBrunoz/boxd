import { AvaliacaoUsuario, EnvioAvaliacao, TipoMidia } from './catalogo.models';

// ficha do usuário no título: o que o backend guarda numa review
export interface Ficha {
  nota: number | null;
  curtido: boolean;
  assistido: boolean;
  texto: string;
}

export const FICHA_VAZIA: Ficha = { nota: null, curtido: false, assistido: false, texto: '' };

export function fichaDaAvaliacao(avaliacao: AvaliacaoUsuario | null): Ficha {
  return {
    nota: avaliacao?.rating ?? null,
    curtido: avaliacao?.liked ?? false,
    assistido: Boolean(avaliacao?.watchedAt),
    texto: avaliacao?.content ?? '',
  };
}

export function fichasIguais(a: Ficha, b: Ficha): boolean {
  return (
    a.nota === b.nota &&
    a.curtido === b.curtido &&
    a.assistido === b.assistido &&
    a.texto === b.texto
  );
}

// o backend substitui a ficha inteira, então tudo vai junto em todo envio
export function envioDaFicha(tmdbId: number, mediaType: TipoMidia, ficha: Ficha): EnvioAvaliacao {
  return {
    tmdbId,
    mediaType,
    liked: ficha.curtido,
    watched: ficha.assistido,
    ...(ficha.nota !== null && { rating: ficha.nota }),
    ...(ficha.texto !== '' && { content: ficha.texto }),
  };
}
