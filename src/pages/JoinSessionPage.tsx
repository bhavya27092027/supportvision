import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, User, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card, CardContent } from '@/components/ui';
import type { Session } from '@/types';

export function JoinSessionPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSession = async () => {
      if (!token) {
        setError('Invalid invite link');
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from('sessions')
          .select('*, profiles!sessions_agent_id_fkey(id, name, email)')
          .eq('invite_token', token)
          .single();

        if (fetchError || !data) {
          setError('Session not found or link has expired');
        } else {
          setSession(data as Session);
        }
      } catch {
        setError('Failed to load session');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSession();
  }, [token]);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !name.trim()) return;

    setIsJoining(true);
    setError('');

    try {
      // Create participant
      const { error: participantError } = await supabase.from('participants').insert({
        session_id: session.id,
        name: name.trim(),
        role: 'customer',
        connection_status: 'connected',
      });

      if (participantError) {
        setError('Failed to join session');
        return;
      }

      // Store customer name in sessionStorage for the session
      sessionStorage.setItem('customerName', name.trim());
      sessionStorage.setItem('sessionId', session.id);

      // Navigate to session
      navigate(`/session/${session.id}`);
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-950">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto mb-4" />
          <p className="text-secondary-600 dark:text-secondary-400">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-950 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-md"
        >
          <div className="w-16 h-16 rounded-full bg-error-100 dark:bg-error-900/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-error-600 dark:text-error-400" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
            Unable to Join
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-6">
            {error || 'This session link is invalid or has expired.'}
          </p>
          <Button variant="outline" onClick={() => navigate('/')}>
            Go Home
          </Button>
        </motion.div>
      </div>
    );
  }

  const agent = session.agent as { id: string; name: string; email: string } | undefined;
  const agentName = agent?.name || 'Support Agent';

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 dark:bg-dark-950 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center mx-auto mb-4">
            <Video className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
            Join Support Session
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            You{'  '}ve been invited by {agentName} to a support session
          </p>
        </div>

        <Card variant="elevated">
          <CardContent className="p-6">
            {session.status === 'active' && (
              <div className="mb-4 p-3 rounded-lg bg-success-50 dark:bg-success-900/20 border border-success-200 dark:border-success-800">
                <p className="text-sm text-success-700 dark:text-success-400 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-success-500 animate-pulse" />
                  Session is live - Join now!
                </p>
              </div>
            )}

            {session.status === 'pending' && (
              <div className="mb-4 p-3 rounded-lg bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800">
                <p className="text-sm text-warning-700 dark:text-warning-400">
                  Session is waiting for the agent to start.
                </p>
              </div>
            )}

            {session.status === 'ended' && (
              <div className="mb-4 p-3 rounded-lg bg-secondary-100 dark:bg-dark-700 border border-secondary-200 dark:border-dark-600">
                <p className="text-sm text-secondary-600 dark:text-secondary-400">
                  This session has ended.
                </p>
              </div>
            )}

            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                label="Your Name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                leftIcon={<User className="w-4 h-4" />}
                required
                disabled={session.status === 'ended'}
              />

              {error && (
                <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                isLoading={isJoining}
                disabled={session.status === 'ended' || !name.trim()}
              >
                {session.status === 'ended' ? 'Session Ended' : 'Join Session'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-xs text-secondary-500 dark:text-secondary-400">
          No account required. Your session will be secure and encrypted.
        </p>
      </motion.div>
    </div>
  );
}
