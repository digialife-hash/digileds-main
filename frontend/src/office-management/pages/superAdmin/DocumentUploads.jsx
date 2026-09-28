// DocumentUploads.jsx
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Plus,
  Eye,
  Download,
  Trash2,
  UserRound,
  FileText,
  CalendarDays,
  Mail,
  X,
  ChevronLeft,
  ChevronRight,
  File,
  Image,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  Files,
  Clock,
} from "lucide-react";
import {
  getEmployeeDocuments,
  deleteEmployeeDocument,
} from "../../services/superAdminDashboardService";

const isImageDoc = (doc) =>
  doc?.resourceType === "image" || doc?.fileType?.startsWith("image");

// Document Type Icons (used as a fallback when a document isn't an image)
const getDocumentIcon = (fileType) => {
  if (fileType?.includes("pdf"))
    return <FileText className="h-5 w-5 text-red-500" />;
  if (fileType?.includes("image"))
    return <Image className="h-5 w-5 text-purple-500" />;
  if (fileType?.includes("word"))
    return <FileText className="h-5 w-5 text-blue-500" />;
  if (fileType?.includes("excel"))
    return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
  if (fileType?.includes("ppt"))
    return <FileSpreadsheet className="h-5 w-5 text-orange-500" />;
  return <File className="h-5 w-5 text-gray-500" />;
};

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Relative "time ago" label for a card's last-activity line.
const formatRelativeTime = (dateString) => {
  if (!dateString) return "N/A";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(dateString);
};

// Document type -> { label, chip classes }. Grouped by what the document is
// used for, so the color itself carries meaning (KYC vs. employment vs.
// credentials) rather than decorating the card.
const DOCUMENT_TYPE_META = {
  resume: {
    label: "Resume / CV",
    chip: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  offer_letter: {
    label: "Offer Letter",
    chip: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  appointment_letter: {
    label: "Appointment Letter",
    chip: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  experience_letter: {
    label: "Experience Letter",
    chip: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  salary_slip: {
    label: "Salary Slip",
    chip: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  contract: {
    label: "Contract Agreement",
    chip: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  identity_proof: {
    label: "Identity Proof",
    chip: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  address_proof: {
    label: "Address Proof",
    chip: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  pan_card: {
    label: "PAN Card",
    chip: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  educational_certificate: {
    label: "Educational Certificate",
    chip: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  training_certificate: {
    label: "Training Certificate",
    chip: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  performance_review: {
    label: "Performance Review",
    chip: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  medical_report: {
    label: "Medical Report",
    chip: "bg-rose-50 text-rose-700 ring-rose-100",
  },
  proposal: {
    label: "Proposal Document",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  invoice: {
    label: "Invoice",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  gst_certificate: {
    label: "GST Certificate",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  company_registration: {
    label: "Company Registration",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  nda: {
    label: "NDA Agreement",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  project_brief: {
    label: "Project Brief",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  scope_of_work: {
    label: "Scope of Work",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  },
  other: { label: "Other", chip: "bg-slate-100 text-slate-700 ring-slate-200" },
};

const getDocumentTypeMeta = (type) =>
  DOCUMENT_TYPE_META[type] || {
    label: type || "Other",
    chip: "bg-slate-100 text-slate-700 ring-slate-200",
  };

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

// A small labelled figure used on the stats strip.
const StatCard = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
      <Icon size={18} />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-0.5 text-xl font-black text-slate-950">{value}</p>
    </div>
  </div>
);

// A document's visual: an actual thumbnail for images, a colored file-type
// icon for everything else.
const DocThumb = ({ doc, size = "md" }) => {
  const dims = size === "sm" ? "h-9 w-9" : "h-12 w-12";
  if (isImageDoc(doc)) {
    return (
      <img
        src={doc.fileUrl}
        alt={doc.title}
        className={`${dims} shrink-0 rounded-lg border border-slate-200 object-cover`}
        loading="lazy"
      />
    );
  }
  return (
    <div
      className={`flex ${dims} shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white`}
    >
      {getDocumentIcon(doc.fileType)}
    </div>
  );
};

// Document Viewer Modal
const DocumentViewer = ({ isOpen, onClose, person, documents }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  if (!isOpen || !person) return null;

  const handleDeleteDocument = async (documentId) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      await deleteEmployeeDocument(documentId);

      // Remove document from list
      const updatedDocuments = documents.filter(
        (doc) => doc._id !== documentId,
      );
      person.documents = updatedDocuments;

      // If no documents left, close modal
      if (updatedDocuments.length === 0) {
        onClose();
      }

      // Refresh the main list
      window.location.reload();
    } catch (error) {
      setDeleteError(error.message || "Failed to delete document");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
              {getInitials(person.name)}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Employee Documents
              </p>
              <h2 className="truncate text-lg font-black text-slate-950">
                {person.name}
              </h2>
              <p className="flex items-center gap-1 text-xs text-slate-500">
                <Mail size={12} />
                {person.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <X size={20} />
          </button>
        </div>

        {/* Document List */}
        <div
          className="overflow-y-auto p-6"
          style={{ maxHeight: "calc(90vh - 200px)" }}
        >
          {deleteError && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              <AlertCircle size={18} />
              {deleteError}
            </div>
          )}

          {documents && documents.length > 0 ? (
            <div className="grid gap-3">
              {documents.map((doc) => {
                const typeMeta = getDocumentTypeMeta(doc.documentType);
                return (
                  <div
                    key={doc._id}
                    className="flex items-center gap-4 rounded-lg border border-slate-200 bg-slate-50/50 p-4 transition hover:bg-slate-50 hover:shadow-sm"
                  >
                    <DocThumb doc={doc} />

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-slate-950">
                        {doc.title}
                      </p>
                      <span
                        className={`mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${typeMeta.chip}`}
                      >
                        {typeMeta.label}
                      </span>
                      {doc.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">
                          {doc.description}
                        </p>
                      )}
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        <span className="flex items-center gap-1">
                          <CalendarDays size={12} />
                          {formatDate(doc.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      {doc.backFileUrl ? (
                        <>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-50 hover:text-blue-700"
                            title="View Front Side"
                          >
                            <Eye size={14} />
                            Front
                          </a>
                          <a
                            href={doc.backFileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-indigo-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                            title="View Back Side"
                          >
                            <Eye size={14} />
                            Back
                          </a>
                        </>
                      ) : (
                        <>
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                            title="View Document"
                          >
                            <Eye size={16} />
                          </a>
                          <a
                            href={doc.fileUrl}
                            download={doc.fileName}
                            className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-700"
                            title="Download Document"
                          >
                            <Download size={16} />
                          </a>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDeleteDocument(doc._id)}
                        disabled={isDeleting}
                        className="rounded-lg border border-slate-200 bg-white p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                        title="Delete Document"
                      >
                        {isDeleting ? (
                          <Loader2 size={16} className="animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <FileText size={28} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-950">
                No Documents Found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                This employee hasn't uploaded any documents yet.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-600">
              Total {documents?.length || 0} documents
            </p>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <Plus size={17} />
              Upload Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Component
const DocumentUploads = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Fetch employee documents
  const fetchDocuments = async () => {
    try {
      setIsLoading(true);
      setError("");

      const response = await getEmployeeDocuments();

      if (response.success) {
        setDocuments(response.data || []);
      } else {
        setError(response.message || "Failed to fetch documents");
      }
    } catch (error) {
      setError(error.message || "Failed to fetch documents");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  // Group documents by employee, sorted newest-upload-first per employee
  const groupDocumentsByPerson = () => {
    const grouped = {};

    documents.forEach((doc) => {
      const personId = doc.NewEmployee_id;
      if (!personId) return;

      if (!grouped[personId]) {
        grouped[personId] = {
          id: personId,
          name: doc.name || "Unknown",
          email: doc.email || "No email",
          documents: [],
        };
      }
      grouped[personId].documents.push(doc);
    });

    return Object.values(grouped).map((person) => ({
      ...person,
      documents: [...person.documents].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    }));
  };

  const persons = useMemo(() => groupDocumentsByPerson(), [documents]);

  // Filter employees
  const filteredPersons = useMemo(() => {
    return persons.filter((person) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        person.name.toLowerCase().includes(searchLower) ||
        person.email.toLowerCase().includes(searchLower) ||
        person.documents.some(
          (doc) =>
            doc.title?.toLowerCase().includes(searchLower) ||
            getDocumentTypeMeta(doc.documentType)
              .label.toLowerCase()
              .includes(searchLower),
        )
      );
    });
  }, [persons, searchTerm]);

  // Pagination
  const totalPages = Math.ceil(filteredPersons.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPersons = filteredPersons.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  const goToPage = (page) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const openDocumentViewer = (person) => {
    setSelectedPerson(person);
    setIsViewerOpen(true);
  };

  const closeDocumentViewer = () => {
    setSelectedPerson(null);
    setIsViewerOpen(false);
  };

  const recentUploadsCount = useMemo(() => {
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return documents.filter(
      (doc) => new Date(doc.createdAt).getTime() >= weekAgo,
    ).length;
  }, [documents]);

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      {/* Header */}
      <div className="border-b border-slate-200 pb-5">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Document Management
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
          Employee Documents
        </h1>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search
          size={18}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          placeholder="Search employees by name, email, or document title..."
          className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          icon={UserRound}
          label="Total Employees"
          value={filteredPersons.length}
        />
        <StatCard
          icon={Files}
          label="Total Documents"
          value={documents.length}
        />
        <StatCard
          icon={Clock}
          label="Uploaded This Week"
          value={recentUploadsCount}
        />
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 size={24} className="animate-spin" />
            <span className="font-semibold">Loading documents...</span>
          </div>
        </div>
      ) : filteredPersons.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText size={25} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No employees found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            {searchTerm
              ? "No employees match your search criteria. Try adjusting your search."
              : "No employees have uploaded documents yet."}
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {paginatedPersons.map((person) => {
              const previewDocs = person.documents.slice(0, 4);
              const extraCount = person.documents.length - previewDocs.length;
              return (
                <div
                  key={person.id}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 overflow-hidden ">
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-black text-blue-700">
                        {getInitials(person.name)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-slate-950">
                          {person.name}
                        </h3>
                        <p className="flex items-start gap-1 text-xs text-slate-500 break-all">
                          <Mail size={11} className="shrink-0 mt-0.5" />
                          <span>{person.email}</span>
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      {person.documents.length} docs
                    </span>
                  </div>

                  {/* Thumbnail strip - a quick visual sense of what's on file */}
                  <div className="mt-4 flex items-center gap-2">
                    {previewDocs.map((doc) => (
                      <DocThumb key={doc._id} doc={doc} size="sm" />
                    ))}
                    {extraCount > 0 && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-xs font-bold text-slate-500">
                        +{extraCount}
                      </div>
                    )}
                  </div>

                  <p className="mt-3 flex items-center gap-1.5 text-xs font-medium text-slate-400">
                    <Clock size={12} />
                    Last upload{" "}
                    {formatRelativeTime(person.documents[0]?.createdAt)}
                  </p>

                  <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openDocumentViewer(person)}
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
                    >
                      <Eye size={16} />
                      View Documents
                    </button>
                    <button
                      type="button"
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-red-600 transition hover:bg-red-50"
                      title="Delete all documents"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Showing {startIndex + 1} -{" "}
              {Math.min(startIndex + itemsPerPage, filteredPersons.length)} of{" "}
              {filteredPersons.length} employees
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage <= 1}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <span className="px-3 text-sm font-semibold text-slate-700">
                {currentPage} / {totalPages || 1}
              </span>
              <button
                type="button"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {/* Document Viewer Modal */}
      <DocumentViewer
        isOpen={isViewerOpen}
        onClose={closeDocumentViewer}
        person={selectedPerson}
        documents={selectedPerson?.documents}
      />
    </section>
  );
};

export default DocumentUploads;

//docs
