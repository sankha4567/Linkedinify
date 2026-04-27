import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function Markdown({ children }: { children: string }) {
  return (
    <div className="text-foreground/90 leading-relaxed text-[15px] break-words">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: (p) => <h1 className="text-xl font-bold mt-2 mb-2 text-foreground" {...p} />,
          h2: (p) => <h2 className="text-lg font-bold mt-2 mb-2 text-foreground" {...p} />,
          h3: (p) => <h3 className="text-base font-semibold mt-2 mb-1 text-foreground" {...p} />,
          p: (p) => <p className="mb-2 last:mb-0 whitespace-pre-wrap" {...p} />,
          a: ({ href, children, ...rest }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
              {...rest}
            >
              {children}
            </a>
          ),
          ul: (p) => <ul className="list-disc pl-5 mb-2 space-y-1" {...p} />,
          ol: (p) => <ol className="list-decimal pl-5 mb-2 space-y-1" {...p} />,
          li: (p) => <li className="leading-relaxed" {...p} />,
          strong: (p) => <strong className="font-semibold" {...p} />,
          em: (p) => <em className="italic" {...p} />,
          code: ({ className, children, ...rest }) => {
            const isInline = !className?.includes("language-");
            return isInline ? (
              <code className="bg-muted text-foreground px-1.5 py-0.5 rounded text-[0.85em] font-mono" {...rest}>
                {children}
              </code>
            ) : (
              <code className={className} {...rest}>
                {children}
              </code>
            );
          },
          pre: (p) => (
            <pre className="bg-muted border border-border p-3 rounded-lg overflow-x-auto text-sm font-mono mb-2" {...p} />
          ),
          blockquote: (p) => (
            <blockquote className="border-l-4 border-border pl-3 italic text-muted-foreground my-2" {...p} />
          ),
          hr: () => <hr className="my-3 border-border" />,
          table: (p) => <table className="w-full border-collapse my-2 text-sm" {...p} />,
          th: (p) => <th className="border border-border px-2 py-1 bg-muted text-left font-semibold" {...p} />,
          td: (p) => <td className="border border-border px-2 py-1" {...p} />,
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
