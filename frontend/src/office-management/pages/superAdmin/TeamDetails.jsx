import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  Edit3,
  FolderKanban,
  LineChart,
  Plus,
  Trash2,
  UserMinus,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import {
  addMembersToTeam,
  assignProjectsToTeam,
  deleteTeam,
  getTeamById,
  removeMembersFromTeam,
  removeProjectsFromTeam,
} from "../../services/teamService";

const statusBadgeClass = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  inactive: "bg-amber-50 text-amber-700 ring-amber-100",
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
};

const formatLabel = (value = "") => value.replaceAll("_", " ");

const formatDateTime = (value) => {
  if (!value) return "Not set";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const getEmployeeName = (employee) => {
  if (!employee) return "Employee";
  if (typeof employee === "string") return employee;
  return employee.name || "Employee";
};

const getProjectName = (project) => {
  if (!project) return "Project";
  if (typeof project === "string") return project;
  return project.projectName || "Project";
};

const getUniqueIds = (values = []) => {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
};

const parseIds = (value = "") => {
  return getUniqueIds(value.split(/[\s,]+/));
};

const DetailItem = ({ label, value, icon: Icon }) => (
  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
      {Icon && <Icon size={15} />}
      {label}
    </div>
    <p className="mt-2 break-words text-sm font-semibold text-slate-900">
      {value || "Not provided"}
    </p>
  </div>
);

const PlaceholderSection = ({ title, icon: Icon, text }) => (
  <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon size={20} />
      </div>
      <div>
        <h2 className="text-base font-black text-slate-950">{title}</h2>
        <p className="text-sm text-slate-500">{text}</p>
      </div>
    </div>
  </div>
);

const TeamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionModal, setActionModal] = useState(null);
  const [idsInput, setIdsInput] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isSubmittingAction, setIsSubmittingAction] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";
  const members = Array.isArray(team?.members) ? team.members : [];
  const assignedProjects = Array.isArray(team?.assignedProjects)
    ? team.assignedProjects
    : [];

  const teamLeadId = getId(team?.teamLead);

  const modalConfig = useMemo(() => {
    const configs = {
      addMembers: {
        title: "Add Members",
        description: "Enter employee IDs separated by commas or spaces.",
        actionLabel: "Add Members",
        icon: UserPlus,
      },
      removeMembers: {
        title: "Remove Members",
        description: "Select members to remove. The team lead cannot be removed.",
        actionLabel: "Remove Members",
        icon: UserMinus,
      },
      assignProjects: {
        title: "Assign Projects",
        description: "Enter project IDs separated by commas or spaces.",
        actionLabel: "Assign Projects",
        icon: FolderKanban,
      },
      removeProjects: {
        title: "Remove Projects",
        description: "Select projects to remove from this team.",
        actionLabel: "Remove Projects",
        icon: Trash2,
      },
    };

    return actionModal ? configs[actionModal] : null;
  }, [actionModal]);

  const fetchTeam = async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMessage("");
      setIsNotFound(false);

      const result = await getTeamById(id);
      setTeam(result.data.team);
    } catch (error) {
      if (error.status === 401) {
        navigate(ROUTES.LOGIN, { replace: true });
        return;
      }

      if (error.status === 403) {
        navigate(ROUTES.UNAUTHORIZED, { replace: true });
        return;
      }

      if (error.status === 404) {
        setIsNotFound(true);
        return;
      }

      setErrorMessage(error.message);
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchTeam();
  }, [id]);

  const openActionModal = (type) => {
    setActionModal(type);
    setIdsInput("");
    setSelectedIds([]);
    setErrorMessage("");
    setSuccessMessage("");
  };

  const closeActionModal = () => {
    if (isSubmittingAction) return;
    setActionModal(null);
    setIdsInput("");
    setSelectedIds([]);
  };

  const toggleSelectedId = (itemId) => {
    setSelectedIds((current) =>
      current.includes(itemId)
        ? current.filter((selectedId) => selectedId !== itemId)
        : [...current, itemId]
    );
  };

  const handleActionSubmit = async () => {
    try {
      setIsSubmittingAction(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (actionModal === "addMembers") {
        const memberIds = parseIds(idsInput);
        if (!memberIds.length) throw new Error("Enter at least one employee ID");
        await addMembersToTeam(id, { members: memberIds });
        setSuccessMessage("Members added successfully");
      }

      if (actionModal === "removeMembers") {
        if (!selectedIds.length) throw new Error("Select at least one member");
        await removeMembersFromTeam(id, { members: selectedIds });
        setSuccessMessage("Members removed successfully");
      }

      if (actionModal === "assignProjects") {
        const projectIds = parseIds(idsInput);
        if (!projectIds.length) throw new Error("Enter at least one project ID");
        await assignProjectsToTeam(id, { projects: projectIds });
        setSuccessMessage("Projects assigned successfully");
      }

      if (actionModal === "removeProjects") {
        if (!selectedIds.length) throw new Error("Select at least one project");
        await removeProjectsFromTeam(id, { projects: selectedIds });
        setSuccessMessage("Projects removed successfully");
      }

      closeActionModal();
      await fetchTeam({ silent: true });
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
      setIsSubmittingAction(false);
    }
  };

  const handleDelete = async () => {
    const shouldDelete = window.confirm(
      `Delete "${team.teamName}"? This action cannot be undone.`
    );

    if (!shouldDelete) return;

    try {
      setIsDeleting(true);
      setErrorMessage("");
      await deleteTeam(id);
      navigate(ROUTES.SUPER_ADMIN_TEAMS, { replace: true });
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
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (isNotFound || !team) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Users size={25} />
        </div>
        <h1 className="mt-4 text-xl font-black text-slate-950">
          Team not found
        </h1>
        <p className="mt-1 max-w-md text-sm text-slate-500">
          The team may have been deleted or the link may be incorrect.
        </p>
        <button
          type="button"
          onClick={() => navigate(ROUTES.SUPER_ADMIN_TEAMS)}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          <ArrowLeft size={17} />
          Back to Teams
        </button>
      </section>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_TEAMS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Teams
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Team Details
          </p>
          <h1 className="mt-1 break-words text-2xl font-black text-slate-950 sm:text-3xl">
            {team.teamName}
          </h1>
          <div className="mt-3 flex flex-wrap gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold capitalize ring-1 ${
                statusBadgeClass[team.status] || statusBadgeClass.inactive
              }`}
            >
              {formatLabel(team.status)}
            </span>
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
              {team.department}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TEAMS}/${id}/edit`)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md"
          >
            <Edit3 size={17} />
            Edit
          </button>
          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:-translate-y-0.5 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <Trash2 size={17} />
              {isDeleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-black text-slate-950">
                Team Information
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Core team identity and audit details.
              </p>
            </div>
            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              <DetailItem label="Team Name" value={team.teamName} icon={Users} />
              <DetailItem
                label="Department"
                value={team.department}
                icon={BriefcaseBusiness}
              />
              <DetailItem
                label="Team Lead"
                value={getEmployeeName(team.teamLead)}
                icon={UserRound}
              />
              <DetailItem label="Status" value={formatLabel(team.status)} />
              <DetailItem
                label="Created At"
                value={formatDateTime(team.createdAt)}
                icon={CalendarDays}
              />
              <DetailItem
                label="Updated At"
                value={formatDateTime(team.updatedAt)}
                icon={CalendarDays}
              />
              <div className="md:col-span-2 xl:col-span-3">
                <DetailItem label="Description" value={team.description} />
              </div>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <Users size={19} />
                  Members
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {members.length} people in this team.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openActionModal("addMembers")}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <UserPlus size={16} />
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => openActionModal("removeMembers")}
                  disabled={!members.length}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <UserMinus size={16} />
                  Remove
                </button>
              </div>
            </div>

            {members.length === 0 ? (
              <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                No members added yet.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {members.map((member) => (
                  <article
                    key={getId(member) || member}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-black text-slate-950">
                          {getEmployeeName(member)}
                        </p>
                        <p className="mt-1 truncate text-sm text-slate-500">
                          {member.email || "No email"}
                        </p>
                      </div>
                      {getId(member) === teamLeadId && (
                        <span className="shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700 ring-1 ring-blue-100">
                          Lead
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      {member.designation || "No designation"} ·{" "}
                      {member.department || "No department"}
                    </p>
                  </article>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-black text-slate-950">
                  <FolderKanban size={19} />
                  Assigned Projects
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {assignedProjects.length} projects assigned.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openActionModal("assignProjects")}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-blue-50 hover:text-blue-700"
                >
                  <Plus size={16} />
                  Assign
                </button>
                <button
                  type="button"
                  onClick={() => openActionModal("removeProjects")}
                  disabled={!assignedProjects.length}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Trash2 size={16} />
                  Remove
                </button>
              </div>
            </div>

            {assignedProjects.length === 0 ? (
              <p className="mt-5 rounded-lg bg-slate-50 p-4 text-sm text-slate-500">
                No projects assigned yet.
              </p>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {assignedProjects.map((project) => (
                  <article
                    key={getId(project) || project}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4"
                  >
                    <p className="font-black text-slate-950">
                      {getProjectName(project)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {project.category || "No category"}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {project.status && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold capitalize text-slate-700">
                          {formatLabel(project.status)}
                        </span>
                      )}
                      {project.priority && (
                        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold capitalize text-blue-700">
                          {project.priority}
                        </span>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>

          <div className="grid gap-4 md:grid-cols-2">
            <PlaceholderSection
              title="Team Tasks"
              icon={BriefcaseBusiness}
              text="Coming soon: task allocation by team will appear here."
            />
            <PlaceholderSection
              title="Team Performance"
              icon={BarChart3}
              text="Coming soon: delivery and productivity metrics will appear here."
            />
            <PlaceholderSection
              title="Project Progress"
              icon={LineChart}
              text="Coming soon: project completion trends will appear here."
            />
            <PlaceholderSection
              title="Productivity Report"
              icon={BarChart3}
              text="Coming soon: team productivity reports will appear here."
            />
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-950">
              Quick Summary
            </h2>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Members</span>
                <span className="font-bold text-slate-900">{members.length}</span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Projects</span>
                <span className="font-bold text-slate-900">
                  {assignedProjects.length}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-500">Lead</span>
                <span className="min-w-0 truncate font-bold text-slate-900">
                  {getEmployeeName(team.teamLead)}
                </span>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {actionModal && modalConfig && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-xl overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Team Management
                </p>
                <h2 className="mt-1 flex items-center gap-2 text-xl font-black text-slate-950">
                  <modalConfig.icon size={20} />
                  {modalConfig.title}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {modalConfig.description}
                </p>
              </div>
              <button
                type="button"
                onClick={closeActionModal}
                disabled={isSubmittingAction}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close team action"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-5">
              {["addMembers", "assignProjects"].includes(actionModal) ? (
                <textarea
                  value={idsInput}
                  onChange={(event) => setIdsInput(event.target.value)}
                  rows={5}
                  placeholder={
                    actionModal === "addMembers"
                      ? "employeeId1, employeeId2"
                      : "projectId1, projectId2"
                  }
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              ) : (
                <div className="max-h-72 space-y-2 overflow-y-auto">
                  {(actionModal === "removeMembers"
                    ? members.filter((member) => getId(member) !== teamLeadId)
                    : assignedProjects
                  ).map((item) => {
                    const itemId = getId(item);

                    return (
                      <label
                        key={itemId}
                        className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 transition hover:bg-white"
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(itemId)}
                          onChange={() => toggleSelectedId(itemId)}
                          className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200"
                        />
                        <span className="min-w-0 truncate text-sm font-bold text-slate-800">
                          {actionModal === "removeMembers"
                            ? getEmployeeName(item)
                            : getProjectName(item)}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeActionModal}
                disabled={isSubmittingAction}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleActionSubmit}
                disabled={isSubmittingAction}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmittingAction ? "Saving..." : modalConfig.actionLabel}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TeamDetails;
