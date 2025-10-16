import { redirect } from "next/navigation";

export default function MagazineRedirect({
  params,
}: {
  params: { name?: string };
}) {
  const name = (params?.name ?? "").toLowerCase();

  if (name.startsWith("espero")) {
    redirect(`/magazine/${name}`);
  } else {
    redirect("/");
  }
}
