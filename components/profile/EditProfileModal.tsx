"use client";

import { useForm } from "react-hook-form";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuthStore } from "@/lib/stores/auth-store";
import { updateProfile } from "@/lib/services/profile";

type FormValues = { name: string };

export function EditProfileModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ values: { name: user?.name ?? "" } });

  async function onSubmit(values: FormValues) {
    if (!user) return;
    const updated = await updateProfile(user.id, { name: values.name });
    setUser(updated);
    onClose();
  }

  return (
    <Modal open={open} title="Meus dados" onClose={onClose}>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <Input
          label="Nome"
          error={errors.name?.message}
          {...register("name", { required: "Informe seu nome" })}
        />
        <Input label="E-mail" value={user?.email ?? ""} disabled hint="O e-mail não pode ser alterado." />
        <Button type="submit" fullWidth loading={isSubmitting}>
          Salvar alterações
        </Button>
      </form>
    </Modal>
  );
}
