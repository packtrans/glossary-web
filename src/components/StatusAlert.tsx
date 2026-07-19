import { AlertCircle, LoaderCircle } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { GlossaryStatus } from "@/types/glossary";

type StatusAlertProps = {
  status: GlossaryStatus;
  error: string | null;
};

export function StatusAlert({ status, error }: StatusAlertProps) {
  if (status === "loading-metadata") {
    return (
      <Alert>
        <LoaderCircle className="animate-spin" />
        <AlertTitle>Loading glossary metadata</AlertTitle>
      </Alert>
    );
  }

  if (status === "loading-index") {
    return (
      <Alert>
        <LoaderCircle className="animate-spin" />
        <AlertTitle>Loading glossary index</AlertTitle>
      </Alert>
    );
  }

  if (status === "loading-dictionary") {
    return (
      <Alert>
        <LoaderCircle className="animate-spin" />
        <AlertTitle>Loading tokenizer dictionary</AlertTitle>
      </Alert>
    );
  }

  if (status === "searching") {
    return (
      <Alert>
        <LoaderCircle className="animate-spin" />
        <AlertTitle>Searching</AlertTitle>
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
