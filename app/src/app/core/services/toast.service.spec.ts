import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let toast: ToastService;

  beforeEach(() => {
    toast = TestBed.inject(ToastService);
  });

  it('usa o tempo do tipo e deixa o erro sem prazo', () => {
    toast.sucesso('Perfil atualizado');
    toast.erro('Não salvamos sua avaliação');

    expect(toast.itens().map((t) => t.duracao)).toEqual([6300, 0]);
  });

  it('troca no lugar o aviso com a mesma chave', () => {
    const primeiro = toast.erro('Não atualizamos sua watchlist', { chave: 'watchlist-1' });
    toast.sucesso('Perfil atualizado');
    const segundo = toast.erro('Não atualizamos sua watchlist', { chave: 'watchlist-1', detalhe: 'Sem conexão' });

    expect(segundo).toBe(primeiro);
    expect(toast.itens().map((t) => t.titulo)).toEqual(['Não atualizamos sua watchlist', 'Perfil atualizado']);
    expect(toast.itens()[0].detalhe).toBe('Sem conexão');
  });

  it('não reaproveita um aviso que já está saindo', () => {
    const id = toast.aviso('Sua sessão expirou', { chave: 'sessao' });
    toast.fechar(id);

    expect(toast.aviso('Sua sessão expirou', { chave: 'sessao' })).not.toBe(id);
    expect(toast.itens().length).toBe(2);
  });

  it('tira o mais antigo quando passa de quatro', () => {
    for (let n = 1; n <= 5; n++) toast.info(`Aviso ${n}`);

    const saindo = toast.itens().filter((t) => t.saindo).map((t) => t.titulo);
    expect(saindo).toEqual(['Aviso 1']);
  });

  it('avisa uma vez quando o aviso começa a sair', () => {
    const aoFechar = jasmine.createSpy('aoFechar');
    const id = toast.info('Assistiu? Conta o que achou.', { aoFechar });

    toast.fechar(id);
    toast.fechar(id);

    expect(aoFechar).toHaveBeenCalledTimes(1);
  });

  it('só some da lista quando o rolo remove', () => {
    const id = toast.sucesso('Avaliação salva');

    toast.fechar(id);
    expect(toast.itens()[0].saindo).toBeTrue();

    toast.remover(id);
    expect(toast.itens()).toEqual([]);
  });
});
