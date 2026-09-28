import PageHero from "../page/PageHero";

export default function GoogleAds() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="Google Ads"
        description="High-intent paid search campaigns managed for efficient lead generation and growth."
      />
      <section className="bg-[#f7faf9] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-[#0C2C50]">
            Turn search intent into action.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            Our campaigns put your offer in front of high-intent customers while
            keeping spend focused.
          </p>
        </div>
      </section>
    </>
  );
}
