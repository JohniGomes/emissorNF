"use client";

import { useActionState } from "react";
import { excluirCliente, type ExcluirClienteState } from "./actions";

const initialState: ExcluirClienteState = {};

export function ExcluirClienteButton({ clienteId }: { clienteId: string }) {
  const [state, formAction, pending] = useActionState(excluirCliente, initialState);

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm("Excluir este cliente? Essa ação não pode ser desfeita.")) {
          e.preventDefault();
        }
      }}
      className="inline"
    >
      <input type="hidden" name="clienteId" value={clienteId} />
      <button
        type="submit"
        disabled={pending}
        className="text-red-600 hover:underline disabled:opacity-50"
      >
        {pending ? "Excluindo..." : "Excluir"}
      </button>
      {state.error && <p className="mt-1 text-xs text-red-600">{state.error}</p>}
    </form>
  );
}
