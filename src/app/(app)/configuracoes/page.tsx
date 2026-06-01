import { Bell, Database, Settings, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/shared/data-table";
import { EntityFormDialog, type EntityField } from "@/components/shared/entity-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { requirePermission } from "@/lib/auth";
import { createConfiguracao, deleteConfiguracao } from "@/modules/configuracoes/actions";
import { getConfiguracoes } from "@/modules/configuracoes/queries";

export default async function ConfiguracoesPage() {
  await requirePermission("gerenciar_configuracoes");
  const configuracoes = await getConfiguracoes();
  const fields: EntityField[] = [
    { name: "chave", label: "Chave", required: true },
    { name: "valor", label: "Valor JSON", type: "textarea", required: true, defaultValue: "{}" },
  ];

  const cards = [
    { title: "Tarefas", description: "Regras de conclusão, reabertura e alertas de prazo.", icon: Settings },
    { title: "Notificações", description: "Preferências para alertas internos e canais futuros.", icon: Bell },
    { title: "Storage", description: "Parâmetros de anexos, caminhos e política de acesso a arquivos.", icon: Database },
    { title: "Segurança", description: "Políticas por cartório, sessão, RBAC e auditoria.", icon: ShieldCheck },
  ];

  return (
    <>
      <PageHeader
        title="Configurações"
        description="Parâmetros administrativos isolados por cartório em formato estruturado."
        actions={<EntityFormDialog title="Nova configuração" fields={fields} action={createConfiguracao} />}
      />
      <div className="divide-y divide-slate-200 border-y border-slate-200">
        <StatCard title="Configurações ativas" value={configuracoes.length} icon={Settings} tone="info" />
        <StatCard title="Módulos configuráveis" value={cards.length} icon={Database} tone="success" />
        <StatCard title="Escopo" value={1} icon={ShieldCheck} tone="warning" />
      </div>
      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <div className="grid gap-4">
          {cards.map((item) => (
            <Card key={item.title}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">{item.description}</CardContent>
            </Card>
          ))}
        </div>
        <DataTable
          data={configuracoes.map((item) => ({
            ...item,
            valor_texto: (() => {
              if (item.valor === null || item.valor === undefined) return "—";
              if (typeof item.valor === "boolean") return item.valor ? "Sim" : "Não";
              if (typeof item.valor === "string" || typeof item.valor === "number") return String(item.valor);
              const obj = item.valor as Record<string, unknown>;
              return Object.entries(obj).map(([k, v]) => {
                const label = typeof v === "boolean" ? (v ? "Sim" : "Não") : String(v ?? "—");
                return `${k}: ${label}`;
              }).join(" · ");
            })(),
          })) as unknown as Record<string, unknown>[]}
          columns={[
            { key: "chave", label: "Chave" },
            { key: "valor_texto", label: "Valor" },
            { key: "updated_at", label: "Atualizado em", format: "date" },
          ]}
          deleteAction={deleteConfiguracao}
        />
      </div>
    </>
  );
}
