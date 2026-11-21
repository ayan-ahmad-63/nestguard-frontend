/** Pages that are designed but not part of Phase-I: they show sample data and are labelled as previews. */
export const PHASE_II_PAGES = ["visitors", "analytics", "camera", "devices"] as const;
export const isPhaseII = (id: string) => (PHASE_II_PAGES as readonly string[]).includes(id);
