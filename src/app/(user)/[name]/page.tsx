import { redirect } from "next/navigation";

export default function MagazineRedirect({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const source = searchParams.source || "";

  if (source.includes("espero")) {
    redirect("/magazine");
  } else {
    redirect("/");
  }
}
