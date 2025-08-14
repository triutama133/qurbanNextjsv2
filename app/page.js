import { redirect } from "next/navigation";

export default function RootRedirect() {
  redirect("/qurban/home");
  return null;
}
