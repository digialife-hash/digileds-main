import React from "react";
import Button from "../ui/Button";
import {
  ArrowRight,
  Search,
  Megaphone,
  BarChart3,
  Target,
  TrendingUp,
  Users,
  Globe,
  MousePointerClick,
  LineChart,
  CheckCircle2,
  Sparkles,
  Eye,
  RefreshCw,
  Smartphone,
  MessageCircle,
  FileText,
  Layers,
  Activity,
  ChevronRight,
  Mail,
  Video,
  ShoppingCart,
  MapPin,
  Star,
  Bot,
  Share2,
  Database,
  SlidersHorizontal,
  Heart,
  Send,
  Store,
  Award,
  Link2,
  Settings2,
} from "lucide-react";

/* =========================================================
   COLORS
========================================================= */

const NAVY = "#0C2C50";
const GREEN = "#2E9E6D";
const GREEN_LIGHT = "#4CBB8E";
const MIST = "#F7FAF9";

/* =========================================================
   MAIN DIGITAL MARKETING SERVICES
========================================================= */

const services = [
  {
    number: "01",
    title: "Search Engine Optimization",
    short: "SEO",
    image: "/uploads/Search_Engine_Optimization.jpg",
    description:
      "Build long-term organic visibility and attract high-intent customers through a complete search engine optimization strategy.",
    points: [
      "Technical SEO",
      "On-Page SEO",
      "Off-Page SEO",
      "Local SEO",
      "E-commerce SEO",
      "Keyword Research",
    ],
  },
  {
    number: "02",
    title: "Google Ads & PPC",
    short: "GOOGLE ADS",
    image: "/uploads/Advertising.jpg",
    description:
      "Reach customers at the exact moment they are searching for your products or services with performance-focused paid campaigns.",
    points: [
      "Search Ads",
      "Display Ads",
      "Shopping Ads",
      "YouTube Ads",
      "Remarketing",
      "PPC Optimization",
    ],
  },
  {
    number: "03",
    title: "Meta Ads",
    short: "META ADS",
    image: "/uploads/Social_Media_Marketing.jpg",
    description:
      "Generate awareness, leads and sales through highly targeted Facebook and Instagram advertising campaigns.",
    points: [
      "Facebook Ads",
      "Instagram Ads",
      "Lead Campaigns",
      "Conversion Ads",
      "Retargeting",
      "Creative Testing",
    ],
  },
  {
    number: "04",
    title: "Social Media Marketing",
    short: "SOCIAL",
    image: "/uploads/social.jpg",
    description:
      "Build a recognizable social presence with strategic content, campaigns, community engagement and consistent brand communication.",
    points: [
      "Social Strategy",
      "Content Calendar",
      "Campaign Management",
      "Audience Growth",
      "Community Building",
      "Engagement",
    ],
  },
  {
    number: "05",
    title: "Social Media Management",
    short: "MANAGEMENT",
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=85",
    description:
      "Manage your complete social media presence from content planning and publishing to comments, messages and performance reporting.",
    points: [
      "Page Management",
      "Post Scheduling",
      "Content Publishing",
      "Comments",
      "DM Management",
      "Reporting",
    ],
  },
  {
    number: "06",
    title: "WhatsApp Marketing",
    short: "WHATSAPP",
    image:
      "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&q=85",
    description:
      "Connect directly with customers using WhatsApp campaigns, business communication, broadcasts and automated customer journeys.",
    points: [
      "WhatsApp Campaigns",
      "Broadcast Marketing",
      "Automation",
      "Lead Follow-up",
      "Customer Support",
      "Promotions",
    ],
  },
  {
    number: "07",
    title: "Email Marketing",
    short: "EMAIL",
    image: "/uploads/EmailMarketing.jpg",
    description:
      "Turn subscribers and leads into customers through personalized campaigns, automated sequences and retention-focused communication.",
    points: [
      "Email Campaigns",
      "Automation",
      "Newsletters",
      "Lead Nurturing",
      "Drip Campaigns",
      "Retention",
    ],
  },
  {
    number: "08",
    title: "Content Marketing",
    short: "CONTENT",
    image: "/uploads/ContentMarketing.jpg",
    description:
      "Create useful and persuasive content that builds authority, supports SEO and helps customers make buying decisions.",
    points: [
      "Blog Content",
      "Website Copy",
      "SEO Content",
      "Copywriting",
      "Content Strategy",
      "Distribution",
    ],
  },
  {
    number: "09",
    title: "Video Marketing",
    short: "VIDEO",
    image:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=1200&q=85",
    description:
      "Use short-form and long-form video content to increase attention, engagement, brand recall and conversions.",
    points: [
      "Short Videos",
      "Reels",
      "YouTube",
      "Product Videos",
      "Video Ads",
      "Creative Strategy",
    ],
  },
];

/* =========================================================
   EXTENDED SERVICES
========================================================= */

const additionalServices = [
  {
    icon: MapPin,
    title: "Local SEO",
    text: "Improve local visibility and help nearby customers discover your business through search and maps.",
    image:
      "https://images.unsplash.com/photo-1524666041070-9cffc5a3e1e7?w=900&q=85",
  },
  {
    icon: Globe,
    title: "Google Business Profile",
    text: "Optimize your business profile, local presence, reviews and customer discovery.",
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=900&q=85",
  },
  {
    icon: Smartphone,
    title: "SMS Marketing",
    text: "Reach customers directly with promotional messages, alerts, reminders and customer campaigns.",
    image:
      "https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=900&q=85",
  },
  {
    icon: Send,
    title: "Push Notification Marketing",
    text: "Bring users back to your website or application with timely and personalized notifications.",
    image:
      "https://images.unsplash.com/photo-1607252650355-f7fd0460ccdb?w=900&q=85",
  },
  {
    icon: RefreshCw,
    title: "Remarketing & Retargeting",
    text: "Reconnect with users who already interacted with your brand and bring them back to convert.",
    image:
      "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=900&q=85",
  },
  {
    icon: MessageCircle,
    title: "Online Reputation Management",
    text: "Build trust through reviews, customer communication, reputation monitoring and brand protection.",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?w=900&q=85",
  },
  {
    icon: Video,
    title: "Influencer Marketing",
    text: "Partner with relevant creators and influencers to reach niche audiences authentically.",
    image:
      "https://images.unsplash.com/photo-1536240478700-b869070f9279?w=900&q=85",
  },
  {
    icon: Link2,
    title: "Affiliate Marketing",
    text: "Build performance-based partnerships that help generate sales, leads and new customers.",
    image:
      "https://images.unsplash.com/photo-1556740749-887f6717d7e4?w=900&q=85",
  },
  {
    icon: Bot,
    title: "Marketing Automation",
    text: "Automate repetitive marketing activities and create smarter customer journeys.",
    image:
      "https://images.unsplash.com/photo-1552664730-d307ca884978?w=900&q=85",
  },
  {
    icon: Database,
    title: "CRM & Lead Nurturing",
    text: "Organize customer data, follow up with leads and build long-term customer relationships.",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=85",
  },
  {
    icon: ShoppingCart,
    title: "Marketplace Marketing",
    text: "Promote products across online marketplaces and improve product discovery and sales.",
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=900&q=85",
  },
  {
    icon: Star,
    title: "Referral Marketing",
    text: "Turn happy customers into brand advocates through structured referral campaigns.",
    image:
      "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=900&q=85",
  },
  {
    icon: Award,
    title: "Brand Strategy",
    text: "Build a clear digital brand identity, positioning and communication strategy.",
    image:
      "https://images.unsplash.com/photo-1559028012-481c04fa702d?w=900&q=85",
  },
  {
    icon: Users,
    title: "Community Marketing",
    text: "Create stronger customer communities through conversations, engagement and valuable experiences.",
    image:
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=900&q=85",
  },
  {
    icon: Target,
    title: "Competitor Research",
    text: "Understand competitors, their channels, content, keywords and opportunities to gain an advantage.",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=85",
  },
  {
    icon: SlidersHorizontal,
    title: "Landing Page Design",
    text: "Create campaign-focused landing pages designed around trust, clarity and conversions.",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=900&q=85",
  },
];

/* =========================================================
   HERO
========================================================= */

function HeroSection() {
  return (
    <section
      className="
        relative overflow-hidden
        bg-[#EAF5F6]
        px-6 pb-20 pt-12
        transition-colors duration-300
        dark:bg-[#06151D]
        sm:px-10
        lg:px-14 lg:pb-28 lg:pt-32
      "
    >
      <div
        className="
          pointer-events-none absolute
          -right-32 -top-32
          h-[450px] w-[450px]
          rounded-full blur-3xl
          bg-[#2E9E6D]/10
          dark:bg-emerald-400/[0.05]
        "
      />

      <div
        className="
          pointer-events-none absolute
          -bottom-32 -left-32
          h-[380px] w-[380px]
          rounded-full blur-3xl
          bg-[#0C2C50]/5
          dark:bg-sky-400/[0.04]
        "
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2">
        <div>
          <h1
            className="
              max-w-2xl text-4xl font-black
              leading-[1.03] tracking-tight
              text-[#0C2C50]
              dark:text-slate-100
              sm:text-5xl
              lg:text-[62px]
            "
          >
            Turn your digital presence into
            <br />
            <span
              className="
                text-[#2E9E6D]
                dark:text-emerald-400
              "
            >
              real business growth.
            </span>
          </h1>

          <p
            className="
              mt-7 max-w-xl
              text-base leading-8
              text-slate-600
              dark:text-slate-400
              sm:text-lg
            "
          >
            From SEO and Google Ads to social media, WhatsApp, content,
            automation and analytics — we connect every digital channel into one
            growth-focused marketing system.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button
              as="a"
              variant="unstyled"
              href="/quote"
              className="
                inline-flex items-center gap-2
                rounded-xl px-6 py-3.5
                text-sm font-bold text-white
                shadow-xl
                transition-all duration-300
                hover:-translate-y-1
              "
              style={{
                background: GREEN,
                boxShadow: `0 18px 40px ${GREEN}35`,
              }}
            >
              Start growing
              <ArrowRight size={17} />
            </Button>

            <Button
              as="a"
              variant="unstyled"
              href="#services"
              className="
                inline-flex items-center gap-2
                rounded-xl border
                border-slate-200
                bg-white px-6 py-3.5
                text-sm font-bold
                text-[#0C2C50]
                transition-all duration-300
                hover:-translate-y-0.5
                dark:border-slate-700
                dark:bg-slate-900
                dark:text-slate-200
                dark:hover:border-emerald-500
              "
            >
              Explore services
              <ChevronRight size={16} />
            </Button>
          </div>

          <div className="mt-9 flex flex-wrap gap-x-5 gap-y-3">
            {[
              "SEO",
              "Google Ads",
              "Meta Ads",
              "Social Media",
              "WhatsApp",
              "Email",
            ].map((item) => (
              <span
                key={item}
                className="
                  flex items-center gap-2
                  text-xs font-semibold
                  text-slate-500
                  dark:text-slate-400
                "
              >
                <CheckCircle2
                  size={14}
                  className="text-[#2E9E6D] dark:text-emerald-400"
                />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* HERO IMAGE */}
        <div className="relative mx-auto w-full max-w-xl">
          <div
            className="
              pointer-events-none absolute inset-5
              rounded-[3rem] blur-3xl
              bg-[#2E9E6D]/10
              dark:bg-emerald-400/[0.04]
            "
          />

          <div
            className="
              relative overflow-hidden
              rounded-[2rem] border
              border-white/80
              bg-white p-3 shadow-2xl
              transition-colors duration-300
              dark:border-slate-700
              dark:bg-slate-900
              sm:p-5
            "
          >
            <div className="relative overflow-hidden rounded-[1.5rem]">
              <img
                src="/uploads/social.jpg"
                alt="Digital marketing campaign"
                className="h-[330px] w-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/85 via-[#0C2C50]/10 to-transparent" />

              <div className="absolute bottom-5 left-5 right-5">
                <div className="flex items-end justify-between gap-5">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
                      Digital growth ecosystem
                    </p>

                    <h3 className="mt-1 text-xl font-black text-white">
                      Every channel working together.
                    </h3>
                  </div>

                  <div
                    className="
                      flex h-11 w-11
                      flex-shrink-0 items-center
                      justify-center rounded-xl
                    "
                    style={{ background: GREEN }}
                  >
                    <TrendingUp size={20} color="white" />
                  </div>
                </div>
              </div>
            </div>

            {/* CHANNELS */}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div
                className="
                  rounded-xl
                  bg-[#F7FAF9] p-3
                  dark:bg-slate-800
                "
              >
                <Search
                  size={15}
                  className="text-[#2E9E6D] dark:text-emerald-400"
                />

                <p
                  className="
                    mt-2 text-sm font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  Search
                </p>

                <p className="text-[9px] text-slate-400">SEO + PPC</p>
              </div>

              <div
                className="
                  rounded-xl
                  bg-[#F7FAF9] p-3
                  dark:bg-slate-800
                "
              >
                <Share2
                  size={15}
                  className="text-[#2E9E6D] dark:text-emerald-400"
                />

                <p
                  className="
                    mt-2 text-sm font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  Social
                </p>

                <p className="text-[9px] text-slate-400">Meta + Content</p>
              </div>

              <div
                className="
                  rounded-xl
                  bg-[#F7FAF9] p-3
                  dark:bg-slate-800
                "
              >
                <BarChart3
                  size={15}
                  className="text-[#2E9E6D] dark:text-emerald-400"
                />

                <p
                  className="
                    mt-2 text-sm font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  Analytics
                </p>

                <p className="text-[9px] text-slate-400">Data + CRO</p>
              </div>
            </div>
          </div>

          <div
            className="
              absolute -bottom-5 -left-4 hidden
              rounded-2xl border
              border-white
              bg-white
              px-4 py-3
              shadow-xl
              transition-colors duration-300
              dark:border-slate-700
              dark:bg-slate-900
              sm:block
              md:-left-8
            "
          >
            <div className="flex items-center gap-3">
              <div
                className="
                  flex h-9 w-9
                  items-center justify-center
                  rounded-xl
                  bg-emerald-500/10
                  dark:bg-emerald-400/10
                "
              >
                <TrendingUp
                  size={17}
                  className="text-[#2E9E6D] dark:text-emerald-400"
                />
              </div>

              <div>
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                  Growth system
                </p>

                <p
                  className="
                    mt-0.5 text-sm font-black
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  Strategy • Data • Scale
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CHANNEL STRIP
========================================================= */

function ChannelStrip() {
  const channels = [
    {
      icon: Search,
      title: "Search",
      text: "SEO & PPC",
    },
    {
      icon: Megaphone,
      title: "Advertising",
      text: "Google & Meta",
    },
    {
      icon: Share2,
      title: "Social",
      text: "Content & Community",
    },
    {
      icon: MessageCircle,
      title: "Messaging",
      text: "WhatsApp & SMS",
    },
    {
      icon: Mail,
      title: "Retention",
      text: "Email & Automation",
    },
    {
      icon: BarChart3,
      title: "Analytics",
      text: "Tracking & CRO",
    },
  ];

  return (
    <section
      className="
        bg-white px-6 py-10
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10 lg:px-14
      "
    >
      <div
        className="
          mx-auto grid max-w-6xl
          grid-cols-2 overflow-hidden
          rounded-3xl border
          border-slate-200
          bg-[#F7FAF9]
          dark:border-slate-800
          dark:bg-slate-900
          sm:grid-cols-3
          lg:grid-cols-6
        "
      >
        {channels.map((item, index) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className={`
                p-5 transition-colors
                hover:bg-white
                dark:hover:bg-slate-800
                ${
                  index < 4
                    ? "border-b border-slate-200 dark:border-slate-800"
                    : ""
                }
                lg:border-b-0
                lg:border-r
                lg:border-slate-200
                lg:dark:border-slate-800
                lg:last:border-r-0
              `}
            >
              <Icon
                size={18}
                className="text-[#2E9E6D] dark:text-emerald-400"
              />

              <p
                className="
                  mt-3 text-sm font-black
                  text-[#0C2C50]
                  dark:text-slate-100
                "
              >
                {item.title}
              </p>

              <p className="mt-1 text-[10px] text-slate-400 dark:text-slate-500">
                {item.text}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* =========================================================
   INTRO
========================================================= */

function IntroSection() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="relative order-2 lg:order-1">
          <div
            className="
              pointer-events-none absolute
              -bottom-6 -left-6
              h-32 w-32 rounded-3xl
              bg-emerald-500/10
              dark:bg-emerald-400/[0.04]
            "
          />

          <div className="relative overflow-hidden rounded-[2rem] shadow-xl">
            <img
              src="/uploads/a.jpg"
              alt="Digital marketing strategy meeting"
              className="h-[430px] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/75 via-transparent to-transparent" />

            <div className="absolute bottom-5 left-5 right-5 rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-xl">
              <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
                The objective
              </p>

              <p className="mt-1 text-lg font-bold text-white">
                Visibility → Trust → Leads → Sales → Retention
              </p>
            </div>
          </div>
        </div>

        <div className="order-1 lg:order-2">

          <h2
            className="
              mt-4 max-w-2xl
              !text-3xl !font-bold
              leading-tight
              text-[#0C2C50]
              dark:text-slate-100
              sm:text-4xl
            "
          >
            Digital marketing is more than just posting on social media.
          </h2>

          <p
            className="
              mt-6 leading-8
              text-slate-600
              dark:text-slate-400
            "
          >
            A successful digital strategy connects search, advertising, social
            media, content, messaging, customer retention, analytics and
            conversion optimization.
          </p>

          <p
            className="
              mt-4 leading-8
              text-slate-500
              dark:text-slate-400
            "
          >
            Instead of treating every channel separately, we create a connected
            marketing ecosystem where every activity supports the next step in
            the customer journey.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {[
              "Increase brand visibility",
              "Generate qualified leads",
              "Improve search rankings",
              "Increase conversions",
              "Build customer relationships",
              "Reduce wasted marketing spend",
              "Improve retention",
              "Measure real business outcomes",
            ].map((item) => (
              <div
                key={item}
                className="
                  flex items-center gap-3
                  rounded-xl border
                  border-slate-100
                  bg-[#F7FAF9]
                  px-4 py-3
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <CheckCircle2
                  size={16}
                  className="text-[#2E9E6D] dark:text-emerald-400"
                />

                <span
                  className="
                    text-sm font-semibold
                    text-[#0C2C50]
                    dark:text-slate-200
                  "
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SERVICES
========================================================= */

function ServicesSection() {
  return (
    <section
      id="services"
      className="
        bg-[#F7FAF9] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-14 flex flex-wrap items-end justify-between gap-8">
          <div className="max-w-2xl">

            <h2
              className="
                mt-4 !text-4xl !font-bold
                tracking-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-4xl
              "
            >
              Everything you need to grow online.
            </h2>

            <p
              className="
                mt-5 max-w-xl text-[15px]
                leading-7
                text-slate-500
                dark:text-slate-400
              "
            >
              From discovery and traffic generation to conversion and retention,
              our core services cover the most important digital marketing
              channels.
            </p>
          </div>

          <div
            className="
              hidden items-center gap-2
              rounded-full border
              border-slate-200
              bg-white
              px-4 py-2
              dark:border-slate-700
              dark:bg-slate-900
              sm:flex
            "
          >
            <Activity
              size={14}
              className="text-[#2E9E6D] dark:text-emerald-400"
            />

            <span
              className="
                text-xs font-bold
                text-slate-500
                dark:text-slate-400
              "
            >
              Full-service marketing
            </span>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <div
              key={service.title}
              className="
                group overflow-hidden
                rounded-2xl border
                border-slate-200
                bg-white
                transition-all duration-300
                hover:-translate-y-1
                hover:shadow-[0_25px_55px_-25px_rgba(12,44,80,0.28)]
                dark:border-slate-800
                dark:bg-slate-900
                dark:hover:shadow-[0_25px_55px_-25px_rgba(0,0,0,0.65)]
              "
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="
                    h-full w-full object-cover
                    transition duration-700
                    group-hover:scale-105
                  "
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/85 via-[#0C2C50]/10 to-transparent" />

                <span className="absolute right-4 top-4 rounded-full border border-white/20 bg-[#0C2C50]/50 px-3 py-1 text-[10px] font-black text-white backdrop-blur-md">
                  {service.number}
                </span>

                <span
                  className="
                    absolute bottom-4 left-4
                    rounded-full px-3 py-1
                    text-[9px] font-black
                    tracking-[.18em] text-white
                  "
                  style={{ background: GREEN }}
                >
                  {service.short}
                </span>
              </div>

              <div className="p-7">
                <h3
                  className="
                    text-xl font-bold
                    text-[#0C2C50]
                    dark:text-slate-100
                  "
                >
                  {service.title}
                </h3>

                <p
                  className="
                    mt-3 text-[13.5px]
                    leading-7
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {service.description}
                </p>

                <div className="mt-5 grid grid-cols-2 gap-2">
                  {service.points.map((point) => (
                    <div
                      key={point}
                      className="
                        flex items-start gap-1.5
                        text-[10px] font-semibold
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      <CheckCircle2
                        size={12}
                        className="
                          mt-0.5 flex-shrink-0
                          text-[#2E9E6D]
                          dark:text-emerald-400
                        "
                        strokeWidth={2.2}
                      />

                      {point}
                    </div>
                  ))}
                </div>

                <div
                  className="
                    mt-6 flex items-center gap-2
                    text-xs font-bold
                    text-[#2E9E6D]
                    dark:text-emerald-400
                  "
                >
                  Explore service
                  <ArrowRight
                    size={13}
                    className="
                      transition-transform duration-300
                      group-hover:translate-x-1
                    "
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   SERVICE CATEGORIES
========================================================= */

const serviceCategories = [
  {
    icon: Search,
    title: "Search & Performance Marketing",
    description:
      "Capture high-intent customers through search visibility and paid acquisition.",
    items: [
      "Technical SEO",
      "On-Page SEO",
      "Off-Page SEO",
      "Local SEO",
      "E-commerce SEO",
      "Google Ads",
      "Shopping Ads",
      "Display Ads",
      "YouTube Ads",
      "Remarketing",
    ],
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=85",
  },
  {
    icon: Share2,
    title: "Social & Community Marketing",
    description:
      "Build attention, trust and communities across the social platforms your customers use.",
    items: [
      "Social Media Marketing",
      "Social Media Management",
      "Facebook Marketing",
      "Instagram Marketing",
      "Community Management",
      "Influencer Marketing",
      "Content Campaigns",
      "Social Advertising",
      "Brand Engagement",
      "Online Community",
    ],
    image:
      "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=1200&q=85",
  },
  {
    icon: MessageCircle,
    title: "Customer Communication",
    description:
      "Stay connected with prospects and customers through direct communication channels.",
    items: [
      "WhatsApp Marketing",
      "Email Marketing",
      "SMS Marketing",
      "Push Notifications",
      "Lead Nurturing",
      "Drip Campaigns",
      "Customer Updates",
      "Promotional Campaigns",
      "Retention Campaigns",
      "Automated Messaging",
    ],
    image:
      "https://images.unsplash.com/photo-1611746872915-64382b5c76da?w=1200&q=85",
  },
  {
    icon: FileText,
    title: "Content & Creative Marketing",
    description:
      "Create content that educates, attracts, engages and moves customers toward action.",
    items: [
      "Blog Writing",
      "SEO Content",
      "Copywriting",
      "Website Content",
      "Video Marketing",
      "Reels",
      "YouTube Content",
      "Creative Campaigns",
      "Product Content",
      "Content Distribution",
    ],
    image:
      "https://images.unsplash.com/photo-1492724441997-5dc865305da7?w=1200&q=85",
  },
  {
    icon: Target,
    title: "Lead & Conversion Growth",
    description:
      "Turn traffic into measurable business opportunities through funnels and conversion optimization.",
    items: [
      "Lead Generation",
      "Landing Pages",
      "CRO",
      "A/B Testing",
      "Conversion Tracking",
      "Sales Funnels",
      "Lead Qualification",
      "CRM Integration",
      "Lead Nurturing",
      "Retargeting",
    ],
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=85",
  },
  {
    icon: ShoppingCart,
    title: "E-commerce & Marketplace Growth",
    description:
      "Grow online stores and product businesses across search, social and marketplaces.",
    items: [
      "E-commerce SEO",
      "Google Shopping",
      "Meta Commerce",
      "Product Marketing",
      "Marketplace Ads",
      "Marketplace SEO",
      "Product Pages",
      "Retargeting",
      "Conversion Optimization",
      "Customer Retention",
    ],
    image:
      "https://images.unsplash.com/photo-1472851294608-062f824d29cc?w=1200&q=85",
  },
];

function CategoriesSection() {
  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">

          <h2
            className="
              mt-4 !text-4xl !font-bold
              text-[#0C2C50]
              dark:text-slate-100
              sm:text-4xl
            "
          >
            One agency. Multiple growth channels.
          </h2>

          <p
            className="
              mt-5 text-[15px] leading-7
              text-slate-500
              dark:text-slate-400
            "
          >
            Choose individual services or combine multiple channels into one
            integrated digital marketing strategy.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {serviceCategories.map((category) => {
            const Icon = category.icon;

            return (
              <div
                key={category.title}
                className="
                  group overflow-hidden
                  rounded-[1.75rem] border
                  border-slate-200
                  bg-white
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="
                      h-full w-full object-cover
                      transition duration-700
                      group-hover:scale-105
                    "
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/90 via-[#0C2C50]/30 to-transparent" />

                  <div
                    className="
                      absolute bottom-5 left-5
                      flex h-11 w-11
                      items-center justify-center
                      rounded-xl
                    "
                    style={{ background: GREEN }}
                  >
                    <Icon size={20} color="white" />
                  </div>
                </div>

                <div className="p-7">
                  <h3
                    className="
                      text-xl font-bold
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    {category.title}
                  </h3>

                  <p
                    className="
                      mt-3 text-sm leading-7
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {category.description}
                  </p>

                  <div className="mt-6 grid grid-cols-2 gap-x-5 gap-y-3 sm:grid-cols-3">
                    {category.items.map((item) => (
                      <div
                        key={item}
                        className="
                          flex items-start gap-2
                          text-[11px] font-semibold
                          text-slate-500
                          dark:text-slate-400
                        "
                      >
                        <CheckCircle2
                          size={13}
                          className="
                            mt-0.5 flex-shrink-0
                            text-[#2E9E6D]
                            dark:text-emerald-400
                          "
                        />

                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ADDITIONAL SERVICES
========================================================= */

function MoreServicesSection() {
  return (
    <section
      className="
        bg-[#F7FAF9] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-12 max-w-2xl text-center">

          <h2
            className="
              mt-4 !text-4xl !font-bold
              text-[#0C2C50]
              dark:text-slate-100
              sm:text-4xl
            "
          >
            More ways to grow, automate and retain.
          </h2>

          <p
            className="
              mt-4 text-sm leading-7
              text-slate-500
              dark:text-slate-400
            "
          >
            Beyond the main marketing channels, we provide supporting services
            that make the complete digital ecosystem stronger.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {additionalServices.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="
                  group overflow-hidden
                  rounded-2xl border
                  border-slate-200
                  bg-white
                  transition duration-300
                  hover:-translate-y-1
                  hover:shadow-xl
                  dark:border-slate-800
                  dark:bg-slate-900
                "
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="
                      h-full w-full object-cover
                      transition duration-700
                      group-hover:scale-105
                    "
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/80 to-transparent" />

                  <div
                    className="
                      absolute bottom-4 left-4
                      flex h-10 w-10
                      items-center justify-center
                      rounded-xl
                    "
                    style={{ background: GREEN }}
                  >
                    <Icon size={18} color="white" />
                  </div>
                </div>

                <div className="p-5">
                  <h3
                    className="
                      font-bold
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-2 text-[12px] leading-6
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {item.text}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   CUSTOMER JOURNEY / FUNNEL
========================================================= */

function FunnelSection() {
  const funnel = [
    {
      icon: Eye,
      title: "Awareness",
      text: "People discover your brand through search, social, ads and content.",
      width: "100%",
    },
    {
      icon: Search,
      title: "Discovery",
      text: "They search, visit your website and explore what you offer.",
      width: "90%",
    },
    {
      icon: Users,
      title: "Consideration",
      text: "They compare your brand, content, reviews and competitors.",
      width: "76%",
    },
    {
      icon: Heart,
      title: "Trust",
      text: "Useful content, communication and reputation build confidence.",
      width: "63%",
    },
    {
      icon: MousePointerClick,
      title: "Conversion",
      text: "The visitor becomes a lead, customer or buyer.",
      width: "49%",
    },
    {
      icon: RefreshCw,
      title: "Retention",
      text: "Email, WhatsApp, CRM and remarketing bring customers back.",
      width: "38%",
    },
    {
      icon: TrendingUp,
      title: "Referral",
      text: "Happy customers recommend your business to others.",
      width: "29%",
    },
  ];

  return (
    <section
      className="
        overflow-hidden
        bg-[#0C2C50]
        px-6 py-20
        transition-colors duration-300
        dark:bg-[#06111F]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[.85fr_1.15fr]">
        <div className="relative">
          <div className="overflow-hidden rounded-[2rem] border border-white/10">
            <img
              src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1100&q=85"
              alt="Digital marketing analytics dashboard"
              className="h-[500px] w-full object-cover opacity-90"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50] via-[#0C2C50]/30 to-transparent" />
          </div>

          <div className="absolute bottom-6 left-6 right-6">
            <p
              className="
                text-[9px] font-bold uppercase tracking-[.2em]
                text-emerald-300
              "
            >
              Complete customer journey
            </p>

            <h3 className="mt-2 text-2xl font-black text-white">
              Don't stop at the first click.
            </h3>

            <p className="mt-2 max-w-md text-sm leading-6 text-white/55">
              The real value comes from turning attention into customers and
              customers into long-term advocates.
            </p>
          </div>
        </div>

        <div>

          <h2 className="mt-4 !text-4xl !font-bold leading-tight !text-white sm:text-4xl">
            We market the complete customer journey.
          </h2>

          <p className="mt-5 max-w-xl leading-8 text-white/60">
            Every stage has a different marketing objective. We use different
            channels and strategies at each stage to move customers naturally
            toward conversion, retention and referral.
          </p>

          <div className="mt-8 space-y-3">
            {funnel.map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                    relative overflow-hidden
                    rounded-2xl border
                    border-white/10
                    bg-white/[0.04]
                    p-4
                  "
                >
                  <div
                    className="absolute bottom-0 left-0 top-0 opacity-10"
                    style={{
                      width: item.width,
                      background: GREEN_LIGHT,
                    }}
                  />

                  <div className="relative flex items-center gap-4">
                    <div
                      className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl"
                      style={{
                        background: `${GREEN}20`,
                      }}
                    >
                      <Icon size={18} color={GREEN_LIGHT} />
                    </div>

                    <div className="flex-1">
                      <p className="text-sm font-bold text-white">
                        {item.title}
                      </p>

                      <p className="mt-1 text-xs leading-5 text-white/40">
                        {item.text}
                      </p>
                    </div>

                    <span
                      className="text-xs font-black"
                      style={{
                        color: GREEN_LIGHT,
                      }}
                    >
                      0{index + 1}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   ANALYTICS
========================================================= */

function AnalyticsSection() {
  const analytics = [
    {
      icon: BarChart3,
      title: "Marketing Analytics",
      text: "Understand channel performance, traffic sources and campaign results.",
    },
    {
      icon: Activity,
      title: "Conversion Tracking",
      text: "Track important actions such as calls, forms, purchases and leads.",
    },
    {
      icon: Target,
      title: "Funnel Analysis",
      text: "Find exactly where visitors drop off before becoming customers.",
    },
    {
      icon: LineChart,
      title: "A/B Testing",
      text: "Test different campaigns, landing pages and messages to improve results.",
    },
    {
      icon: Settings2,
      title: "Google Tag Manager",
      text: "Create a structured tracking system for important marketing events.",
    },
    {
      icon: TrendingUp,
      title: "Continuous Optimization",
      text: "Use performance data to improve campaigns and scale what works.",
    },
  ];

  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="relative overflow-hidden rounded-[2rem]">
            <img
              src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1100&q=85"
              alt="Digital marketing analytics"
              className="h-[460px] w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/85 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-[.2em] text-white/60">
                    Data & analytics
                  </p>

                  <p className="mt-1 text-xl font-black text-white">
                    Measure. Learn. Optimize. Scale.
                  </p>
                </div>

                <BarChart3 size={26} className="text-emerald-300" />
              </div>
            </div>
          </div>

          <div>

            <h2
              className="
                mt-4 !text-4xl !font-bold
                leading-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-4xl
              "
            >
              Don't guess what works. Measure it.
            </h2>

            <p
              className="
                mt-5 leading-8
                text-slate-500
                dark:text-slate-400
              "
            >
              Marketing performance becomes much easier to improve when every
              important action is properly tracked and connected to business
              goals.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {analytics.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="
                      rounded-xl border
                      border-slate-100
                      bg-[#F7FAF9]
                      p-4
                      dark:border-slate-800
                      dark:bg-slate-900
                    "
                  >
                    <div
                      className="
                        flex h-10 w-10
                        items-center justify-center
                        rounded-lg
                        bg-emerald-500/10
                        dark:bg-emerald-400/10
                      "
                    >
                      <Icon
                        size={17}
                        className="text-[#2E9E6D] dark:text-emerald-400"
                      />
                    </div>

                    <h3
                      className="
                        mt-4 text-sm font-bold
                        text-[#0C2C50]
                        dark:text-slate-100
                      "
                    >
                      {item.title}
                    </h3>

                    <p
                      className="
                        mt-1 text-xs leading-5
                        text-slate-500
                        dark:text-slate-400
                      "
                    >
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   PROCESS
========================================================= */

function ProcessSection() {
  const process = [
    {
      number: "01",
      title: "Research",
      image:
        "https://images.unsplash.com/photo-1552664730-d307ca884978?w=700&q=80",
      text: "Understand your business, customers, competitors and current digital presence.",
    },
    {
      number: "02",
      title: "Strategy",
      image:
        "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=700&q=80",
      text: "Build a channel strategy based on goals, audience, budget and customer journey.",
    },
    {
      number: "03",
      title: "Create",
      image:
        "https://images.unsplash.com/photo-1542744094-3a31f272c490?w=700&q=80",
      text: "Create campaigns, content, landing pages, creatives and communication systems.",
    },
    {
      number: "04",
      title: "Launch",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=700&q=80",
      text: "Launch campaigns with proper tracking, targeting and measurable objectives.",
    },
    {
      number: "05",
      title: "Optimize",
      image:
        "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=700&q=80",
      text: "Analyze performance, test ideas and improve the weakest parts of the funnel.",
    },
    {
      number: "06",
      title: "Scale",
      image:
        "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=700&q=80",
      text: "Scale the channels, campaigns and strategies that consistently produce results.",
    },
  ];

  return (
    <section
      className="
        bg-[#F7FAF9] px-6 py-20
        transition-colors duration-300
        dark:bg-[#07111F]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="mx-auto mb-14 max-w-2xl text-center">

          <h2
            className="
              mt-4 !text-4xl !font-bold
              text-[#0C2C50]
              dark:text-slate-100
              sm:text-4xl
            "
          >
            Strategy first. Data always.
          </h2>

          <p
            className="
              mt-5 text-[15px] leading-7
              text-slate-500
              dark:text-slate-400
            "
          >
            A structured process helps us understand what to do, why to do it
            and how to continuously make it better.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {process.map((item) => (
            <div
              key={item.number}
              className="
                group overflow-hidden
                rounded-2xl border
                border-slate-200
                bg-white
                transition duration-300
                hover:-translate-y-1
                hover:shadow-lg
                dark:border-slate-800
                dark:bg-slate-900
              "
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.title}
                  className="
                    h-full w-full object-cover
                    transition duration-700
                    group-hover:scale-105
                  "
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#0C2C50]/85 to-transparent" />

                <span className="absolute right-3 top-3 rounded-full bg-white/20 px-2.5 py-1 text-[9px] font-black text-white backdrop-blur">
                  {item.number}
                </span>

                <h3 className="absolute bottom-4 left-5 text-lg font-black text-white">
                  {item.title}
                </h3>
              </div>

              <div className="p-5">
                <p
                  className="
                    text-[12px] leading-6
                    text-slate-500
                    dark:text-slate-400
                  "
                >
                  {item.text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   WHY US
========================================================= */

function WhyUsSection() {
  const reasons = [
    {
      icon: Target,
      title: "Goal-focused",
      text: "Every campaign starts with a clear business objective.",
    },
    {
      icon: Layers,
      title: "Integrated",
      text: "SEO, ads, social, content and retention work together.",
    },
    {
      icon: BarChart3,
      title: "Data-driven",
      text: "Important decisions are based on measurable performance.",
    },
    {
      icon: RefreshCw,
      title: "Always improving",
      text: "Campaigns are continuously tested and optimized.",
    },
  ];

  return (
    <section
      className="
        bg-white px-6 py-20
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto max-w-6xl">
        <div className="grid items-center gap-12 lg:grid-cols-[.8fr_1.2fr]">
          <div>

            <h2
              className="
                mt-4 !text-4xl !font-bold
                leading-tight
                text-[#0C2C50]
                dark:text-slate-100
                sm:text-4xl
              "
            >
              Marketing built around growth, not vanity metrics.
            </h2>

            <p
              className="
                mt-5 leading-8
                text-slate-500
                dark:text-slate-400
              "
            >
              The objective is not simply more impressions or followers. The
              objective is to create a marketing system that contributes to
              visibility, leads, sales, retention and sustainable growth.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {reasons.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  key={item.title}
                  className="
                    rounded-2xl border
                    border-slate-200
                    bg-[#F7FAF9]
                    p-6
                    transition-all duration-300
                    hover:-translate-y-1
                    hover:shadow-lg
                    dark:border-slate-800
                    dark:bg-slate-900
                  "
                >
                  <div
                    className="
                      flex h-11 w-11
                      items-center justify-center
                      rounded-xl
                      bg-emerald-500/10
                      dark:bg-emerald-400/10
                    "
                  >
                    <Icon
                      size={19}
                      className="text-[#2E9E6D] dark:text-emerald-400"
                    />
                  </div>

                  <h3
                    className="
                      mt-5 font-bold
                      text-[#0C2C50]
                      dark:text-slate-100
                    "
                  >
                    {item.title}
                  </h3>

                  <p
                    className="
                      mt-2 text-sm leading-6
                      text-slate-500
                      dark:text-slate-400
                    "
                  >
                    {item.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   FINAL CTA
========================================================= */

function CTASection() {
  return (
    <section
      className="
        bg-white px-6 pb-20 pt-6
        transition-colors duration-300
        dark:bg-[#020817]
        sm:px-10 lg:px-14
      "
    >
      <div className="mx-auto max-w-6xl">
        <div
          className="
            relative overflow-hidden
            rounded-[2rem]
            bg-[#0C2C50]
            dark:bg-[#06111F]
          "
        >
          <div className="absolute inset-0">
            <img
              src="https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1400&q=80"
              alt=""
              className="h-full w-full object-cover opacity-20"
              aria-hidden="true"
            />

            <div className="absolute inset-0 bg-[#0C2C50]/88 dark:bg-[#06111F]/90" />
          </div>

          <div
            className="
              pointer-events-none absolute
              -right-24 -top-24
              h-72 w-72 rounded-full blur-3xl
            "
            style={{ background: `${GREEN}35` }}
          />

          <div className="relative px-8 py-14 md:px-14 md:py-16">
            <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
              <div className="max-w-xl">

                <h2 className="!text-3xl !font-bold leading-tight !text-white sm:text-4xl">
                  Ready to turn your digital presence into business growth?
                </h2>

                <p className="mt-5 text-sm leading-7 text-white/60">
                  Tell us about your business, your goals and where you want to
                  go. We'll help you identify the right channels and build a
                  digital marketing strategy around them.
                </p>
              </div>

              <div className="relative flex flex-col items-start gap-3 md:items-end">
                <a
                  href="/quote"
                  className="
                    inline-flex items-center gap-2
                    rounded-xl px-7 py-3.5
                    text-sm font-bold text-white
                    transition duration-300
                    hover:scale-[1.04]
                  "
                  style={{
                    background: GREEN,
                  }}
                >
                  Get a free consultation
                  <ArrowRight size={16} />
                </a>

                <span className="text-xs text-white/40">
                  SEO • Ads • Social • WhatsApp • Content • Analytics
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   MAIN COMPONENT
========================================================= */

export default function DigitalMarketing() {
  return (
    <main
      className="
        w-full overflow-x-hidden
        bg-white
        transition-colors duration-300
        dark:bg-[#020817]
      "
    >
      <HeroSection />
      <ChannelStrip />
      <IntroSection />
      <ServicesSection />
      <CategoriesSection />
      <MoreServicesSection />
      <FunnelSection />
      <AnalyticsSection />
      <ProcessSection />
      <WhyUsSection />
      <CTASection />
    </main>
  );
}
