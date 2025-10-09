import Magazine from "@widgets/flipbook/Magazine";

type RegisterPageProps = {
  params: Promise<{ name: string }>;
};

export default async function RegisterPage({ params }: RegisterPageProps) {
  const { name } = await params;

  if (!name) {
    return <div>Book not found</div>;
  }

  // ✅ Pass data into Client Component
  return <Magazine name={name} />;
}
