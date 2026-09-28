import React, { useState } from "react";
import { Share2, Sparkles, Filter, CheckCircle2, ShieldAlert } from "lucide-react";
import PackageCard from "../../components/client/social-media-packages/PackageCard";
import WhyChooseUsSection from "../../components/client/social-media-packages/WhyChooseUsSection";
import PackageInformationNote from "../../components/client/social-media-packages/PackageInformationNote";
import { socialMediaPackages } from "../../data/socialMediaPackages";

const CATEGORIES = ["All Plans", "Starter", "Growth", "Advanced"];

const SocialMediaPackagesPage = () => {
  const [selectedCategory, setSelectedCategory] = useState("All Plans");

  const filteredPackages =
    selectedCategory === "All Plans"
      ? socialMediaPackages
      : socialMediaPackages.filter((p) => p.category === selectedCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 p-8 rounded-3xl text-white shadow-xl">
        <div className="space-y-2 max-w-2xl">
          <div className="flex items-center space-x-2">
            <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-[11px] font-extrabold uppercase tracking-wider">
              Digital Alife Pvt. Ltd.
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-[11px] font-extrabold">
              Plans starting from ₹4,999/month
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Social Media Management Packages
          </h1>

          <p className="text-xs sm:text-sm font-medium text-slate-300 leading-relaxed">
            Choose the right social media management package for your business growth. Scale your online presence with professional creative designs, reels, and data-driven marketing.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-md text-xs space-y-1.5 shrink-0">
          <div className="flex items-center space-x-1.5 text-blue-300 font-bold">
            <Sparkles size={16} />
            <span>Monthly Subscription Plans</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            • All prices are monthly<br />
            • Ad budget extra where applicable<br />
            • Flexible multi-platform coverage
          </p>
        </div>
      </div>

      {/* Optional Category Filter Bar */}
      <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center space-x-2">
          <Filter size={16} className="text-slate-400" />
          <span className="text-xs font-bold text-slate-600">Filter Plans:</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition ${
                selectedCategory === cat
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Package Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        {filteredPackages.map((pkg) => (
          <PackageCard key={pkg.id} pkg={pkg} />
        ))}
      </div>

      {/* Why Choose Digital Alife Section */}
      <WhyChooseUsSection />

      {/* Important Information Note */}
      <PackageInformationNote />
    </div>
  );
};

export default SocialMediaPackagesPage;
