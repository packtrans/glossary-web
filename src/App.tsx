import { ResultsTable } from "@/components/ResultsTable";
import { SearchForm } from "@/components/SearchForm";
import { StatusAlert } from "@/components/StatusAlert";
import { useGlossarySearch } from "@/hooks/useGlossarySearch";

export default function App() {
  const { status, error, hits, lastQuery, lastInverse, search, prefetchInverse } =
    useGlossarySearch();
  const busy =
    status === "loading-index" || status === "loading-dictionary" || status === "searching";

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">PackTrans Glossary</h1>
      </header>

      <StatusAlert status={status} error={error} />
      <SearchForm
        disabled={busy || status === "error"}
        onSearch={search}
        onInverseChange={(inverse) => {
          if (inverse) {
            prefetchInverse();
          }
        }}
      />
      <ResultsTable hits={hits} query={lastQuery} inverse={lastInverse} />
    </div>
  );
}
