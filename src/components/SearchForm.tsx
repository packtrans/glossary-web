import { useState } from "react";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { DEMO_LANG } from "@/types/glossary";

type SearchFormProps = {
  disabled?: boolean;
  onSearch: (query: string, limit: number, inverse: boolean) => void | Promise<void>;
  onInverseChange?: (inverse: boolean) => void;
};

const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;
const FORWARD_EXAMPLE = "Cooking Pot";
const INVERSE_EXAMPLE = "厨锅";

function clampLimit(value: number): number {
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, value));
}

export function SearchForm({ disabled = false, onSearch, onInverseChange }: SearchFormProps) {
  const [inverse, setInverse] = useState(false);
  const [query, setQuery] = useState(FORWARD_EXAMPLE);
  const [limit, setLimit] = useState("10");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search glossary</CardTitle>
        <CardDescription>
          {inverse
            ? `Simplified Chinese (\`${DEMO_LANG}\`) text to English translations.`
            : `English source text to Simplified Chinese (\`${DEMO_LANG}\`) translations.`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            const parsedLimit = Number.parseInt(limit, 10);
            const boundedLimit = Number.isFinite(parsedLimit)
              ? clampLimit(parsedLimit)
              : DEFAULT_LIMIT;
            void onSearch(query, boundedLimit, inverse);
          }}
        >
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="size-4 rounded border border-input accent-primary"
              checked={inverse}
              disabled={disabled}
              onChange={(event) => {
                const nextInverse = event.target.checked;
                setInverse(nextInverse);
                setQuery(nextInverse ? INVERSE_EXAMPLE : FORWARD_EXAMPLE);
                onInverseChange?.(nextInverse);
              }}
            />
            Inverse query (search by target language)
          </label>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-2">
              <label className="text-sm font-medium" htmlFor="query">
                Query
              </label>
              <Input
                id="query"
                placeholder={inverse ? `Try "${INVERSE_EXAMPLE}"` : `Try "${FORWARD_EXAMPLE}"`}
                value={query}
                disabled={disabled}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="grid w-full gap-2 sm:w-28">
              <label className="text-sm font-medium" htmlFor="limit">
                Limit
              </label>
              <Input
                id="limit"
                type="number"
                inputMode="numeric"
                min={MIN_LIMIT}
                max={MAX_LIMIT}
                value={limit}
                disabled={disabled}
                onChange={(event) => setLimit(event.target.value)}
              />
            </div>
            <Button type="submit" disabled={disabled} className="sm:w-auto">
              <Search />
              Search
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
