import { notFound } from "next/navigation";

// This will be expanded with real content per page
const pages: Record<string, { title: string; subtitle: string }> = {
  // Add your landing pages here
};

export default async function LandingPage({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const { page } = await params;
  const content = pages[page];

  if (!content) {
    notFound();
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-2xl">
        <h1 className="text-5xl font-bold tracking-tight mb-4">
          {content.title}
        </h1>
        <p className="text-lg text-gray-400">{content.subtitle}</p>
      </div>
    </main>
  );
}

export function generateStaticParams() {
  return Object.keys(pages).map((page) => ({ page }));
}
