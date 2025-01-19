import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form';
import { useLogin } from '@/api/auth';
import type { RouterContext } from './__root'
import { routerContext } from '@/lib/routerContext';
import { queryClient } from '@/main';

interface LoginForm {
  password: string;
}

export const Route = createFileRoute('/login')({
  beforeLoad: ({ context }: { context: RouterContext }) => {
    if (context.auth?.isAuthenticated) {
      throw redirect({
        to: '/explanations'
      })
    }
  },
  component: LoginComponent
})

function LoginComponent() {
  const navigate = useNavigate();
  const loginMutation = useLogin();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await loginMutation.mutateAsync(data.password);
      queryClient.resetQueries()
      navigate({ to: '/' })
    } catch (err) {
      setError('password', { 
        type: 'manual',
        message: 'Invalid password'
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <form 
        onSubmit={handleSubmit(onSubmit)} 
        className="w-full max-w-md space-y-4 rounded-lg border p-6 shadow-lg"
      >
        <h2 className="text-center text-2xl font-bold">Login</h2>
        <div className="space-y-4">
          <input
            type="password"
            placeholder="Enter Password"
            className="w-full rounded border p-2"
            {...register('password', { required: 'Password is required' })}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password.message}</p>
          )}
          <button 
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full rounded bg-blue-500 p-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loginMutation.isPending ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
    </div>
  );
} 