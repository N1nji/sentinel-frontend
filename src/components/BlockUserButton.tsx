import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import {
  bloquearUsuario,
  desbloquearUsuario,
} from "../services/securityService";

import { UserX, UserCheck, Loader2 } from "lucide-react";

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
      // Aqui você poderia disparar um Toast de erro
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
        className={`
          inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold
          transition-all duration-200 active:scale-95
          disabled:opacity-50 disabled:cursor-not-allowed
          ${isActive 
            ? "bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-600 hover:text-white dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 dark:hover:bg-rose-600 dark:hover:text-white" 
            : "bg-emerald-50 text-emerald-600 border border-emerald-200 hover:bg-emerald-600 hover:text-white dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-600 dark:hover:text-white"
          }
        `}
      >
        {loading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : isActive ? (
          <UserX className="h-3.5 w-3.5" />
        ) : (
          <UserCheck className="h-3.5 w-3.5" />
        )}

        <span>{loading ? "Processando..." : isActive ? "Bloquear" : "Desbloquear"}</span>
      </button>

      <ConfirmDialog
        open={open}
        title={isActive ? "Bloquear usuário?" : "Desbloquear usuário?"}
        description={
          isActive
            ? "O usuário perderá o acesso ao sistema imediatamente. Todas as sessões ativas serão invalidadas no próximo request."
            : "O acesso do usuário será restaurado e ele poderá realizar login novamente."
        }
        confirmText={isActive ? "Sim, Bloquear" : "Sim, Desbloquear"}
        danger={isActive}
        onCancel={() => setOpen(false)}
        onConfirm={handleConfirm}
      />
    </>
  );
}