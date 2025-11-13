// app/info/[slug]/page.jsx
import { pageContent } from "@/data/pageContent";

export default async function InfoPage({ params }) {
  const { slug } = await params;
  const data = pageContent[slug];

  if (!data) return <div>Page not found</div>;

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-[#691080]">{data.title}</h1>
      {data.sections.map((section, i) => (
        <div key={i} className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{section.heading}</h2>
          {section.content.split("\n").map((line, j) => (
            <p key={j} className="text-gray-700 mb-1">{line}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
