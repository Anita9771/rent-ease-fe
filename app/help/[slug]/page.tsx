import { notFound } from "next/navigation";
import { HelpArticleLayout } from "@/components/help/help-article-layout";
import { getHelpArticle, helpArticleSlugs } from "@/lib/help-articles";

type PageProps = {
  params: { slug: string };
};

export function generateStaticParams() {
  return helpArticleSlugs.map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps) {
  const article = getHelpArticle(params.slug);
  if (!article) {
    return { title: "Help | RentEase" };
  }
  return {
    title: `${article.title} | RentEase Help`,
    description: article.summary,
  };
}

export default function HelpArticlePage({ params }: PageProps) {
  const article = getHelpArticle(params.slug);
  if (!article) {
    notFound();
  }
  return <HelpArticleLayout article={article} />;
}
