export default function PolicyPage({ type = "privacy" }) {
  const isPrivacy = type === "privacy";
  return (
    <main className="mx-auto max-w-4xl px-5 py-20 text-slate-700 dark:text-slate-200">
      <h1 className="text-4xl font-black text-slate-950 dark:text-white">
        {isPrivacy ? "Privacy Policy" : "Cookie Policy"}
      </h1>
      <p className="mt-3 text-sm text-slate-500">Last updated: September 10, 2026</p>
      {isPrivacy ? (
        <>
          <p className="mt-8 leading-7">Digital Alife Pvt. Ltd. collects only the information needed to respond to enquiries, provide services, operate administrator accounts, and improve this website. This may include contact details, account identifiers, device information, and security activity such as login time, IP address, and browser user agent.</p>
          <h2 className="mt-8 text-xl font-bold">Use and retention</h2>
          <p className="mt-2 leading-7">We use data to deliver requested services, prevent abuse, maintain security, and meet legal obligations. We retain it only as long as reasonably necessary for those purposes. We do not sell personal information.</p>
          <h2 className="mt-8 text-xl font-bold">Your choices</h2>
          <p className="mt-2 leading-7">You may request access, correction, or deletion of personal information by contacting info@digitalalife.com. Administrator security records may be retained where required to protect the service.</p>
        </>
      ) : (
        <>
          <p className="mt-8 leading-7">This website uses essential cookies and browser storage to keep sessions secure, remember preferences, and protect forms. Optional analytics is disabled unless you choose “Accept optional” in the cookie banner.</p>
          <h2 className="mt-8 text-xl font-bold">Manage consent</h2>
          <p className="mt-2 leading-7">Use the “Cookie settings” control at the bottom of the site at any time to reopen preferences. Rejecting optional cookies removes analytics identifiers and stops future analytics requests.</p>
          <h2 className="mt-8 text-xl font-bold">Contact</h2>
          <p className="mt-2 leading-7">Questions about cookies can be sent to info@digitalalife.com.</p>
        </>
      )}
    </main>
  );
}
