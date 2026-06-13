import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  Users,
  Video,
  Clock,
  TrendingUp,
  MonitorPlay,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, StatsCard } from '@/components/ui';
import type { Session } from '@/types';
import { formatDuration } from '@/lib/utils';

interface DailyStats {
  date: string;
  sessions: number;
  duration: number;
}

export function AdminAnalyticsPage() {
  const [stats, setStats] = useState({
    totalSessions: 0,
    activeSessions: 0,
    totalUsers: 0,
    totalAgents: 0,
    totalDuration: 0,
    avgSessionDuration: 0,
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Total sessions
        const { count: totalSessions } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true });

        // Active sessions
        const { count: activeSessions } = await supabase
          .from('sessions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');

        // Total users
        const { count: totalUsers } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });

        // Total agents
        const { count: totalAgents } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'agent');

        // Calculate total duration
        const { data: sessions } = await supabase
          .from('sessions')
          .select('duration_seconds');

        const totalDuration = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
        const avgSessionDuration = sessions?.length ? totalDuration / sessions.length : 0;

        setStats({
          totalSessions: totalSessions || 0,
          activeSessions: activeSessions || 0,
          totalUsers: totalUsers || 0,
          totalAgents: totalAgents || 0,
          totalDuration,
          avgSessionDuration: Math.round(avgSessionDuration),
        });

        // Generate mock daily stats for last 7 days
        const mockDailyStats: DailyStats[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          mockDailyStats.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            sessions: Math.floor(Math.random() * 20) + 5,
            duration: Math.floor(Math.random() * 100) + 30,
          });
        }
        setDailyStats(mockDailyStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-secondary-900 dark:text-white">Analytics</h1>
        <p className="text-secondary-600 dark:text-secondary-400">Overview of platform performance</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={<MonitorPlay className="w-5 h-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Active Now"
          value={stats.activeSessions}
          icon={<Video className="w-5 h-5" />}
          className={stats.activeSessions > 0 ? 'ring-2 ring-success-500' : ''}
        />
        <StatsCard
          title="Total Users"
          value={stats.totalUsers}
          icon={<Users className="w-5 h-5" />}
          trend={{ value: 8, isPositive: true }}
        />
        <StatsCard
          title="Total Agents"
          value={stats.totalAgents}
          icon={<Users className="w-5 h-5" />}
        />
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Sessions Over Time */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-4">
                Sessions Over Time
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyStats}>
                    <defs>
                      <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="sessions"
                      stroke="#3b82f6"
                      fill="url(#colorSessions)"
                      strokeWidth={2}
                    />
                      </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
