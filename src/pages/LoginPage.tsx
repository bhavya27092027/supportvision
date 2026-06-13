import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button, Input, Card, CardContent } from '@/components/ui';
import { useAuthStore, useUIStore } from '@/stores';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { initialize, createProfile } = useAuthStore();
  const { addToast } = useUIStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    console.log('[Login] Attempting login for:', email);

    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('[Login] Sign in error:', signInError);
        setError(signInError.message);
        setIsLoading(false);
        return;
      }

      console.log('[Login] Sign in successful:', data.user?.id);

      if (data.user) {
        // Ensure profile exists
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          console.log('[Login] Creating missing profile');
          const metadata = data.user.user_metadata || {};
          await createProfile(
            data.user.id,
            data.user.email || email,
            metadata.name || metadata.full_name
          );
        }

        // Initialize auth state
        await initialize();

        addToast({
          type: 'success',
          title: 'Welcome back!',
          message: 'You have successfully signed in.',
        });

        console.log('[Login] Navigating to dashboard');
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      console.error('[Login] Exception:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-secondary-900 dark:text-white">SupportVision</span>
          </Link>

          <h1 className="text-2xl font-bold text-secondary-900 dark:text-white mb-2">
            Welcome back
          </h1>
          <p className="text-secondary-600 dark:text-secondary-400 mb-8">
            Sign in to your account to continue
          </p>

          <Card variant="elevated">
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  leftIcon={<Lock className="w-4 h-4" />}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="hover:text-secondary-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  }
                  required
                />

                {error && (
                  <p className="text-sm text-error-600 dark:text-error-400">{error}</p>
                )}

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded border-secondary-300" />
                    <span className="text-sm text-secondary-600 dark:text-secondary-400">Remember me</span>
                  </label>
                  <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-700">
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  isLoading={isLoading}
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Sign In
                </Button>
              </form>
            </CardContent>
          </Card>

          <p className="mt-6 text-center text-sm text-secondary-600 dark:text-secondary-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 hover:text-primary-700 font-medium">
              Sign up
            </Link>
          </p>
        </motion.div>
      </div>

      {/* Right Side - Image */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="hidden lg:block lg:w-1/2 relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary-600 to-accent-500">
          <div className="absolute inset-0 bg-black/20" />
          <img
            src="https://images.pexels.com/photos/3183150/pexels-photo-3183150.jpeg?w=800&h=1200&fit=crop"
            alt="Support Team"
            className="w-full h-full object-cover mix-blend-overlay"
          />
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">Support That Scales</h2>
              <p className="text-lg opacity-90 max-w-md">
                Connect with customers through secure video sessions. No account required for them.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
