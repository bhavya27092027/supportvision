export type UserRole = 'agent' | 'admin' | 'customer';
export type SessionStatus = 'pending' | 'active' | 'ended' | 'cancelled';
export type RecordingStatus = 'recording' | 'processing' | 'ready' | 'failed';
export type MessageType = 'text' | 'system' | 'file';
export type ConnectionStatus = 'connected' | 'disconnected' | 'reconnecting';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Session {
  id: string;
  agent_id: string;
  invite_token: string;
  title?: string;
  description?: string;
  status: SessionStatus;
  start_time?: string;
  end_time?: string;
  duration_seconds: number;
  created_at: string;
  updated_at: string;
  agent?: Profile;
}

export interface Participant {
  id: string;
  session_id: string;
  user_id?: string;
  role: 'agent' | 'customer';
  display_name?: string;
  joined_at: string;
  left_at?: string;
  connection_status: ConnectionStatus;
}

export interface Message {
  id: string;
  session_id: string;
  sender_id?: string;
  sender_name: string;
  content: string;
  message_type: MessageType;
  file_id?: string;
  created_at: string;
}

export interface Recording {
  id: string;
  session_id: string;
  started_at: string;
  ended_at?: string;
  duration_seconds: number;
  status: RecordingStatus;
  file_url?: string;
  file_size: number;
  created_at: string;
}

export interface SharedFile {
  id: string;
  session_id: string;
  uploaded_by?: string;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  created_at: string;
}

export interface SessionEvent {
  id: string;
  session_id: string;
  user_id?: string;
  user_name?: string;
  event_type: string;
  event_data: Record<string, unknown>;
  created_at: string;
}

export interface SessionStats {
  total_sessions: number;
  active_sessions: number;
  total_duration: number;
  total_participants: number;
  avg_session_duration: number;
}

export interface DashboardStats {
  activeSessions: number;
  totalCalls: number;
  totalDuration: number;
  activeUsers: number;
  dailySessions: { date: string; count: number }[];
  sessionLogs: Session[];
}
