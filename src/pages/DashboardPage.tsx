import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Video,
  Users,
  Clock,
  TrendingUp,
  Plus,
  ArrowRight,
  Calendar,
  MonitorPlay,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, Button, Badge, StatsCard } from '@/components/ui';
import { useAuthStore } from '@/stores';
import type { Session } from '@/types';
import { formatRelativeTime, formatDuration } from '@/lib/utils';

export function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalDuration: 0,
    recentSessions: [] as Session[],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch total sessions
        const { count: totalSessions } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', user.id);

        // Fetch active sessions
        const { count: activeSessions } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('agent_id', user.id)
          .eq('status', 'active');

        // Fetch recent sessions
        const { data: recentSessions } = await supabase
          .from('sessions')
          .select('*')
          .eq('agent_id', user.id)
          .order('created_at', { ascending: false })
          .limit(5);

        // Calculate total duration
        const { data: sessions } = await supabase
          .from('sessions')
          .select('duration_seconds')
          .eq('agent_id', user.id)
          .eq('status', 'ended');

        const totalDuration = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;

        setStats({
          totalSessions: totalSessions || 0,
          activeSessions: activeSessions || 0,
          totalDuration,
          recentSessions: recentSessions || [],
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [user]);

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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">
            Welcome back, {user?.name?.split(' ')[0]}!
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400">
            Here{'  '}s an overview of your support sessions.
          </p>
        </div>
        <Link to="/sessions">
          <Button leftIcon={<Plus className="w-4 h-4" />}>
            New Session
          </Button>
        </Link>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={<MonitorPlay className="w-5 h-5" />}
        />
        <StatsCard
          title="Active Sessions"
          value={stats.activeSessions}
          icon={<Video className="w-5 h-5" />}
          className={stats.activeSessions > 0 ? 'ring-2 ring-success-500' : ''}
        />
        <StatsCard
          title="Total Duration"
          value={formatDuration(stats.totalDuration)}
          icon={<Clock className="w-5 h-5" />}
        />
        <StatsCard
          title="Avg. Session"
          value={stats.totalSessions > 0
            ? formatDuration(Math.round(stats.totalDuration / stats.totalSessions))
            : '0:00'}
          icon={<TrendingUp className="w-5 h-5" />}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Quick Actions
                </h2>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Link
                  to="/sessions/new"
                  className="p-6 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 text-white hover:shadow-soft-lg transition-shadow"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-white/20">
                      <Video className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Start New Session</h3>
                      <p className="text-sm opacity-90">Create and invite customers</p>
                    </div>
                  </div>
                </Link>

                <div className="p-6 rounded-xl bg-secondary-50 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-secondary-100 dark:bg-dark-700">
                      <Calendar className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-secondary-900 dark:text-white">Schedule Session</h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">Plan for later</p>
                    </div>
                  </div>
                </div>

                <Link
                  to="/history"
                  className="p-6 rounded-xl bg-secondary-50 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-secondary-100 dark:bg-dark-700">
                      <Clock className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-secondary-900 dark:text-white">Session History</h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">View past sessions</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-secondary-400" />
                  </div>
                </Link>

                <Link
                  to="/recordings"
                  className="p-6 rounded-xl bg-secondary-50 dark:bg-dark-800 border border-secondary-200 dark:border-dark-700 hover:border-primary-200 dark:hover:border-primary-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-secondary-100 dark:bg-dark-700">
                      <Users className="w-6 h-6 text-secondary-600 dark:text-secondary-400" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-secondary-900 dark:text-white">Recordings</h3>
                      <p className="text-sm text-secondary-600 dark:text-secondary-400">Manage recordings</p>
                    </div>
                    <ArrowRight className="w-5 h-5 text-secondary-400" />
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="h-full">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-secondary-900 dark:text-white">
                  Recent Sessions
                </h2>
                <Link to="/history" className="text-sm text-primary-600 hover:text-primary-700">
                  View all
                </Link>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-16 bg-secondary-100 dark:bg-dark-700 rounded-lg" />
                    </div>
                  ))}
                </div>
              ) : stats.recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <MonitorPlay className="w-12 h-12 text-secondary-300 dark:text-dark-600 mx-auto mb-3" />
                  <p className="text-secondary-500 dark:text-secondary-400">No sessions yet</p>
                  <Link to="/sessions/new" className="mt-2 inline-block text-sm text-primary-600 hover:text-primary-700">
                    Start your first session
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {stats.recentSessions.map((session) => (
                    <Link
                      key={session.id}
                      to={`/session/${session.id}`}
                      className="block p-3 rounded-lg bg-secondary-50 dark:bg-dark-800 hover:bg-secondary-100 dark:hover:bg-dark-700 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-secondary-900 dark:text-white">
                            {session.title || 'Untitled Session'}
                          </p>
                          <p className="text-sm text-secondary-500 dark:text-secondary-400">
                            {formatRelativeTime(session.created_at)}
                          </p>
                        </div>
                        {getStatusBadge(session.status)}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
