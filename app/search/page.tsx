import getSongsByTitle from "@/actions/getSongsByTitle";
import Header from "@/components/Header";
import SearchInput from "@/components/SearchInput";
import TrackList from "@/components/TrackList";
export const revalidate = 0;
export default async function Search({
  searchParams,
}: {
  searchParams: Promise<{ title?: string }>;
}) {
  const title = (await searchParams).title || "",
    songs = await getSongsByTitle(title);
  return (
    <div className="interior-page">
      <Header>
        <p className="eyebrow">EXPLORE THE COLLECTION</p>
        <h1>
          Follow your <em>curiosity.</em>
        </h1>
        <p className="page-description">
          A familiar favourite. A new discovery. Start with a title.
        </p>
      </Header>
      <div className="search-section">
        <SearchInput initialValue={title} />
        <div className="results-heading">
          <p className="eyebrow">
            {title ? "RESULTS FOR “" + title + "”" : "ALL RECORDS"}
          </p>
          <span>
            {songs.length} {songs.length === 1 ? "record" : "records"}
          </span>
        </div>
        <TrackList
          songs={songs}
          emptyTitle="A little further afield."
          emptyText="We could not find that title. Try a different search."
        />
      </div>
    </div>
  );
}
