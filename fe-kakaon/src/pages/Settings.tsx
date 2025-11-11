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

// 프로필 정보 폼 유효성 검사 스키마
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "이름은 2자 이상이어야 합니다." }),
  phone: z.string().optional().refine(val => !val || /^\d{3}-\d{3,4}-\d{4}$/.test(val), {
    message: "전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)",
  }),
});

// PIN 번호 변경 폼 유효성 검사 스키마
const pinFormSchema = z.object({
  currentPin: z.string().optional(), // 현재 PIN은 서버에서 검증하므로 클라이언트에서는 형식만 체크
  newPin: z.string().length(4, { message: "PIN 번호는 4자리여야 합니다." }),
  confirmPin: z.string().length(4, { message: "PIN 번호는 4자리여야 합니다." }),
}).refine(data => data.newPin === data.confirmPin, {
  message: "새 PIN 번호가 일치하지 않습니다.",
  path: ["confirmPin"], // 오류 메시지를 confirmPin 필드에 표시
});


// Zod 스키마로부터 TypeScript 타입 추론
type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PinFormValues = z.infer<typeof pinFormSchema>;


export default function Settings() {
  const { data: member, isLoading, isError } = useMyInfo();
  const { mutate: updateInfo, isPending: isUpdating } = useUpdateMyInfo();
  const { mutate: deleteAccount, isPending: isDeleting } = useDeleteMyAccount();

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: "",
      phone: "",
    },
  });

  const pinForm = useForm<PinFormValues>({
    resolver: zodResolver(pinFormSchema),
    defaultValues: {
      currentPin: "",
      newPin: "",
      confirmPin: "",
    },
  });

  // API로부터 데이터를 성공적으로 불러오면 프로필 폼의 기본값을 설정
  useEffect(() => {
    if (member) {
      profileForm.reset({
        name: member.name,
        phone: member.phone || "",
      });
    }
  }, [member, profileForm]);

  const onProfileSubmit = (values: ProfileFormValues) => {
    const payload = {
      name: values.name,
      phone: values.phone || "",
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

  const onPinSubmit = (values: PinFormValues) => {
    // 현재 PIN 번호 검증은 백엔드에서 처리한다고 가정하고, 새 PIN 번호만 전송
    const payload = {
      adminPin: values.newPin,
    };

    updateInfo(payload, {
      onSuccess: () => {
        toast.success("PIN 번호가 성공적으로 수정되었습니다.");
        pinForm.reset(); // 성공 시 폼 초기화
      },
      onError: () => {
        toast.error("PIN 번호 수정에 실패했습니다. 다시 시도해주세요.");
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile */}
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none h-full">
            <h3 className="text-[#333333] mb-6">프로필 정보</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#333333] mb-2">이름</label>
                <Input
                  {...profileForm.register("name")}
                  className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                />
                {profileForm.formState.errors.name && (
                  <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#333333] mb-2">전화번호</label>
                <Input
                  {...profileForm.register("phone")}
                  placeholder="010-1234-5678"
                  className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                />
                {profileForm.formState.errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{profileForm.formState.errors.phone.message}</p>
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
            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none px-8 w-full max-w-xs"
              >
                {isUpdating ? "수정 중..." : "정보 수정"}
              </Button>
            </div>
          </Card>
        </form>

        {/* PIN Management */}
        <form onSubmit={pinForm.handleSubmit(onPinSubmit)}>
          <Card className="p-6 rounded-xl border border-[rgba(0,0,0,0.08)] shadow-none h-full">
            <h3 className="text-[#333333] mb-6">관리자 PIN 번호</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#333333] mb-2">현재 PIN 번호</label>
                <Input
                  {...pinForm.register("currentPin")}
                  type="password"
                  placeholder="기본 핀번호는 0000 입니다."
                  className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                  maxLength={4}
                />
                 {pinForm.formState.errors.currentPin && (
                  <p className="text-red-500 text-sm mt-1">{pinForm.formState.errors.currentPin.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#333333] mb-2">새 PIN 번호</label>
                <Input
                  {...pinForm.register("newPin")}
                  type="password"
                  placeholder="새 PIN 번호를 입력하세요"
                  className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                  maxLength={4}
                />
                {pinForm.formState.errors.newPin && (
                  <p className="text-red-500 text-sm mt-1">{pinForm.formState.errors.newPin.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#333333] mb-2">새 PIN 번호 확인</label>
                <Input
                  {...pinForm.register("confirmPin")}
                  type="password"
                  placeholder="새 PIN 번호를 다시 입력하세요"
                  className="rounded-lg bg-white border-[rgba(0,0,0,0.1)]"
                  maxLength={4}
                />
                {pinForm.formState.errors.confirmPin && (
                  <p className="text-red-500 text-sm mt-1">{pinForm.formState.errors.confirmPin.message}</p>
                )}
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <Button
                type="submit"
                disabled={isUpdating}
                className="bg-[#FEE500] hover:bg-[#FFD700] text-[#3C1E1E] rounded-lg shadow-none px-8 w-full max-w-xs"
              >
                {isUpdating ? "수정 중..." : "PIN 번호 수정"}
              </Button>
            </div>
          </Card>
        </form>
      </div>

      {/* Danger Zone */}
      <div className="max-w-2xl mx-auto">
        <Card className="p-6 border-red-200">
          <div className="flex flex-col tablet:flex-row items-start tablet:items-center justify-between gap-4">
            <div>
              <h3 className="text-[#FF4D4D] mb-1">계정 삭제</h3>
              <p className="text-sm text-[#717182]">계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="rounded-lg w-full tablet:w-auto" disabled={isDeleting}>
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
