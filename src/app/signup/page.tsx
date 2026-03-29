import SignupPageClient from "./SignupPageClient";

type SignupPageProps = {
  searchParams: Promise<{
    redirect?: string;
  }>;
};

export default async function SignupPage({ searchParams }: SignupPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirect = resolvedSearchParams.redirect ?? "/";

  return <SignupPageClient redirect={redirect} />;
}
