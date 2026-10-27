export const colors = {
  primary: '#0F766E',
  primaryDark: '#115E59',
  primarySoft: '#CCFBF1',
  bg: '#F4F6F8',
  card: '#FFFFFF',
  text: '#0F172A',
  muted: '#64748B',
  border: '#E2E8F0',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  warning: '#B45309',
  warningSoft: '#FEF3C7',
  success: '#15803D',
  successSoft: '#DCFCE7',
};

export const radius = { sm: 10, md: 14, lg: 20 };

export const shadow = {
  shadowColor: '#0F172A',
  shadowOpacity: 0.06,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 4 },
  elevation: 2,
};

export const money = (n: number) => '$' + String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
