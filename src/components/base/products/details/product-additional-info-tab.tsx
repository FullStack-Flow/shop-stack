import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

interface ProductAdditionalInfoTabProps {
  specifications: Record<string, string>;
}

export default function ProductAdditionalInfoTab({
  specifications,
}: ProductAdditionalInfoTabProps) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableBody>
          {Object.entries(specifications).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="w-1/3 bg-muted/30 font-medium text-muted-foreground">
                {key}
              </TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
