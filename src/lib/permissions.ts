export type UserRole = "admin" | "gestor" | "operador" | "leitura";

export interface Permission {
  action: string;
  roles: UserRole[];
}

const permissions: Record<string, UserRole[]> = {
  // Leads
  "leads:upload": ["admin", "gestor", "operador"],
  "leads:view": ["admin", "gestor", "operador", "leitura"],
  "leads:process": ["admin", "gestor", "operador"],
  
  // Estratégia
  "estrategia:create": ["admin", "gestor"],
  "estrategia:view": ["admin", "gestor", "operador", "leitura"],
  "estrategia:edit": ["admin", "gestor"],
  
  // Aprovações
  "aprovacao:submit": ["admin", "gestor"],
  "aprovacao:review": ["admin", "gestor"],
  "aprovacao:view": ["admin", "gestor", "operador", "leitura"],
  
  // Disparo
  "disparo:execute": ["admin", "gestor"],
  "disparo:view": ["admin", "gestor", "operador", "leitura"],
  
  // Conversas
  "conversas:view": ["admin", "gestor", "operador", "leitura"],
  "conversas:interact": ["admin", "gestor", "operador"],
  
  // Agendamentos
  "agendamentos:view": ["admin", "gestor", "operador", "leitura"],
  "agendamentos:manage": ["admin", "gestor", "operador"],
  
  // Relatórios
  "relatorios:view": ["admin", "gestor", "leitura"],
  "relatorios:export": ["admin", "gestor"],
  
  // Configurações
  "config:view": ["admin", "gestor"],
  "config:edit": ["admin"],
};

export function hasPermission(userRole: UserRole, action: string): boolean {
  const allowedRoles = permissions[action];
  if (!allowedRoles) return false;
  return allowedRoles.includes(userRole);
}

export function canApprove(userEmail: string, createdBy: string): boolean {
  // Regra quatro-olhos: usuário não pode aprovar sua própria criação
  return userEmail !== createdBy;
}
