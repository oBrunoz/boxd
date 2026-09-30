import { Injectable, signal } from '@angular/core';
import { DURACAO_DO_TIPO, OpcoesToast, TipoToast, Toast } from '../models/toast.models';

// passando disso o mais antigo sai sozinho
const LIMITE = 4;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly lista = signal<Toast[]>([]);
  readonly itens = this.lista.asReadonly();

  private proximoId = 0;

  info(titulo: string, opcoes?: OpcoesToast): number {
    return this.mostrar('info', titulo, opcoes);
  }

  sucesso(titulo: string, opcoes?: OpcoesToast): number {
    return this.mostrar('sucesso', titulo, opcoes);
  }

  aviso(titulo: string, opcoes?: OpcoesToast): number {
    return this.mostrar('aviso', titulo, opcoes);
  }

  erro(titulo: string, opcoes?: OpcoesToast): number {
    return this.mostrar('erro', titulo, opcoes);
  }

  // começa a saída; quem tira da lista é o rolo, quando a animação termina
  fechar(id: number): void {
    const alvo = this.lista().find((t) => t.id === id);
    if (!alvo || alvo.saindo) return;

    this.lista.update((itens) => itens.map((t) => (t.id === id ? { ...t, saindo: true } : t)));
    alvo.aoFechar?.();
  }

  remover(id: number): void {
    this.lista.update((itens) => itens.filter((t) => t.id !== id));
  }

  private mostrar(tipo: TipoToast, titulo: string, opcoes: OpcoesToast = {}): number {
    const toast: Toast = {
      ...opcoes,
      id: ++this.proximoId,
      tipo,
      titulo,
      duracao: DURACAO_DO_TIPO[tipo],
      saindo: false,
    };

    const repetido = toast.chave
      ? this.lista().find((t) => !t.saindo && t.chave === toast.chave)
      : undefined;

    // troca o conteúdo no lugar: sem animar de novo nem mexer na ordem
    if (repetido) {
      this.lista.update((itens) =>
        itens.map((t) => (t.id === repetido.id ? { ...toast, id: repetido.id } : t)),
      );
      return repetido.id;
    }

    const ativos = this.lista().filter((t) => !t.saindo);
    const velhos = ativos.slice(0, Math.max(0, ativos.length + 1 - LIMITE));

    this.lista.update((itens) => [...itens, toast]);
    velhos.forEach((t) => this.fechar(t.id));

    return toast.id;
  }
}
