import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  BriefcaseBusiness,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  FolderKanban,
  Plus,
  Save,
  Search,
  Trash2,
  UserRound,
  Users,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import PageBackButton from "../../components/common/PageBackButton";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployees } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import {
  createTeam,
  deleteTeam,
  getTeams,
  updateTeam,
} from "../../services/teamService";

const statusOptions = ["active", "inactive", "archived"];

const defaultFormData = {
  teamName: "",
  teamLead: "",
  members: [],
  department: "",
  assignedProjects: [],
  status: "active",
  description: "",
};

const statusBadgeClass = {
  active: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  inactive: "bg-amber-50 text-amber-700 ring-amber-100",
  archived: "bg-slate-100 text-slate-600 ring-slate-200",
};

const formatLabel = (value = "") => value.replaceAll("_", " ");
const statusDropdownOptions = statusOptions.map((status) => [status, formatLabel(status)]);

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const getUniqueIds = (values = []) => {
  return [...new Set(values.map(getId).filter(Boolean))];
};

const getEmployeeName = (employee) => {
  if (!employee) return "No team lead";
  if (typeof employee === "string") return employee;
  return employee.name || "Employee";
};

const getProjectName = (project) => {
  if (!project) return "Project";
  if (typeof project === "string") return project;
  return project.projectName || "Project";
};

const filterEmployees = (employees = [], query = "") => {
  const searchText = query.trim().toLowerCase();
  if (!searchText) return employees;

  return employees.filter((employee) => {
    return [
      employee.name,
      employee.email,
      employee.department,
      employee.designation,
    ]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchText));
  });
};

const filterProjects = (projects = [], query = "") => {
  const searchText = query.trim().toLowerCase();
  if (!searchText) return projects;

  return projects.filter((project) => {
    return [project.projectName, project.category, project.status, project.priority]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchText));
  });
};

const mergeById = (...groups) => {
  const itemMap = new Map();

  groups.flat().forEach((item) => {
    const itemId = getId(item);
    if (itemId && !itemMap.has(itemId)) {
      itemMap.set(itemId, typeof item === "string" ? { _id: item } : item);
    }
  });

  return [...itemMap.values()];
};

const getUniqueOptions = (items, getKey) => {
  const optionMap = new Map();

  items.forEach((item) => {
    const option = getKey(item);
    if (option?.value && !optionMap.has(option.value)) {
      optionMap.set(option.value, option);
    }
  });

  return [...optionMap.values()];
};

const getTeamFormData = (team) => ({
  teamName: team?.teamName || "",
  teamLead: getId(team?.teamLead),
  members: getUniqueIds(team?.members || []),
  department: team?.department || "",
  assignedProjects: getUniqueIds(team?.assignedProjects || []),
  status: team?.status || "active",
  description: team?.description || "",
});

const buildTeamPayload = (formData, members, assignedProjects) => ({
  teamName: formData.teamName.trim(),
  teamLead: formData.teamLead,
  members,
  department: formData.department.trim(),
  assignedProjects,
  status: formData.status || "active",
  description: formData.description.trim(),
});

const SuperAdminTeams = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const selectedProjectId = searchParams.get("assignedProject") || "";

  const [teams, setTeams] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: "",
    department: "",
    status: "",
    teamLead: "",
    assignedProject: selectedProjectId,
  });
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [actionId, setActionId] = useState("");
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    team: null,
  });
  const [formModal, setFormModal] = useState({
    isOpen: false,
    mode: "create",
    team: null,
  });
  const [formData, setFormData] = useState(defaultFormData);
  const [formErrors, setFormErrors] = useState({});
  const [teamLeadSearch, setTeamLeadSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const canAccessTeams = isSuperAdmin;
  const teamsBasePath = ROUTES.SUPER_ADMIN_TEAMS;

  const requestParams = useMemo(
    () => ({
      page,
      limit: pagination.limit,
      search: filters.search || undefined,
      department: filters.department || undefined,
      status: filters.status || undefined,
      teamLead: filters.teamLead || undefined,
      assignedProject: filters.assignedProject || undefined,
    }),
    [filters, page, pagination.limit]
  );

  const teamLeadOptions = useMemo(
    () =>
      getUniqueOptions(teams, (team) => ({
        value: getId(team.teamLead),
        label: getEmployeeName(team.teamLead),
      })),
    [teams]
  );

  const projectOptions = useMemo(() => {
    const assignedProjects = teams.flatMap((team) => team.assignedProjects || []);

    return getUniqueOptions([...projects, ...assignedProjects], (project) => ({
      value: getId(project),
      label: getProjectName(project),
    }));
  }, [projects, teams]);
  const statusFilterOptions = useMemo(
    () => [["", "All statuses"], ...statusDropdownOptions],
    []
  );
  const teamLeadFilterOptions = useMemo(
    () => [["", "All leads"], ...teamLeadOptions.map((lead) => [lead.value, lead.label])],
    [teamLeadOptions]
  );
  const projectFilterOptions = useMemo(
    () => [["", "All projects"], ...projectOptions.map((project) => [project.value, project.label])],
    [projectOptions]
  );

  const employeeOptions = useMemo(() => {
    return mergeById(
      employees,
      formModal.team?.teamLead ? [formModal.team.teamLead] : [],
      formModal.team?.members || []
    );
  }, [employees, formModal.team]);

  const projectFormOptions = useMemo(() => {
    return mergeById(projects, formModal.team?.assignedProjects || []);
  }, [projects, formModal.team]);

  const previewMembers = useMemo(() => {
    return getUniqueIds([...formData.members, formData.teamLead]);
  }, [formData.members, formData.teamLead]);

  const selectedProjects = useMemo(() => {
    return getUniqueIds(formData.assignedProjects);
  }, [formData.assignedProjects]);

  const selectedLead = useMemo(() => {
    return employeeOptions.find((employee) => employee._id === formData.teamLead);
  }, [employeeOptions, formData.teamLead]);

  const filteredTeamLeadOptions = useMemo(() => {
    return filterEmployees(employeeOptions, teamLeadSearch).slice(0, 8);
  }, [employeeOptions, teamLeadSearch]);

  const filteredMemberOptions = useMemo(() => {
    const selectedMemberIds = new Set(formData.members);

    return filterEmployees(employeeOptions, memberSearch)
      .filter((employee) => !selectedMemberIds.has(employee._id))
      .slice(0, 8);
  }, [employeeOptions, formData.members, memberSearch]);

  const filteredProjectOptions = useMemo(() => {
    const selectedProjectIds = new Set(formData.assignedProjects);

    return filterProjects(projectFormOptions, projectSearch)
      .filter((project) => !selectedProjectIds.has(project._id))
      .slice(0, 8);
  }, [formData.assignedProjects, projectFormOptions, projectSearch]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await getTeams(requestParams);

      setTeams(result.data.teams || []);
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

  const fetchFormOptions = async () => {
    const [employeeResult, projectResult] = await Promise.allSettled([
      getEmployees({ limit: 100, status: "active" }),
      getProjects({ limit: 100 }),
    ]);

    if (employeeResult.status === "fulfilled") {
      setEmployees(employeeResult.value.data.employees || []);
    }

    if (projectResult.status === "fulfilled") {
      setProjects(projectResult.value.data.projects || []);
    }
  };

  useEffect(() => {
    if (user && !canAccessTeams) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [canAccessTeams, navigate, user]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTeams();
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [requestParams]);

  useEffect(() => {
    void fetchFormOptions();
  }, []);

  const updateFilter = (name, value) => {
    setFilters((current) => ({
      ...current,
      [name]: value,
    }));
    setPage(1);
  };

  const goToPage = (nextPage) => {
    if (nextPage < 1 || nextPage > pagination.totalPages) return;
    setPage(nextPage);
  };

  const openCreateModal = () => {
    setFormData(
      filters.assignedProject
        ? { ...defaultFormData, assignedProjects: [filters.assignedProject] }
        : defaultFormData
    );
    setFormErrors({});
    setTeamLeadSearch("");
    setMemberSearch("");
    setProjectSearch("");
    setFormModal({
      isOpen: true,
      mode: "create",
      team: null,
    });
    void fetchFormOptions();
  };

  const openEditModal = (team) => {
    setFormData(getTeamFormData(team));
    setFormErrors({});
    setTeamLeadSearch("");
    setMemberSearch("");
    setProjectSearch("");
    setFormModal({
      isOpen: true,
      mode: "edit",
      team,
    });
    void fetchFormOptions();
  };

  const closeFormModal = () => {
    setFormModal({
      isOpen: false,
      mode: "create",
      team: null,
    });
    setFormData(defaultFormData);
    setFormErrors({});
    setTeamLeadSearch("");
    setMemberSearch("");
    setProjectSearch("");
  };

  const openDeleteModal = (team) => {
    setDeleteModal({
      isOpen: true,
      team,
    });
  };

  const closeDeleteModal = () => {
    if (actionId) return;

    setDeleteModal({
      isOpen: false,
      team: null,
    });
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const updateArrayField = (name, values) => {
    setFormData((current) => ({
      ...current,
      [name]: getUniqueIds(values),
    }));

    if (formErrors[name]) {
      setFormErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const selectTeamLead = (employeeId) => {
    setFormData((current) => ({
      ...current,
      teamLead: employeeId,
    }));
    setTeamLeadSearch("");

    if (formErrors.teamLead) {
      setFormErrors((current) => ({
        ...current,
        teamLead: "",
      }));
    }
  };

  const addMember = (employeeId) => {
    updateArrayField("members", [...formData.members, employeeId]);
    setMemberSearch("");
  };

  const removeMember = (employeeId) => {
    updateArrayField(
      "members",
      formData.members.filter((memberId) => memberId !== employeeId)
    );
  };

  const addProject = (projectId) => {
    updateArrayField("assignedProjects", [
      ...formData.assignedProjects,
      projectId,
    ]);
    setProjectSearch("");
  };

  const removeProject = (projectId) => {
    updateArrayField(
      "assignedProjects",
      formData.assignedProjects.filter((assignedProjectId) => {
        return assignedProjectId !== projectId;
      })
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.teamName.trim()) errors.teamName = "Team name is required";
    if (!formData.department.trim()) errors.department = "Department is required";
    if (!formData.teamLead) errors.teamLead = "Team lead is required";
    if (!statusOptions.includes(formData.status)) errors.status = "Invalid status";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmitTeam = async () => {
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      const payload = buildTeamPayload(formData, previewMembers, selectedProjects);

      if (formModal.mode === "create") {
        await createTeam(payload);
      } else {
        await updateTeam(formModal.team._id, payload);
      }

      closeFormModal();
      await fetchTeams();
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
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async () => {
    const team = deleteModal.team;
    if (!team) return;

    try {
      setActionId(team._id);
      setErrorMessage("");

      await deleteTeam(team._id);
      closeDeleteModal();
      await fetchTeams();
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
      setActionId("");
    }
  };

  const renderStatusBadge = (status) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
        statusBadgeClass[status] || statusBadgeClass.inactive
      }`}
    >
      {formatLabel(status)}
    </span>
  );

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <PageBackButton fallbackPath={ROUTES.SUPER_ADMIN_DASHBOARD} />
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Team Creation
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Teams
          </h1>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300"
        >
          <Plus size={17} />
          Create Team
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
            placeholder="Search team name or department"
            className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </label>

        <input
          type="text"
          value={filters.department}
          onChange={(event) => updateFilter("department", event.target.value)}
          placeholder="Department"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          value={filters.status}
          options={statusFilterOptions}
          onChange={(event) => updateFilter("status", event.target.value)}
          wrapperClassName="filter-control"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          value={filters.teamLead}
          options={teamLeadFilterOptions}
          onChange={(event) => updateFilter("teamLead", event.target.value)}
          wrapperClassName="filter-control"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
        />

        <SelectDropdown
          value={filters.assignedProject}
          options={projectFilterOptions}
          onChange={(event) => updateFilter("assignedProject", event.target.value)}
          wrapperClassName="filter-control"
          className="filter-control h-9 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
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
      ) : teams.length === 0 ? (
        <div className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
          <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Users size={25} />
          </div>
          <h2 className="mt-4 text-lg font-black text-slate-950">
            No teams found
          </h2>
          <p className="mt-1 max-w-md text-sm text-slate-500">
            Adjust your filters or create the first team for project allocation.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm xl:block">
            <table className="w-full table-fixed">
              <thead className="bg-slate-50 text-left text-xs font-bold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4">Team</th>
                  <th className="px-5 py-4">Department</th>
                  <th className="px-5 py-4">Team Lead</th>
                  <th className="px-5 py-4">Members</th>
                  <th className="px-5 py-4">Projects</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {teams.map((team) => (
                  <tr key={team._id} className="transition hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="truncate font-bold text-slate-950">
                        {team.teamName}
                      </p>
                      <p className="line-clamp-1 text-sm text-slate-500">
                        {team.description || "No description"}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-sm font-semibold text-slate-700">
                      {team.department}
                    </td>
                    <td className="px-5 py-4">
                      <p className="truncate text-sm font-bold text-slate-800">
                        {getEmployeeName(team.teamLead)}
                      </p>
                      <p className="truncate text-sm text-slate-500">
                        {team.teamLead?.designation || "No designation"}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                        <Users size={14} />
                        {team.members?.length || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                        <FolderKanban size={14} />
                        {team.assignedProjects?.length || 0}
                      </span>
                    </td>
                    <td className="px-5 py-4">{renderStatusBadge(team.status)}</td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => navigate(`${teamsBasePath}/${team._id}`)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-slate-100 hover:text-slate-950"
                          aria-label="View team details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openEditModal(team)}
                          className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-blue-50 hover:text-blue-700"
                          aria-label="Edit team"
                        >
                          <Edit3 size={16} />
                        </button>
                        {isSuperAdmin && (
                          <button
                            type="button"
                            onClick={() => openDeleteModal(team)}
                            disabled={actionId === team._id}
                            className="rounded-lg border border-slate-200 p-2 text-slate-600 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                            aria-label="Delete team"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4 xl:hidden">
            {teams.map((team) => (
              <article
                key={team._id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Users size={17} className="shrink-0 text-slate-400" />
                      <h2 className="truncate font-black text-slate-950">
                        {team.teamName}
                      </h2>
                    </div>
                    <p className="mt-1 truncate text-sm font-semibold text-slate-600">
                      {team.department}
                    </p>
                  </div>
                  <div className="shrink-0">{renderStatusBadge(team.status)}</div>
                </div>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p className="inline-flex min-w-0 items-center gap-2 font-semibold text-slate-800">
                    <UserRound size={15} className="shrink-0" />
                    <span className="truncate">{getEmployeeName(team.teamLead)}</span>
                  </p>
                  <p className="inline-flex items-center gap-2">
                    <BriefcaseBusiness size={15} />
                    {team.teamLead?.designation || "No designation"}
                  </p>
                  <p className="line-clamp-2 text-sm text-slate-500">
                    {team.description || "No description added."}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700">
                    <Users size={14} />
                    {team.members?.length || 0} members
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700">
                    <FolderKanban size={14} />
                    {team.assignedProjects?.length || 0} projects
                  </span>
                </div>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => navigate(`${teamsBasePath}/${team._id}`)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <button
                    type="button"
                    onClick={() => openEditModal(team)}
                    className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Edit3 size={16} />
                    Edit
                  </button>
                  {isSuperAdmin && (
                    <button
                      type="button"
                      onClick={() => openDeleteModal(team)}
                      disabled={actionId === team._id}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete team"
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
              Showing page {pagination.page} of {pagination.totalPages || 1} -{" "}
              {pagination.total} teams
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
          <div className="flex max-h-[92vh] w-full max-w-5xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  {formModal.mode === "create" ? "Create Team" : "Edit Team"}
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {formModal.mode === "create"
                    ? "New Team"
                    : formModal.team?.teamName}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeFormModal}
                disabled={isSubmitting}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close team form"
              >
                <X size={20} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                <div className="grid gap-4 md:grid-cols-2">
                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Team Name <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      name="teamName"
                      value={formData.teamName}
                      onChange={handleFormChange}
                      className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                        formErrors.teamName
                          ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                      }`}
                    />
                    {formErrors.teamName && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {formErrors.teamName}
                      </p>
                    )}
                  </label>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Department <span className="text-red-500">*</span>
                    </span>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={handleFormChange}
                      className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                        formErrors.department
                          ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                      }`}
                    />
                    {formErrors.department && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {formErrors.department}
                      </p>
                    )}
                  </label>

                  <div className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Team Lead <span className="text-red-500">*</span>
                    </span>
                    <div
                      className={`mt-2 rounded-lg border bg-white p-3 transition focus-within:ring-2 ${
                        formErrors.teamLead
                          ? "border-red-300 focus-within:border-red-300 focus-within:ring-red-100"
                          : "border-slate-200 focus-within:border-blue-300 focus-within:ring-blue-100"
                      }`}
                    >
                      {selectedLead && (
                        <div className="mb-3 flex items-center justify-between gap-3 rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-800 ring-1 ring-blue-100">
                          <span className="min-w-0 truncate">
                            {selectedLead.name || selectedLead._id} -{" "}
                            {selectedLead.department || "No department"}
                          </span>
                          <button
                            type="button"
                            onClick={() => selectTeamLead("")}
                            className="shrink-0 rounded-md p-1 text-blue-600 transition hover:bg-blue-100"
                            aria-label="Remove team lead"
                          >
                            <X size={15} />
                          </button>
                        </div>
                      )}
                      <div className="relative">
                        <Search
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="search"
                          value={teamLeadSearch}
                          onChange={(event) => setTeamLeadSearch(event.target.value)}
                          placeholder="Search team lead"
                          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                        />
                      </div>
                      <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-slate-100">
                        {filteredTeamLeadOptions.length ? (
                          filteredTeamLeadOptions.map((employee) => (
                            <button
                              key={employee._id}
                              type="button"
                              onClick={() => selectTeamLead(employee._id)}
                              className="flex w-full items-center justify-between gap-3 border-b border-slate-100 px-3 py-2 text-left transition last:border-b-0 hover:bg-blue-50"
                            >
                              <span className="min-w-0">
                                <span className="block truncate text-sm font-bold text-slate-900">
                                  {employee.name || employee._id}
                                </span>
                                <span className="block truncate text-xs font-semibold text-slate-500">
                                  {employee.designation || "No designation"} -{" "}
                                  {employee.department || "No department"}
                                </span>
                              </span>
                              {formData.teamLead === employee._id && (
                                <span className="shrink-0 rounded-full bg-blue-100 px-2 py-1 text-xs font-black text-blue-700">
                                  Lead
                                </span>
                              )}
                            </button>
                          ))
                        ) : (
                          <div className="px-3 py-3 text-sm font-semibold text-slate-500">
                            No employees found
                          </div>
                        )}
                      </div>
                    </div>
                    {formErrors.teamLead && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {formErrors.teamLead}
                      </p>
                    )}
                  </div>

                  <label className="block">
                    <span className="text-sm font-bold text-slate-700">
                      Status
                    </span>
                    <SelectDropdown
                      name="status"
                      value={formData.status}
                      options={statusDropdownOptions}
                      onChange={handleFormChange}
                      className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 ${
                        formErrors.status
                          ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                          : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                      }`}
                    />
                    {formErrors.status && (
                      <p className="mt-1 text-xs font-semibold text-red-600">
                        {formErrors.status}
                      </p>
                    )}
                  </label>

                  <div className="block md:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Members
                    </span>
                    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                      {formData.members.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {formData.members.map((memberId) => {
                            const member = employeeOptions.find(
                              (employee) => employee._id === memberId
                            );

                            return (
                              <span
                                key={memberId}
                                className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                              >
                                <span className="truncate">
                                  {member?.name || "Employee"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeMember(memberId)}
                                  className="text-slate-500 transition hover:text-red-700"
                                  aria-label="Remove member"
                                >
                                  <X size={13} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="relative">
                        <Search
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="search"
                          value={memberSearch}
                          onChange={(event) => setMemberSearch(event.target.value)}
                          placeholder="Search and add team members"
                          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                        />
                      </div>
                      <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                        {filteredMemberOptions.length ? (
                          filteredMemberOptions.map((employee) => (
                            <button
                              key={employee._id}
                              type="button"
                              onClick={() => addMember(employee._id)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
                            >
                              <span className="block truncate text-sm font-bold text-slate-900">
                                {employee.name || employee._id}
                              </span>
                              <span className="block truncate text-xs font-semibold text-slate-500">
                                {employee.designation || "No designation"} -{" "}
                                {employee.department || "No department"}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500 sm:col-span-2">
                            No more employees found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="block md:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Assigned Projects
                    </span>
                    <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                      {formData.assignedProjects.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          {formData.assignedProjects.map((projectId) => {
                            const project = projectFormOptions.find(
                              (projectOption) => projectOption._id === projectId
                            );

                            return (
                              <span
                                key={projectId}
                                className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                              >
                                <span className="truncate">
                                  {project?.projectName || "Project"}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeProject(projectId)}
                                  className="text-blue-500 transition hover:text-red-700"
                                  aria-label="Remove project"
                                >
                                  <X size={13} />
                                </button>
                              </span>
                            );
                          })}
                        </div>
                      )}
                      <div className="relative">
                        <Search
                          size={16}
                          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />
                        <input
                          type="search"
                          value={projectSearch}
                          onChange={(event) => setProjectSearch(event.target.value)}
                          placeholder="Search and assign projects"
                          className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                        />
                      </div>
                      <div className="mt-2 grid max-h-52 gap-2 overflow-y-auto sm:grid-cols-2">
                        {filteredProjectOptions.length ? (
                          filteredProjectOptions.map((project) => (
                            <button
                              key={project._id}
                              type="button"
                              onClick={() => addProject(project._id)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
                            >
                              <span className="block truncate text-sm font-bold text-slate-900">
                                {project.projectName || project._id}
                              </span>
                              <span className="block truncate text-xs font-semibold capitalize text-slate-500">
                                {formatLabel(project.status || "No status")} -{" "}
                                {project.priority || "No priority"}
                              </span>
                            </button>
                          ))
                        ) : (
                          <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500 sm:col-span-2">
                            No more projects found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <label className="block md:col-span-2">
                    <span className="text-sm font-bold text-slate-700">
                      Description
                    </span>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleFormChange}
                      rows={4}
                      className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                    />
                  </label>
                </div>

                <aside className="h-fit space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-sm font-black text-slate-950">
                    <Users size={18} />
                    Team Preview
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Members
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-950">
                        {previewMembers.length}
                      </p>
                    </div>
                    <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                      <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                        Projects
                      </p>
                      <p className="mt-2 text-2xl font-black text-slate-950">
                        {selectedProjects.length}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                      Included Members
                    </p>
                    <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                      {previewMembers.length ? (
                        previewMembers.map((memberId) => {
                          const member = employeeOptions.find(
                            (employee) => employee._id === memberId
                          );

                          return (
                            <span
                              key={memberId}
                              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                            >
                              {member?.name || "Employee"}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-sm font-semibold text-slate-500">
                          No members selected
                        </span>
                      )}
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeFormModal}
                disabled={isSubmitting}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmitTeam}
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {isSubmitting
                  ? "Saving..."
                  : formModal.mode === "create"
                    ? "Create Team"
                    : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal.isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                  Delete Team
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {deleteModal.team?.teamName}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(actionId)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close delete confirmation"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-5">
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-800">
                  This team will be permanently deleted.
                </p>
                <p className="mt-1 text-sm text-red-700">
                  Project and task history may need a soft-delete flow later.
                </p>
              </div>

              <div className="mt-4 rounded-lg bg-slate-50 px-4 py-3">
                <p className="text-sm font-bold text-slate-950">
                  {deleteModal.team?.department}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Lead: {getEmployeeName(deleteModal.team?.teamLead)}
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={Boolean(actionId)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTeam}
                disabled={Boolean(actionId)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 size={17} />
                {actionId ? "Deleting..." : "Delete Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default SuperAdminTeams;
