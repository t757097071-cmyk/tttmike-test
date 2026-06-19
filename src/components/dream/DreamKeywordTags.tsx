interface DreamKeywordTagsProps {
  keywords: string[];
}

export function DreamKeywordTags({ keywords }: DreamKeywordTagsProps) {
  return (
    <div className="dream-keyword-tags" aria-label="梦境关键词">
      {keywords.map((keyword) => (
        <span key={keyword}>{keyword}</span>
      ))}
    </div>
  );
}
