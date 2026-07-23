export type ProjectStatusOption = {
  value: string;
  label: string;
};

export const PROJECT_STATUS_OPTIONS: ProjectStatusOption[] = [
  { value: 'PLANEJAMENTO', label: 'Planejamento' },
  { value: 'EM_ANDAMENTO', label: 'Em Andamento' },
  { value: 'CONCLUIDO', label: 'Concluído' },
];

export const PROJECT_STATUS_DISPLAY_ORDER = PROJECT_STATUS_OPTIONS.map((option) => option.label);

export const formatProjectStatusLabel = (value: string | null | undefined): string => {
  if (typeof value !== 'string') {
    return 'Sem status';
  }

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

  if (!normalized) {
    return 'Sem status';
  }

  if (normalized === 'PLANEJAMENTO') {
    return 'Planejamento';
  }

  if (normalized === 'EM_ANDAMENTO' || normalized === 'EM ACAO' || normalized === 'EM_ACAO') {
    return 'Em Andamento';
  }

  if (normalized === 'CONCLUIDO' || normalized === 'FINALIZADO') {
    return 'Concluído';
  }

  return value.trim();
};

export const normalizeProjectStatusValue = (value: string | null | undefined): string => {
  if (typeof value !== 'string') {
    return '';
  }

  const normalized = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .trim();

  if (normalized === 'PLANEJAMENTO') {
    return 'PLANEJAMENTO';
  }

  if (normalized === 'EM_ANDAMENTO' || normalized === 'EM ACAO' || normalized === 'EM_ACAO') {
    return 'EM_ANDAMENTO';
  }

  if (normalized === 'CONCLUIDO' || normalized === 'FINALIZADO') {
    return 'CONCLUIDO';
  }

  return '';
};