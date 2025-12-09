import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { LogIn, Loader2, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToSignup }) => {
  const { login, isLoading } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = await login({ email, password });
    
    if (result.success) {
      toast({
        title: "Welcome back!",
        description: "You've successfully logged in.",
      });
      onSuccess?.();
    } else {
      // Parse and format the error message
      let errorMsg = result.error || 'Login failed';
      let toastTitle = "Login failed";
      
      // Provide user-friendly messages for common errors
      if (errorMsg.toLowerCase().includes('invalid email or password')) {
        toastTitle = "Invalid credentials";
        errorMsg = "The email or password you entered is incorrect. Please try again.";
      } else if (errorMsg.toLowerCase().includes('user not found')) {
        toastTitle = "Account not found";
        errorMsg = "No account found with this email. Please check your email or sign up.";
      } else if (errorMsg.toLowerCase().includes('invalid token')) {
        toastTitle = "Session expired";
        errorMsg = "Your session has expired. Please log in again.";
      }
      
      setError(errorMsg);
      toast({
        title: toastTitle,
        description: errorMsg,
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-foreground">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="player@snake.game"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-foreground">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <Button type="submit" variant="neon" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <LogIn className="w-4 h-4 mr-2" />
        )}
        Log In
      </Button>

      <p className="text-center text-muted-foreground text-sm">
        Don't have an account?{' '}
        <button
          type="button"
          onClick={onSwitchToSignup}
          className="text-secondary hover:text-secondary/80 underline underline-offset-4"
        >
          Sign up
        </button>
      </p>

      <div className="text-center text-muted-foreground text-xs">
        <p>Demo credentials:</p>
        <p>user1@example.com / password123</p>
      </div>
    </form>
  );
};
