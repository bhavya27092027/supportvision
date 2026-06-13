import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Search, Video, Copy, ExternalLink, Check, Share2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Button, Badge, Input, Modal } from '@/components/ui';
import { useAuthStore, useUIStore } from '@/stores';
import type { Session } from '@/types';
import { formatDate, formatDuration } from '@/lib/utils';

export function SessionsPage() {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showNewModal, setShowNewModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    fetchSessions();
  }, [user, statusFilter]);

  const fetchSessions = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from('sessions')
        .select('*')
        .eq('agent_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (!error && data) {
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.invite_token.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleEndSession = async (sessionId: string) => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          status: 'ended',
          end_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      if (!error) {
        addToast({
          type: 'success',
          title: 'Session Ended',
          message: 'The session has been ended.',
        });
        fetchSessions();
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to end session.',
      });
    }
  };

  const handleCopyInviteLink = (session: Session) => {
    const inviteUrl = `${window.location.origin}/join/${session.invite_token}`;
    navigator.clipboard.writeText(inviteUrl);
    addToast({
      type: 'success',
      title: 'Link Copied',
      message: 'Invite link copied to clipboard.',
    });
  };

  const handleShowInvite = (session: Session) => {
    setSelectedSession(session);
    setShowInviteModal(true);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default'> = {
      active: 'success',
      pending: 'warning',
      ended: 'default',
    };
    return (
      <Badge variant={variants[status] || 'default'} dot>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Sessions</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Manage your support sessions</p>
        </div>
        <Button leftIcon={<Plus className="w-4 h-4" />} onClick={() => setShowNewModal(true)}>
          New Session
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              {['all', 'active', 'pending', 'ended'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Video className="w-12 h-12 text-secondary-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-secondary-500 dark:text-secondary-400">No sessions found</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowNewModal(true)}
            >
              Create your first session
            </Button>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <motion.div
              key={session.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-soft transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center">
                        <Video className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-white">
                          {session.title || 'Untitled Session'}
                        </h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          Created {formatDate(session.created_at)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(session.status)}
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">
                          {formatDuration(session.duration_seconds || 0)}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">Duration</p>
                      </div>
                      <div className="flex gap-2">
                        {session.status === 'active' && (
                          <>
                            <Link to={`/session/${session.id}`}>
                              <Button size="sm">Join</Button>
                            </Link>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleEndSession(session.id)}
                            >
                              End
                            </Button>
                          </>
                        )}
                        {session.status === 'pending' && (
                          <>
                            <Link to={`/session/${session.id}`}>
                              <Button size="sm">Start</Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              leftIcon={<Share2 className="w-4 h-4" />}
                              onClick={() => handleShowInvite(session)}
                            >
                              Share
                            </Button>
                          </>
                        )}
                        {session.status === 'ended' && (
                          <Link to={`/history/${session.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      <NewSessionModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
        onCreated={(session) => {
          setShowNewModal(false);
          setSelectedSession(session);
          setShowInviteModal(true);
          fetchSessions();
        }}
      />

      <InviteModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        session={selectedSession}
      />
    </div>
  );
}

function NewSessionModal({
  isOpen,
  onClose,
  onCreated,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (session: Session) => void;
}) {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sessions')
        .insert({
          agent_id: user.id,
          title: title || 'Support Session',
          description,
          status: 'pending',
        })
        .select()
        .single();

      if (!error && data) {
        addToast({
          type: 'success',
          title: 'Session Created',
          message: 'Share the invite link with your customer.',
        });
        onCreated(data as Session);
        setTitle('');
        setDescription('');
      }
    } catch {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to create session.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Session" size="md">
      <div className="space-y-4">
        <Input
          label="Session Title"
          placeholder="e.g., Product Demo Support"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300 mb-1.5">
            Description (Optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 text-sm rounded-lg bg-white dark:bg-dark-800 border border-secondary-200 dark:border-dark-600 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
            placeholder="What's this session about?"
          />
        </div>
        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button onClick={handleCreate} isLoading={isLoading} className="flex-1">
            Create Session
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function InviteModal({
  isOpen,
  onClose,
  session,
}: {
  isOpen: boolean;
  onClose: () => void;
  session: Session | null;
}) {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [copied, setCopied] = useState(false);

  if (!session) return null;

  const inviteUrl = `${window.location.origin}/join/${session.invite_token}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    addToast({
      type: 'success',
      title: 'Link Copied',
      message: 'Invite link copied to clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartSession = async () => {
    await supabase
      .from('sessions')
      .update({
        status: 'active',
        start_time: new Date().toISOString(),
      })
      .eq('id', session.id);

    onClose();
    navigate(`/session/${session.id}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Share Invite Link" size="md">
      <div className="space-y-6">
        <div className="p-4 rounded-xl bg-secondary-50 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700">
          <p className="text-sm text-secondary-500 dark:text-secondary-400 mb-2">
            Share this link with your customer to join the session:
          </p>
          <div className="flex items-center gap-2">
            <Input
              value={inviteUrl}
              readOnly
              className="flex-1 font-mono text-sm"
            />
            <Button
              variant={copied ? 'success' : 'outline'}
              size="sm"
              onClick={handleCopy}
              leftIcon={copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            >
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleCopy}
            leftIcon={<Copy className="w-4 h-4" />}
            className="flex-1"
          >
            Copy Link
          </Button>
          <Button
            onClick={handleStartSession}
            leftIcon={<ExternalLink className="w-4 h-4" />}
            className="flex-1"
          >
            Start Session
          </Button>
        </div>

        <p className="text-xs text-center text-secondary-400 dark:text-secondary-500">
          No account required for customers. They can join directly from their browser.
        </p>
      </div>
    </Modal>
  );
}
