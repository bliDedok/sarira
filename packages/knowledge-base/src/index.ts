/** Phase 2 boundary only. No RAG, embeddings, retrieval, or AI is implemented. */
export interface KnowledgeBasePort {
  retrieve(query: unknown): Promise<never>;
}

export const KNOWLEDGE_BASE_STATUS = 'NOT_IMPLEMENTED_PHASE_2' as const;
