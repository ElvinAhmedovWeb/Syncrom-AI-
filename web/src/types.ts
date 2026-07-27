export type Role = "user" | "assistant";

export interface ChatMessage {
  role: Role;
  content: string;
  image?: string;
  /** Şəkil yaradılanda istifadə olunan ingiliscə prompt (yalnız göstərmək üçün) */
  imagePrompt?: string;
}

export interface Chat {
  id: string | null;
  title: string;
  messages: ChatMessage[];
  modelId?: string;
  updatedAt: number;
}

export interface ModelInfo {
  id: string;
  name: string;
  tag: string;
  color: string;
  desc: string;
  vision: boolean;
  agentTools: boolean;
}

export interface ModelsResponse {
  default: string;
  models: ModelInfo[];
}
