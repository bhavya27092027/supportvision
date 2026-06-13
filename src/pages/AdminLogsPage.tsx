import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { History, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Input, Badge } from '@/components/ui';
import type { SessionEvent } from '@/types';
import { formatDateTime } from '@/lib/utils';

export function AdminLogsPage() {
  const [events, setEvents] = useState<SessionEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await supabase
        .from('session_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (data) {
        setEvents(data);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((event) => {
    return (
      event.event_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const getEventBadge = (type: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
      session_created: 'success',
      session_started: 'success',
      session_ended: 'warning',
      participant_joined: 'success',
      participant_left: 'warning',
      recording_started: 'primary',
      recording_stopped: 'warning',
      error: 'error',
    };
    return (
      <Badge variant={variants[type] || 'default'} size="sm">
        {type.replace(/_/g, ' ')}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Session Logs</h1>
        <p className="text-secondary-600 dark:text-secondary-400">Monitor all session activity</p>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search events..."
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
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-secondary-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-secondary-500 dark:text-secondary-400">No events logged yet</p>
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="border-b border-secondary-100 dark:border-dark-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-secondary-500 dark:text-secondary-400 uppercase tracking-wider">
                      Details
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-secondary-100 dark:divide-dark-700">
                  {filteredEvents.slice(0, 50).map((event) => (
                    <motion.tr
                      key={event.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-secondary-50 dark:hover:bg-dark-800"
                    >
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary-500 dark:text-secondary-400">
                          {formatDateTime(event.created_at)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {getEventBadge(event.event_type)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-secondary-900 dark:text-white">
                          {event.user_name || 'System'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs text-secondary-500 dark:text-secondary-400 bg-secondary-100 dark:bg-dark-700 px-2 py-1 rounded">
                          {JSON.stringify(event.event_data)}
                        </code>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
