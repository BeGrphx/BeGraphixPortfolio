import { getTranslations } from "next-intl/server";
import { FadeIn } from "@/components/FadeIn";
import { KeywordGrid } from "@/components/KeywordGrid";

interface HomeIntroProps {
  showIntro?: boolean;
  className?: string;
}

export async function HomeIntro({
  showIntro = true,
  className = "",
}: HomeIntroProps) {
  const t = await getTranslations("home");
  const keywordColumns = t.raw("keywordColumns") as string[][];

  return (
    <div className={className}>
      {showIntro && (
        <FadeIn>
          <p className="max-w-3xl text-[15px] leading-relaxed text-white/85 sm:text-base md:text-lg md:leading-relaxed">
            {t("intro")}
          </p>
        </FadeIn>
      )}
      <FadeIn delay={showIntro ? 0.1 : 0}>
        <blockquote className="font-mono mt-10 max-w-2xl text-[13px] italic leading-relaxed text-white/70 sm:mt-12 sm:text-sm">
          &ldquo;{t("quote")}&rdquo;
        </blockquote>
      </FadeIn>
      <FadeIn delay={showIntro ? 0.2 : 0.1}>
        <KeywordGrid columns={keywordColumns} className="mt-10 sm:mt-12" />
      </FadeIn>
    </div>
  );
}
