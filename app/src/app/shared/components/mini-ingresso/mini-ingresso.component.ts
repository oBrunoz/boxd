import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { ESPECTRO, ZONA_DO_TIPO } from '../../../core/models/toast.models';

// confirmação pequena que sai do próprio botão; o pai precisa ser relative
@Component({
  selector: 'app-mini-ingresso',
  standalone: true,
  templateUrl: './mini-ingresso.component.html',
  styleUrls: ['./mini-ingresso.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiniIngressoComponent {
  @Input({ required: true }) aberto = false;
  @Output() fechou = new EventEmitter<void>();

  readonly espectro = ESPECTRO;
  readonly zona = ZONA_DO_TIPO.sucesso;

  // o Angular prefixa os keyframes do componente
  aoTerminar(evento: AnimationEvent): void {
    if (evento.animationName.endsWith('estala')) this.fechou.emit();
  }
}
