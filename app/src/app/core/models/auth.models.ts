export interface PublicUser {
  id: string;
  username: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  createdAt: string;
}

export interface SessionResponse {
  user?: PublicUser;
  accessToken: string;
}

export interface AtualizacaoPerfil {
  name?: string;
  username?: string;
  email?: string;
  bio?: string;
  // string vazia tira a foto
  avatarUrl?: string;
  currentPassword?: string;
}

export interface Credenciais {
  email: string;
  password: string;
}

export interface DadosCadastro extends Credenciais {
  name: string;
  username: string;
}
