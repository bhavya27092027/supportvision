import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Video,
  Users,
  Shield,
  Zap,
  MonitorPlay,
  MessageSquare,
  FileVideo,
  Clock,
  CheckCircle,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui';

const features = [
  {
    icon: Video,
    title: 'HD Video Calls',
    description: 'Crystal clear video and audio for seamless support sessions.',
  },
  {
    icon: MessageSquare,
    title: 'Real-time Chat',
    description: 'Instant messaging with file sharing and emoji support.',
  },
  {
    icon: FileVideo,
    title: 'Session Recording',
    description: 'Record sessions for training and quality assurance.',
  },
  {
    icon: Shield,
    title: 'Secure Links',
    description: 'End-to-end encrypted sessions with secure invite tokens.',
  },
  {
    icon: Users,
    title: 'Multi-participant',
    description: 'Support multiple participants in a single session.',
  },
  {
    icon: Clock,
    title: 'Session History',
    description: 'Complete history with analytics and insights.',
  },
];

const stats = [
  { value: '50K+', label: 'Sessions Hosted' },
  { value: '99.9%', label: 'Uptime' },
  { value: '10K+', label: 'Active Agents' },
  { value: '4.9/5', label: 'User Rating' },
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-dark-950">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-secondary-100 dark:border-dark-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-secondary-900 dark:text-white">SupportVision</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              Real-time Video Support Platform
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-secondary-900 dark:text-white mb-6 leading-tight">
              Connect with Customers in
              <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent"> Real-Time</span>
            </h1>

            <p className="text-lg md:text-xl text-secondary-600 dark:text-secondary-400 max-w-3xl mx-auto mb-10">
              SupportVision enables customer support teams to provide exceptional service through secure video sessions. No account required for customers.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" rightIcon={<ChevronRight className="w-5 h-5" />}>
                  Start Free Trial
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Sign In as Agent
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-16 relative"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-soft-lg bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/20 dark:to-accent-900/20 p-2">
              <img
                src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?w=1200&h=600&fit=crop"
                alt="Support Dashboard"
                className="w-full rounded-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent dark:from-dark-900/20" />
            </div>

            {/* Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="absolute -left-4 top-1/4 bg-white dark:bg-dark-800 rounded-xl shadow-soft-lg p-4 hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-success-100 dark:bg-success-900/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">Session Active</p>
                  <p className="text-xs text-secondary-500">2 participants</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="absolute -right-4 bottom-1/4 bg-white dark:bg-dark-800 rounded-xl shadow-soft-lg p-4 hidden lg:block"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">Live Chat</p>
                  <p className="text-xs text-secondary-500">5 new messages</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-secondary-50 dark:bg-dark-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-bold text-primary-600 dark:text-primary-400">
                  {stat.value}
                </p>
                <p className="mt-1 text-sm text-secondary-600 dark:text-secondary-400">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-secondary-900 dark:text-white mb-4">
              Everything You Need for Support
            </h2>
            <p className="text-lg text-secondary-600 dark:text-secondary-400 max-w-2xl mx-auto">
              Powerful features designed to help your team deliver exceptional customer support.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-6 rounded-2xl bg-white dark:bg-dark-800 border border-secondary-100 dark:border-dark-700 hover:shadow-soft transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary-600 dark:text-primary-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600 dark:text-secondary-400">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-3xl bg-gradient-to-r from-primary-600 to-accent-500 p-8 md:p-12 text-center text-white"
          >
            <MonitorPlay className="w-12 h-12 mx-auto mb-6 opacity-90" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Transform Your Support?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
              Join thousands of teams providing exceptional customer support through real-time video sessions.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                className="bg-white text-primary-600 hover:bg-secondary-50"
              >
                Get Started for Free
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-secondary-50 dark:bg-dark-900 border-t border-secondary-100 dark:border-dark-700">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                <Video className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-secondary-900 dark:text-white">SupportVision</span>
            </div>
            <p className="text-sm text-secondary-500 dark:text-secondary-400">
              2024 SupportVision. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
