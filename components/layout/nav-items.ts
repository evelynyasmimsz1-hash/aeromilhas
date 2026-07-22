import {
  Bell,
  HelpCircle,
  History,
  LayoutGrid,
  Search,
  Settings,
  Tag,
  User,
  Wallet,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const mainNavItems: NavItem[] = [
  { label: "Visão geral", href: "/dashboard", icon: LayoutGrid },
  { label: "Ofertas", href: "/dashboard/ofertas", icon: Tag },
  { label: "Buscar passagens", href: "/dashboard/buscar", icon: Search },
  { label: "Minhas milhas", href: "/dashboard/milhas", icon: Wallet },
  { label: "Alertas", href: "/dashboard/alertas", icon: Bell },
  { label: "Histórico", href: "/dashboard/historico", icon: History },
];

export const secondaryNavItems: NavItem[] = [
  { label: "Perfil", href: "/dashboard/perfil", icon: User },
  { label: "Configurações", href: "/dashboard/configuracoes", icon: Settings },
  { label: "Ajuda", href: "/dashboard/ajuda", icon: HelpCircle },
];

export const mobileNavItems: NavItem[] = [
  { label: "Início", href: "/dashboard", icon: LayoutGrid },
  { label: "Ofertas", href: "/dashboard/ofertas", icon: Tag },
  { label: "Buscar", href: "/dashboard/buscar", icon: Search },
  { label: "Milhas", href: "/dashboard/milhas", icon: Wallet },
  { label: "Perfil", href: "/dashboard/perfil", icon: User },
];
