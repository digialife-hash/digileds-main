import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, FolderKanban, Save, UserRound, Users } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployees } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import { getTeamById, updateTeam } from "../../services/teamService";

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

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value._id || "";
};

const getUniqueIds = (values = []) => {
  return [...new Set(values.map(getId).filter(Boolean))];
};

const getSelectedOptions = (event) => {
  return Array.from(event.target.selectedOptions).map((option) => option.value);
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

const getNameById = (items = [], id, fallback = "Not selected") => {
  return items.find((item) => item._id === id)?.name || fallback;
};

const getProjectNameById = (items = [], id) => {
  return items.find((item) => item._id === id)?.projectName || "Project";
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

const buildTeamPayload = (formData, previewMembers, assignedProjects) => ({
  teamName: formData.teamName.trim(),
  teamLead: formData.teamLead,
  members: previewMembers,
  department: formData.department.trim(),
  assignedProjects,
  status: formData.status || "active",
  description: formData.description.trim(),
});

const EditTeam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [team, setTeam] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isNotFound, setIsNotFound] = useState(false);

  const canManageTeams = user?.role === "super_admin";

  const employeeOptions = useMemo(() => {
    return mergeById(employees, team?.teamLead ? [team.teamLead] : [], team?.members || []);
  }, [employees, team]);
  const teamLeadOptions = useMemo(
    () => [
      ["", "Select team lead"],
      ...employeeOptions.map((employee) => [
        employee._id,
        `${employee.name || employee._id} - ${employee.department || "No department"}`,
      ]),
    ],
    [employeeOptions]
  );
  const memberOptions = useMemo(
    () =>
      employeeOptions.map((employee) => [
        employee._id,
        `${employee.name || employee._id} - ${employee.designation || "No designation"}`,
      ]),
    [employeeOptions]
  );

  const projectOptions = useMemo(() => {
    return mergeById(projects, team?.assignedProjects || []);
  }, [projects, team]);
  const assignedProjectOptions = useMemo(
    () =>
      projectOptions.map((project) => [
        project._id,
        `${project.projectName || project._id} - ${formatLabel(project.status || "")}`,
      ]),
    [projectOptions]
  );

  const previewMembers = useMemo(() => {
    return getUniqueIds([...formData.members, formData.teamLead]);
  }, [formData.members, formData.teamLead]);

  const selectedProjects = useMemo(() => {
    return getUniqueIds(formData.assignedProjects);
  }, [formData.assignedProjects]);

  useEffect(() => {
    if (user && !canManageTeams) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [canManageTeams, navigate, user]);

  useEffect(() => {
    const fetchTeamAndOptions = async () => {
      try {
        setIsLoading(true);
        setErrorMessage("");
        setIsNotFound(false);

        const [teamResult, employeeResult, projectResult] = await Promise.all([
          getTeamById(id),
          getEmployees({ limit: 100, status: "active" }),
          getProjects({ limit: 100 }),
        ]);

        const nextTeam = teamResult.data.team;

        setTeam(nextTeam);
        setFormData(getTeamFormData(nextTeam));
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

        if (error.status === 404) {
          setIsNotFound(true);
          return;
        }

        setErrorMessage(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchTeamAndOptions();
  }, [id, navigate]);

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

  const handleMultiSelectChange = (name, event) => {
    const values = getUniqueIds(getSelectedOptions(event));

    setFormData((current) => ({
      ...current,
      [name]: values,
    }));

    if (formErrors[name]) {
      setFormErrors((current) => ({
        ...current,
        [name]: "",
      }));
    }
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

      await updateTeam(
        id,
        buildTeamPayload(formData, previewMembers, selectedProjects)
      );
      navigate(`${ROUTES.SUPER_ADMIN_TEAMS}/${id}`, { replace: true });
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

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (isNotFound) {
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
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TEAMS}/${id}`)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Team
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Team Creation
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Edit Team
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

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Team Lead <span className="text-red-500">*</span>
              </span>
              <SelectDropdown
                name="teamLead"
                value={formData.teamLead}
                options={teamLeadOptions}
                onChange={handleChange}
                className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 ${
                  formErrors.teamLead
                    ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                }`}
              />
              {formErrors.teamLead && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {formErrors.teamLead}
                </p>
              )}
            </label>

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

            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-700">Members</span>
              <SelectDropdown
                name="members"
                value={formData.members}
                options={memberOptions}
                multiple
                placeholder="Select members"
                onChange={(event) => handleMultiSelectChange("members", event)}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-700">
                Assigned Projects
              </span>
              <SelectDropdown
                name="assignedProjects"
                value={formData.assignedProjects}
                options={assignedProjectOptions}
                multiple
                placeholder="Select projects"
                onChange={(event) =>
                  handleMultiSelectChange("assignedProjects", event)
                }
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

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
                {getNameById(employeeOptions, formData.teamLead)}
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
                      {getNameById(employeeOptions, memberId, "Employee")}
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
                      {getProjectNameById(projectOptions, projectId)}
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
            onClick={() => navigate(`${ROUTES.SUPER_ADMIN_TEAMS}/${id}`)}
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
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default EditTeam;
