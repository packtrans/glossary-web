import { useRef, useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RELEASES_URL = "https://github.com/packtrans/glossary/releases";

type CodeBlockProps = {
  code: string;
  label?: string;
};

function CodeBlock({ code, label }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard may be unavailable (insecure context); ignore */
    }
  }

  return (
    <div className="flex flex-col gap-1">
      {label ? <span className="text-xs text-muted-foreground">{label}</span> : null}
      <div className="group relative">
        <pre className="overflow-x-auto rounded-md bg-muted p-3 pr-9 font-mono text-xs leading-relaxed text-foreground">
          <code>{code}</code>
        </pre>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          onClick={handleCopy}
          className="absolute right-1 top-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 aria-pressed:opacity-100"
          aria-label={copied ? "Copied" : "Copy to clipboard"}
          aria-pressed={copied}
          title={copied ? "Copied" : "Copy to clipboard"}
        >
          {copied ? <Check /> : <Copy />}
        </Button>
      </div>
    </div>
  );
}

export function CliApiReference() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Rust CLI &amp; HTTP API</CardTitle>
          <CardDescription>
            This app is designed for web query only. For batch or programmatic use, install the CLI.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            variant="outline"
            size="sm"
            className="w-fit"
            nativeButton={false}
            render={<a href={RELEASES_URL} target="_blank" rel="noreferrer" />}
          >
            <ExternalLink />
            Download pre-built binary
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>For AI agents</CardTitle>
          <CardDescription>
            Install the CLI as a skill so coding agents can query translations without manual setup.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <CodeBlock
            label="Install the skill (requires Node.js)"
            code={`npx skills add packtrans/glossary --skill packtrans-glossary-cli`}
          />
          <p className="text-xs text-muted-foreground">
            Once installed, agents can invoke{" "}
            <code className="font-mono">packtrans-glossary-cli</code> to look up translations on
            demand.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Query translations</CardTitle>
          <CardDescription>
            Release-managed indexes are downloaded on demand to the default data directory.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <CodeBlock
            label="Release-managed index"
            code={`packtrans-glossary query --lang zh_cn "Cooking Pot" --limit 20`}
          />
          <CodeBlock
            label="Local index built with the builder"
            code={`packtrans-glossary query --index-dir indexes --lang zh_cn "Cooking Pot" --limit 20`}
          />
          <CodeBlock
            label="Inverse query (search target text → return source)"
            code={`packtrans-glossary query --lang zh_cn "厨锅" --inverse`}
          />
          <CodeBlock
            label="Emit JSON (same shape as the HTTP API)"
            code={`packtrans-glossary query --lang zh_cn "Cooking Pot" --json`}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>HTTP API</CardTitle>
          <CardDescription>
            Ad-hoc local queries via the <code className="font-mono text-xs">serve</code>{" "}
            subcommand. Default bind <code className="font-mono text-xs">127.0.0.1:8080</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <CodeBlock code={"packtrans-glossary serve"} label="Default: release-managed indexes" />
          <CodeBlock
            code={"packtrans-glossary serve --host 0.0.0.0 --port 3000 --index-dir indexes"}
            label="Custom host/port with a local index root"
          />
          <CodeBlock
            label="GET /query"
            code={`curl 'http://127.0.0.1:8080/query?lang=zh_cn&q=Cooking+Pot&limit=20&inverse=false'`}
          />
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Parameter</th>
                  <th className="py-2 pr-4 font-medium">Required</th>
                  <th className="py-2 pr-4 font-medium">Default</th>
                  <th className="py-2 font-medium">Description</th>
                </tr>
              </thead>
              <tbody className="font-mono text-xs">
                <tr className="border-b">
                  <td className="py-2 pr-4">lang</td>
                  <td className="py-2 pr-4">yes</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 font-sans text-sm">Target language code (e.g. zh_cn)</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">q / query</td>
                  <td className="py-2 pr-4">yes</td>
                  <td className="py-2 pr-4">—</td>
                  <td className="py-2 font-sans text-sm">Search text</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">limit</td>
                  <td className="py-2 pr-4">no</td>
                  <td className="py-2 pr-4">10</td>
                  <td className="py-2 font-sans text-sm">Maximum results (max 50)</td>
                </tr>
                <tr>
                  <td className="py-2 pr-4">inverse</td>
                  <td className="py-2 pr-4">no</td>
                  <td className="py-2 pr-4">false</td>
                  <td className="py-2 font-sans text-sm">Search target text, return source</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted-foreground">
            Returns a JSON array of hits with <code className="font-mono">confidence</code>,{" "}
            <code className="font-mono">mod_id</code>, <code className="font-mono">key</code>,{" "}
            <code className="font-mono">source</code>,{" "}
            <code className="font-mono">source_lang</code>,{" "}
            <code className="font-mono">target_lang</code>, and{" "}
            <code className="font-mono">target</code>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
