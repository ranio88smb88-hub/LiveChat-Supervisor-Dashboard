
export type SenderType = 'customer' | 'agent' | 'system';

export interface Message {
  id: string;
  sender: SenderType;
  text: string;
  timestamp: number;
}

export interface Chat {
  id: string;
  customerName: string;
  messages: Message[];
  startTime: number;
  lastCustomerMessageTime: number | null;
  lastAgentMessageTime: number | null;
  isActive: boolean;
}

export interface Settings {
  timerDuration: number; // in seconds
  keywords: string[];
  enableSound: boolean;
  monitoringEnabled: boolean;
}

export interface SupervisorStatus {
  activeChatsCount: number;
  delayedChatsCount: number;
  criticalChatsCount: number;
}
