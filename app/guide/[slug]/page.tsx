import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGuide, GUIDE_SLUGS } from "@/lib/content/guides";

type Params = Promise<{ slug: string }>;

export function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(decodeURIComponent(slug));
  if (!guide) return { title: "가이드" };
  return {
    title: guide.metaTitle,
    description: guide.description,
    openGraph: { title: guide.metaTitle, description: guide.description },
  };
}

export default async function GuidePage({ params }: { params: Params }) {
  const { slug } = await params;
  const guide = getGuide(decodeURIComponent(slug));
  if (!guide) notFound();

  return (
    <main className="mx-auto w-full max-w-md px-5 py-8">
      <nav className="text-ink-faint mb-5 text-sm">
        <Link href="/guide" className="hover:text-pop-deep">
          가이드
        </Link>
        <span className="mx-1.5">›</span>
        <span>{guide.keyword}</span>
      </nav>

      <header className="mb-6">
        <div className="bg-pop/10 mb-3 inline-flex size-12 items-center justify-center rounded-2xl text-2xl">
          {guide.emoji}
        </div>
        <h1 className="text-ink text-[26px] font-black leading-snug">{guide.title}</h1>
      </header>

      <p className="text-ink-soft mb-7 text-[15px] leading-relaxed">{guide.lead}</p>

      <Link
        href="/"
        className="bg-pop hover:bg-pop-deep shadow-popsm mb-8 block w-full rounded-xl py-4 text-center text-lg font-bold text-white transition"
      >
        4문항 30초, 내 유형 확인하기 →
      </Link>

      <article className="space-y-6">
        {guide.sections.map((s) => (
          <section key={s.h}>
            <h2 className="text-ink mb-2 text-lg font-bold">{s.h}</h2>
            <p className="text-ink-soft text-[15px] leading-relaxed">{s.p}</p>
          </section>
        ))}
      </article>

      <section className="mt-9">
        <h2 className="text-ink mb-3 text-lg font-bold">자주 묻는 질문</h2>
        <div className="space-y-3">
          {guide.faq.map((f) => (
            <div key={f.q} className="border-cream-deep bg-cream-soft rounded-2xl border p-4">
              <p className="text-ink mb-1.5 text-[15px] font-semibold">Q. {f.q}</p>
              <p className="text-ink-soft text-sm leading-relaxed">A. {f.a}</p>
            </div>
          ))}
        </div>
      </section>

      <Link
        href="/"
        className="bg-pop hover:bg-pop-deep shadow-popsm mt-9 block w-full rounded-xl py-4 text-center text-lg font-bold text-white transition"
      >
        지금 내 유형 확인하기 →
      </Link>

      <p className="text-ink-faint mt-6 text-center text-xs leading-relaxed">
        타입컷은 재미로 보는 성향 테스트예요. 심리검사가 아니며, 성향 코드는 재미용 유형입니다.
      </p>
    </main>
  );
}
