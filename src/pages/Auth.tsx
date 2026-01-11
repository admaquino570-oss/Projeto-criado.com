import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { z } from 'zod';

const authSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  fullName: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').optional(),
});

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isRecovery) {
        const result = authSchema.pick({ email: true }).safeParse({ email });
        if (!result.success) {
          toast.error(result.error.errors[0].message);
          return;
        }
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
        setIsRecovery(false);
      } else if (isLogin) {
        const result = authSchema.pick({ email: true, password: true }).safeParse({ email, password });
        if (!result.success) {
          toast.error(result.error.errors[0].message);
          return;
        }
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success('Login realizado com sucesso!');
        navigate('/');
      } else {
        const result = authSchema.safeParse({ email, password, fullName });
        if (!result.success) {
          toast.error(result.error.errors[0].message);
          return;
        }
        const { error } = await signUp(email, password, fullName);
        if (error) throw error;
        toast.success('Conta criada com sucesso!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-[url('/placeholder.svg')] bg-cover bg-center opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background" />

      <div className="relative w-full max-w-md bg-card/90 backdrop-blur-sm rounded-lg p-8 shadow-2xl animate-scale-in">
        <h1 className="text-4xl font-display text-primary text-center mb-2">STREAMIX</h1>
        <h2 className="text-2xl font-display text-center mb-6">
          {isRecovery ? 'Recuperar Senha' : isLogin ? 'Entrar' : 'Criar Conta'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && !isRecovery && (
            <div>
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Seu nome"
                className="mt-1"
              />
            </div>
          )}

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="mt-1"
            />
          </div>

          {!isRecovery && (
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1"
              />
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Carregando...' : isRecovery ? 'Enviar Email' : isLogin ? 'Entrar' : 'Criar Conta'}
          </Button>
        </form>

        <div className="mt-6 text-center space-y-2">
          {!isRecovery && (
            <button
              onClick={() => setIsRecovery(true)}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Esqueceu a senha?
            </button>
          )}
          <p className="text-sm text-muted-foreground">
            {isRecovery ? (
              <button onClick={() => setIsRecovery(false)} className="text-primary hover:underline">
                Voltar ao login
              </button>
            ) : isLogin ? (
              <>
                Não tem conta?{' '}
                <button onClick={() => setIsLogin(false)} className="text-primary hover:underline">
                  Criar conta
                </button>
              </>
            ) : (
              <>
                Já tem conta?{' '}
                <button onClick={() => setIsLogin(true)} className="text-primary hover:underline">
                  Entrar
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
