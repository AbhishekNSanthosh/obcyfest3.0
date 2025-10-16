import { redirect } from "next/navigation";

export default async function MagazineRedirect({
  params,
}: {
  params: { name: string };
}) {
  const { name } = (await params) || { name: "" };

  if (name.startsWith("espero")) {
    redirect(`/magazine/${name}`);
  } else {
    redirect("/");
  }
}
