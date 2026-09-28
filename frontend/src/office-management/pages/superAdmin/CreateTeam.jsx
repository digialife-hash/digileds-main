import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FolderKanban,
  Save,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployees } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import { createTeam } from "../../services/teamService";

const statusOptions = ["active", "inactive", "archived"];

const initialFormData = {
  teamName: "",
  teamLead: "",
  members: [],
  department: "",
  assignedProjects: [],
  status: "active",
  description: "",
};

const formatLabel = (value = "") => value.replaceAll("_", " ");
const statusDropdownOptions = statusOptions.map((status) => [status, formatLabel(status)]);

const getUniqueIds = (values = []) => {
  return [...new Set(values.filter(Boolean))];
};

const getNameById = (items = [], id, fallback = "Not selected") => {
  return items.find((item) => item._id === id)?.name || fallback;
};

const getProjectNameById = (items = [], id) => {
  return items.find((item) => item._id === id)?.projectName || "Project";
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

const buildTeamPayload = (formData, previewMembers) => ({
  teamName: formData.teamName.trim(),
  teamLead: formData.teamLead,
  members: previewMembers,
  department: formData.department.trim(),
  assignedProjects: formData.assignedProjects,
  status: formData.status || "active",
  description: formData.description.trim(),
});

const CreateTeam = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [teamLeadSearch, setTeamLeadSearch] = useState("");
  const [memberSearch, setMemberSearch] = useState("");
  const [projectSearch, setProjectSearch] = useState("");
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const canManageTeams = user?.role === "super_admin";

  const previewMembers = useMemo(() => {
    return getUniqueIds([...formData.members, formData.teamLead]);
  }, [formData.members, formData.teamLead]);

  const selectedProjects = useMemo(() => {
    return getUniqueIds(formData.assignedProjects);
  }, [formData.assignedProjects]);

  const selectedLead = useMemo(() => {
    return employees.find((employee) => employee._id === formData.teamLead);
  }, [employees, formData.teamLead]);

  const filteredTeamLeadOptions = useMemo(() => {
    return filterEmployees(employees, teamLeadSearch).slice(0, 8);
  }, [employees, teamLeadSearch]);

  const filteredMemberOptions = useMemo(() => {
    const selectedMemberIds = new Set(formData.members);
    return filterEmployees(employees, memberSearch)
      .filter((employee) => !selectedMemberIds.has(employee._id))
      .slice(0, 8);
  }, [employees, formData.members, memberSearch]);

  const filteredProjectOptions = useMemo(() => {
    const selectedProjectIds = new Set(formData.assignedProjects);
    return filterProjects(projects, projectSearch)
      .filter((project) => !selectedProjectIds.has(project._id))
      .slice(0, 8);
  }, [formData.assignedProjects, projectSearch, projects]);

  useEffect(() => {
    if (user && !canManageTeams) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [canManageTeams, navigate, user]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setIsLoadingOptions(true);
        setErrorMessage("");

        const [employeeResult, projectResult] = await Promise.all([
          getEmployees({ limit: 100, status: "active" }),
          getProjects({ limit: 100 }),
        ]);

        setEmployees(employeeResult.data.employees || []);
        setProjects(projectResult.data.projects || []);
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
        setIsLoadingOptions(false);
      }
    };

    void fetchOptions();
  }, [navigate]);

  const handleChange = (event) => {
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

    if (!formData.teamName.trim()) {
      errors.teamName = "Team name is required";
    }

    if (!formData.department.trim()) {
      errors.department = "Department is required";
    }

    if (!formData.teamLead) {
      errors.teamLead = "Team lead is required";
    }

    if (!statusOptions.includes(formData.status)) {
      errors.status = "Invalid status";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);
      setErrorMessage("");

      await createTeam(buildTeamPayload(formData, previewMembers));
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
      setIsSubmitting(false);
    }
  };

  if (isLoadingOptions) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_TEAMS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Teams
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Team Creation
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Create Team
          </h1>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-lg border border-slate-200 bg-white shadow-sm"
      >
        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Team Name <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
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
                onChange={handleChange}
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
                      {selectedLead.name} - {selectedLead.department || "No department"}
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
                    placeholder="Search employee by name, email, department"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                  />
                </div>
                <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-slate-100">
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
                            {employee.name}
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
              <span className="text-sm font-bold text-slate-700">Status</span>
              <SelectDropdown
                name="status"
                value={formData.status}
                options={statusDropdownOptions}
                onChange={handleChange}
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
              <span className="text-sm font-bold text-slate-700">Members</span>
              <div className="mt-2 rounded-lg border border-slate-200 bg-white p-3 transition focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100">
                {formData.members.length > 0 && (
                  <div className="mb-3 flex flex-wrap gap-2">
                    {formData.members.map((memberId) => (
                      <span
                        key={memberId}
                        className="inline-flex max-w-full items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700"
                      >
                        <span className="truncate">
                          {getNameById(employees, memberId, "Employee")}
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
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="Search and add team members"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                  />
                </div>
                <div className="mt-2 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
                  {filteredMemberOptions.length ? (
                    filteredMemberOptions.map((employee) => (
                      <button
                        key={employee._id}
                        type="button"
                        onClick={() => addMember(employee._id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <span className="block truncate text-sm font-bold text-slate-900">
                          {employee.name}
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
                    {formData.assignedProjects.map((projectId) => (
                      <span
                        key={projectId}
                        className="inline-flex max-w-full items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700"
                      >
                        <span className="truncate">
                          {getProjectNameById(projects, projectId)}
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
                    value={projectSearch}
                    onChange={(event) => setProjectSearch(event.target.value)}
                    placeholder="Search and assign projects"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:bg-white"
                  />
                </div>
                <div className="mt-2 grid max-h-56 gap-2 overflow-y-auto sm:grid-cols-2">
                  {filteredProjectOptions.length ? (
                    filteredProjectOptions.map((project) => (
                      <button
                        key={project._id}
                        type="button"
                        onClick={() => addProject(project._id)}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-left transition hover:border-blue-200 hover:bg-blue-50"
                      >
                        <span className="block truncate text-sm font-bold text-slate-900">
                          {project.projectName}
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
              <span className="text-sm font-bold text-slate-700">Description</span>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
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

            <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Lead
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-950">
                {getNameById(employees, formData.teamLead)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <UserRound size={14} />
                  Members
                </div>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {previewMembers.length}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  <FolderKanban size={14} />
                  Projects
                </div>
                <p className="mt-2 text-2xl font-black text-slate-950">
                  {selectedProjects.length}
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
              <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Members Included
              </p>
              <div className="mt-2 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
                {previewMembers.length ? (
                  previewMembers.map((memberId) => (
                    <span
                      key={memberId}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-700"
                    >
                      {getNameById(employees, memberId, "Employee")}
                    </span>
                  ))
                ) : (
                  <span className="text-sm font-semibold text-slate-500">
                    No members selected
                  </span>
                )}
              </div>
            </div>

            {selectedProjects.length > 0 && (
              <div className="rounded-lg bg-white p-3 ring-1 ring-slate-200">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Projects
                </p>
                <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                  {selectedProjects.map((projectId) => (
                    <span
                      key={projectId}
                      className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-blue-700"
                    >
                      {getProjectNameById(projects, projectId)}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_TEAMS)}
            disabled={isSubmitting}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Save size={17} />
            {isSubmitting ? "Creating..." : "Create Team"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateTeam;
