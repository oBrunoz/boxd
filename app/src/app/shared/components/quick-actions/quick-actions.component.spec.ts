import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AvaliacaoUsuario, EnvioAvaliacao } from '../../../core/models/catalogo.models';
import { AuthService } from '../../../core/services/auth.service';
import { AvaliacaoService } from '../../../core/services/avaliacao.service';
import { FichaSyncService } from '../../../core/services/ficha-sync.service';
import { WatchlistService } from '../../../core/services/watchlist.service';
import { QuickActionsComponent } from './quick-actions.component';

const AVALIACAO: AvaliacaoUsuario = {
  id: 'r1',
  rating: null,
  content: null,
  liked: false,
  watchedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('QuickActionsComponent', () => {
  let fixture: ComponentFixture<QuickActionsComponent>;
  let componente: QuickActionsComponent;
  let avaliacoes: jasmine.SpyObj<AvaliacaoService>;
  let watchlist: jasmine.SpyObj<WatchlistService>;

  beforeEach(async () => {
    watchlist = jasmine.createSpyObj<WatchlistService>('WatchlistService', ['contem', 'adicionar', 'remover']);
    watchlist.contem.and.returnValue(of({ present: false }));

    avaliacoes = jasmine.createSpyObj<AvaliacaoService>('AvaliacaoService', ['minhaNoTitulo', 'salvar']);
    avaliacoes.minhaNoTitulo.and.returnValue(of(null));
    avaliacoes.salvar.and.returnValue(of(AVALIACAO));

    await TestBed.configureTestingModule({
      imports: [QuickActionsComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: WatchlistService, useValue: watchlist },
        { provide: AvaliacaoService, useValue: avaliacoes },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(QuickActionsComponent);
    componente = fixture.componentInstance;
    TestBed.inject(AuthService).usuario.set({
      id: 'u1',
      username: 'teste',
      name: 'Teste',
      avatarUrl: null,
      bio: null,
      createdAt: '2026-01-01T00:00:00.000Z',
    });
  });

  function abrirTitulo(tmdbId: number): void {
    fixture.componentRef.setInput('tmdbId', tmdbId);
    fixture.componentRef.setInput('mediaType', 'movie');
    fixture.detectChanges();
  }

  function ultimoEnvio(): EnvioAvaliacao {
    return avaliacoes.salvar.calls.mostRecent().args[0];
  }

  it('mantém nota e texto já gravados ao marcar assistido', () => {
    avaliacoes.minhaNoTitulo.and.returnValue(of({ ...AVALIACAO, rating: 8, content: 'bom demais' }));
    abrirTitulo(1);

    componente.alternarCurtido();

    // o backend substitui a ficha inteira: mandar só a curtida apagaria o resto
    expect(ultimoEnvio()).toEqual({
      tmdbId: 1,
      mediaType: 'movie',
      liked: true,
      watched: false,
      rating: 8,
      content: 'bom demais',
    });
  });

  it('convida a avaliar quem marcou assistido sem nota', () => {
    abrirTitulo(1);

    componente.alternarAssistido();

    expect(componente.ficha().assistido).toBeTrue();
    expect(componente.convite()).toBeTruthy();
  });

  it('não convida quem já deu nota', () => {
    avaliacoes.minhaNoTitulo.and.returnValue(of({ ...AVALIACAO, rating: 7 }));
    abrirTitulo(1);

    componente.alternarAssistido();

    expect(componente.convite()).toBe('');
  });

  it('volta o botão quando a gravação falha', () => {
    abrirTitulo(1);
    avaliacoes.salvar.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));

    componente.alternarAssistido();

    expect(componente.ficha().assistido).toBeFalse();
    expect(componente.convite()).toBe('');
    expect(componente.erro()).toBeTruthy();
  });

  it('não grava sem ter a ficha do servidor', () => {
    avaliacoes.minhaNoTitulo.and.returnValue(throwError(() => new HttpErrorResponse({ status: 500 })));
    abrirTitulo(1);

    componente.alternarAssistido();

    expect(avaliacoes.salvar).not.toHaveBeenCalled();
  });

  it('avisa os outros componentes do título depois de gravar', () => {
    const sync = TestBed.inject(FichaSyncService);
    const avisos: number[] = [];
    sync.todas().subscribe((m) => avisos.push(m.tmdbId));
    abrirTitulo(1);

    componente.alternarCurtido();

    expect(avisos).toEqual([1]);
  });
});
