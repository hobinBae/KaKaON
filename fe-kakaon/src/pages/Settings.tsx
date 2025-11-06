import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useMyInfo, useUpdateMyInfo, useDeleteMyAccount } from "@/lib/hooks/useMember";

// --- Zod 스키마 및 타입 정의 ---

// 전체 폼에 대한 유효성 검사 스키마
const formSchema = z.object({
  name: z.string().min(2, { message: "이름은 2자 이상이어야 합니다." }),
  phone1: z.string().optional(),
  phone2: z.string().optional(),
  phone3: z.string().optional(),
}).superRefine((data, ctx) => {
  const { phone1, phone2, phone3 } = data;
  const phoneParts = [phone1, phone2, phone3];
  const filledPartsCount = phoneParts.filter(p => p && p.length > 0).length;

  // 전화번호 필드가 하나라도 채워져 있다면, 모든 필드가 채워져야 하고 각 형식도 맞아야 함
  if (filledPartsCount > 0) {
    if (!phone1 || phone1.length !== 3) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "3자리여야 합니다.",
        path: ["phone1"],
      });
    }
    if (!phone2 || (phone2.length < 3 || phone2.length > 4)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "3-4자리여야 합니다.",
        path: ["phone2"],
      });
    }
    if (!phone3 || phone3.length !== 4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "4자리여야 합니다.",
        path: ["phone3"],
      });
    }
  }
});

// Zod 스키마로부터 TypeScript 타입 추론
type FormValues = z.infer<typeof formSchema>;


export default function Settings() {
  const { data: member, isLoading, isError } = useMyInfo();
  const { mutate: updateInfo, isPending: isUpdating } = useUpdateMyInfo();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteMyAccount();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      phone1: "",
      phone2: "",
      phone3: "",
    },
  });

  // API로부터 데이터를 성공적으로 불러오면 폼의 기본값을 설정
  useEffect(() => {
    if (member) {
      const [phone1 = "", phone2 = "", phone3 = ""] = member.phone?.split("-") || [];
      form.reset({
        name: member.name,
        phone1,
        phone2,
        phone3,
      });
    }
  }, [member, form]);

  const onSubmit = (values: FormValues) => {
    // 세 부분으로 나뉜 전화번호를 하나의 문자열로 합침
    const fullPhone = (values.phone1 && values.phone2 && values.phone3)
      ? `${values.phone1}-${values.phone2}-${values.phone3}`
      : null;

    const payload = {
      name: values.name,
      phone: fullPhone,
    };

    updateInfo(payload, {
      onSuccess: () => {
        toast.success("프로필 정보가 성공적으로 수정되었습니다.");
      },
      onError: () => {
        toast.error("정보 수정에 실패했습니다. 다시 시도해주세요.");
      },
    });
  };

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  if (isError) {
    return <div>에러가 발생했습니다.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-[#333333] mb-1">설정</h1>
        <p className="text-sm text-[#717182]">계정 및 알림 설정을 관리하세요</p>
      </div>

      <div className="max-w-2xl mx-auto space-y-6">
        <form onSubmit={form.handleSubmit(onSubmit)}>
          {/* Profile */}
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
            <h3 className="text-[#333333] mb-6">프로필 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#333333] mb-2">이름</label>
                <Input
                  {...form.register("name")}
                  defaultValue={member?.name}
                  className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                />
                {form.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#333333] mb-2">전화번호</label>
                <div className="flex items-center gap-2">
                  <Input
                    {...form.register("phone1")}
                    className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                    maxLength={3}
                  />
                  <span>-</span>
                  <Input
                    {...form.register("phone2")}
                    className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                    maxLength={4}
                  />
                  <span>-</span>
                  <Input
                    {...form.register("phone3")}
                    className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                    maxLength={4}
                  />
                </div>
                {(form.formState.errors.phone1 || form.formState.errors.phone2 || form.formState.errors.phone3) && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.phone1?.message || form.formState.errors.phone2?.message || form.formState.errors.phone3?.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#333333] mb-2">이메일 (카카오 계정)</label>
                <Input
                  defaultValue={member?.email}
                  className="rounded-lg bg-[#F5F5F5] border-[rgba(0,0,0,0.1)]"
                  readOnly
                />
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-center mt-6">
            <Button
              type="submit"
              disabled={isUpdating}
              className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none px-8 w-full max-w-xs"
            >
              {isUpdating ? "수정 중..." : "정보 수정"}
            </Button>
          </div>
        </form>

        {/* Danger Zone */}
        <Card className="p-6 border-red-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[#FF4D4D] mb-1">계정 삭제</h3>
              <p className="text-sm text-[#717182]">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-lg" disabled={isDeleting}>
                  {isDeleting ? "삭제 중..." : "계정 삭제"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>정말로 계정을 삭제하시겠습니까?</AlertDialogTitle>
                  <AlertDialogDescription>
                    이 작업은 되돌릴 수 없으며, 모든 데이터가 영구적으로 삭제됩니다.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>취소</AlertDialogCancel>
                  <AlertDialogAction onClick={() => deleteAccount()}>삭제</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      </div>
    </div>
  );
}

// 로딩 상태를 표시하기 위한 스켈레톤 컴포넌트
const SettingsSkeleton = () => (
  <div className="space-y-6">
    <div>
      <Skeleton className="h-8 w-24 mb-2" />
      <Skeleton className="h-4 w-48" />
    </div>
    <div className="max-w-2xl mx-auto space-y-6">
      <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </Card>
      <div className="flex justify-center">
        <Skeleton className="h-10 w-full max-w-xs" />
      </div>
    </div>
  </div>
);
