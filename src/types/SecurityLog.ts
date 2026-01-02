export interface SecurityLog {
  _id: string;
  action: string;
  email?: string;
  ip: string;
  userAgent?: string; // opcional
  createdAt: string;
  userId?: {
    _id: string;
    nome: string;
    email: string;
    tipo: string;
  };
}
export interface SecurityLog {
  _id: string;
  action: string;
  email?: string;
  ip: string;
  userAgent?: string; // opcional
  createdAt: string;
  userId?: {
    _id: string;
    nome: string;
    email: string;
    tipo: string;
  };
}
