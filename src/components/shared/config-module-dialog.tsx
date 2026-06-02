"use client";

import { useState, useTransition } from "react";
import { Pencil, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { saveConfiguracao } from "@/modules/configuracoes/actions";

type Props = {
  chave: string;
  label: string;
  currentJson: string;
  accent?: string;
};

export function ConfigModuleDialog({ chave, label, currentJson, accent }: Props) {
  const [open, setOpen]       = useState(false);
  const [json, setJson]       = useState(currentJson);
  const [error, setError]     = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleOpen(v: boolean) {
    if (v) setJson(currentJson); // reset to current on open
    setError(null);
    setOpen(v);
  }

  function handleSave() {
    setError(null);
    // Validate JSON before submitting
    try {
      JSON.parse(json);
    } catch {
      setError("JSON inválido. Verifique a sintaxe antes de salvar.");
      return;
    }

    startTransition(async () => {
      const result = await saveConfiguracao(chave, json);
      if (result.ok) {
        toast.success(result.message);
        setOpen(false);
      } else {
        setError(result.message);
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-7 gap-1.5 px-2.5 text-xs"
          style={accent ? { borderColor: `${accent}40`, color: accent } : undefined}
        >
          <Pencil className="h-3 w-3" />
          Editar
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Configurar · {label}</DialogTitle>
          <DialogDescription>
            Edite os parâmetros em formato JSON. As chaves disponíveis estão pré-preenchidas com os valores atuais.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Valor JSON — chave: <code className="font-mono text-slate-700">{chave}</code>
          </label>
          <textarea
            value={json}
            onChange={(e) => { setJson(e.target.value); setError(null); }}
            rows={10}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-sm leading-relaxed text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
            placeholder="{}"
            spellCheck={false}
          />
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}
          <p className="text-[11px] text-slate-400">
            Formato: objeto JSON com pares chave/valor. Booleans: <code>true</code> / <code>false</code>. Números sem aspas.
          </p>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={pending}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={pending}
            style={accent ? { background: accent, borderColor: accent } : undefined}
          >
            {pending ? <><Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> Salvando…</> : "Salvar configuração"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
