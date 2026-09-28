import { Phone, Mail, MapPin } from "lucide-react";
import PageHero from "./PageHero";
import ContactForm from "./ContactForm";

export default function Contact() {
  const contactDetails = [
    [Phone, "Call us", "9211954915 / 7678165464"],
    [Mail, "Email us", "info@digitalalife.com"],
    [MapPin, "Visit us", "Sector 58, Noida, Uttar Pradesh"],
  ];

  return (
    <>
      {/* Hero */}
      <PageHero
        eyebrow="Contact us"
        title="Let's talk about your next project."
        description="Share your idea, challenge or goal. We are here to help you find the right way forward."
        action={null}
      />

      {/* Contact Section */}
      <section
        className="
          bg-[#f7faf9]
          px-6
          py-20
          transition-colors
          duration-300

          dark:bg-[#0b2033]

          sm:px-10
        "
      >
        <div
          className="
            mx-auto
            grid
            max-w-6xl
            gap-10

            lg:grid-cols-[.8fr_1.2fr]
          "
        >
          {/* Contact Information */}
          <div>
            <p
              className="
                text-xs
                font-bold
                uppercase
                tracking-[0.2em]
                text-[#2E9E6D]
              "
            >
              Contact
            </p>

            <h2
              className="
                mt-2
                text-3xl
                font-bold
                text-[#0C2C50]

                dark:text-white
              "
            >
              Get in touch
            </h2>

            <p
              className="
                mt-4
                max-w-md
                text-sm
                leading-6
                text-slate-500

                dark:text-slate-400
              "
            >
              Have a project in mind? Reach out to us and let's discuss how we
              can turn your idea into a digital experience.
            </p>

            <div className="mt-7 space-y-6">
              {contactDetails.map(([Icon, title, value]) => (
                <div key={title} className="flex items-start gap-4">
                  {/* Icon */}
                  <span
                    className="
                      shrink-0
                      rounded-xl
                      bg-[#eaf7f1]
                      p-3
                      text-[#2E9E6D]

                      dark:bg-[#173d35]
                      dark:text-[#72d3aa]
                    "
                  >
                    <Icon size={22} />
                  </span>

                  {/* Details */}
                  <div>
                    <b
                      className="
                        block
                        text-[#0C2C50]

                        dark:text-white
                      "
                    >
                      {title}
                    </b>

                    <span
                      className="
                        mt-1
                        block
                        text-sm
                        leading-6
                        text-slate-500

                        dark:text-slate-400
                      "
                    >
                      {value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div
            className="
              rounded-2xl
              border
              border-slate-200
              bg-white
              p-5
              shadow-sm
              transition-colors
              duration-300

              dark:border-slate-700
              dark:bg-[#102a43]
              dark:shadow-black/10

              sm:p-6
              lg:p-8
            "
          >
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
