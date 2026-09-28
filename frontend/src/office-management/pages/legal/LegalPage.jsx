import { Link } from "react-router-dom";
import AuthBrand from "../../components/common/AuthBrand";
import { ROUTES } from "../../routes/routeConstants";

const termsSections = [
  {
    title: "Introduction",
    body: [
      "Welcome to Digital Alife. These terms and conditions outline the rules and regulations for using the Digital Alife Pvt Ltd website, located at digitalalife.com.",
      "By accessing this website, we assume you accept these terms and conditions. Do not continue to use Digital Alife if you do not agree to all of the terms stated on this page.",
    ],
  },
  {
    title: "Terminology",
    body: [
      '"Client", "You", and "Your" refers to the person using this website and agreeing to the Company terms. "The Company", "Ourselves", "We", "Our", and "Us" refers to Digital Alife Pvt Ltd. "Party", "Parties", or "Us" refers to both the Client and ourselves.',
    ],
  },
  {
    title: "Cookies",
    body: [
      "We use cookies to support website functionality and improve the visitor experience. By accessing Digital Alife, you agree to the use of cookies in agreement with this Privacy Policy.",
    ],
  },
  {
    title: "License",
    body: [
      "Unless otherwise stated, Digital Alife Pvt Ltd and/or its licensors own the intellectual property rights for all material on Digital Alife. You may access it for your own personal use subject to the restrictions in these terms.",
    ],
    list: [
      "Do not republish material from Digital Alife.",
      "Do not sell, rent, or sub-license material from Digital Alife.",
      "Do not reproduce, duplicate, or copy material from Digital Alife.",
      "Do not redistribute content from Digital Alife.",
    ],
  },
  {
    title: "User Comments",
    body: [
      "Parts of this website may allow users to post and exchange opinions and information. Comments reflect the views of the person posting them and do not necessarily reflect the views of Digital Alife Pvt Ltd.",
      "Digital Alife Pvt Ltd reserves the right to monitor and remove comments that are inappropriate, offensive, or breach these terms.",
    ],
  },
  {
    title: "Hyperlinking",
    body: [
      "Government agencies, search engines, news organizations, and online directory distributors may link to our website when the link is not deceptive, does not falsely imply endorsement, and fits the context of the linking party site.",
      "Other organizations may request approval by contacting Digital Alife Pvt Ltd with relevant organization and URL details.",
    ],
  },
  {
    title: "iFrames and Content Liability",
    body: [
      "Without prior written approval, you may not create frames around our webpages that alter the visual presentation or appearance of our website.",
      "We are not responsible for content appearing on third-party websites that link to us. You agree to protect and defend us against claims arising from your website.",
    ],
  },
  {
    title: "Reservation of Rights",
    body: [
      "We reserve the right to request removal of links to our website and to amend these terms and linking policy at any time. Continued use of or linking to the website means you agree to follow the updated terms.",
    ],
  },
  {
    title: "Disclaimer",
    body: [
      "To the maximum extent permitted by applicable law, we exclude representations, warranties, and conditions relating to our website and its use. As long as the website and its information or services are provided free of charge, we will not be liable for loss or damage of any nature.",
    ],
  },
];

const privacySections = [
  {
    title: "Introduction",
    body: [
      "At Digital Alife, accessible from digitalalife.com, visitor privacy is one of our priorities. This Privacy Policy explains the types of information collected and recorded by Digital Alife and how we use it.",
      "This policy applies to online activities and is valid for visitors to our website regarding information they share and/or collect through Digital Alife. It does not apply to information collected offline or through other channels.",
    ],
  },
  {
    title: "Consent",
    body: [
      "By using our website, you consent to this Privacy Policy and agree to its terms.",
    ],
  },
  {
    title: "Information We Collect",
    body: [
      "When you contact us directly, we may receive information such as your name, email address, phone number, message contents, attachments, and any other information you choose to provide.",
      "When you register for an account, we may ask for contact information including name, company name, address, email address, and telephone number.",
    ],
  },
  {
    title: "How We Use Information",
    list: [
      "Provide, operate, and maintain our website.",
      "Improve, personalize, and expand our website.",
      "Understand and analyze how visitors use our website.",
      "Develop new products, services, features, and functionality.",
      "Communicate with users for service, updates, marketing, and support.",
      "Send emails and help find or prevent fraud.",
    ],
  },
  {
    title: "Log Files, Cookies, and Web Beacons",
    body: [
      "Digital Alife follows a standard procedure of using log files. These may include IP addresses, browser type, ISP, date and time stamp, referring/exit pages, and click counts. This information is used for analysis, administration, and demographic insights.",
      "Like many websites, Digital Alife uses cookies to store visitor preferences and pages visited so we can optimize the user experience.",
    ],
  },
  {
    title: "Third-Party Privacy",
    body: [
      "Digital Alife has no access to or control over cookies used by third-party advertisers. Our Privacy Policy does not apply to other advertisers or websites, so we advise users to review their respective privacy policies.",
    ],
  },
  {
    title: "CCPA Privacy Rights",
    body: [
      "California consumers may request disclosure of collected personal data, request deletion of personal data, and request that a business that sells personal data not sell it. If you make a request, we have one month to respond.",
    ],
  },
  {
    title: "GDPR Data Protection Rights",
    body: [
      "Every user is entitled to request access, rectification, erasure, restriction of processing, objection to processing, and data portability under applicable conditions. If you make a request, we have one month to respond.",
    ],
  },
  {
    title: "Children's Information",
    body: [
      "Digital Alife does not knowingly collect personally identifiable information from children under 13. If you believe a child provided this information, contact us immediately and we will do our best to remove it from our records.",
    ],
  },
  {
    title: "Contact",
    body: [
      "If there are questions regarding this Privacy Policy, contact us at info@digitalalife.com.",
    ],
  },
];

const contentByType = {
  terms: {
    title: "Terms and Conditions",
    intro: "Rules and responsibilities for using Digital Alife services and website content.",
    sections: termsSections,
  },
  privacy: {
    title: "Privacy Policy",
    intro: "How Digital Alife Pvt Ltd collects, uses, and protects website visitor and account information.",
    sections: privacySections,
  },
};

const LegalPage = ({ type }) => {
  const content = contentByType[type] || contentByType.terms;

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <AuthBrand />
          <Link
            to={ROUTES.LOGIN}
            className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 shadow-sm hover:border-blue-200 hover:text-blue-700"
          >
            Back to login
          </Link>
        </div>

        <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wide text-blue-700">
            Digital Alife Pvt Ltd
          </p>
          <h1 className="mt-2 text-3xl font-black text-slate-950 sm:text-4xl">
            {content.title}
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">
            {content.intro}
          </p>

          <div className="mt-8 space-y-7">
            {content.sections.map((section) => (
              <section key={section.title}>
                <h2 className="text-lg font-black text-slate-950">{section.title}</h2>
                {section.body?.map((paragraph) => (
                  <p key={paragraph} className="mt-3 text-sm leading-7 text-slate-600">
                    {paragraph}
                  </p>
                ))}
                {section.list && (
                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
                    {section.list.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
};

export default LegalPage;
