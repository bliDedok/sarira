/** Phase 2 boundary only. No nutrition calculation is implemented. */
export interface NutritionEnginePort {
  calculate(input: unknown): Promise<never>;
}

export const NUTRITION_ENGINE_STATUS = 'NOT_IMPLEMENTED_PHASE_2' as const;
