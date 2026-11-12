import { redirect } from "next/navigation";

// Retired separate builder in favor of Peach Match AI on Peach Home (/business)
export default function NewProjectPage() {
  redirect("/business");
}
