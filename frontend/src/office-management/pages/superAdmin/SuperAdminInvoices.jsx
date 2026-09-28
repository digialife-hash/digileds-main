import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CreditCard,
  Download,
  FileText,
  Pencil,
  Plus,
  Printer,
  Save,
  Trash2,
  X,
  MoreVertical,
} from "lucide-react";

import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";

import { getClients } from "../../services/clientService";
import { adminGetAllServiceDetailsApi } from "../../services/clientServiceDetailService";

import {
  createInvoice,
  getInvoices,
  updateInvoice,
  deleteInvoice,
} from "../../services/invoiceService";

import { getProjects } from "../../services/projectService";

import {
  getBankSettings,
  getCompanySettings,
  updateBankSettings,
} from "../../services/settingsService";

import { ROUTES } from "../../routes/routeConstants";
import { openInvoicePrintView } from "../../utils/invoicePrint";

/* =========================================================
   PAYMENT STATUS
   OVERDUE REMOVED
========================================================= */

const paymentStatuses = ["pending", "partially_paid", "paid"];

/* =========================================================
   PAYMENT MODES
========================================================= */

const paymentModes = ["offline", "online"];

const statusBadgeClass = {
  pending: "bg-amber-50 text-amber-700 ring-amber-100",
  partially_paid: "bg-blue-50 text-blue-700 ring-blue-100",
  paid: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

/* =========================================================
   TAX TYPE OPTIONS
========================================================= */

const taxTypeOptions = [
  ["with_tax", "With Tax"],
  ["without_tax", "Without Tax"],
];

/* =========================================================
   DEFAULT FORM
========================================================= */

const defaultFormData = {
  clientId: "",
  projectId: "",
  serviceDetailId: "",
  serviceType: "",
  items: [
    {
      description: "",
      amount: "",
    },
  ],
  tax: "",
  taxExempt: false,
  paymentStatus: "pending",
  dueDate: "",
  paidDate: "",
  invoiceDate: "",
  invoiceTime: "",
  advancePayments: [],
  totalAmount: "",
};

/* =========================================================
   DEFAULT BANK DETAILS
========================================================= */

const defaultBankDetails = {
  bankName: "",
  accountNumber: "",
  branchName: "",
  ifscCode: "",
  accountHolderName: "",
  upiId: "",
};

/* =========================================================
   DEFAULT COMPANY DETAILS
========================================================= */

const defaultCompanyDetails = {
  companyName: "",
  companyEmail: "",
  companyPhone: "",
  companyAddress: "",
  website: "",
  gstNumber: "",
  companyLogo: "",
};

/* =========================================================
   HELPERS
========================================================= */

const formatLabel = (value = "") => String(value).replaceAll("_", " ");

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return "Not set";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};

/* =========================================================
   DATE + TIME
========================================================= */

const formatDateTime12h = (value) => {
  if (!value) return "Not recorded";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not recorded";
  }

  const datePart = new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);

  const timePart = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return `${datePart}, ${timePart}`;
};

/* =========================================================
   ID
========================================================= */

const createAdvancePaymentId = () =>
  `adv-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const getClientName = (client) => {
  if (!client) return "Client";

  if (typeof client === "string") {
    return client;
  }

  return client.companyName || client.clientName || "Client";
};

const getProjectName = (project) => {
  if (!project) return "Project";

  if (typeof project === "string") {
    return project;
  }

  return project.projectName || "Project";
};

const getServiceName = (serviceDetail, serviceType = "") => {
  if (serviceDetail && typeof serviceDetail !== "string") {
    return (
      serviceDetail.serviceName ||
      formatLabel(serviceDetail.serviceType || serviceType)
    );
  }

  return serviceType ? formatLabel(serviceType) : "Not linked";
};

const getGeneratedBy = (user) => {
  if (!user) return "System";

  if (typeof user === "string") {
    return user;
  }

  return `${user.name || "User"}${user.role ? ` (${formatLabel(user.role)})` : ""}`;
};

const getId = (value) => {
  if (!value) return "";

  if (typeof value === "string") {
    return value;
  }

  return value._id || "";
};

const toDateInputValue = (value) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
};

/* =========================================================
   CLIENT TAX HELPER
========================================================= */

const isClientTaxExempt = (client) => {
  if (!client) {
    return false;
  }

  if (client.taxExempt === true || client.taxExempt === "true") {
    return true;
  }

  if (client.taxExempt === false || client.taxExempt === "false") {
    return false;
  }

  /*
   * Compatibility for older client records:
   * GST present -> With Tax
   * GST missing -> Without Tax
   */
  return !String(client.gstNumber || "").trim();
};

/* =========================================================
   ADVANCE PAYMENTS
========================================================= */

const getAdvancePaymentsList = (invoice) => {
  if (Array.isArray(invoice.advancePayments) && invoice.advancePayments.length) {
    return invoice.advancePayments.map((payment, index) => ({
      id: payment._id || payment.id || `advance-${index}`,
      amount: Number(payment.amount || 0),
      mode: payment.mode || "offline",
      receivedBy: payment.receivedBy || "",
      recordedAt: payment.recordedAt || payment.date || invoice.createdAt,
    }));
  }

  if (invoice.advancePayment) {
    return [
      {
        id: "legacy-advance",
        amount: Number(invoice.advancePayment || 0),
        mode: invoice.paymentMode || "offline",
        receivedBy: invoice.advancePaymentReceivedBy || "",
        recordedAt:
          invoice.advancePaymentDate ||
          invoice.createdAt ||
          new Date().toISOString(),
      },
    ];
  }

  return [];
};

/* =========================================================
   ADVANCE SUMMARY
========================================================= */

const getAdvanceSummary = (invoice) => {
  const payments = getAdvancePaymentsList(invoice);

  const total =
    typeof invoice.totalAdvancePaid === "number"
      ? invoice.totalAdvancePaid
      : payments.reduce((sum, payment) => sum + payment.amount, 0);

  return {
    total,
    count: payments.length,
  };
};

/* =========================================================
   ROW ACTION MENU
   Width in px, kept in sync with the className below (w-44)
========================================================= */

const ROW_MENU_WIDTH = 176;
const ROW_MENU_ESTIMATED_HEIGHT = 240;
const ROW_MENU_GAP = 8;

/* =========================================================
   COMPONENT
========================================================= */

const SuperAdminInvoices = () => {
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const menuRef = useRef(null);

  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useSearchParams();

  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [serviceDetails, setServiceDetails] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState(defaultFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [bankDetails, setBankDetails] = useState(defaultBankDetails);
  const [bankFormData, setBankFormData] = useState(defaultBankDetails);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isSavingBank, setIsSavingBank] = useState(false);

  const [companyDetails, setCompanyDetails] = useState(defaultCompanyDetails);

  /* =======================================================
     ROW ACTION MENU: close on outside click / scroll / resize / escape
     Rendered through a portal so it is never clipped by an
     ancestor's `overflow-hidden` (this was the original bug).
  ======================================================= */

  useEffect(() => {
    if (!openMenuId) return undefined;

    const handlePointerDown = (event) => {
      if (menuRef.current && menuRef.current.contains(event.target)) {
        return;
      }

      if (event.target.closest("[data-row-menu-trigger]")) {
        return;
      }

      setOpenMenuId(null);
    };

    const handleDismiss = () => setOpenMenuId(null);

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", handleDismiss, true);
    window.addEventListener("resize", handleDismiss);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", handleDismiss, true);
      window.removeEventListener("resize", handleDismiss);
    };
  }, [openMenuId]);

  const handleRowMenuToggle = (event, invoiceId) => {
    if (openMenuId === invoiceId) {
      setOpenMenuId(null);
      setMenuPosition(null);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();

    const spaceBelow = window.innerHeight - rect.bottom;
    const openUpward =
      spaceBelow < ROW_MENU_ESTIMATED_HEIGHT && rect.top > ROW_MENU_ESTIMATED_HEIGHT;

    const left = Math.min(
      Math.max(8, rect.right - ROW_MENU_WIDTH),
      window.innerWidth - ROW_MENU_WIDTH - 8,
    );

    setMenuPosition({
      left,
      top: openUpward ? rect.top - ROW_MENU_GAP : rect.bottom + ROW_MENU_GAP,
      openUpward,
    });

    setOpenMenuId(invoiceId);
  };

  const activeMenuInvoice = useMemo(
    () => invoices.find((invoice) => invoice._id === openMenuId) || null,
    [invoices, openMenuId],
  );

  /* =======================================================
     DELETE INVOICE
  ======================================================= */

  const handleDeleteInvoice = async (invoice) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const confirmed = window.confirm(
        `Are you sure you want to delete invoice "${invoice.invoiceNumber}"?`,
      );

      if (!confirmed) {
        return;
      }

      await deleteInvoice(invoice._id);

      setInvoices((currentInvoices) =>
        currentInvoices.filter((item) => item._id !== invoice._id),
      );

      setOpenMenuId(null);
      setMenuPosition(null);

      setSuccessMessage(`${invoice.invoiceNumber} deleted successfully`);
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message || "Failed to delete invoice");
    }
  };

  /* =======================================================
     FILTERED PROJECTS
  ======================================================= */

  const filteredProjects = useMemo(() => {
    if (!formData.clientId) {
      return projects;
    }

    return projects.filter((project) => {
      const clientId =
        typeof project.clientId === "object"
          ? project.clientId?._id
          : project.clientId;

      return clientId === formData.clientId;
    });
  }, [formData.clientId, projects]);

  /* =======================================================
     FILTERED SERVICES
  ======================================================= */

  const filteredServiceDetails = useMemo(() => {
    if (!formData.clientId) {
      return serviceDetails;
    }

    return serviceDetails.filter(
      (detail) => getId(detail.clientId) === formData.clientId,
    );
  }, [formData.clientId, serviceDetails]);

  /* =======================================================
     OPTIONS
  ======================================================= */

  const clientOptions = useMemo(
    () => [
      ["", "Select client"],
      ...clients.map((client) => [client._id, getClientName(client)]),
    ],
    [clients],
  );

  const projectOptions = useMemo(
    () => [
      ["", "Select project"],
      ...filteredProjects.map((project) => [project._id, project.projectName]),
    ],
    [filteredProjects],
  );

  const serviceOptions = useMemo(
    () => [
      ["", "Select client service"],
      ...filteredServiceDetails.map((detail) => [detail._id, detail.serviceName]),
    ],
    [filteredServiceDetails],
  );

  const paymentStatusOptions = useMemo(
    () => paymentStatuses.map((status) => [status, formatLabel(status)]),
    [],
  );

  const paymentModeOptions = useMemo(
    () => paymentModes.map((mode) => [mode, formatLabel(mode)]),
    [],
  );

  /* =======================================================
     FORM CALCULATIONS
  ======================================================= */

  const invoiceAmount = useMemo(() => {
    return formData.items.reduce((total, item) => {
      const amount = Number(item.amount || 0);

      return total + (Number.isFinite(amount) ? amount : 0);
    }, 0);
  }, [formData.items]);

  const advanceTotal = useMemo(
    () =>
      formData.advancePayments.reduce((sum, payment) => {
        const amount = Number(payment.amount || 0);

        return sum + (Number.isFinite(amount) ? amount : 0);
      }, 0),
    [formData.advancePayments],
  );

  const taxPercentage = Number(formData.tax || 0);

  const taxAmount =
    !formData.taxExempt && Number.isFinite(taxPercentage)
      ? (invoiceAmount * taxPercentage) / 100
      : 0;

  const totalAmount =
    formData.totalAmount !== undefined &&
    formData.totalAmount !== "" &&
    !Number.isNaN(Number(formData.totalAmount))
      ? Number(formData.totalAmount)
      : invoiceAmount + taxAmount;

  /* =======================================================
     FETCH DATA
  ======================================================= */

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const [
        invoiceResult,
        clientResult,
        projectResult,
        serviceDetailResult,
        bankResult,
        companyResult,
      ] = await Promise.all([
        getInvoices({
          limit: 100,
          paymentStatus:
            searchParams.get("status") ||
            searchParams.get("paymentStatus") ||
            undefined,
          clientId: searchParams.get("clientId") || undefined,
          serviceDetailId: searchParams.get("serviceDetailId") || undefined,
        }),
        getClients({ limit: 100, status: "active" }),
        getProjects({ limit: 100 }),
        adminGetAllServiceDetailsApi({ limit: 500 }),
        getBankSettings(),
        getCompanySettings(),
      ]);

      setInvoices(invoiceResult?.data?.invoices || []);
      setClients(clientResult?.data?.clients || []);
      setProjects(projectResult?.data?.projects || []);
      setServiceDetails(serviceDetailResult?.data?.serviceDetails || []);

      setBankDetails({
        ...defaultBankDetails,
        ...(bankResult?.data?.bank || {}),
      });

      setCompanyDetails({
        ...defaultCompanyDetails,
        ...(companyResult?.data?.company || {}),
      });
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message || "Failed to load invoice data");
    } finally {
      setIsLoading(false);
    }
  };

  /* =======================================================
     EFFECTS
  ======================================================= */

  useEffect(() => {
    void fetchData();
  }, [searchParams]);

  useEffect(() => {
    if (isLoading || !invoices.length || isModalOpen) {
      return;
    }

    const invoiceId = searchParams.get("invoiceId");

    if (!invoiceId) {
      return;
    }

    const invoice = invoices.find((item) => item._id === invoiceId);

    if (invoice) {
      openEditModal(invoice);
    }
  }, [isLoading, invoices, isModalOpen, searchParams]);

  useEffect(() => {
    if (isLoading || isModalOpen || searchParams.get("invoiceId")) {
      return;
    }

    const clientId = searchParams.get("clientId");
    const serviceDetailId = searchParams.get("serviceDetailId");

    if (clientId || serviceDetailId) {
      openCreateModal({ clientId, serviceDetailId });
    }
  }, [isLoading, isModalOpen, searchParams, serviceDetails]);

  /* =======================================================
     AUTO CALCULATE TOTAL
  ======================================================= */

  useEffect(() => {
    const calculatedInvoiceAmount = formData.items.reduce((total, item) => {
      const amt = Number(item.amount || 0);

      return total + (Number.isFinite(amt) ? amt : 0);
    }, 0);

    const taxPct = Number(formData.tax || 0);

    const taxAmt =
      !formData.taxExempt && Number.isFinite(taxPct)
        ? (calculatedInvoiceAmount * taxPct) / 100
        : 0;

    const computedTotal = String((calculatedInvoiceAmount + taxAmt).toFixed(2));

    setFormData((current) => {
      if (current.totalAmount === computedTotal) {
        return current;
      }

      return {
        ...current,
        totalAmount: computedTotal,
      };
    });
  }, [formData.items, formData.tax, formData.taxExempt]);

  /* =======================================================
     ITEM HELPERS
  ======================================================= */

  const updateItem = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = () => {
    setFormData((current) => ({
      ...current,
      items: [...current.items, { description: "", amount: "" }],
    }));
  };

  const removeItem = (index) => {
    setFormData((current) => ({
      ...current,
      items:
        current.items.length === 1
          ? current.items
          : current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  /* =======================================================
     ADVANCE PAYMENT HELPERS
  ======================================================= */

  const addAdvancePayment = () => {
    setFormData((current) => ({
      ...current,
      advancePayments: [
        ...current.advancePayments,
        {
          id: createAdvancePaymentId(),
          amount: "",
          mode: "offline",
          receivedBy: "",
          recordedAt: new Date().toISOString(),
        },
      ],
    }));
  };

  const updateAdvancePayment = (id, field, value) => {
    setFormData((current) => ({
      ...current,
      advancePayments: current.advancePayments.map((payment) =>
        payment.id === id ? { ...payment, [field]: value } : payment,
      ),
    }));
  };

  const removeAdvancePayment = (id) => {
    setFormData((current) => ({
      ...current,
      advancePayments: current.advancePayments.filter(
        (payment) => payment.id !== id,
      ),
    }));
  };

  /* =======================================================
     OPEN CREATE MODAL
     ONE BUTTON ONLY
  ======================================================= */

  function openCreateModal(preset = {}) {
    setEditingInvoice(null);

    const now = new Date();

    const currentDate = now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });

    const currentTime = now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

    const selectedServiceDetail = serviceDetails.find(
      (detail) => detail._id === preset.serviceDetailId,
    );

    const selectedClient = clients.find(
      (client) =>
        client._id ===
        (preset.clientId || getId(selectedServiceDetail?.clientId)),
    );

    const selectedClientTaxExempt = isClientTaxExempt(selectedClient);

    setFormData({
      ...defaultFormData,
      clientId:
        preset.clientId || getId(selectedServiceDetail?.clientId) || "",
      serviceDetailId: preset.serviceDetailId || "",
      serviceType: selectedServiceDetail?.serviceType || "",
      tax: selectedClientTaxExempt ? "" : "",
      taxExempt: selectedClientTaxExempt,
      invoiceDate: currentDate,
      invoiceTime: currentTime,
      advancePayments: [],
      totalAmount: "0.00",
    });

    setErrorMessage("");
    setSuccessMessage("");
    setIsModalOpen(true);
  }

  /* =======================================================
     OPEN EDIT MODAL
  ======================================================= */

  function openEditModal(invoice) {
    setEditingInvoice(invoice);

    const existingAdvancePayments =
      Array.isArray(invoice.advancePayments) && invoice.advancePayments.length
        ? invoice.advancePayments.map((payment, index) => ({
            id: payment._id || payment.id || `existing-${index}`,
            amount: String(payment.amount ?? ""),
            mode: payment.mode || "offline",
            receivedBy: payment.receivedBy || "",
            recordedAt:
              payment.recordedAt ||
              payment.date ||
              invoice.createdAt ||
              new Date().toISOString(),
          }))
        : invoice.advancePayment
          ? [
              {
                id: "legacy-advance",
                amount: String(invoice.advancePayment ?? ""),
                mode: invoice.paymentMode || "offline",
                receivedBy: invoice.advancePaymentReceivedBy || "",
                recordedAt:
                  invoice.advancePaymentDate ||
                  invoice.createdAt ||
                  new Date().toISOString(),
              },
            ]
          : [];

    setFormData({
      clientId: getId(invoice.clientId),
      projectId: getId(invoice.projectId),
      serviceDetailId: getId(invoice.serviceDetailId),
      serviceType: invoice.serviceType || "",
      items:
        Array.isArray(invoice.items) && invoice.items.length
          ? invoice.items.map((item) => ({
              description: item.description || "",
              amount: String(item.amount ?? ""),
            }))
          : [{ description: "", amount: "" }],
      tax: String(invoice.tax ?? ""),
      taxExempt: invoice.taxExempt === true || invoice.taxExempt === "true",
      paymentStatus: invoice.paymentStatus || "pending",
      dueDate: toDateInputValue(invoice.dueDate),
      paidDate: toDateInputValue(invoice.paidDate),
      invoiceDate: invoice.invoiceDate || "",
      invoiceTime: invoice.invoiceTime || "",
      advancePayments: existingAdvancePayments,
      totalAmount: String(invoice.totalAmount ?? ""),
    });

    setErrorMessage("");
    setSuccessMessage("");
    setIsModalOpen(true);
  }

  /* =======================================================
     CLOSE INVOICE MODAL
  ======================================================= */

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingInvoice(null);
    setFormData(defaultFormData);

    setSearchParams((current) => {
      const next = new URLSearchParams(current);

      next.delete("invoiceId");
      next.delete("clientId");
      next.delete("serviceDetailId");

      return next;
    });
  };

  /* =======================================================
     HANDLE TAX TYPE
  ======================================================= */

  const handleTaxTypeChange = (event) => {
    const taxType = event.target.value;
    const taxExempt = taxType === "without_tax";

    setFormData((current) => ({
      ...current,
      taxExempt,
      tax: taxExempt ? "" : current.tax,
    }));
  };

  /* =======================================================
     SELECT CLIENT
  ======================================================= */

  const handleClientChange = (event) => {
    const selectedVal = event.target.value;

    const selectedClient = clients.find(
      (client) => client._id === selectedVal,
    );

    const clientTaxExempt = isClientTaxExempt(selectedClient);

    setFormData((current) => ({
      ...current,
      clientId: selectedVal,
      projectId: "",
      serviceDetailId: "",
      serviceType: "",
      taxExempt: clientTaxExempt,
      tax: clientTaxExempt ? "" : current.tax,
    }));
  };

  /* =======================================================
     HANDLE SUBMIT
  ======================================================= */

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (!formData.clientId) {
        setErrorMessage("Please select a client.");
        setIsSubmitting(false);
        return;
      }

      if (advanceTotal < 0) {
        setErrorMessage("Advance payment cannot be negative.");
        setIsSubmitting(false);
        return;
      }

      if (advanceTotal > totalAmount) {
        setErrorMessage("Advance payment cannot exceed the invoice total.");
        setIsSubmitting(false);
        return;
      }

      const { advancePayments, ...restFormData } = formData;

      const payload = {
        ...restFormData,
        tax: formData.taxExempt ? 0 : Number(formData.tax || 0),
        taxExempt: formData.taxExempt,
        items: formData.items.map((item) => ({
          description: item.description,
          amount: Number(item.amount || 0),
        })),
        dueDate:
          formData.dueDate ||
          (editingInvoice
            ? toDateInputValue(editingInvoice.dueDate)
            : new Date().toISOString().slice(0, 10)),
        paidDate: formData.paidDate || undefined,
        invoiceDate: formData.invoiceDate || undefined,
        invoiceTime: formData.invoiceTime || undefined,
        advancePayments: advancePayments.map((payment) => ({
          amount: Number(payment.amount || 0),
          mode: payment.mode || "offline",
          receivedBy: payment.receivedBy || "",
          recordedAt: payment.recordedAt,
        })),
      };

      if (editingInvoice) {
        await updateInvoice(editingInvoice._id, payload);
      } else {
        await createInvoice(payload);
      }

      closeModal();

      setSuccessMessage(
        editingInvoice
          ? "Invoice updated successfully"
          : "Invoice generated and client notification created",
      );

      await fetchData();
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message || "Failed to save invoice");
    } finally {
      setIsSubmitting(false);
    }
  };

  /* =======================================================
     MARK PAID
  ======================================================= */

  const handleMarkPaid = async (invoice) => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      const now = new Date();

      await updateInvoice(invoice._id, {
        paymentStatus: "paid",
        paidDate: now.toISOString(),
      });

      setSuccessMessage(`${invoice.invoiceNumber} marked as paid`);

      await fetchData();
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message);
    }
  };

  /* =======================================================
     BANK MODAL
  ======================================================= */

  const openBankModal = () => {
    setBankFormData({ ...defaultBankDetails, ...bankDetails });
    setErrorMessage("");
    setSuccessMessage("");
    setIsBankModalOpen(true);
  };

  const closeBankModal = () => {
    setIsBankModalOpen(false);
    setBankFormData({ ...defaultBankDetails, ...bankDetails });
  };

  const handleBankChange = (event) => {
    const { name, value } = event.target;

    setBankFormData((current) => ({ ...current, [name]: value }));
  };

  const handleBankSubmit = async () => {
    try {
      setIsSavingBank(true);
      setErrorMessage("");
      setSuccessMessage("");

      const result = await updateBankSettings(bankFormData);

      setBankDetails({
        ...defaultBankDetails,
        ...(result?.data?.bank || {}),
      });

      setIsBankModalOpen(false);

      setSuccessMessage(
        result.message || "Bank details updated successfully",
      );
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      setErrorMessage(error.message || "Failed to update bank details");
    } finally {
      setIsSavingBank(false);
    }
  };

  /* =======================================================
     PRINT / PDF
  ======================================================= */

  const handlePrintInvoice = (invoice) => {
    openInvoicePrintView(invoice, "print", bankDetails, companyDetails);
  };

  const handleDownloadInvoice = (invoice) => {
    openInvoicePrintView(invoice, "pdf", bankDetails, companyDetails);
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />

      {/* ===================================================
          PAGE HEADER
      =================================================== */}

      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Billing
          </p>

          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Invoices
          </h1>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={openBankModal}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 sm:text-sm"
          >
            <CreditCard size={16} />
            Bank Details
          </button>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-blue-700 sm:text-sm"
          >
            <Plus size={16} />
            Generate Invoice
          </button>
        </div>
      </div>

      {/* ===================================================
          MESSAGES
      =================================================== */}

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          {successMessage}
        </div>
      )}

      {/* ===================================================
          LOADING / EMPTY
      =================================================== */}

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : invoices.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white text-center">
          <FileText size={28} className="text-slate-400" />

          <h2 className="mt-4 text-lg font-black text-slate-950">
            No invoices yet
          </h2>
        </div>
      ) : (
        <>
          {/* =================================================
              MOBILE CARDS
          ================================================= */}

          <div className="grid gap-4 md:hidden">
            {invoices.map((invoice) => {
              const advancePayments = getAdvancePaymentsList(invoice);
              const advanceSummary = getAdvanceSummary(invoice);

              const displayStatus =
                invoice.paymentStatus === "overdue"
                  ? "pending"
                  : invoice.paymentStatus || "pending";

              return (
                <article
                  key={invoice._id}
                  className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="break-words text-sm font-black text-slate-950">
                        {invoice.invoiceNumber}
                      </p>

                      <p className="mt-1 text-xs font-semibold text-slate-500">
                        Created {formatDate(invoice.createdAt)}
                      </p>

                      {invoice.taxExempt && (
                        <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                          Without Tax
                        </span>
                      )}
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                        statusBadgeClass[displayStatus] ||
                        statusBadgeClass.pending
                      }`}
                    >
                      {formatLabel(displayStatus)}
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3">
                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Client / Project
                      </p>

                      <p className="mt-1 break-words text-sm font-black text-slate-950">
                        {getClientName(invoice.clientId)}
                      </p>

                      <p className="mt-1 break-words text-sm font-semibold text-slate-600">
                        {getProjectName(invoice.projectId)}
                      </p>

                      <p className="mt-1 break-words text-xs font-bold text-blue-700">
                        {getServiceName(
                          invoice.serviceDetailId,
                          invoice.serviceType,
                        )}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Amount
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-950">
                          {formatCurrency(invoice.totalAmount)}
                        </p>

                        {invoice.taxExempt && (
                          <p className="mt-1 text-xs font-bold text-emerald-700">
                            Without tax
                          </p>
                        )}
                      </div>

                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Due
                        </p>

                        <p className="mt-1 text-sm font-black text-slate-950">
                          {formatDate(invoice.dueDate)}
                        </p>
                      </div>
                    </div>

                    {/* -------------------------------------
                        ADVANCE PAYMENTS
                    ------------------------------------- */}

                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Advance Payments
                      </p>

                      {advancePayments.length === 0 ? (
                        <p className="mt-1 text-sm font-semibold text-slate-400">
                          No advance payments
                        </p>
                      ) : (
                        <div className="mt-2 space-y-1.5">
                          {advancePayments.map((payment, idx) => (
                            <div
                              key={payment.id}
                              className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600"
                            >
                              <span className="truncate">
                                #{idx + 1} {formatCurrency(payment.amount)} ·{" "}
                                {formatLabel(payment.mode)}
                                {payment.receivedBy
                                  ? ` · ${payment.receivedBy}`
                                  : ""}
                              </span>

                              <span className="shrink-0 text-[11px] text-slate-400">
                                {formatDateTime12h(payment.recordedAt)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="mt-2 flex items-center justify-between border-t border-slate-200 pt-2">
                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                          Total Advance Payments
                        </span>

                        <span className="text-sm font-black text-slate-950">
                          {formatCurrency(advanceSummary.total)}
                        </span>
                      </div>
                    </div>

                    {/* -------------------------------------
                        GENERATED BY
                    ------------------------------------- */}

                    <div className="rounded-lg bg-slate-50 px-3 py-2">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Generated By
                      </p>

                      <p className="mt-1 break-words text-sm font-black text-slate-950">
                        {getGeneratedBy(invoice.createdBy)}
                      </p>

                      {invoice.paidDate && (
                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Paid {formatDate(invoice.paidDate)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* -------------------------------------
                      ACTIONS
                  ------------------------------------- */}

                  <div className="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
                    <button
                      type="button"
                      onClick={() => openEditModal(invoice)}
                      className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Pencil size={13} />
                      Edit
                    </button>

                    {invoice.paymentStatus !== "paid" && (
                      <button
                        type="button"
                        onClick={() => handleMarkPaid(invoice)}
                        className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Save size={13} />
                        Mark Paid
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handlePrintInvoice(invoice)}
                      className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Printer size={13} />
                      Print
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="inline-flex min-h-9 items-center justify-center gap-1 rounded-lg border border-slate-200 px-2 py-1.5 text-xs font-bold text-slate-700 transition hover:bg-slate-50"
                    >
                      <Download size={13} />
                      PDF
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          {/* =================================================
              DESKTOP TABLE
          ================================================= */}

          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm md:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Invoice</th>
                  <th className="px-5 py-4">Client / Project</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Paid Amount</th>
                  <th className="px-5 py-4">Due Amount</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => {
                  const advanceSummary = getAdvanceSummary(invoice);

                  const dueAmount =
                    typeof invoice.balanceAmount === "number"
                      ? invoice.balanceAmount
                      : Math.max(
                          0,
                          Number(invoice.totalAmount || 0) -
                            advanceSummary.total,
                        );

                  return (
                    <tr key={invoice._id} className="transition hover:bg-slate-50">
                      <td className="px-5 py-4 align-top">
                        <p className="font-black text-slate-950">
                          {invoice.invoiceNumber}
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-500">
                          Created {formatDate(invoice.createdAt)}
                        </p>

                        {invoice.taxExempt && (
                          <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                            Without Tax
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 align-top">
                        <p className="truncate text-sm font-bold text-slate-900">
                          {getClientName(invoice.clientId)}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-500">
                          {getProjectName(invoice.projectId)}
                        </p>

                        <p className="mt-1 truncate text-xs font-bold text-blue-700">
                          {getServiceName(
                            invoice.serviceDetailId,
                            invoice.serviceType,
                          )}
                        </p>

                        <p className="mt-1 truncate text-xs font-semibold text-slate-400">
                          By {getGeneratedBy(invoice.createdBy)}
                        </p>
                      </td>

                      <td className="px-5 py-4 align-top text-sm font-black text-slate-900">
                        <p>{formatCurrency(invoice.totalAmount)}</p>

                        {invoice.taxExempt && (
                          <span className="mt-2 inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">
                            Without Tax
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 align-top text-sm font-black text-emerald-700">
                        {formatCurrency(advanceSummary.total)}

                        {advanceSummary.count > 0 && (
                          <p className="mt-1 text-xs font-semibold text-slate-400">
                            {advanceSummary.count} payment
                            {advanceSummary.count > 1 ? "s" : ""}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4 align-top text-sm font-black text-blue-800">
                        {formatCurrency(dueAmount)}
                      </td>

                      <td className="px-5 py-4 align-top">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            data-row-menu-trigger
                            onClick={(event) =>
                              handleRowMenuToggle(event, invoice._id)
                            }
                            className={`inline-flex items-center justify-center rounded-lg border p-2 transition ${
                              openMenuId === invoice._id
                                ? "border-blue-300 bg-blue-50 text-blue-700"
                                : "border-slate-200 text-slate-600 hover:bg-slate-50"
                            }`}
                            aria-haspopup="menu"
                            aria-expanded={openMenuId === invoice._id}
                          >
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ===================================================
          ROW ACTION MENU (PORTAL)
          Rendered at document.body so it is never clipped by
          the table's overflow-hidden wrapper, and always
          positioned relative to the trigger button on screen.
      =================================================== */}

      {openMenuId &&
        menuPosition &&
        activeMenuInvoice &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            style={{
              position: "fixed",
              left: menuPosition.left,
              top: menuPosition.openUpward ? undefined : menuPosition.top,
              bottom: menuPosition.openUpward
                ? window.innerHeight - menuPosition.top
                : undefined,
              width: ROW_MENU_WIDTH,
            }}
            className="z-[100] rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          >
            <button
              type="button"
              onClick={() => {
                openEditModal(activeMenuInvoice);
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Pencil size={15} />
              Edit
            </button>

            {activeMenuInvoice.paymentStatus !== "paid" && (
              <button
                type="button"
                onClick={() => {
                  handleMarkPaid(activeMenuInvoice);
                  setOpenMenuId(null);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                <Save size={15} />
                Mark Paid
              </button>
            )}

            <button
              type="button"
              onClick={() => {
                handlePrintInvoice(activeMenuInvoice);
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Printer size={15} />
              Print
            </button>

            <button
              type="button"
              onClick={() => {
                handleDownloadInvoice(activeMenuInvoice);
                setOpenMenuId(null);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Download size={15} />
              PDF
            </button>

            <div className="my-1 border-t border-slate-100" />

            <button
              type="button"
              onClick={() => {
                handleDeleteInvoice(activeMenuInvoice);
              }}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-bold text-red-600 hover:bg-red-50"
            >
              <Trash2 size={15} />
              Delete
            </button>
          </div>,
          document.body,
        )}

      {/* ===================================================
          INVOICE MODAL
      =================================================== */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            {/* =============================================
                MODAL HEADER
            ============================================= */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {editingInvoice
                    ? "Invoice Editing"
                    : formData.taxExempt
                      ? "Tax Exempt Invoice"
                      : "Invoice Generation"}
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {editingInvoice ? "Edit Invoice" : "Generate Invoice"}
                </h2>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close invoice form"
              >
                <X size={20} />
              </button>
            </div>

            {/* =============================================
                MODAL BODY
            ============================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {/* =========================================
                    CLIENT
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Client
                  </span>

                  <SelectDropdown
                    value={formData.clientId}
                    disabled={!!editingInvoice}
                    options={clientOptions}
                    onChange={handleClientChange}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />

                  {formData.clientId &&
                    (() => {
                      const client = clients.find(
                        (c) => getId(c) === formData.clientId,
                      );

                      if (!client) {
                        return null;
                      }

                      const clientWithoutTax = isClientTaxExempt(client);

                      return (
                        <div className="mt-2 space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs font-semibold text-slate-700">
                          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                            Auto-Fetched Client Details
                          </p>

                          <p>
                            <strong>Company:</strong>{" "}
                            {client.companyName || "N/A"}
                          </p>

                          <p>
                            <strong>Contact:</strong>{" "}
                            {client.clientName || "N/A"}
                          </p>

                          <p>
                            <strong>Phone:</strong> {client.phone || "N/A"}
                          </p>

                          <p>
                            <strong>Email:</strong> {client.email || "N/A"}
                          </p>

                          <p>
                            <strong>Address:</strong>{" "}
                            {client.address || "N/A"}
                          </p>

                          <p>
                            <strong>Tax Type:</strong>{" "}
                            {clientWithoutTax ? "Without Tax" : "With Tax"}
                          </p>

                          {!clientWithoutTax && client.gstNumber && (
                            <p>
                              <strong>GST Number:</strong> {client.gstNumber}
                            </p>
                          )}

                          <p>
                            <strong>Location:</strong>{" "}
                            {[client.city, client.state, client.pincode]
                              .filter(Boolean)
                              .join(", ") || "N/A"}
                          </p>
                        </div>
                      );
                    })()}
                </label>

                {/* =========================================
                    CLIENT SERVICE
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Client Service
                  </span>

                  <SelectDropdown
                    value={formData.serviceDetailId}
                    disabled={!!editingInvoice}
                    options={serviceOptions}
                    onChange={(event) => {
                      const serviceDetailId = event.target.value;

                      const selectedDetail = serviceDetails.find(
                        (detail) => detail._id === serviceDetailId,
                      );

                      setFormData((current) => ({
                        ...current,
                        serviceDetailId,
                        serviceType: selectedDetail?.serviceType || "",
                      }));
                    }}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </label>

                {/* =========================================
                    PROJECT
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Project
                  </span>

                  <SelectDropdown
                    value={formData.projectId}
                    disabled={!!editingInvoice}
                    options={projectOptions}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        projectId: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100 disabled:text-slate-500"
                  />
                </label>

                {/* =========================================
                    TAX TYPE
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Tax Type
                  </span>

                  <SelectDropdown
                    value={formData.taxExempt ? "without_tax" : "with_tax"}
                    onChange={handleTaxTypeChange}
                    options={taxTypeOptions}
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />

                  <p className="mt-1.5 text-xs font-medium text-slate-400">
                    {formData.taxExempt
                      ? "GST/tax will not be applied to this invoice."
                      : "Tax will be calculated on the invoice subtotal."}
                  </p>
                </label>

                {/* =========================================
                    ITEMS
                ========================================= */}

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-700">
                      Items / Services
                    </span>

                    <button
                      type="button"
                      onClick={addItem}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                    >
                      Add Item
                    </button>
                  </div>

                  <div className="mt-2 space-y-2">
                    {formData.items.map((item, index) => (
                      <div
                        key={index}
                        className="grid gap-2 md:grid-cols-[minmax(0,1fr)_160px_auto]"
                      >
                        <input
                          type="text"
                          value={item.description}
                          onChange={(event) =>
                            updateItem(index, "description", event.target.value)
                          }
                          placeholder="Service description"
                          className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.amount}
                          onChange={(event) =>
                            updateItem(index, "amount", event.target.value)
                          }
                          placeholder="Amount"
                          className="h-11 rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                        />

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="inline-flex h-11 items-center justify-center rounded-lg border border-slate-200 px-3 text-red-700 transition hover:bg-red-50"
                          aria-label={`Remove item ${index + 1}`}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* =========================================
                    TAX %
                    ONLY WITH TAX
                ========================================= */}

                {!formData.taxExempt && (
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Tax (%)
                    </span>

                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={formData.tax}
                      onChange={(event) =>
                        setFormData((current) => ({
                          ...current,
                          tax: event.target.value,
                        }))
                      }
                      placeholder="18"
                      className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                )}

                {/* =========================================
                    PAYMENT STATUS
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Payment Status
                  </span>

                  <SelectDropdown
                    value={
                      formData.paymentStatus === "overdue"
                        ? "pending"
                        : formData.paymentStatus
                    }
                    options={paymentStatusOptions}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        paymentStatus: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                {/* =========================================
                    INVOICE DATE
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Invoice Date
                  </span>

                  <input
                    type="text"
                    value={formData.invoiceDate}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        invoiceDate: event.target.value,
                      }))
                    }
                    placeholder="DD/MM/YYYY"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                {/* =========================================
                    INVOICE TIME
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Invoice Time
                  </span>

                  <input
                    type="text"
                    value={formData.invoiceTime}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        invoiceTime: event.target.value,
                      }))
                    }
                    placeholder="10:45 AM"
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                {/* =========================================
                    ADVANCE PAYMENTS
                ========================================= */}

                <div className="md:col-span-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-slate-700">
                      Advance Payments
                    </span>

                    <button
                      type="button"
                      onClick={addAdvancePayment}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-100"
                    >
                      <Plus size={14} />
                      Add Payment
                    </button>
                  </div>

                  {formData.advancePayments.length === 0 ? (
                    <p className="mt-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs font-semibold text-slate-400">
                      No advance payments added yet. Click "Add Payment" to
                      record one.
                    </p>
                  ) : (
                    <div className="mt-2 space-y-2">
                      {formData.advancePayments.map((payment, index) => (
                        <div
                          key={payment.id}
                          className="grid grid-cols-1 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2 md:grid-cols-[28px_minmax(0,0.85fr)_105px_minmax(0,0.95fr)_140px_36px]"
                        >
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
                            {index + 1}
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={payment.amount}
                            onChange={(event) =>
                              updateAdvancePayment(
                                payment.id,
                                "amount",
                                event.target.value,
                              )
                            }
                            placeholder="Amount"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />

                          <SelectDropdown
                            value={payment.mode}
                            options={paymentModeOptions}
                            onChange={(event) =>
                              updateAdvancePayment(
                                payment.id,
                                "mode",
                                event.target.value,
                              )
                            }
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-2 text-xs font-bold text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />

                          <input
                            type="text"
                            value={payment.receivedBy}
                            onChange={(event) =>
                              updateAdvancePayment(
                                payment.id,
                                "receivedBy",
                                event.target.value,
                              )
                            }
                            placeholder="Received by"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                          />

                          <span className="truncate rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500">
                            {formatDateTime12h(payment.recordedAt)}
                          </span>

                          <button
                            type="button"
                            onClick={() => removeAdvancePayment(payment.id)}
                            className="inline-flex h-10 w-9 items-center justify-center justify-self-start rounded-lg border border-slate-200 bg-white text-red-600 transition hover:bg-red-50 md:justify-self-auto"
                            aria-label={`Remove advance payment ${index + 1}`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* =========================================
                    TOTAL
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Total Amount
                  </span>

                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.totalAmount || ""}
                    onChange={(event) =>
                      setFormData((current) => ({
                        ...current,
                        totalAmount: event.target.value,
                      }))
                    }
                    className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold text-slate-800 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>

                {/* =========================================
                    BALANCE
                ========================================= */}

                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Balance Amount
                  </span>

                  <input
                    type="text"
                    readOnly
                    value={formatCurrency(
                      Math.max(0, totalAmount - advanceTotal),
                    )}
                    className="mt-2 h-11 w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-blue-800 outline-none"
                  />
                </label>
              </div>

              {/* =================================================
                  SUMMARY
              ================================================= */}

              <div className="mt-5 grid gap-3 rounded-lg bg-slate-50 p-4 sm:grid-cols-2 lg:grid-cols-5">
                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Subtotal
                  </p>

                  <p className="mt-1 font-black text-slate-950">
                    {formatCurrency(invoiceAmount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Tax
                  </p>

                  <p className="mt-1 font-black text-slate-950">
                    {formData.taxExempt
                      ? "Without Tax"
                      : `${taxPercentage || 0}% (${formatCurrency(taxAmount)})`}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Grand Total
                  </p>

                  <p className="mt-1 font-black text-slate-950">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Advance Paid
                  </p>

                  <p className="mt-1 font-black text-slate-950">
                    {formatCurrency(advanceTotal)}
                  </p>

                  {formData.advancePayments.length > 0 && (
                    <p className="mt-1 text-xs font-semibold text-slate-500">
                      {formData.advancePayments.length} payment
                      {formData.advancePayments.length > 1 ? "s" : ""}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-xs font-bold uppercase text-slate-500">
                    Balance Due
                  </p>

                  <p className="mt-1 font-black text-blue-800">
                    {formatCurrency(Math.max(0, totalAmount - advanceTotal))}
                  </p>
                </div>
              </div>
            </div>

            {/* =============================================
                MODAL FOOTER
            ============================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={17} />
                {isSubmitting
                  ? editingInvoice
                    ? "Saving..."
                    : "Generating..."
                  : editingInvoice
                    ? "Save Changes"
                    : "Generate Invoice"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================
          BANK MODAL
      =================================================== */}

      {isBankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4">
          <div className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            {/* =============================================
                BANK HEADER
            ============================================= */}

            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Invoice Settings
                </p>

                <h2 className="mt-1 text-xl font-black text-slate-950">
                  Bank Details
                </h2>
              </div>

              <button
                type="button"
                onClick={closeBankModal}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                aria-label="Close bank details"
              >
                <X size={20} />
              </button>
            </div>

            {/* =============================================
                BANK BODY
            ============================================= */}

            <div className="min-h-0 flex-1 overflow-y-auto p-5">
              <div className="grid gap-4 md:grid-cols-2">
                {[
                  ["bankName", "Bank Name", "State Bank of India"],
                  ["accountNumber", "Account Number", "000000000000"],
                  ["branchName", "Branch Name", "Main Branch"],
                  ["ifscCode", "IFSC Code", "SBIN0000000"],
                  [
                    "accountHolderName",
                    "Account Holder Name",
                    "Company Name",
                  ],
                  ["upiId", "UPI ID", "company@upi"],
                ].map(([name, label, placeholder]) => (
                  <label key={name} className="block">
                    <span className="text-sm font-bold text-slate-700">
                      {label}
                    </span>

                    <input
                      type="text"
                      name={name}
                      value={bankFormData[name]}
                      onChange={handleBankChange}
                      placeholder={placeholder}
                      className="mt-2 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                ))}
              </div>
            </div>

            {/* =============================================
                BANK FOOTER
            ============================================= */}

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeBankModal}
                disabled={isSavingBank}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleBankSubmit}
                disabled={isSavingBank}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                <Save size={17} />
                {isSavingBank ? "Saving..." : "Save Bank Details"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminInvoices;