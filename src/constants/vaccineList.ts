
export interface VaccineTemplate {
  id: string;
  name: string;
  ageLabel: string;
  ageMonths: number;
  description: string;
}

export const VACCINE_LIST: VaccineTemplate[] = [
  // ── Nacimiento ──
  {
    id: 'bcg',
    name: 'BCG',
    ageLabel: 'Nacimiento',
    ageMonths: 0,
    description: 'Protege contra la tuberculosis grave',
  },
  {
    id: 'hep_b_birth',
    name: 'Hepatitis B',
    ageLabel: 'Nacimiento',
    ageMonths: 0,
    description: 'Primera dosis contra la Hepatitis B',
  },

  // ── 2 Meses ──
  {
    id: 'pentavalente_1',
    name: 'Pentavalente (1ra dosis)',
    ageLabel: '2 meses',
    ageMonths: 2,
    description: 'Protege contra difteria, tétanos, tos ferina, hepatitis B y Hib',
  },
  {
    id: 'polio_1',
    name: 'Polio (1ra dosis)',
    ageLabel: '2 meses',
    ageMonths: 2,
    description: 'Protege contra la poliomielitis',
  },
  {
    id: 'rotavirus_1',
    name: 'Rotavirus (1ra dosis)',
    ageLabel: '2 meses',
    ageMonths: 2,
    description: 'Protege contra diarrea severa por rotavirus',
  },
  {
    id: 'neumococo_1',
    name: 'Neumococo (1ra dosis)',
    ageLabel: '2 meses',
    ageMonths: 2,
    description: 'Protege contra neumonía y meningitis',
  },

  // ── 4 Meses ──
  {
    id: 'pentavalente_2',
    name: 'Pentavalente (2da dosis)',
    ageLabel: '4 meses',
    ageMonths: 4,
    description: 'Segunda dosis contra difteria, tétanos, tos ferina, hepatitis B y Hib',
  },
  {
    id: 'polio_2',
    name: 'Polio (2da dosis)',
    ageLabel: '4 meses',
    ageMonths: 4,
    description: 'Segunda dosis contra la poliomielitis',
  },
  {
    id: 'rotavirus_2',
    name: 'Rotavirus (2da dosis)',
    ageLabel: '4 meses',
    ageMonths: 4,
    description: 'Segunda dosis contra diarrea severa por rotavirus',
  },
  {
    id: 'neumococo_2',
    name: 'Neumococo (2da dosis)',
    ageLabel: '4 meses',
    ageMonths: 4,
    description: 'Segunda dosis contra neumonía y meningitis',
  },

  // ── 6 Meses ──
  {
    id: 'pentavalente_3',
    name: 'Pentavalente (3ra dosis)',
    ageLabel: '6 meses',
    ageMonths: 6,
    description: 'Tercera dosis contra difteria, tétanos, tos ferina, hepatitis B y Hib',
  },
  {
    id: 'polio_3',
    name: 'Polio (3ra dosis)',
    ageLabel: '6 meses',
    ageMonths: 6,
    description: 'Tercera dosis contra la poliomielitis',
  },
  {
    id: 'influenza_1',
    name: 'Influenza (1ra dosis)',
    ageLabel: '6 meses',
    ageMonths: 6,
    description: 'Protege contra la gripe estacional',
  },

  // ── 12 Meses ──
  {
    id: 'srp',
    name: 'SRP',
    ageLabel: '12 meses',
    ageMonths: 12,
    description: 'Protege contra sarampión, rubéola y paperas',
  },
  {
    id: 'varicela',
    name: 'Varicela',
    ageLabel: '12 meses',
    ageMonths: 12,
    description: 'Protege contra la varicela',
  },
  {
    id: 'neumococo_3',
    name: 'Neumococo (refuerzo)',
    ageLabel: '12 meses',
    ageMonths: 12,
    description: 'Refuerzo contra neumonía y meningitis',
  },

  // ── 18 Meses ──
  {
    id: 'pentavalente_r',
    name: 'Pentavalente (refuerzo)',
    ageLabel: '18 meses',
    ageMonths: 18,
    description: 'Refuerzo contra difteria, tétanos, tos ferina, hepatitis B y Hib',
  },
  {
    id: 'polio_r',
    name: 'Polio (refuerzo)',
    ageLabel: '18 meses',
    ageMonths: 18,
    description: 'Refuerzo contra la poliomielitis',
  },

  // ── 5 Años ──
  {
    id: 'srp_r',
    name: 'SRP (refuerzo)',
    ageLabel: '5 años',
    ageMonths: 60,
    description: 'Refuerzo contra sarampión, rubéola y paperas',
  },
  {
    id: 'dpt_r',
    name: 'DPT (refuerzo)',
    ageLabel: '5 años',
    ageMonths: 60,
    description: 'Refuerzo contra difteria, pertussis y tétanos',
  },
  {
    id: 'polio_5',
    name: 'Polio (5 años)',
    ageLabel: '5 años',
    ageMonths: 60,
    description: 'Dosis final contra la poliomielitis',
  },
];


export const getVaccinesByAge = (): Record<string, VaccineTemplate[]> => {
  return VACCINE_LIST.reduce((groups, vaccine) => {
    const key = vaccine.ageLabel;

    if (!groups[key]) {
      groups[key] = []
    }
    groups[key].push(vaccine);
    return groups
  }, {} as Record<string, VaccineTemplate[]>);
};