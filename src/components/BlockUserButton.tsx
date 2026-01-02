import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import {
  bloquearUsuario,
  desbloquearUsuario,
} from "../services/securityService";

import { UserX, UserCheck } from "lucide-react";

interface BlockUserButtonProps {
  userId: string;
  status: string;
  onSuccess?: () => void;
}

export default function BlockUserButton({
  userId,
  status,
  onSuccess,
}: BlockUserButtonProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const isActive = status === "ativo";

  async function handleConfirm(): Promise<void> {
    try {
      setLoading(true);

      if (isActive) {
        await bloquearUsuario(userId);
      } else {
        await desbloquearUsuario(userId);
      }

      setOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("Erro ao alterar status do usuário");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={loading}
        className={[
          "inline-flex items-center gap-2",
          "px-3 py-1.5 rounded-md text-xs font-semibold",
          "transition-colors",
          "disabled:opacity-60 disabled:cursor-not-allowed",
          isActive
            ? "border border-red-300 text-red-700 hover:bg-red-50 dark:border-red-500/40 dark:text-red-400 dark:hover:bg-red-500/10"
            : "border border-green-300 text-green-700 hover:bg-green-50 dark:border-green-500/40 dark:text-green-400 dark:hover:bg-green-500/10",
        ].join(" ")}
      >
        {isActive ? (
          <UserX className="h-3.5 w-3.5" />
        ) : (
          <UserCheck className="h-3.5 w-3.5" />
        )}

        {isActive ? "Bloquear" : "Desbloquear"}
      </button>

      <ConfirmDialog
        open={open}
        title={isActive ? "Bloquear usuário?" : "Desbloquear usuário?"}
        description={
          isActive
            ? "Esse usuário perderá acesso imediatamente ao sistema."
            : "Esse usuário poderá acessar o sistema novamente."
        }
        confirmText={isActive ? "Bloquear" : "Desbloquear"}
        danger={isActive}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}
