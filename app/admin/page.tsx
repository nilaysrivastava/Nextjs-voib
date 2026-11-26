import { isAdministrator } from "@/libs/access.cjs";
import { redirect } from "next/navigation";
import { getVerifiedUser } from "@/libs/server-user";
import Header from "@/components/Header";
import AdminSongs from "./AdminSongs";
export const dynamic = "force-dynamic";
export default async function Admin() {
  const { client, user } = await getVerifiedUser();
  if (!user || !isAdministrator(user)) redirect("/?admin=required");
  let query = client
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });
  if (user.app_metadata.demo) query = query.eq("is_demo", true);
  const { data } = await query;
  return (
    <div className="interior-page">
      <Header>
        <p className="eyebrow">VOIB ADMIN / THE COLLECTION STUDIO</p>
        <h1>
          Behind the <em>records.</em>
        </h1>
        <p className="page-description">
          {user.app_metadata.demo
            ? "A shared space to manage demo records. The main catalogue stays protected."
            : "Care for the collection. Give every record its place."}
        </p>
      </Header>
      <AdminSongs
        songs={(data || []).map((s) => ({ ...s, id: String(s.id) }))}
      />
    </div>
  );
}
