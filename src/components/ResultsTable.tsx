import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DEMO_LANG, type QueryHit } from "@/types/glossary";

type ResultsTableProps = {
  hits: QueryHit[];
  query: string;
  inverse?: boolean;
};

export function ResultsTable({ hits, query, inverse = false }: ResultsTableProps) {
  if (!query) {
    return null;
  }

  const direction = inverse
    ? `${DEMO_LANG} → English`
    : `English → ${DEMO_LANG}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Results</CardTitle>
        <CardDescription>
          {hits.length === 0
            ? `No matches for "${query}" (${direction}).`
            : `${hits.length} match${hits.length === 1 ? "" : "es"} for "${query}" (${direction}).`}
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {hits.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Confidence</TableHead>
                <TableHead>Mod</TableHead>
                <TableHead>Key</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Target</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hits.map((hit) => (
                <TableRow key={`${hit.mod_id}:${hit.key}:${hit.target}`}>
                  <TableCell>{hit.confidence.toFixed(2)}</TableCell>
                  <TableCell className="font-mono text-xs">{hit.mod_id}</TableCell>
                  <TableCell className="font-mono text-xs">{hit.key}</TableCell>
                  <TableCell>{hit.source}</TableCell>
                  <TableCell>{hit.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : null}
      </CardContent>
    </Card>
  );
}
