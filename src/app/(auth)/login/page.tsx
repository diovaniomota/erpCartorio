import Image from "next/image";
import { ArrowRight, CalendarDays, Landmark, LockKeyhole, Mail, ShieldCheck, UsersRound } from "lucide-react";
import { loginAction } from "@/app/(auth)/login/actions";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1.08fr)_minmax(440px,0.92fr)]">
        <section className="relative hidden overflow-hidden lg:block">
          <Image
            src="/images/login-hero.png"
            alt="Ambiente administrativo de cartório"
            fill
            priority
            sizes="58vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#111820]/[0.82]" />
          <div className="absolute inset-0 flex flex-col justify-between p-12 xl:p-16">
            <div className="flex items-center gap-3 text-white">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/[0.14] ring-1 ring-white/20">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold leading-none">CartórioHub</p>
                <p className="mt-1 text-sm text-white/72">Backoffice administrativo</p>
              </div>
            </div>

            <div className="max-w-xl text-white">
              <Badge className="border-white/20 bg-white/10 text-white hover:bg-white/10">
                Acesso administrativo
              </Badge>
              <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-normal xl:text-5xl">
                A rotina interna da serventia em um só lugar.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/78">
                Financeiro, contratos, equipe, documentos, agenda e tarefas com visão clara para o dia a dia do cartório.
              </p>
            </div>

            <div className="grid max-w-2xl grid-cols-3 gap-4 border-t border-white/15 pt-5">
              {[
                { title: "Financeiro", text: "Contas, caixa e boletos", icon: ShieldCheck },
                { title: "Agenda", text: "Prazos e reuniões", icon: CalendarDays },
                { title: "Equipe", text: "RH e demandas internas", icon: UsersRound },
              ].map((item) => (
                <div key={item.title} className="text-white">
                  <item.icon className="h-5 w-5 text-[#c8a850]" />
                  <p className="mt-3 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs leading-5 text-white/70">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8">
          <div className="w-full max-w-[448px]">
            <div className="mb-8 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xl font-semibold leading-none">CartórioHub</p>
                <p className="mt-1 text-sm text-muted-foreground">Backoffice administrativo</p>
              </div>
            </div>

            <Card className="border-slate-200 bg-white">
              <CardContent className="p-7 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Badge variant="secondary">Acesso restrito</Badge>
                    <h2 className="mt-5 text-2xl font-semibold tracking-normal">Entrar no sistema</h2>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Use sua conta administrativa autorizada.
                    </p>
                  </div>
                  <div className="hidden h-12 w-12 items-center justify-center rounded-lg bg-blue-50 text-primary sm:flex">
                    <LockKeyhole className="h-6 w-6" />
                  </div>
                </div>

                <LoginError searchParams={searchParams} />

                <form action={loginAction} className="mt-7 space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="seu.email@cartorio.com.br"
                        className="h-11 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        autoComplete="current-password"
                        className="h-11 pl-10"
                        required
                      />
                    </div>
                  </div>

                  <Button className="h-11 w-full" type="submit">
                    Entrar
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </form>
              </CardContent>
            </Card>

            <p className="mt-5 text-center text-xs text-muted-foreground">
              CartórioHub - acesso exclusivo para usuários autorizados.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

async function LoginError({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params = searchParams ? await searchParams : undefined;

  if (!params?.error) return null;

  const message =
    params.error === "configuracao"
      ? "A autenticação do Supabase não está configurada neste ambiente."
      : "Confira o e-mail e a senha informados e tente novamente.";

  return (
    <Alert className="mt-6 border-red-200 bg-red-50 text-red-900" variant="destructive">
      <AlertTitle>Não foi possível entrar</AlertTitle>
      <AlertDescription>{message}</AlertDescription>
    </Alert>
  );
}
