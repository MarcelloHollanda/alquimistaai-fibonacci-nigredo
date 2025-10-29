export interface PacingData {
  cap_per_minute: number;
  sent_this_minute: number;
  available_this_minute: number;
  in_allowed_window: boolean;
  next_window_delay_text: string;
  minute_remaining_ms: number;
  window_start: string;
  window_end: string;
  timezone: string;
  business_days: string[];
}

export interface WhatsAppStatus {
  provider: 'evolution_http' | 'evolution_local' | 'meta_cloud' | 'offline';
  instance_id?: string;
  status: 'connected' | 'disconnected' | 'connecting';
  qr_code?: string;
  pacing: PacingData;
  last_message?: {
    timestamp: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
  };
}

export interface PacingHistoryPoint {
  time: string;
  sent: number;
  limit: number;
}
