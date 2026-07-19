import { AlertCircle, LoaderCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { LANGUAGE_LABELS, type GlossaryLanguage, type GlossaryStatus } from "@/types/glossary";

type StatusAlertProps = {
  status: GlossaryStatus;
  error: string | null;
  lang: GlossaryLanguage;
};

export function StatusAlert({ status, error, lang }: StatusAlertProps) {
  if (status === "loading-metadata") {
    return (
      <Alert>
        <LoaderCircle className="animate-spin" />
        <AlertTitle>Loading glossary metadata</AlertTitle>
        <AlertDescription>
          Fetching index versions and language availability from the CDN.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "loading-index") {
    return (
      <Alert>
        <LoaderCircle className="animate-spin" />
        <AlertTitle>Loading glossary index</AlertTitle>
        <AlertDescription>
          Downloading the `{lang}` ({LANGUAGE_LABELS[lang]}) glossary index into WebAssembly
          memory.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "loading-dictionary") {
    return (
      <Alert>
        <LoaderCircle className="animate-spin" />
        <AlertTitle>Loading tokenizer dictionary</AlertTitle>
        <AlertDescription>
          Downloading the Lindera dictionary for inverse `{lang}` queries from the CDN.
        </AlertDescription>
      </Alert>
    );
  }

  if (status === "searching") {
    return (
      <Alert>
        <LoaderCircle className="animate-spin" />
        <AlertTitle>Searching</AlertTitle>
        <AlertDescription>Running the query in the WASM module.</AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return null;
}
