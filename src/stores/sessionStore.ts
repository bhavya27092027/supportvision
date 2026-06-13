import { create } from 'zustand';
import type { Session, Participant, Message } from '@/types';
import { supabase } from '@/lib/supabase';

interface SessionState {
  currentSession: Session | null;
  participants: Participant[];
  messages: Message[];
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
  isRecording: boolean;
  isFullscreen: boolean;
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
  isConnecting: boolean;
  error: string | null;

  setCurrentSession: (session: Session | null) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setVideoEnabled: (enabled: boolean) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setRecording: (recording: boolean) => void;
  setFullscreen: (fullscreen: boolean) => void;
  setConnectionQuality: (quality: 'excellent' | 'good' | 'fair' | 'poor') => void;
  setConnecting: (connecting: boolean) => void;
  setError: (error: string | null) => void;
  clearSession: () => void;
  fetchMessages: (sessionId: string) => Promise<void>;
  sendMessage: (sessionId: string, senderId: string | undefined, senderName: string, content: string, type?: 'text' | 'system' | 'file') => Promise<void>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  currentSession: null,
  participants: [],
  messages: [],
  isVideoEnabled: true,
  isAudioEnabled: true,
  isRecording: false,
  isFullscreen: false,
  connectionQuality: 'good',
  isConnecting: false,
  error: null,

  setCurrentSession: (session) => set({ currentSession: session }),
  setParticipants: (participants) => set({ participants }),
  addParticipant: (participant) =>
    set((state) => ({
      participants: [...state.participants, participant],
    })),
  removeParticipant: (participantId) =>
    set((state) => ({
      participants: state.participants.filter((p) => p.id !== participantId),
    })),
  updateParticipant: (id, updates) =>
    set((state) => ({
      participants: state.participants.map((p) =>
        p.id === id ? { ...p, ...updates } : p
      ),
    })),
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  setVideoEnabled: (enabled) => set({ isVideoEnabled: enabled }),
  setAudioEnabled: (enabled) => set({ isAudioEnabled: enabled }),
  setRecording: (recording) => set({ isRecording: recording }),
  setFullscreen: (fullscreen) => set({ isFullscreen: fullscreen }),
  setConnectionQuality: (quality) => set({ connectionQuality: quality }),
  setConnecting: (connecting) => set({ isConnecting: connecting }),
  setError: (error) => set({ error }),
  clearSession: () =>
    set({
      currentSession: null,
      participants: [],
      messages: [],
      isRecording: false,
      isConnecting: false,
      error: null,
    }),

  fetchMessages: async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      set({ messages: data || [] });
    } catch (error) {
      console.error('Error fetching messages:', error);
      set({ error: 'Failed to load messages' });
    }
  },

  sendMessage: async (sessionId, senderId, senderName, content, type = 'text') => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          session_id: sessionId,
          sender_id: senderId,
          sender_name: senderName,
          content,
          message_type: type,
        })
        .select()
        .single();

      if (error) throw error;
      if (data) {
        set((state) => ({
          messages: [...state.messages, data],
        }));
      }
    } catch (error) {
      console.error('Error sending message:', error);
      set({ error: 'Failed to send message' });
    }
  },
}));
