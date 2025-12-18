export default function ProductDescriptionTab({
  description,
}: {
  description: string;
}) {
  return (
    <div
      className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground"
      dangerouslySetInnerHTML={{ __html: description }}
    />
  );
}
