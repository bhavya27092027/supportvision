import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Phone,
  PhoneOff,
  MessageSquare,
  Users,
  Settings,
  Maximize,
  Minimize,
  Circle,
  Monitor,
  ScreenShare,
  Download,
  Send,
  Paperclip,
  MoreVertical,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button, Avatar, Badge, Input, Card, CardContent } from '@/components/ui';
import { useAuthStore, useSessionStore, useUIStore } from '@/stores';
import type { Session, Participant, Message } from '@/types';
import { getInitials, formatTime } from '@/lib/utils';

export function SessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentSession,
    participants,
    messages,
    isVideoEnabled,
    isAudioEnabled,
    isRecording,
    isFullscreen,
    connectionQuality,
    setCurrentSession,
    setParticipants,
    addParticipant,
    removeParticipant,
    setMessages,
    addMessage,
    setVideoEnabled,
    setAudioEnabled,
    setRecording,
    setFullscreen,
    setConnectionQuality,
    fetchMessages,
    sendMessage,
    clearSession,
  } = useSessionStore();
  const { addToast } = useUIStore();

  const [isLoading, setIsLoading] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [chatMessage, setChatMessage] = useState('');

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        const { data: session, error: sessionError } = await supabase
          .from('sessions')
          .select('*, profiles!sessions_agent_id_fkey(id, name, email, avatar_url)')
          .eq('id', sessionId)
          .single();

        if (sessionError || !session) {
          addToast({
            type: 'error',
            title: 'Error',
            message: 'Session not found.',
          });
          navigate('/dashboard');
          return;
        }

        setCurrentSession(session as Session);

        // Fetch participants
        const { data: participants } = await supabase
          .from('participants')
          .select('*')
          .eq('session_id', sessionId);

        if (participants) {
          setParticipants(participants);
        }

        // Fetch messages
        await fetchMessages(sessionId);

        // Subscribe to participants changes
        const participantsChannel = supabase
          .channel(`participants:${sessionId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'participants',
              filter: `session_id=eq.${sessionId}`,
            },
            (payload) => {
              if (payload.eventType === 'INSERT') {
                addParticipant(payload.new as Participant);
              } else if (payload.eventType === 'UPDATE') {
                // Update handled silently for minimal context usage
              } else if (payload.eventType === 'DELETE') {
                removeParticipant(payload.old.id);
              }
            }
          )
          .subscribe();

        // Subscribe to messages
        const messagesChannel = supabase
          .channel(`messages:${sessionId}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `session_id=eq.${sessionId}`,
            },
            (payload) => {
              addMessage(payload.new as Message);
            }
          )
          .subscribe();

        setIsLoading(false);

        return () => {
          participantsChannel.unsubscribe();
          messagesChannel.unsubscribe();
        };
      } catch (error) {
        console.error('Error fetching session:', error);
        setIsLoading(false);
      }
    };

    fetchSession();

    return () => {
      clearSession();
    };
  }, [sessionId]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Initialize local video
  useEffect(() => {
    const initVideo = async () => {
      try {
        if (isVideoEnabled && localVideoRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: isAudioEnabled,
          });
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
        addToast({
          type: 'error',
          title: 'Camera Access',
          message: 'Could not access camera or microphone.',
        });
      }
    };

    if (!isLoading && currentSession) {
      initVideo();
    }
  }, [isLoading, currentSession, isVideoEnabled, isAudioEnabled]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || !sessionId || !user) return;

    await sendMessage(sessionId, user.id, user.name, chatMessage.trim());
    setChatMessage('');
  };

  const handleToggleVideo = () => {
    setVideoEnabled(!isVideoEnabled);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !isVideoEnabled;
      });
    }
  };

  const handleToggleAudio = () => {
    setAudioEnabled(!isAudioEnabled);
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getAudioTracks().forEach((track) => {
        track.enabled = !isAudioEnabled;
      });
    }
  };

  const handleEndCall = async () => {
    if (!currentSession || !user) return;

    // Stop local tracks
    if (localVideoRef.current && localVideoRef.current.srcObject) {
      const stream = localVideoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }

    // Update session status
    await supabase
      .from('sessions')
      .update({
        status: 'ended',
        end_time: new Date().toISOString(),
      })
      .eq('id', sessionId);

    addToast({
      type: 'info',
      title: 'Session Ended',
      message: 'The support session has ended.',
    });

    navigate('/dashboard');
  };

  const handleStartSession = async () => {
    if (!sessionId) return;

    await supabase
      .from('sessions')
      .update({
        status: 'active',
        start_time: new Date().toISOString(),
      })
      .eq('id', sessionId);

    addToast({
      type: 'success',
      title: 'Session Started',
      message: 'The session is now active.',
    });
  };

  const getConnectionIcon = () => {
    if (connectionQuality === 'excellent' || connectionQuality === 'good') {
      return <Wifi className="w-4 h-4 text-success-500" />;
    }
    return <WifiOff className="w-4 h-4 text-warning-500" />;
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-primary-500 animate-pulse mx-auto mb-4" />
          <p className="text-white">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!currentSession) {
    return (
      <div className="h-screen flex items-center justify-center bg-dark-900">
        <div className="text-center text-white">
          <p>Session not found</p>
          <Button onClick={() => navigate('/dashboard')} className="mt-4">
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const isAgent = user?.id === currentSession.agent_id;

  return (
    <div className="h-screen flex flex-col bg-dark-900">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 bg-dark-800 border-b border-dark-700">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-accent-500 flex items-center justify-center">
            <Video className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-semibold text-white">{currentSession.title || 'Support Session'}</h1>
            <div className="flex items-center gap-2 text-sm text-secondary-400">
              <Badge
                variant={currentSession.status === 'active' ? 'success' : 'warning'}
                size="sm"
                dot
              >
                {currentSession.status === 'active' ? 'Live' : 'Waiting'}
              </Badge>
              <span>{formatTime(new Date())}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isRecording && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-error-500/20 text-error-400">
              <Circle className="w-3 h-3 fill-current animate-pulse" />
              <span className="text-sm">Recording</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-secondary-400">
            {getConnectionIcon()}
            <span className="text-sm capitalize">{connectionQuality}</span>
          </div>

          <div className="flex items-center gap-2 text-secondary-400">
            <Users className="w-4 h-4" />
            <span className="text-sm">{participants.length + 1}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Video Area */}
        <div className="flex-1 relative">
          {/* Remote Video (Main) */}
          <div className="absolute inset-0 bg-dark-950">
            <video
              ref={remoteVideoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
            {!remoteVideoRef.current?.srcObject && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <Avatar
                    name={participants.find(p => p.role === 'customer')?.display_name || 'Customer'}
                    size="xl"
                    className="w-24 h-24 mx-auto mb-4"
                  />
                  <p className="text-white text-lg">Waiting for participant...</p>
                  <p className="text-secondary-400 text-sm mt-2">
                    Share the invite link to join
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Local Video (Preview) */}
          <div className="absolute bottom-4 right-4 w-48 h-36 rounded-xl overflow-hidden border-2 border-dark-700 bg-dark-800 shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={cn(
                'w-full h-full object-cover',
                !isVideoEnabled && 'hidden'
              )}
            />
            {!isVideoEnabled && (
              <div className="w-full h-full flex items-center justify-center">
                <Avatar name={user?.name || 'You'} size="lg" />
              </div>
            )}
            <div className="absolute bottom-2 left-2 right-2 flex justify-between items-center">
              <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">You</span>
              {!isAudioEnabled && (
                <MicOff className="w-4 h-4 text-error-400" />
              )}
            </div>
          </div>

          {/* Session Not Started Overlay */}
          {currentSession.status === 'pending' && isAgent && (
            <div className="absolute inset-0 bg-dark-900/80 flex items-center justify-center">
              <div className="text-center">
                <Video className="w-16 h-16 text-primary-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">Ready to Start?</h2>
                <p className="text-secondary-400 mb-6">Share the invite link and start when ready.</p>
                <div className="flex gap-3 justify-center">
                  <Button variant="outline" onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/join/${currentSession.invite_token}`);
                    addToast({
                      type: 'success',
                      title: 'Link Copied',
                      message: 'Invite link copied to clipboard.',
                    });
                  }}>
                    Copy Invite Link
                  </Button>
                  <Button onClick={handleStartSession}>
                    Start Session
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel */}
        <AnimatePresence>
          {showChat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="bg-dark-800 border-l border-dark-700 flex flex-col"
            >
              <div className="p-4 border-b border-dark-700">
                <h3 className="font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat
                </h3>
              </div>

              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4"
              >
                {messages.length === 0 ? (
                  <div className="text-center text-secondary-400 py-8">
                    <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No messages yet</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const isOwn = message.sender_id === user?.id;
                    return (
                      <div
                        key={message.id}
                        className={cn(
                          'flex gap-2',
                          isOwn && 'flex-row-reverse'
                        )}
                      >
                        <Avatar name={message.sender_name} size="sm" />
                        <div
                          className={cn(
                            'max-w-[70%] rounded-xl p-3',
                            isOwn
                              ? 'bg-primary-600 text-white'
                              : 'bg-dark-700 text-white'
                          )}
                        >
                          <p className="text-xs text-secondary-400 mb-1">
                            {message.sender_name}
                          </p>
                          <p className="text-sm">{message.content}</p>
                          <p className="text-xs text-secondary-400 mt-1">
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              <form onSubmit={handleSendMessage} className="p-4 border-t border-dark-700">
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-secondary-400"
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  <Input
                    value={chatMessage}
                    onChange={(e) => setChatMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="sm" disabled={!chatMessage.trim()}>
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="h-20 flex items-center justify-center gap-4 bg-dark-800 border-t border-dark-700 px-4">
        <Button
          variant={isVideoEnabled ? 'secondary' : 'danger'}
          size="lg"
          onClick={handleToggleVideo}
          className="rounded-full w-12 h-12 p-0"
        >
          {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        <Button
          variant={isAudioEnabled ? 'secondary' : 'danger'}
          size="lg"
          onClick={handleToggleAudio}
          className="rounded-full w-12 h-12 p-0"
        >
          {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        {isAgent && (
          <Button
            variant={isRecording ? 'danger' : 'secondary'}
            size="lg"
            onClick={() => setRecording(!isRecording)}
            className="rounded-full w-12 h-12 p-0"
          >
            {isRecording ? <Circle className="w-5 h-5 fill-current" /> : <Circle className="w-5 h-5" />}
          </Button>
        )}

        <Button
          variant="secondary"
          size="lg"
          onClick={() => setShowChat(!showChat)}
          className="rounded-full w-12 h-12 p-0"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => setIsScreenSharing(!isScreenSharing)}
          className="rounded-full w-12 h-12 p-0"
        >
          <ScreenShare className="w-5 h-5" />
        </Button>

        <Button
          variant="secondary"
          size="lg"
          onClick={() => setFullscreen(!isFullscreen)}
          className="rounded-full w-12 h-12 p-0"
        >
          {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </Button>

        <div className="w-px h-8 bg-dark-700 mx-2" />

        <Button
          variant="danger"
          size="lg"
          onClick={handleEndCall}
          className="rounded-full w-14 h-14 p-0"
        >
          <PhoneOff className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
}
