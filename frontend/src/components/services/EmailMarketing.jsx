import PageHero from "../page/PageHero";

export default function EmailMarketing() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Email Marketing"
        description="Automated and engaging email journeys that nurture leads into loyal customers."
      />
      <section className="bg-[#f7faf9] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-[#0C2C50]">
            Stay relevant from first click to repeat sale.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            We create targeted email content and automated journeys that keep
            your audience engaged.
          </p>
        </div>
      </section>
    </>
  );
}
