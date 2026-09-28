import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  BriefcaseBusiness,
  CalendarDays,
  FolderKanban,
  Plus,
  Save,
  Search,
  Users,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { getClients } from "../../services/clientService";
import { getEmployees } from "../../services/employeeService";
import {
  createProject,
  getProjectById,
  updateProject,
} from "../../services/projectService";
import { getTeams } from "../../services/teamService";
import { ROUTES } from "../../routes/routeConstants";
const initialFormData = {
  projectName: "",
  clientId: "",
  category: "",
  assignedTeam: [],
  assignedTeams: [],
  startDate: "",
  deadline: "",
  budget: "",
  status: "not_started",
  priority: "medium",
  description: "",
  progressPercentage: 0,
  githubRepo: "",
  notes: "",
};

const priorityOptions = [
  ["low", "Low"],
  ["medium", "Medium"],
  ["high", "High"],
  ["urgent", "Urgent"],
];

const statusOptions = [
  ["not_started", "Not Started"],
  ["in_progress", "In Progress"],
  ["on_hold", "On Hold"],
  ["completed", "Completed"],
  ["cancelled", "Cancelled"],
];

const toDateInputValue = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
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

const filterTeams = (teams = [], query = "") => {
  const searchText = query.trim().toLowerCase();
  if (!searchText) return teams;

  return teams.filter((team) => {
    return [team.teamName, team.department, team.description]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(searchText));
  });
};

const getUniqueById = (items = []) => {
  const seenIds = new Set();

  return items.filter((item) => {
    if (!item?._id || seenIds.has(item._id)) return false;
    seenIds.add(item._id);
    return true;
  });
};

const getProjectFormData = (project) => ({
  projectName: project?.projectName || "",
  clientId: getId(project?.clientId),
  category: project?.category || "",
  assignedTeam: Array.isArray(project?.assignedTeam)
    ? project.assignedTeam.map(getId).filter(Boolean)
    : [],
  assignedTeams: Array.isArray(project?.assignedTeams)
    ? project.assignedTeams.map(getId).filter(Boolean)
    : [],
  startDate: toDateInputValue(project?.startDate),
  deadline: toDateInputValue(project?.deadline),
  budget: project?.budget ?? "",
  status: project?.status || "not_started",
  priority: project?.priority || "medium",
  description: project?.description || "",
  progressPercentage: project?.progressPercentage ?? 0,
  notes: project?.notes || "",
githubRepo: project?.github?.repoUrl || ""
});

const CreateProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [clients, setClients] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [teams, setTeams] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [teamSearch, setTeamSearch] = useState("");
  const [formErrors, setFormErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoadingClients, setIsLoadingClients] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const isEditMode = Boolean(id);

  const selectedClient = useMemo(() => {
    return clients.find((client) => client._id === formData.clientId);
  }, [clients, formData.clientId]);
  const clientOptions = useMemo(
    () => [
      ["", "Select client"],
      ...clients.map((client) => [
        client._id,
        client.companyName || client.clientName || "Client",
      ]),
    ],
    [clients],
  );

  const selectedTeamMembers = useMemo(() => {
    return formData.assignedTeam.map((memberId) => {
      return (
        employees.find((member) => member._id === memberId) || {
          _id: memberId,
          name: "Assigned user / employee",
          email: memberId,
        }
      );
    });
  }, [employees, formData.assignedTeam]);

  const selectedTeams = useMemo(() => {
    return formData.assignedTeams.map((teamId) => {
      return (
        teams.find((team) => team._id === teamId) || {
          _id: teamId,
          teamName: "Assigned team",
          department: "Team",
          members: [],
        }
      );
    });
  }, [formData.assignedTeams, teams]);

  const filteredEmployeeOptions = useMemo(() => {
    const assignedIds = new Set(formData.assignedTeam);
    return filterEmployees(employees, employeeSearch)
      .filter((member) => !assignedIds.has(member._id))
      .slice(0, 8);
  }, [employeeSearch, employees, formData.assignedTeam]);

  const filteredTeamOptions = useMemo(() => {
    const assignedIds = new Set(formData.assignedTeams);
    return filterTeams(teams, teamSearch)
      .filter((team) => !assignedIds.has(team._id))
      .slice(0, 8);
  }, [formData.assignedTeams, teamSearch, teams]);

  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [isSuperAdmin, navigate, user]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoadingClients(true);
        setErrorMessage("");

        const [clientsResult, employeeResult, teamsResult, projectResult] =
          await Promise.all([
            getClients({ limit: 100, status: "active" }),
            getEmployees({ limit: 100, status: "active" }),
            getTeams({ limit: 100, status: "active" }),
            isEditMode ? getProjectById(id) : Promise.resolve(null),
          ]);

        setClients(clientsResult.data.clients || []);
        setEmployees(getUniqueById(employeeResult.data.employees || []));
        setTeams(getUniqueById(teamsResult.data.teams || []));

        if (projectResult) {
          setFormData(getProjectFormData(projectResult.data.project));
        }
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
        setIsLoadingClients(false);
      }
    };

    void fetchInitialData();
  }, [id, isEditMode, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: name === "progressPercentage" ? Number(value) : value,
    }));

    if (formErrors[name]) {
      setFormErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
  };

  const addTeamMember = (memberId) => {
    setFormData((current) => ({
      ...current,
      assignedTeam: current.assignedTeam.includes(memberId)
        ? current.assignedTeam
        : [...current.assignedTeam, memberId],
    }));
    setEmployeeSearch("");

    if (formErrors.assignedTeam) {
      setFormErrors((current) => ({
        ...current,
        assignedTeam: "",
      }));
    }
  };

  const removeTeamMember = (id) => {
    setFormData((current) => ({
      ...current,
      assignedTeam: current.assignedTeam.filter((memberId) => memberId !== id),
    }));
  };

  const addExistingTeam = (teamId) => {
    setFormData((current) => ({
      ...current,
      assignedTeams: current.assignedTeams.includes(teamId)
        ? current.assignedTeams
        : [...current.assignedTeams, teamId],
    }));
    setTeamSearch("");
  };

  const removeExistingTeam = (teamId) => {
    setFormData((current) => ({
      ...current,
      assignedTeams: current.assignedTeams.filter((id) => id !== teamId),
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.projectName.trim()) {
      errors.projectName = "Project name is required";
    }

    if (!formData.clientId) {
      errors.clientId = "Client is required";
    }

    if (formData.budget !== "" && Number(formData.budget) < 0) {
      errors.budget = "Budget cannot be negative";
    }

    const githubRegex = /^https:\/\/github\.com\/[^/]+\/[^/]+(?:\.git)?\/?$/;

    const githubRepo = formData.githubRepo.trim();

    if (githubRepo && !githubRegex.test(githubRepo)) {
      errors.githubRepo = "Invalid Github Repository URL";
    }

    if (
      !Number.isFinite(Number(formData.progressPercentage)) ||
      Number(formData.progressPercentage) < 0 ||
      Number(formData.progressPercentage) > 100
    ) {
      errors.progressPercentage = "Progress must be between 0 and 100";
    }

    if (formData.startDate && formData.deadline) {
      const startDate = new Date(formData.startDate);
      const deadline = new Date(formData.deadline);

      if (deadline < startDate) {
        errors.deadline = "Deadline cannot be before start date";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = () => {
    const payload = {
      projectName: formData.projectName.trim(),
      clientId: formData.clientId,
      status: formData.status,
      priority: formData.priority,
      progressPercentage: Number(formData.progressPercentage),
    };

    if (formData.category.trim()) payload.category = formData.category.trim();
    if (formData.assignedTeam.length)
      payload.assignedTeam = formData.assignedTeam;
    if (formData.assignedTeams.length)
      payload.assignedTeams = formData.assignedTeams;
    if (formData.startDate) payload.startDate = formData.startDate;
    if (formData.deadline) payload.deadline = formData.deadline;
    if (formData.budget !== "") payload.budget = Number(formData.budget);
    if (formData.githubRepo.trim()) {
      payload.githubRepo = formData.githubRepo.trim();
    }
    if (formData.description.trim())
      payload.description = formData.description.trim();
    if (formData.notes.trim()) payload.notes = formData.notes.trim();

    return payload;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");
      if (isEditMode) {
        await updateProject(id, buildPayload());
        navigate(`${ROUTES.SUPER_ADMIN_PROJECTS}/${id}`, { replace: true });
      } else {
        const result = await createProject(buildPayload());
        const createdId = result?.data?.project?._id;
        if (createdId) {
          navigate(ROUTES.SUPER_ADMIN_PROJECTS,{ replace: true });
        } else {
          navigate(ROUTES.SUPER_ADMIN_PROJECTS, { replace: true });
        }
      }
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

  if (isLoadingClients) {
    return (
      <section className="flex h-full items-center justify-center">
        <LoadingSpinner />
      </section>
    );
  }

  return (
    <section className="h-full overflow-y-auto pb-8">
      <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Project Management
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            {isEditMode ? "Edit Project" : "Create Project"}
          </h1>
        </div>

        <button
          type="button"
          onClick={() => navigate(ROUTES.SUPER_ADMIN_PROJECTS)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
        >
          <ArrowLeft size={17} />
          Back to Projects
        </button>
      </div>

      {errorMessage && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]"
      >
        <div className="space-y-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <BriefcaseBusiness size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Project Details
                </h2>
                <p className="text-sm text-slate-500">
                  Core project scope, client, dates, and budget.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">
                  Project Name <span className="text-red-500">*</span>
                </span>
                <input
                  type="text"
                  name="projectName"
                  value={formData.projectName}
                  onChange={handleChange}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                    formErrors.projectName
                      ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  }`}
                />
                {formErrors.projectName && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {formErrors.projectName}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Client <span className="text-red-500">*</span>
                </span>
                <SelectDropdown
                  name="clientId"
                  value={formData.clientId}
                  options={clientOptions}
                  onChange={handleChange}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 ${
                    formErrors.clientId
                      ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  }`}
                />
                {formErrors.clientId && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {formErrors.clientId}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Category
                </span>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Start Date
                </span>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Deadline
                </span>
                <input
                  type="date"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:ring-2 ${
                    formErrors.deadline
                      ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  }`}
                />
                {formErrors.deadline && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {formErrors.deadline}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Budget</span>
                <input
                  type="number"
                  min="0"
                  name="budget"
                  value={formData.budget}
                  onChange={handleChange}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                    formErrors.budget
                      ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  }`}
                />
                {formErrors.budget && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {formErrors.budget}
                  </p>
                )}
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Priority
                </span>
                <SelectDropdown
                  name="priority"
                  value={formData.priority}
                  options={priorityOptions}
                  onChange={handleChange}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Status</span>
                <SelectDropdown
                  name="status"
                  value={formData.status}
                  options={statusOptions}
                  onChange={handleChange}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">
                  Progress Percentage
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  name="progressPercentage"
                  value={formData.progressPercentage}
                  onChange={handleChange}
                  className="mt-4 w-full accent-blue-600"
                />
                <div className="mt-2 flex items-center gap-3">
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-blue-600 transition-all"
                      style={{ width: `${formData.progressPercentage}%` }}
                    />
                  </div>
                  <span className="w-12 text-right text-sm font-black text-slate-700">
                    {formData.progressPercentage}%
                  </span>
                </div>
                {formErrors.progressPercentage && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {formErrors.progressPercentage}
                  </p>
                )}
              </label>
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Users size={20} />
              </div>
              <div>
                <h2 className="text-lg font-black text-slate-950">
                  Assigned Employees
                </h2>
                <p className="text-sm text-slate-500">
                  Add employee records directly or allocate existing teams.
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <Users size={16} />
                Employees
              </div>
              {selectedTeamMembers.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedTeamMembers.map((member) => (
                    <span
                      key={member._id}
                      className="inline-flex max-w-full items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 ring-1 ring-emerald-100"
                    >
                      <span className="truncate">{member.name}</span>
                      <button
                        type="button"
                        onClick={() => removeTeamMember(member._id)}
                        className="text-emerald-600 transition hover:text-red-700"
                        aria-label="Remove team member"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={employeeSearch}
                  onChange={(event) => setEmployeeSearch(event.target.value)}
                  placeholder="Search employee by name, email, department"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                />
              </div>

              <div className="mt-2 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                {filteredEmployeeOptions.length ? (
                  filteredEmployeeOptions.map((member) => (
                    <div
                      key={member._id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-slate-900">
                          {member.name}
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-500">
                          {member.email}
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-400">
                          {member.designation || "No designation"}
                          {member.department ? ` - ${member.department}` : ""}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => addTeamMember(member._id)}
                        className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                      >
                        <Plus size={14} />
                        Add to Team
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500 sm:col-span-2">
                    No more active users/employees found
                  </div>
                )}
              </div>
            </div>

            <div className="mt-4 rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
              <div className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
                <FolderKanban size={16} />
                Existing Teams
              </div>

              {selectedTeams.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedTeams.map((team) => (
                    <span
                      key={team._id}
                      className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-800 ring-1 ring-blue-100"
                    >
                      <span className="truncate">
                        {team.teamName} - {team.members?.length || 0} members
                      </span>
                      <button
                        type="button"
                        onClick={() => removeExistingTeam(team._id)}
                        className="text-blue-600 transition hover:text-red-700"
                        aria-label="Remove team"
                      >
                        <X size={13} />
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="relative">
                <Search
                  size={16}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={teamSearch}
                  onChange={(event) => setTeamSearch(event.target.value)}
                  placeholder="Search existing teams by name or department"
                  className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                />
              </div>

              <div className="mt-2 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                {filteredTeamOptions.length ? (
                  filteredTeamOptions.map((team) => (
                    <div
                      key={team._id}
                      className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-slate-900">
                          {team.teamName}
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-500">
                          {team.department || "No department"}
                        </span>
                        <span className="block truncate text-xs font-semibold text-slate-400">
                          {team.members?.length || 0} members
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => addExistingTeam(team._id)}
                        className="inline-flex shrink-0 items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-700"
                      >
                        <Plus size={14} />
                        Add Team
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-lg bg-slate-50 px-3 py-3 text-sm font-semibold text-slate-500 sm:col-span-2">
                    No more active teams found
                  </div>
                )}
              </div>
            </div>
          </section>

                  <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Github Repository
                </span>
                <input
                  type="url"
                  name="githubRepo"
                  value={formData.githubRepo}
                  autoComplete="off"
                  onChange={handleChange}
                  className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                    formErrors.githubRepo
                      ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                      : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                  }`}
                  placeholder="https://github.com/Owner/Repo.git"
                />
                {formErrors.githubRepo && (
                  <p className="mt-1 text-xs font-semibold text-red-600">
                    {formErrors.githubRepo}
                  </p>
                )}
              </label>
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-sm font-bold text-slate-700">
                  Description
                </span>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={5}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Notes</span>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>
          </section>
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-base font-black text-slate-950">Summary</h2>

            <div className="mt-4 space-y-4 text-sm">
              <div>
                <p className="font-bold text-slate-500">Client</p>
                <p className="mt-1 font-black text-slate-950">
                  {selectedClient?.companyName || "Not selected"}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-500">Status</p>
                <p className="mt-1 font-black capitalize text-slate-950">
                  {formData.status.replace("_", " ")}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-500">Priority</p>
                <p className="mt-1 font-black capitalize text-slate-950">
                  {formData.priority}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-500">GitHub Repository</p>
                <p className="mt-1 font-black capitalize text-slate-950">
                  {formData.githubRepo ? (
                    <a
                      href={formData.githubRepo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 underline break-all"
                    >{formData.githubRepo}</a>
                  ) : (
                    <span>Not Added</span>
                  )}
                </p>
              </div>

              <div>
                <p className="font-bold text-slate-500">Team</p>
                <p className="mt-1 font-black text-slate-950">
                  {formData.assignedTeam.length} users/employees,{" "}
                  {formData.assignedTeams.length} teams
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <CalendarDays size={14} />
                  Timeline
                </div>
                <p className="font-semibold text-slate-700">
                  {formData.startDate || "Start date not set"} to{" "}
                  {formData.deadline || "deadline not set"}
                </p>
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={17} />
            {isSubmitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Project"
                : "Create Project"}
          </button>
        </aside>
      </form>
    </section>
  );
};

export default CreateProject;
