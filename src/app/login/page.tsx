import LoginPageClient from "./LoginPageClient";

type LoginPageProps = {
  searchParams: Promise<{
    redirect?: string | string[] | undefined;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;

  const redirect = Array.isArray(params.redirect)
    ? params.redirect[0]
    : params.redirect;

  return <LoginPageClient redirect={redirect ?? "/"} />;
}
