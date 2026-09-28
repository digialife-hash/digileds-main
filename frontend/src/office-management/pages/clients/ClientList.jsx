import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  KeyRound,
  Plus,
  Search,
  Trash2,
  Users,
  MoreVertical,
} from "lucide-react";
import ChangePasswordModal from "./ChangePasswordModal";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import { deleteClient, getClients } from "../../services/clientService";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import ClientForm from "./ClientForm";

const statusBadgeClass = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  inactive: "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusOptions = [
  ["", "All statuses"],
  ["active", "Active"],
  ["inactive", "Inactive"],
];

const ClientList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clients, setClients] = useState([]);
  const [passwordModal, setPasswordModal] = useState({
    isOpen: false,
    client: null,
  });

  const openPasswordModal = (client) => {
    setPasswordModal({ isOpen: true, client });
  };

  const closePasswordModal = () => {
    setPasswordModal({ isOpen: false, client: null });
  };
  const [openActionMenu, setOpenActionMenu] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    businessCategory: "",
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [formModal, setFormModal] = useState({
    isOpen: false,
    clientId: null,
  });

  const canDeleteClients = user?.role === "super_admin";
  const baseClientPath = ROUTES.SUPER_ADMIN_CLIENTS;

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      status: filters.status || undefined,
      businessCategory: filters.businessCategory || undefined,
    }),
    [filters, page, pagination.limit],
  );

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getClients(requestParams);

      setClients(result.data.clients || []);
      setPagination(result.data.pagination || pagination);
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
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchClients();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [requestParams]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
    setPage(1);
  };

  const handleDeleteClient = async (client) => {
    const shouldDelete = window.confirm(
      `Delete ${client.companyName}? This action cannot be undone.`,
    );

    if (!shouldDelete) return;

    try {
      await deleteClient(client._id);
      await fetchClients();
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

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const openCreateModal = () => {
    setFormModal({
      isOpen: true,
      clientId: null,
    });
  };

  const openEditModal = (clientId) => {
    setFormModal({
      isOpen: true,
      clientId,
    });
  };

  const closeFormModal = () => {
    setFormModal({
      isOpen: false,
      clientId: null,
    });
  };

  const handleFormSuccess = async () => {
    closeFormModal();
    await fetchClients();
  };








  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Client Management
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Clients
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Plus size={17} />
          Add Client
        </button>
      </div>

      <div className="filter-bar gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <label className="filter-control relative block">
          <Search
            size={18}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="search"
            value={filters.search}
            onChange={(event) => updateFilter("search", event.target.value)}
            placeholder="Search name, company, email, phone"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <SelectDropdown
          name="status"
          value={filters.status}
          options={statusOptions}
          onChange={(event) => updateFilter("status", event.target.value)}
          wrapperClassName="filter-control"
          className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <input
          type="text"
          value={filters.businessCategory}
          onChange={(event) =>
            updateFilter("businessCategory", event.target.value)
          }
          placeholder="Business category"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      {isLoading ? (
        <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
          <LoadingSpinner />
        </div>
      ) : clients.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Users size={25} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No clients found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Try adjusting your search or filters, or add the first client to
            this workspace.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm lg:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Client</th>
                  <th className="px-5 py-4">Contact</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {clients.map((client) => (
                  <tr key={client._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="truncate font-bold text-slate-950">
                        {client.companyName}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {client.clientName}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-semibold text-slate-700">
                        {client.email}
                      </p>
                      <p className="text-sm text-slate-500">{client.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {client.businessCategory}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                          statusBadgeClass[client.status] ||
                          statusBadgeClass.inactive
                        }`}
                      >
                        {client.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="relative flex justify-end">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenActionMenu(
                              openActionMenu === client._id ? null : client._id,
                            )
                          }
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          aria-label="Client actions"
                        >
                          <MoreVertical size={18} />
                        </button>

                        {openActionMenu === client._id && (
                          <div className="absolute right-0 top-10 z-50 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white py-1 shadow-lg">
                            {/* View */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenu(null);
                                navigate(`${baseClientPath}/${client._id}`);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50"
                            >
                              <Eye size={16} className="text-slate-500" />
                              <span>View</span>
                            </button>

                            {/* Edit */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenu(null);
                                openEditModal(client._id);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                            >
                              <Edit3 size={16} />
                              <span>Edit</span>
                            </button>
                            {/* Change Password */}
                            <button
                              type="button"
                              onClick={() => {
                                setOpenActionMenu(null);
                                openPasswordModal(client);
                              }}
                              className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"                            >
                              <KeyRound size={16} />
                              <span>Change Password</span>
                            </button>
                            {/* Delete */}
                            {canDeleteClients && (
                              <button
                                type="button"
                                onClick={() => {
                                  setOpenActionMenu(null);
                                  handleDeleteClient(client);
                                }}
                                className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition hover:bg-red-50"
                              >
                                <Trash2 size={16} />
                                <span>Delete</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 lg:hidden">
            {clients.map((client) => (
              <article
                key={client._id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Building2
                        size={17}
                        className="shrink-0 text-slate-400"
                      />
                      <h2 className="truncate font-black text-slate-950">
                        {client.companyName}
                      </h2>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      {client.clientName}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                      statusBadgeClass[client.status] ||
                      statusBadgeClass.inactive
                    }`}
                  >
                    {client.status}
                  </span>
                </div>

                <div className="mt-4 space-y-1 text-sm text-slate-600">
                  <p className="truncate">{client.email}</p>
                  <p>{client.phone}</p>
                  <p className="font-semibold text-slate-800">
                    {client.businessCategory}
                  </p>
                </div>
                {/* mobile */}
                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`${baseClientPath}/${client._id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(client._id)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => openPasswordModal(client)}
                    className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-amber-700 transition hover:bg-amber-50"
                    aria-label="Change password"
                  >
                    <KeyRound size={16} />
                  </button>
                  {canDeleteClients && (
                    <button
                      type="button"
                      onClick={() => handleDeleteClient(client)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-red-700 transition hover:bg-red-50"
                      aria-label="Delete client"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>

          <div className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-semibold text-slate-600">
              Showing page {pagination.page} of {pagination.totalPages || 1} ·{" "}
              {pagination.total} clients
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page <= 1}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ChevronLeft size={16} />
                Previous
              </button>
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page >= pagination.totalPages}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

      {formModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <ClientForm
              clientId={formModal.clientId}
              isModal
              onCancel={closeFormModal}
              onSuccess={handleFormSuccess}
            />
          </div>
        </div>
      )}


      {passwordModal.isOpen && (
  <ChangePasswordModal
    client={passwordModal.client}
    onCancel={closePasswordModal}
    onSuccess={closePasswordModal}
  />
)}
    </section>
  );




};

export default ClientList;
