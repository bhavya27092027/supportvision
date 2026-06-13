import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Video,
  Clock,
  Users,
  MessageSquare,
  FileVideo,
  Download,
  Calendar,
  Copy,
  Share2,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Button, Badge, Avatar } from '@/components/ui';
import { useAuthStore, useUIStore } from '@/stores';
import type { Session, Participant, Message, Recording, SharedFile } from '@/types';
import { formatDate, formatDuration, formatDateTime } from '@/lib/utils';

export function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [files, setFiles] = useState<SharedFile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchSessionDetails = async () => {
      if (!sessionId || !user) return;

      try {
        // Fetch session
        const { data: sessionData } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single();

        if (sessionData) {
          setSession(sessionData as Session);
        }

        // Fetch participants
        const { data: participantsData } = await supabase
          .from('participants')
          .select('*')
          .eq('session_id', sessionId);

        if (participantsData) {
          setParticipants(participantsData);
        }

        // Fetch messages
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (messagesData) {
          setMessages(messagesData);
        }

        // Fetch recordings
        const { data: recordingsData } = await supabase
          .from('recordings')
          .select('*')
          .eq('session_id', sessionId);

        if (recordingsData) {
          setRecordings(recordingsData);
        }

        // Fetch shared files
        const { data: filesData } = await supabase
          .from('shared_files')
          .select('*')
          .eq('session_id', sessionId);

        if (filesData) {
          setFiles(filesData);
        }
      } catch (error) {
        console.error('Error fetching session details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessionDetails();
  }, [sessionId, user]);

  const handleCopyInviteLink = () => {
    if (!session) return;
    const inviteUrl = `${window.location.origin}/join/${session.invite_token}`;
    navigator.clipboard.writeText(inviteUrl);
    addToast({
      type: 'success',
      title: 'Link Copied',
      message: 'Invite link copied to clipboard.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <Video className="w-12 h-12 text-secondary-300 dark:text-dark-600 mx-auto mb-3" />
        <p className="text-secondary-500 dark:text-secondary-400">Session not found</p>
        <Button variant="outline" onClick={() => navigate('/history')} className="mt-4">
          Back to History
        </Button>
      </div>
    );
  }

  const agentParticipant = participants.find(p => p.role === 'agent');
  const customerParticipant = participants.find(p => p.role === 'customer');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/history')}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            {session.title || 'Untitled Session'}
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Session Details
          </p>
        </div>
        {session.status === 'pending' && (
          <div className="flex gap-2">
            <Button variant="outline" leftIcon={<Share2 className="w-4 h-4" />} onClick={handleCopyInviteLink}>
              Share Invite
            </Button>
            <Link to={`/session/${session.id}`}>
              <Button>Start Session</Button>
            </Link>
          </div>
        )}
        {session.status === 'active' && (
          <Link to={`/session/${session.id}`}>
            <Button>Join Session</Button>
          </Link>
        )}
      </div>

      {/* Session Info */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                <Clock className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Duration</p>
                <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {formatDuration(session.duration_seconds || 0)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success-50 dark:bg-success-900/20">
                <Users className="w-5 h-5 text-success-600 dark:text-success-400" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Participants</p>
                <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {participants.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning-50 dark:bg-warning-900/20">
                <MessageSquare className="w-5 h-5 text-warning-600 dark:text-warning-400" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Messages</p>
                <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {messages.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent-50 dark:bg-accent-900/20">
                <FileVideo className="w-5 h-5 text-accent-600 dark:text-accent-400" />
              </div>
              <div>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">Recordings</p>
                <p className="text-lg font-semibold text-secondary-900 dark:text-white">
                  {recordings.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Session Info */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Session Information
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-secondary-100 dark:border-dark-700">
                <span className="text-secondary-500 dark:text-secondary-400">Status</span>
                <Badge
                  variant={session.status === 'active' ? 'success' : session.status === 'pending' ? 'warning' : 'default'}
                  dot
                >
                  {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-secondary-100 dark:border-dark-700">
                <span className="text-secondary-500 dark:text-secondary-400">Created</span>
                <span className="text-secondary-900 dark:text-white">{formatDateTime(session.created_at)}</span>
              </div>
              {session.start_time && (
                <div className="flex justify-between items-center py-2 border-b border-secondary-100 dark:border-dark-700">
                  <span className="text-secondary-500 dark:text-secondary-400">Started</span>
                  <span className="text-secondary-900 dark:text-white">{formatDateTime(session.start_time)}</span>
                </div>
              )}
              {session.end_time && (
                <div className="flex justify-between items-center py-2 border-b border-secondary-100 dark:border-dark-700">
                  <span className="text-secondary-500 dark:text-secondary-400">Ended</span>
                  <span className="text-secondary-900 dark:text-white">{formatDateTime(session.end_time)}</span>
                </div>
              )}
              <div className="flex justify-between items-center py-2 border-b border-secondary-100 dark:border-dark-700">
                <span className="text-secondary-500 dark:text-secondary-400">Invite Token</span>
                <div className="flex items-center gap-2">
                  <code className="text-xs bg-secondary-100 dark:bg-dark-700 px-2 py-1 rounded font-mono">
                    {session.invite_token}
                  </code>
                  <Button variant="ghost" size="sm" onClick={handleCopyInviteLink}>
                    <Copy className="w-3 h-3" />
                  </Button>
                </div>
              </div>
              {session.description && (
                <div className="py-2">
                  <span className="text-secondary-500 dark:text-secondary-400 block mb-2">Description</span>
                  <p className="text-secondary-900 dark:text-white">{session.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Participants */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Participants
            </h2>
            {participants.length === 0 ? (
              <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">
                No participants joined yet
              </p>
            ) : (
              <div className="space-y-3">
                {participants.map((participant) => (
                  <div
                    key={participant.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-dark-800"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={participant.display_name || participant.role} size="sm" />
                      <div>
                        <p className="font-medium text-secondary-900 dark:text-white">
                          {participant.display_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400 capitalize">
                          {participant.role}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        Joined {formatDateTime(participant.joined_at)}
                      </p>
                      {participant.left_at && (
                        <p className="text-xs text-secondary-400 dark:text-secondary-500">
                          Left {formatDateTime(participant.left_at)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Chat History */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
            Chat History ({messages.length} messages)
          </h2>
          {messages.length === 0 ? (
            <p className="text-secondary-500 dark:text-secondary-400 text-center py-8">
              No messages in this session
            </p>
          ) : (
            <div className="max-h-96 overflow-y-auto space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.sender_id === user?.id ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar name={message.sender_name} size="sm" />
                  <div
                    className={`max-w-[70%] rounded-xl p-3 ${
                      message.sender_id === user?.id
                        ? 'bg-primary-50 dark:bg-primary-900/20'
                        : 'bg-secondary-50 dark:bg-dark-800'
                    }`}
                  >
                    <p className="text-xs text-secondary-500 dark:text-secondary-400 mb-1">
                      {message.sender_name}
                    </p>
                    <p className="text-secondary-900 dark:text-white">{message.content}</p>
                    <p className="text-xs text-secondary-400 dark:text-secondary-500 mt-1">
                      {formatDateTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared Files */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
              Shared Files
            </h2>
            <div className="grid gap-3">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary-50 dark:bg-dark-800"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary-50 dark:bg-primary-900/20">
                      <Download className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                    </div>
                    <div>
                      <p className="font-medium text-secondary-900 dark:text-white">
                        {file.filename}
                      </p>
                      <p className="text-xs text-secondary-500 dark:text-secondary-400">
                        {(file.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => window.open(file.file_url, '_blank')}>
                    Download
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
