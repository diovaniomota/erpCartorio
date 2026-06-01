"use client";

import { useMemo, useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { isValidCPF, isValidCpfCnpj, maskCPF, maskCpfCnpj } from "@/lib/cpf-cnpj";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { ActionResult } from "@/lib/types";

export type EntityField = {
  name: string;
  label: string;
  type?: "text" | "email" | "number" | "money" | "date" | "datetime-local" | "textarea" | "select" | "checkbox" | "url" | "cpf" | "cpf-cnpj";
  required?: boolean;
  options?: { label: string; value: string }[];
  defaultValue?: string | number | boolean | null;
  placeholder?: string;
  managedOptions?: {
    action: (values: string[]) => Promise<ActionResult<string[]>>;
    minOptions?: number;
  };
};

type EntityFormDialogProps = {
  title: string;
  description?: string;
  triggerLabel?: string;
  fields: EntityField[];
  action: (values: Record<string, unknown>) => Promise<ActionResult>;
};

export function EntityFormDialog({
  title,
  description,
  triggerLabel = "Novo registro",
  fields,
  action,
}: EntityFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const schema = useMemo(() => buildSchema(fields), [fields]);
  const form = useForm<Record<string, unknown>>({
    resolver: zodResolver(schema),
    defaultValues: Object.fromEntries(
      fields.map((field) => [field.name, field.defaultValue ?? (field.type === "checkbox" ? false : "")]),
    ),
  });

  function onSubmit(values: Record<string, unknown>) {
    startTransition(async () => {
      const result = await action(values);
      if (result.ok) {
        toast.success(result.message);
        form.reset();
        setOpen(false);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent className="overflow-hidden rounded-md border-slate-200 p-0">
        <DialogHeader className="border-b border-slate-200 bg-white px-6 py-5">
          <DialogTitle className="text-lg text-slate-950">{title}</DialogTitle>
          {description ? <DialogDescription className="text-slate-500">{description}</DialogDescription> : null}
        </DialogHeader>
        <form className="grid gap-0" onSubmit={form.handleSubmit(onSubmit)}>
          <div className="grid max-h-[64vh] gap-4 overflow-y-auto bg-slate-50 p-6 sm:grid-cols-2">
            {fields.map((field) => (
              <div key={field.name} className={field.type === "textarea" ? "space-y-2 sm:col-span-2" : "space-y-2"}>
                <Label htmlFor={field.name} className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
                  {field.label}
                </Label>
                <FieldControl field={field} register={form.register} setValue={form.setValue} value={form.watch(field.name)} />
                {form.formState.errors[field.name] ? (
                  <p className="text-xs font-medium text-destructive">
                    {String(form.formState.errors[field.name]?.message)}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
          <DialogFooter className="border-t border-slate-200 bg-white px-6 py-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              <Save className="h-4 w-4" />
              {isPending ? "Salvando..." : "Salvar registro"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function FieldControl({
  field,
  register,
  setValue,
  value,
}: {
  field: EntityField;
  register: ReturnType<typeof useForm<Record<string, unknown>>>["register"];
  setValue: ReturnType<typeof useForm<Record<string, unknown>>>["setValue"];
  value: unknown;
}) {
  if (field.type === "textarea") {
    return <Textarea id={field.name} placeholder={field.placeholder} className="min-h-28 rounded-md bg-white" {...register(field.name)} />;
  }

  if (field.type === "select") {
    if (field.managedOptions) {
      return <ManagedSelect field={field} setValue={setValue} value={value} />;
    }

    return (
      <Select value={String(value ?? "")} onValueChange={(nextValue) => setValue(field.name, nextValue, { shouldValidate: true })}>
        <SelectTrigger id={field.name} className="rounded-md bg-white">
          <SelectValue placeholder={field.placeholder ?? "Selecione"} />
        </SelectTrigger>
        <SelectContent>
          {(field.options ?? []).map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  if (field.type === "checkbox") {
    return (
      <div className="flex h-9 items-center gap-2 rounded-md border bg-white px-3">
        <Checkbox
          id={field.name}
          checked={Boolean(value)}
          onCheckedChange={(checked) => setValue(field.name, checked === true, { shouldValidate: true })}
        />
        <span className="text-sm text-muted-foreground">Sim</span>
      </div>
    );
  }

  if (field.type === "cpf" || field.type === "cpf-cnpj") {
    const applyMask = field.type === "cpf" ? maskCPF : maskCpfCnpj;
    const maxLen = field.type === "cpf" ? 14 : 18; // 000.000.000-00 = 14, 00.000.000/0000-00 = 18
    return (
      <Input
        id={field.name}
        value={String(value ?? "")}
        onChange={(e) => setValue(field.name, applyMask(e.target.value), { shouldValidate: true })}
        placeholder={field.placeholder ?? (field.type === "cpf" ? "000.000.000-00" : "CPF ou CNPJ")}
        inputMode="numeric"
        maxLength={maxLen}
        className="rounded-md bg-white"
      />
    );
  }

  return (
    <Input
      id={field.name}
      type={field.type === "money" ? "number" : field.type ?? "text"}
      step={field.type === "money" ? "0.01" : undefined}
      placeholder={field.placeholder}
      className="rounded-md bg-white"
      {...register(field.name)}
    />
  );
}

function ManagedSelect({
  field,
  setValue,
  value,
}: {
  field: EntityField;
  setValue: ReturnType<typeof useForm<Record<string, unknown>>>["setValue"];
  value: unknown;
}) {
  const [options, setOptions] = useState(() => field.options ?? []);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const selectedValue = String(value ?? "");
  const minOptions = field.managedOptions?.minOptions ?? 1;

  function persist(nextOptions: { label: string; value: string }[], nextSelectedValue?: string) {
    if (!field.managedOptions) return;

    startTransition(async () => {
      const result = await field.managedOptions!.action(nextOptions.map((option) => option.value));

      if (result.ok) {
        const savedOptions = (result.data ?? nextOptions.map((option) => option.value)).map((optionValue) => ({
          label: optionValue,
          value: optionValue,
        }));
        setOptions(savedOptions);
        if (nextSelectedValue) {
          setValue(field.name, nextSelectedValue, { shouldValidate: true, shouldDirty: true });
        }
        toast.success(result.message);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    });
  }

  function addOption() {
    const nextValue = draft.trim();
    if (!nextValue) return;

    const exists = options.some((option) => option.value.toLocaleLowerCase("pt-BR") === nextValue.toLocaleLowerCase("pt-BR"));
    if (exists) {
      setValue(field.name, nextValue, { shouldValidate: true, shouldDirty: true });
      setDraft("");
      return;
    }

    const nextOptions = [...options, { label: nextValue, value: nextValue }];
    setDraft("");
    persist(nextOptions, nextValue);
  }

  function removeOption(optionValue: string) {
    if (options.length <= minOptions) {
      toast.error("Mantenha pelo menos um tipo.");
      return;
    }

    const nextOptions = options.filter((option) => option.value !== optionValue);
    const nextSelectedValue = selectedValue === optionValue ? nextOptions[0]?.value : selectedValue;
    persist(nextOptions, nextSelectedValue);
  }

  return (
    <div className="space-y-2 rounded-md border border-slate-200 bg-white p-2">
      <Select value={selectedValue} onValueChange={(nextValue) => setValue(field.name, nextValue, { shouldValidate: true })}>
        <SelectTrigger id={field.name} className="rounded-md bg-white">
          <SelectValue placeholder={field.placeholder ?? "Selecione"} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              addOption();
            }
          }}
          placeholder="Novo tipo"
          className="h-8 rounded-md bg-white"
        />
        <Button type="button" size="sm" variant="outline" onClick={addOption} disabled={isPending || !draft.trim()}>
          <Plus className="h-3.5 w-3.5" />
          Adicionar
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {options.map((option) => (
          <span
            key={option.value}
            className="inline-flex max-w-full items-center gap-1 rounded-full border border-slate-200 bg-slate-50 py-1 pl-2.5 pr-1 text-xs font-medium text-slate-700"
          >
            <span className="truncate">{option.label}</span>
            <button
              type="button"
              onClick={() => removeOption(option.value)}
              disabled={isPending || options.length <= minOptions}
              className="inline-grid h-5 w-5 shrink-0 place-items-center rounded-full text-slate-400 hover:bg-white hover:text-red-600 disabled:pointer-events-none disabled:opacity-40"
              aria-label={`Excluir tipo ${option.label}`}
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

function buildSchema(fields: EntityField[]) {
  return z.object(
    Object.fromEntries(
      fields.map((field) => {
        let schema: z.ZodTypeAny;
        if (field.type === "number" || field.type === "money") {
          schema = field.required ? z.coerce.number().min(0) : z.coerce.number().optional().or(z.literal(""));
        } else if (field.type === "checkbox") {
          schema = z.coerce.boolean().optional();
        } else if (field.type === "email") {
          schema = field.required
            ? z.string().email("E-mail inválido")
            : z.string().email("E-mail inválido").or(z.literal("")).optional();
        } else if (field.type === "cpf") {
          schema = field.required
            ? z.string().min(1, "Informe o CPF").refine(isValidCPF, "CPF inválido")
            : z.string().refine(isValidCPF, "CPF inválido").or(z.literal("")).optional();
        } else if (field.type === "cpf-cnpj") {
          schema = field.required
            ? z.string().min(1, "Informe CPF ou CNPJ").refine(isValidCpfCnpj, "Informe um CPF ou CNPJ válido")
            : z.string().refine(isValidCpfCnpj, "Informe um CPF ou CNPJ válido").or(z.literal("")).optional();
        } else {
          schema = field.required ? z.string().min(1, "Campo obrigatório") : z.string().optional();
        }

        return [field.name, schema];
      }),
    ),
  );
}
