import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Search, Video, Play } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Badge, Input } from '@/components/ui';
import { useAuthStore } from '@/stores';
import type { Session } from '@/types';
import { formatDate, formatDuration, formatRelativeTime } from '@/lib/utils';

export function HistoryPage() {
  const { user } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchSessions = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('agent_id', user.id)
          .eq('status', 'ended')
          .order('end_time', { ascending: false });

        if (data) {
          setSessions(data);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  const filteredSessions = sessions.filter((session) => {
    return session.title?.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalDuration = sessions.reduce((acc, s) => acc + (s.duration_seconds || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Session History</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Review your past support sessions</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Sessions</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">{sessions.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Total Duration</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">{formatDuration(totalDuration)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-secondary-500 dark:text-secondary-400">Avg Duration</p>
            <p className="text-2xl font-bold text-secondary-900 dark:text-white">
              {sessions.length > 0 ? formatDuration(Math.round(totalDuration / sessions.length)) : '0:00'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="text-center py-12">
            <Clock className="w-12 h-12 text-secondary-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-secondary-500 dark:text-secondary-400">No session history yet</p>
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
                      <div className="w-12 h-12 rounded-xl bg-secondary-100 dark:bg-dark-700 flex items-center justify-center">
                        <Video className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-white">
                          {session.title || 'Untitled Session'}
                        </h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          Ended {session.end_time ? formatRelativeTime(session.end_time) : 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-secondary-900 dark:text-white">
                          {formatDuration(session.duration_seconds || 0)}
                        </p>
                        <p className="text-xs text-secondary-500 dark:text-secondary-400">Duration</p>
                      </div>
                      <Link to={`/history/${session.id}`}>
                        <Badge variant="outline">View Details</Badge>
                      </Link>
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
