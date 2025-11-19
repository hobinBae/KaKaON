import { useState } from 'react';
import { useForm } from 'react-hook-form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTestLogin } from '@/auth/hooks/useAuth';

interface TestLoginModalProps {
  trigger: React.ReactNode;
}

interface TestLoginForm {
  testId: string;
  testPassword: string;
}

export default function TestLoginModal({ trigger }: TestLoginModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<TestLoginForm>();
  const { mutate: testLogin, isPending } = useTestLogin();

  const onSubmit = (data: TestLoginForm) => {
    testLogin(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-center">테스트 ID 로그인</DialogTitle>
          <DialogDescription className="text-center">
            테스트 계정 정보를 입력하여 로그인하세요.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testId" className="text-right">
              아이디
            </Label>
            <Input
              id="testId"
              className="col-span-3"
              {...register('testId', { required: '아이디를 입력해주세요' })}
            />
          </div>
          {errors.testId && (
            <p className="text-sm text-red-500 text-right">{errors.testId.message}</p>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="testPassword" className="text-right">
              비밀번호
            </Label>
            <Input
              id="testPassword"
              type="password"
              className="col-span-3"
              {...register('testPassword', { required: '비밀번호를 입력해주세요' })}
            />
          </div>
          {errors.testPassword && (
            <p className="text-sm text-red-500 text-right">{errors.testPassword.message}</p>
          )}

          <div className="flex justify-center pt-4">
            <Button type="submit" disabled={isPending} className="rounded-full w-full sm:w-auto px-8">
              {isPending ? '로그인 중...' : '로그인'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
