import PageHero from "../page/PageHero";

export default function WhatsAppMarketing() {
  return (
    <>
      <PageHero
        eyebrow="Our services"
        title="WhatsApp Marketing"
        description="Helpful customer conversations and campaigns delivered directly through WhatsApp."
      />
      <section className="bg-[#f7faf9] px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-[#0C2C50]">
            Meet customers in a channel they trust.
          </h2>
          <p className="mt-5 max-w-2xl leading-7 text-slate-600">
            We help businesses create timely, helpful WhatsApp campaigns and
            customer journeys.
          </p>
        </div>
      </section>
    </>
  );
}
