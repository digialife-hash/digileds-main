import React, { useEffect, useState } from "react";
import { Award, Printer, QrCode, RefreshCw, ShieldCheck, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../api/axiosInstance";
import CertificateTemplate from "../../components/certificates/CertificateTemplate";
import CertificateStatusBadge from "../../components/certificates/CertificateStatusBadge";

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    fetchMyCertificates();
  }, []);

  const fetchMyCertificates = async () => {
    try {
      setIsLoading(true);
      setError("");
      const response = await API.get("/certificates/my-certificates");
      if (response.data?.success && response.data?.data?.certificates) {
        const certs = response.data.data.certificates;
        setCertificates(certs);
        if (certs.length > 0) {
          setSelectedCert(certs[0]);
        }
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "No active certificates have been issued for your account."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleOpenQRVerify = () => {
    if (!selectedCert) return;
    const verifyUrl = selectedCert.verificationToken
      ? `/verify-certificate/${selectedCert.verificationToken}`
      : `/verify-certificate/${selectedCert.certificateNumber}`;
    window.open(verifyUrl, "_blank");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-600 p-2.5 text-white shadow-md shadow-amber-500/20">
            <Award size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              My Certificates
            </h1>
            <p className="text-xs font-medium text-slate-500">
              View, print, and verify your official corporate achievement & recognition certificates
            </p>
          </div>
        </div>

        {selectedCert && (
          <div className="flex items-center space-x-2">
            <button
              onClick={handleOpenQRVerify}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl border border-amber-200 bg-amber-50 text-amber-800 text-xs font-bold hover:bg-amber-100 transition"
            >
              <QrCode size={15} />
              <span>Verify QR</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition"
            >
              <Printer size={15} />
              <span>Print Certificate</span>
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center space-y-3 bg-white rounded-3xl border border-slate-100 shadow-xs">
          <RefreshCw className="animate-spin text-amber-600" size={32} />
          <p className="text-xs font-semibold text-slate-500">Loading your certificates...</p>
        </div>
      ) : certificates.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-3xl border border-slate-100 shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="h-16 w-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
            <Award size={32} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No Certificates Issued Yet</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {error || "You do not have any issued certificates currently in official records."}
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Certificate Selector Pills if multiple */}
          {certificates.length > 1 && (
            <div className="flex items-center space-x-2 overflow-x-auto pb-2">
              {certificates.map((cert) => (
                <button
                  key={cert._id}
                  onClick={() => setSelectedCert(cert)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    selectedCert?._id === cert._id
                      ? "bg-amber-600 text-white shadow-md shadow-amber-500/20"
                      : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {cert.certificateType || cert.certificateNumber}
                </button>
              ))}
            </div>
          )}

          {/* Certificate Preview Container */}
          {selectedCert && (
            <div className="bg-slate-100 p-8 rounded-3xl border border-slate-200 flex flex-col items-center justify-center overflow-x-auto">
              <div className="transform scale-90 sm:scale-100 origin-center transition-transform">
                <CertificateTemplate certificate={selectedCert} />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyCertificates;
