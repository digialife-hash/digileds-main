import PageHero from "../page/PageHero";

export default function GoogleSEO() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Google SEO"
        description="Sustainable search visibility with technical SEO, useful content and data-led optimization."
      />
      <section className="bg-[#f7faf9] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-[#0C2C50]">
            Be found by the right audience.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            Our SEO work improves technical health, content quality and search
            visibility over time.
          </p>
        </div>
      </section>
    </>
  );
}
