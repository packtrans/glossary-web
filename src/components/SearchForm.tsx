import { Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { targetDictName } from "@/lib/glossaryMetadata";
import { type GlossaryLanguage, LANGUAGE_LABELS } from "@/types/glossary";

type SearchFormProps = {
  disabled?: boolean;
  lang: GlossaryLanguage;
  availableLanguages: GlossaryLanguage[];
  onLangChange: (lang: GlossaryLanguage) => void;
  onSearch: (query: string, limit: number, inverse: boolean) => void | Promise<void>;
  onInverseChange?: (inverse: boolean) => void;
};

const MIN_LIMIT = 1;
const MAX_LIMIT = 100;
const DEFAULT_LIMIT = 10;

const FORWARD_EXAMPLES: Record<GlossaryLanguage, string> = {
  ja_jp: "Cooking Pot",
  zh_cn: "Cooking Pot",
  zh_hk: "Cooking Pot",
  zh_tw: "Cooking Pot",
};

const INVERSE_EXAMPLES: Record<GlossaryLanguage, string> = {
  ja_jp: "調理鍋",
  zh_cn: "厨锅",
  zh_hk: "烹調鍋",
  zh_tw: "烹調鍋",
};

function clampLimit(value: number): number {
  return Math.min(MAX_LIMIT, Math.max(MIN_LIMIT, value));
}

export function SearchForm({
  disabled = false,
  lang,
  availableLanguages,
  onLangChange,
  onSearch,
  onInverseChange,
}: SearchFormProps) {
  const [inverse, setInverse] = useState(false);
  const [query, setQuery] = useState(FORWARD_EXAMPLES[lang]);
  const [limit, setLimit] = useState("10");
  const supportsInverse = targetDictName(lang) !== null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Search glossary</CardTitle>
        <CardDescription>
          {inverse
            ? `${LANGUAGE_LABELS[lang]} (${lang}) text to English translations.`
            : `English source text to ${LANGUAGE_LABELS[lang]} (${lang}) translations.`}
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
          <div className="grid gap-2 sm:max-w-xs">
            <Label htmlFor="lang">Target language</Label>
            <Select
              value={lang}
              disabled={disabled}
              onValueChange={(nextLang) => {
                const next = nextLang as GlossaryLanguage;
                onLangChange(next);
                setQuery(inverse ? INVERSE_EXAMPLES[next] : FORWARD_EXAMPLES[next]);
                if (!targetDictName(next) && inverse) {
                  setInverse(false);
                  onInverseChange?.(false);
                }
              }}
            >
              <SelectTrigger id="lang" type="button" className="w-full">
                <SelectValue>{`${LANGUAGE_LABELS[lang]} (${lang})`}</SelectValue>
              </SelectTrigger>
              <SelectContent>
                {availableLanguages.map((code) => (
                  <SelectItem key={code} value={code}>
                    {`${LANGUAGE_LABELS[code]} (${code})`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {supportsInverse ? (
            <Label htmlFor="inverse" className="font-normal">
              <Checkbox
                id="inverse"
                checked={inverse}
                disabled={disabled}
                onCheckedChange={(next) => {
                  setInverse(next);
                  setQuery(next ? INVERSE_EXAMPLES[lang] : FORWARD_EXAMPLES[lang]);
                  onInverseChange?.(next);
                }}
              />
              Inverse query (search by target language)
            </Label>
          ) : null}

          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="query">Query</Label>
              <Input
                id="query"
                placeholder={
                  inverse ? `Try "${INVERSE_EXAMPLES[lang]}"` : `Try "${FORWARD_EXAMPLES[lang]}"`
                }
                value={query}
                disabled={disabled}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="grid w-full gap-2 sm:w-28">
              <Label htmlFor="limit">Limit</Label>
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
