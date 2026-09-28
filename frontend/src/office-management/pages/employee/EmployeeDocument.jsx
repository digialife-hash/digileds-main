// EmployeeDocument.jsx

import React, { useState, useEffect, useRef } from "react";
import {
  Plus,
  X,
  Upload,
  FileText,
  Image,
  File,
  Trash2,
  Download,
  Eye,
  Search,
  CalendarDays,
  User,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  uploadEmployeeDocument,
  getEmployeeDocuments,
  deleteEmployeeDocument,
} from "../../services/employeeService";
// Document type options
const DOCUMENT_TYPES = [
  { value: "resume", label: "Resume / CV" },
  { value: "offer_letter", label: "Offer Letter" },
  { value: "appointment_letter", label: "Appointment Letter" },
  { value: "identity_proof", label: "Identity Proof" },
  { value: "address_proof", label: "Address Proof" },
  { value: "educational_certificate", label: "Educational Certificate" },
  { value: "experience_letter", label: "Experience Letter" },
  { value: "salary_slip", label: "Salary Slip" },
  { value: "performance_review", label: "Performance Review" },
  { value: "training_certificate", label: "Training Certificate" },
  { value: "medical_report", label: "Medical Report" },
  { value: "other", label: "Other" },
];

// File size limit (5MB)
const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_FILE_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const getFileIcon = (fileType) => {
  if (fileType?.includes("pdf"))
    return <FileText className="w-5 h-5 text-red-500" />;
  if (fileType?.includes("image"))
    return <Image className="w-5 h-5 text-purple-500" />;
  if (fileType?.includes("word"))
    return <FileText className="w-5 h-5 text-blue-500" />;
  if (fileType?.includes("excel"))
    return <FileText className="w-5 h-5 text-green-500" />;
  return <File className="w-5 h-5 text-gray-500" />;
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

const DocumentUploadModal = ({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  employeeEmail,
  onUploadSuccess,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    documentType: "",
    description: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBackFile, setSelectedBackFile] = useState(null);
  const [fileError, setFileError] = useState("");
  const [backFileError, setBackFileError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const fileInputRef = useRef(null);
  const backFileInputRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setFormData({ title: "", documentType: "", description: "" });
      setSelectedFile(null);
      setSelectedBackFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      if (backFileInputRef.current) {
        backFileInputRef.current.value = "";
      }
      setFileError("");
      setBackFileError("");
      setUploadProgress(0);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFileError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setFileError("Invalid file type. Please upload PDF, JPEG, PNG");
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setFileError(
        `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
      );
      setSelectedFile(null);
      e.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleBackFileChange = (e) => {
    const file = e.target.files[0];
    setBackFileError("");

    if (!file) {
      setSelectedBackFile(null);
      return;
    }

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setBackFileError("Invalid file type. Please upload PDF, JPEG, PNG");
      setSelectedBackFile(null);
      e.target.value = "";
      return;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setBackFileError(
        `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`,
      );
      setSelectedBackFile(null);
      e.target.value = "";
      return;
    }

    setSelectedBackFile(file);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    if (!formData.title.trim()) {
      setFileError("Please enter a document title.");
      return;
    }

    if (!formData.documentType) {
      setFileError("Please select a document type.");
      return;
    }

    if (!selectedFile) {
      setFileError("Please select a file to upload.");
      return;
    }

    try {
      setIsSubmitting(true);
      setUploadProgress(0);

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 200);

      const uploadFormData = new FormData();
      uploadFormData.append("employeeId", employeeId);
      uploadFormData.append("employeeName", employeeName);
      uploadFormData.append("employeeEmail", employeeEmail);
      uploadFormData.append("title", formData.title.trim());
      uploadFormData.append("documentType", formData.documentType);
      uploadFormData.append("description", formData.description.trim());
      uploadFormData.append("file", selectedFile);
      if (formData.documentType === "address_proof" && selectedBackFile) {
        uploadFormData.append("backFile", selectedBackFile);
      }

      const response = await uploadEmployeeDocument(uploadFormData);

      clearInterval(progressInterval);

      if (response.success) {
        setUploadProgress(100);
        onUploadSuccess(response.data);
        onClose();
        // Reset form
        setFormData({ title: "", documentType: "", description: "" });
        setSelectedFile(null);
        setSelectedBackFile(null);
        setFileError("");
        setBackFileError("");
        setUploadProgress(0);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        if (backFileInputRef.current) {
          backFileInputRef.current.value = "";
        }
      }
    } catch (error) {
      setFileError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload document.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl max-h-[92vh] overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-4 shrink-0">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-blue-600">
              Upload Document
            </p>
            <h2 className="mt-1 text-xl font-black text-slate-950">
              Add Employee Document
            </h2>
            <p className="text-sm text-slate-500">
              Upload important documents for the employee
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form
          id="documentUploadForm"
          onSubmit={handleSubmit}
          className="overflow-y-auto p-6 flex-1 space-y-6"
        >
          {/* Document Type & Title */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Document Type */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                name="documentType"
                value={formData.documentType}
                onChange={handleChange}
                className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                disabled={isSubmitting}
                required
              >
                <option value="">Select document type</option>
                {DOCUMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Document Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Aadhar Card, Voter ID, Utility Bill"
                className="w-full h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                disabled={isSubmitting}
                required
              />
            </div>
          </div>

          {/* File Upload Area (Front Side or Single File) */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {formData.documentType === "address_proof"
                ? "Document File (Front Side)"
                : "Document File"}{" "}
              <span className="text-red-500">*</span>
            </label>
            <div
              className={`relative border-2 border-dashed rounded-xl p-6 text-center transition ${
                selectedFile
                  ? "border-green-300 bg-green-50"
                  : fileError
                    ? "border-red-300 bg-red-50"
                    : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isSubmitting}
              />

              {selectedFile ? (
                <div className="flex items-center justify-center gap-4">
                  <div className="flex items-center gap-3">
                    {getFileIcon(selectedFile.type)}
                    <div className="text-left">
                      <p className="font-semibold text-slate-950 truncate max-w-xs">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedFile(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = "";
                      }
                    }}
                    className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div>
                  <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm font-semibold text-slate-700">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    PDF, JPEG, PNG, (Max {MAX_FILE_SIZE / (1024 * 1024)}MB)
                  </p>
                </div>
              )}
            </div>
            {fileError && (
              <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1">
                <AlertCircle size={14} />
                {fileError}
              </p>
            )}
          </div>

          {/* File Upload Area (Back Side - Address Proof Only) */}
          {formData.documentType === "address_proof" && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Document File (Back Side){" "}
                <span className="text-slate-400 text-xs font-normal">
                  (Optional)
                </span>
              </label>
              <div
                className={`relative border-2 border-dashed rounded-xl p-6 text-center transition ${
                  selectedBackFile
                    ? "border-green-300 bg-green-50"
                    : backFileError
                      ? "border-red-300 bg-red-50"
                      : "border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/50"
                }`}
              >
                <input
                  ref={backFileInputRef}
                  type="file"
                  onChange={handleBackFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={isSubmitting}
                />

                {selectedBackFile ? (
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-3">
                      {getFileIcon(selectedBackFile.type)}
                      <div className="text-left">
                        <p className="font-semibold text-slate-950 truncate max-w-xs">
                          {selectedBackFile.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatFileSize(selectedBackFile.size)}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBackFile(null);
                        if (backFileInputRef.current) {
                          backFileInputRef.current.value = "";
                        }
                      }}
                      className="rounded-lg p-1.5 text-red-600 hover:bg-red-50"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                    <p className="text-sm font-semibold text-slate-700">
                      Click to upload back side or drag and drop
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      PDF, JPEG, PNG, (Max {MAX_FILE_SIZE / (1024 * 1024)}MB)
                    </p>
                  </div>
                )}
              </div>
              {backFileError && (
                <p className="mt-2 text-xs font-semibold text-red-600 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {backFileError}
                </p>
              )}
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Description{" "}
              <span className="text-slate-400 text-xs font-normal">
                (Optional)
              </span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Add any additional notes about this document..."
              rows="3"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100 resize-none"
              disabled={isSubmitting}
            />
          </div>

          {/* Upload Progress */}
          {isSubmitting && (
            <div>
              <div className="flex items-center justify-between text-sm font-semibold text-slate-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="documentUploadForm"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={17} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload size={17} />
                Upload Document
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Document Card Component
const DocumentCard = ({ document, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      setIsDeleting(true);

      await onDelete(document._id);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group rounded-lg border border-slate-200 bg-white p-4 transition hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 border border-slate-200">
          {getFileIcon(document.fileType)}
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-slate-950 truncate">
            {document.title}
          </h3>
          <div className="mt-2 space-y-1">
            <p className="flex items-center gap-2 text-sm text-slate-700">
              <User size={14} />
              {document.name}
            </p>

            <p className="text-xs text-slate-500">{document.email}</p>
          </div>
          <p className="text-sm text-slate-600 truncate mt-1">
            {DOCUMENT_TYPES.find((t) => t.value === document.documentType)
              ?.label || document.documentType}
          </p>
          {document.description && (
            <p className="text-xs text-slate-500 mt-1 line-clamp-2">
              {document.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400">
            <span>{formatFileSize(document.fileSize)}</span>
            {document.backFileSize > 0 && (
              <span>+ {formatFileSize(document.backFileSize)} (Back)</span>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <CalendarDays size={12} />
              {new Date(document.createdAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </span>
          </div>

          {/* Front Side and Back Side View Buttons */}
          {document.backFileUrl && (
            <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
              >
                <Eye size={12} />
                Front Side
              </a>
              <a
                href={document.backFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-2.5 py-1.5 text-xs font-bold text-indigo-700 transition hover:bg-indigo-100"
              >
                <Eye size={12} />
                Back Side
              </a>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {!document.backFileUrl && (
            <>
              <a
                href={document.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                title="View Document"
              >
                <Eye size={16} />
              </a>
              <a
                href={document.fileUrl}
                download
                className="rounded-lg p-2 text-slate-600 transition hover:bg-green-50 hover:text-green-700"
                title="Download Document"
              >
                <Download size={16} />
              </a>
            </>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="rounded-lg p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed"
          >
            {isDeleting ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Trash2 size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Employee Document Component
const EmployeeDocument = ({ employeeId, employeeName, employeeEmail }) => {
  //.log(employeeId);
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [error, setError] = useState("");
  // Fetch documents
  // useEffect(() => {
  //   const fetchDocuments = async () => {
  //     try {
  //       setIsLoading(true);
  //       setError("");
  //       // API call to fetch documents
  //       const response = await getEmployeeDocuments();

  //       if (response.success) {
  //         setDocuments(response.data);
  //       }
  //     } catch (error) {
  //       setError(error.message || "Failed to fetch documents");
  //       setIsLoading(false);
  //     }
  //   };

  //   if (employeeId) {
  //     fetchDocuments();
  //   }
  // }, [employeeId]);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setIsLoading(true);
        setError("");

        const response = await getEmployeeDocuments();
        if (response.success) {
          setDocuments(response.data);
        }
      } catch (error) {
        setError(error.message || "Failed to fetch documents");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Handle document upload success
  const handleUploadSuccess = (newDocument) => {
    setDocuments((prev) => [newDocument, ...prev]);
  };

  // Handle document delete
  const handleDocumentDelete = async (documentId) => {
    try {
      const response = await deleteEmployeeDocument(documentId);

      if (response.success) {
        setDocuments((prev) => prev.filter((doc) => doc._id !== documentId));
      }
    } catch (error) {
      alert(
        error.response?.data?.message ||
          error.message ||
          "Failed to delete document.",
      );
    }
  };



  // Filter documents
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType ? doc.documentType === filterType : true;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-black text-slate-950">Documents</h2>
            <span className="text-sm font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {documents.length}
            </span>
          </div>
          {employeeName && (
            <p className="text-sm text-slate-500">
              Documents for {employeeName}
            </p>
          )}
        </div>

        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Plus size={17} />
          Add Document
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents..."
            className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="h-11 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
        >
          <option value="">All Types</option>
          {DOCUMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex items-center gap-2">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <div className="flex min-h-48 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 size={24} className="animate-spin" />
            <span className="font-semibold">Loading documents...</span>
          </div>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <FileText size={25} />
          </div>
          <h3 className="mt-4 text-lg font-black text-slate-950">
            {searchTerm || filterType
              ? "No documents found"
              : "No documents uploaded"}
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            {searchTerm || filterType
              ? "Try adjusting your search or filters"
              : "Upload the first document for this employee"}
          </p>
          {!searchTerm && !filterType && (
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-blue-700"
            >
              <Plus size={16} />
              Upload Document
            </button>
          )}
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredDocuments.map((document) => (
            <DocumentCard
              key={document._id}
              document={document}
              onDelete={handleDocumentDelete}
            />
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employeeId={employeeId}
        employeeName={employeeName}
        employeeEmail={employeeEmail}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  );
};

export default EmployeeDocument;
