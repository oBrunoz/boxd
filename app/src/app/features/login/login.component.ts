import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LucideEye, LucideEyeOff, LucideLock, LucideMail } from '@lucide/angular';
import { ehFalhaDeSistema, mensagemDeErro } from '../../core/errors/mensagens';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Campos } from '../../core/validacao/campos';
import { validarEmail, validarSenhaDigitada } from '../../core/validacao/conta';
import { TravessiaComponent } from '../../shared/components/travessia/travessia.component';

type Campo = 'email' | 'password';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, LucideMail, LucideLock, LucideEye, LucideEyeOff, TravessiaComponent],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly rota = inject(ActivatedRoute);

  email = signal('');
  password = signal('');
  showPassword = signal(false);
  enviando = signal(false);
  // não dá para dizer qual dos dois está errado, então o aviso é do formulário
  credenciaisIncorretas = signal(false);
  erroGeral = signal('');

  readonly campos = new Campos<Campo>(() => ({
    email: validarEmail(this.email()),
    password: validarSenhaDigitada(this.password()),
  }));

  togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  editar(campo: Campo, valor: string): void {
    (campo === 'email' ? this.email : this.password).set(valor);
    this.campos.editou(campo);
    this.credenciaisIncorretas.set(false);
    this.erroGeral.set('');
  }

  onSubmit(): void {
    if (this.enviando()) return;

    const invalido = this.campos.primeiroInvalido();
    if (invalido) {
      document.getElementById(invalido)?.focus();
      return;
    }

    this.enviando.set(true);
    this.credenciaisIncorretas.set(false);
    this.erroGeral.set('');

    this.auth.entrar({ email: this.email().trim(), password: this.password() }).subscribe({
      next: () => {
        const destino = this.rota.snapshot.queryParamMap.get('redirect') ?? '/';
        void this.router.navigateByUrl(destino);
      },
      error: (falha) => {
        this.enviando.set(false);
        this.tratarFalha(falha);
      },
    });
  }

  private tratarFalha(falha: unknown): void {
    if (ehFalhaDeSistema(falha)) {
      this.toast.erro('Não conseguimos entrar', { detalhe: mensagemDeErro(falha), chave: 'login-form' });
      return;
    }

    // a API recusa com 400 a senha abaixo do mínimo: para quem digita, é só senha errada
    const status = falha instanceof HttpErrorResponse ? falha.status : -1;
    if (status === 401 || status === 400) {
      this.credenciaisIncorretas.set(true);
      return;
    }

    this.erroGeral.set(mensagemDeErro(falha));
  }
}
