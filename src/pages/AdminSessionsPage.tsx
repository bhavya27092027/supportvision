import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { MonitorPlay, Search, User, PhoneOff, Eye } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Button, Badge, Input, Avatar } from '@/components/ui';
import type { Session, Profile } from '@/types';
import { formatRelativeTime, formatDuration } from '@/lib/utils';

interface SessionWithAgent extends Session {
  profiles?: Profile;
}

export function AdminSessionsPage() {
  const [sessions, setSessions] = useState<SessionWithAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('active');

  useEffect(() => {
    fetchSessions();

    const channel = supabase
      .channel('sessions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'sessions',
        },
        () => {
          fetchSessions();
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [statusFilter]);

  const fetchSessions = async () => {
    try {
      let query = supabase
        .from('sessions')
        .select('*, profiles!sessions_agent_id_fkey(id, name, email, avatar_url, role)')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data } = await query;

      if (data) {
        setSessions(data as SessionWithAgent[]);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceEnd = async (sessionId: string) => {
    try {
      await supabase
        .from('sessions')
        .update({
          status: 'ended',
          end_time: new Date().toISOString(),
        })
        .eq('id', sessionId);

      fetchSessions();
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const filteredSessions = sessions.filter((session) => {
    const matchesSearch = session.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      session.profiles?.name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

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
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Active Sessions</h1>
        <p className="text-secondary-600 dark:text-secondary-400">Monitor and manage all live sessions</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search sessions or agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                leftIcon={<Search className="w-4 h-4" />}
              />
            </div>
            <div className="flex gap-2">
              {['active', 'pending', 'all'].map((status) => (
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
            <MonitorPlay className="w-12 h-12 text-secondary-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-secondary-500 dark:text-secondary-400">No sessions found</p>
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
                        <MonitorPlay className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-white">
                          {session.title || 'Untitled Session'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar name={session.profiles?.name || 'Agent'} size="sm" />
                          <span className="text-sm text-secondary-500 dark:text-secondary-400">
                            {session.profiles?.name || 'Unknown Agent'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(session.status)}
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">
                          {formatDuration(session.duration_seconds || 0)}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">
                          {formatRelativeTime(session.created_at)}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/session/${session.id}`}>
                          <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
                            View
                          </Button>
                        </Link>
                        {session.status === 'active' && (
                          <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<PhoneOff className="w-4 h-4" />}
                            onClick={() => handleForceEnd(session.id)}
                          >
                            End
                          </Button>
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
    </div>
  );
}
