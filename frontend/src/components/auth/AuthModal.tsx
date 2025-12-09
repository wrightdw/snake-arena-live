import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { LoginForm } from './LoginForm';
import { SignupForm } from './SignupForm';

interface AuthModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  open,
  onOpenChange,
  defaultTab = 'login',
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);

  const handleSuccess = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-card border-2 border-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-primary neon-text font-pixel">
            {activeTab === 'login' ? 'WELCOME BACK' : 'JOIN THE GAME'}
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            {activeTab === 'login'
              ? 'Log in to track your scores and compete on the leaderboard'
              : 'Create an account to save your progress and challenge others'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4">
          {activeTab === 'login' ? (
            <LoginForm
              onSuccess={handleSuccess}
              onSwitchToSignup={() => setActiveTab('signup')}
            />
          ) : (
            <SignupForm
              onSuccess={handleSuccess}
              onSwitchToLogin={() => setActiveTab('login')}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
