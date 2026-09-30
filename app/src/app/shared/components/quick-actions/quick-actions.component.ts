import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { LucideBookmark, LucideCheck, LucideEye, LucideHeart, LucideX } from '@lucide/angular';
import { Observable, Subject, takeUntil } from 'rxjs';
import { mensagemDeErro } from '../../../core/errors/mensagens';
import { TipoMidia } from '../../../core/models/catalogo.models';
import { FICHA_VAZIA, Ficha, envioDaFicha, fichaDaAvaliacao } from '../../../core/models/ficha';
import { AuthService } from '../../../core/services/auth.service';
import { AvaliacaoService } from '../../../core/services/avaliacao.service';
import { FichaSyncService } from '../../../core/services/ficha-sync.service';
import { WatchlistService } from '../../../core/services/watchlist.service';

const CONVITES_ASSISTIDO = [
  'Assistiu? Então conta aí: valeu a pipoca?',
  'E aí, amou, odiou ou ficou no meio-termo? Deixa sua nota enquanto tá fresquinho.',
  'Mais um pra conta! Que tal dizer o que achou?',
];

const CONVITES_CURTIDO = [
  'Curtiu, hein? Aproveita e deixa uma nota também.',
  'Gostou? Conta pro pessoal o que te pegou.',
];

function sortear(opcoes: string[]): string {
  return opcoes[Math.floor(Math.random() * opcoes.length)];
}

// atalhos do banner: assistido, curtido e watchlist gravam na hora
@Component({
  selector: 'app-quick-actions',
  standalone: true,
  imports: [CommonModule, RouterModule, LucideBookmark, LucideCheck, LucideEye, LucideHeart, LucideX],
  templateUrl: './quick-actions.component.html',
  // os botões entram na mesma fileira do hero e o convite quebra para baixo
  host: { class: 'contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickActionsComponent implements OnInit, OnChanges, OnDestroy {
  @Input({ required: true }) tmdbId!: number;
  @Input({ required: true }) mediaType!: TipoMidia;

  // fora da página do título o convite leva até ela; dentro, o pai rola até o formulário
  @Input() rotaAvaliacao: unknown[] | null = null;

  @Output() avaliar = new EventEmitter<void>();
  @Output() conviteVisivel = new EventEmitter<boolean>();

  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly watchlist = inject(WatchlistService);
  private readonly avaliacoes = inject(AvaliacaoService);
  private readonly sync = inject(FichaSyncService);

  ficha = signal<Ficha>({ ...FICHA_VAZIA });
  naWatchlist = signal(false);
  carregando = signal(false);
  // sem a ficha do servidor, gravar daqui apagaria nota e texto que o usuário já tinha
  semFicha = signal(false);
  salvando = signal(false);
  erro = signal('');
  convite = signal('');

  private cancelarCarga$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.sync
      .deOutros(this, () => this.tmdbId, () => this.mediaType)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.carregar());
  }

  ngOnChanges(mudancas: SimpleChanges): void {
    // a rota chega como array novo a cada ciclo; só a troca de título recarrega
    if (!mudancas['tmdbId'] && !mudancas['mediaType']) return;

    this.cancelarCarga$.next();
    this.ficha.set({ ...FICHA_VAZIA });
    this.naWatchlist.set(false);
    this.salvando.set(false);
    this.semFicha.set(false);
    this.erro.set('');
    this.fecharConvite();
    if (this.auth.autenticado() && this.tmdbId) this.carregar();
  }

  ngOnDestroy(): void {
    this.cancelarCarga$.next();
    this.cancelarCarga$.complete();
    this.destroy$.next();
    this.destroy$.complete();
  }

  alternarAssistido(): void {
    const atual = this.ficha();
    const assistido = !atual.assistido;
    // nota sem ter assistido não faz sentido, igual ao formulário
    this.gravar({ ...atual, assistido, nota: assistido ? atual.nota : null }, assistido ? CONVITES_ASSISTIDO : null);
  }

  alternarCurtido(): void {
    const atual = this.ficha();
    const curtido = !atual.curtido;
    this.gravar({ ...atual, curtido }, curtido ? CONVITES_CURTIDO : null);
  }

  alternarWatchlist(): void {
    if (!this.exigirLogin() || this.salvando()) return;
    this.salvando.set(true);
    this.erro.set('');

    const queria = !this.naWatchlist();
    const acao: Observable<unknown> = queria
      ? this.watchlist.adicionar(this.tmdbId, this.mediaType)
      : this.watchlist.remover(this.tmdbId, this.mediaType);

    this.naWatchlist.set(queria);
    acao.pipe(takeUntil(this.cancelarCarga$), takeUntil(this.destroy$)).subscribe({
      next: () => {
        this.salvando.set(false);
        this.sync.avisar(this.tmdbId, this.mediaType, this);
      },
      error: (falha) => {
        this.naWatchlist.set(!queria);
        this.erro.set(mensagemDeErro(falha));
        this.salvando.set(false);
      },
    });
  }

  irParaAvaliacao(): void {
    this.fecharConvite();
    if (this.rotaAvaliacao) {
      this.router.navigate(this.rotaAvaliacao, { fragment: 'sua-avaliacao' });
    } else {
      this.avaliar.emit();
    }
  }

  fecharConvite(): void {
    if (!this.convite()) return;
    this.convite.set('');
    this.conviteVisivel.emit(false);
  }

  private gravar(nova: Ficha, convites: string[] | null): void {
    if (!this.exigirLogin() || this.salvando() || this.carregando() || this.semFicha()) return;

    const anterior = this.ficha();
    this.ficha.set(nova);
    this.salvando.set(true);
    this.erro.set('');
    this.fecharConvite();

    this.avaliacoes
      .salvar(envioDaFicha(this.tmdbId, this.mediaType, nova))
      .pipe(takeUntil(this.cancelarCarga$), takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.salvando.set(false);
          this.sync.avisar(this.tmdbId, this.mediaType, this);
          // só convida quem ainda não deu nota nem escreveu
          if (convites && nova.nota === null && nova.texto === '') {
            this.convite.set(sortear(convites));
            this.conviteVisivel.emit(true);
          }
        },
        error: (falha) => {
          this.ficha.set(anterior);
          this.erro.set(mensagemDeErro(falha));
          this.salvando.set(false);
        },
      });
  }

  private exigirLogin(): boolean {
    if (this.auth.autenticado()) return true;
    this.router.navigate(['/login'], { queryParams: { redirect: this.router.url } });
    return false;
  }

  private carregar(): void {
    this.carregando.set(true);

    this.watchlist
      .contem(this.tmdbId, this.mediaType)
      .pipe(takeUntil(this.cancelarCarga$), takeUntil(this.destroy$))
      .subscribe({ next: ({ present }) => this.naWatchlist.set(present), error: () => {} });

    this.avaliacoes
      .minhaNoTitulo(this.tmdbId, this.mediaType)
      .pipe(takeUntil(this.cancelarCarga$), takeUntil(this.destroy$))
      .subscribe({
        next: (minha) => {
          this.ficha.set(fichaDaAvaliacao(minha));
          this.semFicha.set(false);
          this.carregando.set(false);
        },
        error: () => {
          this.semFicha.set(true);
          this.carregando.set(false);
        },
      });
  }
}
