"use client";

import { useActionState, useState } from "react";
import { cancelarNota, type CancelarNotaState } from "./actions";

const initialState: CancelarNotaState = {};

export function CancelarNotaButton({ notaId }: { notaId: string }) {
  const [aberto, setAberto] = useState(false);
  const [state, formAction, pending] = useActionState(cancelarNota, initialState);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="text-red-600 hover:underline"
      >
        Cancelar
      </button>
    );
  }

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-md border border-gray-200 p-2">
      <input type="hidden" name="notaId" value={notaId} />
      <textarea
        name="justificativa"
        required
        rows={2}
        placeholder="Justificativa do cancelamento (mín. 15 caracteres)"
        className="w-full rounded-md border border-gray-300 px-2 py-1 text-xs"
      />
      {state.error && <p className="text-xs text-red-600">{state.error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-red-600 px-2 py-1 text-xs font-medium text-white disabled:opacity-50"
        >
          {pending ? "Cancelando..." : "Confirmar cancelamento"}
        </button>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="rounded-md border border-gray-300 px-2 py-1 text-xs text-gray-600"
        >
          Voltar
        </button>
      </div>
    </form>
  );
}
