import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileVideo, Download, Play, Search } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Badge, Input, Button } from '@/components/ui';
import { useAuthStore } from '@/stores';
import type { Recording, Session } from '@/types';
import { formatDate, formatDuration, formatFileSize } from '@/lib/utils';

export function RecordingsPage() {
  const { user } = useAuthStore();
  const [recordings, setRecordings] = useState<(Recording & { session?: Session })[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchRecordings = async () => {
      if (!user) return;

      try {
        const { data } = await supabase
          .from('recordings')
          .select('*, sessions(*)')
          .eq('sessions.agent_id', user.id)
          .order('created_at', { ascending: false });

        if (data) {
          setRecordings(data as (Recording & { sessions: Session })[]);
        }
      } catch (error) {
        console.error('Error fetching recordings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecordings();
  }, [user]);

  const filteredRecordings = recordings.filter((recording) => {
    const sessionTitle = recording.session?.title || '';
    return sessionTitle.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'warning' | 'default' | 'error'> = {
      ready: 'success',
      processing: 'warning',
      recording: 'info',
      failed: 'error',
    };
    return (
      <Badge variant={variants[status] || 'default'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Recordings</h1>
          <p className="text-secondary-600 dark:text-secondary-400">Manage your session recordings</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <Input
            placeholder="Search recordings..."
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
        ) : filteredRecordings.length === 0 ? (
          <div className="text-center py-12">
            <FileVideo className="w-12 h-12 text-secondary-300 dark:text-dark-600 mx-auto mb-3" />
            <p className="text-secondary-500 dark:text-secondary-400">No recordings yet</p>
          </div>
        ) : (
          filteredRecordings.map((recording) => (
            <motion.div
              key={recording.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:shadow-soft transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-secondary-100 dark:bg-dark-700 flex items-center justify-center relative overflow-hidden">
                        <Play className="w-6 h-6 text-secondary-600 dark:text-secondary-400 absolute z-10" />
                        <div className="absolute inset-0 bg-black/20" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-secondary-900 dark:text-white">
                          {recording.session?.title || 'Untitled Recording'}
                        </h3>
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          {formatDate(recording.created_at)} • {formatDuration(recording.duration_seconds || 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {getStatusBadge(recording.status)}
                      <div className="text-right">
                        <p className="text-sm text-secondary-900 dark:text-white">
                          {formatFileSize(recording.file_size || 0)}
                        </p>
                      </div>
                      {recording.status === 'ready' && recording.file_url && (
                        <Button variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                          Download
                        </Button>
                      )}
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
