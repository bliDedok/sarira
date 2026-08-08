export interface DomainModuleBoundary {
  readonly name: string;
  readonly phase: 2 | 3;
  readonly status: 'foundation' | 'implemented' | 'placeholder';
  readonly ownsHealthRules: boolean;
}

export const defineDomain = (name: string, status: DomainModuleBoundary['status'] = 'placeholder', phase: 2 | 3 = 2, ownsHealthRules = false): DomainModuleBoundary => ({ name, phase, status, ownsHealthRules });
