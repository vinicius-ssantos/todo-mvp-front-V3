import { format, formatDistanceToNow, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

/**
 * Format date to Brazilian format
 */
export function formatDate(date: string | Date, pattern = "dd/MM/yyyy"): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return format(dateObj, pattern, { locale: ptBR });
}

/**
 * Format date to relative time (e.g., "há 2 horas")
 */
export function formatRelative(date: string | Date): string {
  const dateObj = typeof date === "string" ? parseISO(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: ptBR });
}

/**
 * Format date to datetime
 */
export function formatDateTime(date: string | Date): string {
  return formatDate(date, "dd/MM/yyyy 'às' HH:mm");
}
