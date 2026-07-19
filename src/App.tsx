import { Github } from "lucide-react";
import { CliApiReference } from "@/components/CliApiReference";
import { ModeToggle } from "@/components/ModeToggle";
import { ResultsTable } from "@/components/ResultsTable";
import { StatusAlert } from "@/components/StatusAlert";
import { SearchForm } from "@/components/SearchForm";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGlossarySearch } from "@/hooks/useGlossarySearch";

const REPO_URL = "https://github.com/packtrans/glossary";

export default function App() {
  const {
    status,
    error,
    hits,
    lastQuery,
    lang,
    availableLanguages,
    setLang,
    setInverseEnabled,
    search,
  } = useGlossarySearch();
  const busy =
    status === "loading-metadata" ||
    status === "loading-index" ||
    status === "loading-dictionary" ||
    status === "searching";

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-6 px-4 py-10">
      <header className="flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold tracking-tight">PackTrans Glossary</h1>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            nativeButton={false}
            render={<a href={REPO_URL} target="_blank" rel="noreferrer" />}
            aria-label="View source on GitHub"
            title="View source on GitHub"
          >
            <Github />
          </Button>
          <ModeToggle />
        </div>
      </header>

      <Tabs defaultValue="search">
        <TabsList>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="cli-api">Skills / CLI / API</TabsTrigger>
        </TabsList>
        <TabsContent value="search" className="flex flex-col gap-6">
          <StatusAlert status={status} error={error} />
          <SearchForm
            disabled={busy || status === "error"}
            lang={lang}
            availableLanguages={availableLanguages}
            onLangChange={setLang}
            onSearch={search}
            onInverseChange={setInverseEnabled}
          />
          <ResultsTable hits={hits} query={lastQuery} />
        </TabsContent>
        <TabsContent value="cli-api">
          <CliApiReference />
        </TabsContent>
      </Tabs>
    </div>
  );
}
