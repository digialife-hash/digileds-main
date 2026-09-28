import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Paperclip, Save, Upload, X } from "lucide-react";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import { getEmployees } from "../../services/employeeService";
import { getProjects } from "../../services/projectService";
import { addTaskComment, createTask, uploadTaskDocuments } from "../../services/taskService";


const priorityOptions = ["low", "medium", "high", "urgent"];
const statusOptions = ["pending", "in_progress", "submitted", "approved", "rejected", "completed"];

const initialFormData = {
  taskTitle: "",
  description: "",
  assignedEmployee: "",
  relatedProject: "",
  priority: "medium",
  deadline: "",
  status: "pending",
  initialComment: "",
};

const formatLabel = (value = "") => value.replaceAll("_", " ");

const buildTaskPayload = (formData) => ({
  taskTitle: formData.taskTitle.trim(),
  description: formData.description.trim(),
  assignedEmployee: formData.assignedEmployee,
  relatedProject: formData.relatedProject || undefined,
  priority: formData.priority,
  deadline: formData.deadline || undefined,
  status: formData.status || "pending",
});

const CreateTask = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const selectedProjectId =
    searchParams.get("projectId") || searchParams.get("relatedProject") || "";

  const [employees, setEmployees] = useState([]);
  const [projects, setProjects] = useState([]);
  const [formData, setFormData] = useState({
    ...initialFormData,
    relatedProject: selectedProjectId,
  });
  const [formErrors, setFormErrors] = useState({});
  const [attachments, setAttachments] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const isSuperAdmin = ["super_admin", "admin"].includes(user?.role);
  const employeeOptions = useMemo(
    () => [
      ["", "Select employee"],
      ...employees.map((employee) => [
        employee._id,
        `${employee.name} - ${employee.department || "No department"}`,
      ]),
    ],
    [employees]
  );
  const projectOptions = useMemo(
    () => [["", "No project"], ...projects.map((project) => [project._id, project.projectName])],
    [projects]
  );
  const priorityDropdownOptions = useMemo(
    () => priorityOptions.map((priority) => [priority, formatLabel(priority)]),
    []
  );
  const statusDropdownOptions = useMemo(
    () => statusOptions.map((status) => [status, formatLabel(status)]),
    []
  );

  useEffect(() => {
    if (user && !isSuperAdmin) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [isSuperAdmin, navigate, user]);

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

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files || []);
    if (selectedFiles.length > 0) {
      setAttachments((current) => [...current, ...selectedFiles]);
    }
    event.target.value = "";
  };

  const removeAttachment = (indexToRemove) => {
    setAttachments((current) =>
      current.filter((_, index) => index !== indexToRemove)
    );
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.taskTitle.trim()) {
      errors.taskTitle = "Task title is required";
    }

    if (!formData.assignedEmployee) {
      errors.assignedEmployee = "Assigned employee is required";
    }

    if (!priorityOptions.includes(formData.priority)) {
      errors.priority = "Invalid priority";
    }

    if (!statusOptions.includes(formData.status)) {
      errors.status = "Invalid status";
    }

    if (formData.deadline) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const deadline = new Date(formData.deadline);
      deadline.setHours(0, 0, 0, 0);

      if (Number.isNaN(deadline.getTime())) {
        errors.deadline = "Deadline must be a valid date";
      } else if (deadline < today) {
        errors.deadline = "Deadline cannot be in the past";
      }
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

      const result = await createTask(buildTaskPayload(formData));
      const createdTask = result.data.task;

      if (createdTask?._id) {
        if (formData.initialComment.trim()) {
          await addTaskComment(createdTask._id, {
            commentText: formData.initialComment.trim(),
          });
        }

        if (attachments.length > 0) {
          const docFormData = new FormData();
          attachments.forEach((file) => docFormData.append("files", file));
          docFormData.append("document_type", "Admin Attachment");
          if (formData.initialComment.trim()) {
            docFormData.append("comment", formData.initialComment.trim());
          }
          await uploadTaskDocuments(createdTask._id, docFormData);
        }
      }

      navigate(ROUTES.SUPER_ADMIN_TASKS, { replace: true });
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
            onClick={() => navigate(ROUTES.SUPER_ADMIN_TASKS)}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Task Allocation
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            Create Task
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
        <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-700">
                Task Title <span className="text-red-500">*</span>
              </span>
              <input
                type="text"
                name="taskTitle"
                value={formData.taskTitle}
                onChange={handleChange}
                className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
                  formErrors.taskTitle
                    ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                }`}
              />
              {formErrors.taskTitle && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {formErrors.taskTitle}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">
                Assigned Employee <span className="text-red-500">*</span>
              </span>
              <SelectDropdown
                name="assignedEmployee"
                value={formData.assignedEmployee}
                options={employeeOptions}
                onChange={handleChange}
                className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:ring-2 ${
                  formErrors.assignedEmployee
                    ? "border-red-300 focus:border-red-300 focus:ring-red-100"
                    : "border-slate-200 focus:border-blue-300 focus:ring-blue-100"
                }`}
              />
              {formErrors.assignedEmployee && (
                <p className="mt-1 text-xs font-semibold text-red-600">
                  {formErrors.assignedEmployee}
                </p>
              )}
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Related Project</span>
              <SelectDropdown
                name="relatedProject"
                value={formData.relatedProject}
                options={projectOptions}
                onChange={handleChange}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Priority</span>
              <SelectDropdown
                name="priority"
                value={formData.priority}
                options={priorityDropdownOptions}
                onChange={handleChange}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Status</span>
              <SelectDropdown
                name="status"
                value={formData.status}
                options={statusDropdownOptions}
                onChange={handleChange}
                className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <label className="block">
              <span className="text-sm font-bold text-slate-700">Deadline</span>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className={`mt-2 h-11 w-full rounded-lg border bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:ring-2 ${
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

            <label className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-700">
                Initial Comment / Remarks
              </span>
              <textarea
                name="initialComment"
                value={formData.initialComment}
                onChange={handleChange}
                rows={3}
                className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
              />
            </label>

            <div className="block md:col-span-2">
              <span className="text-sm font-bold text-slate-700">
                Task Supporting Attachments (Requirements, SOPs, Design Files, Excel, PDFs, ZIPs)
              </span>
              <div className="mt-2 flex items-center gap-3">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100">
                  <Upload size={16} className="text-blue-600" />
                  Select Attachments
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.jpg,.jpeg,.png,.webp,.svg,.zip,.rar"
                  />
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  {attachments.length === 0
                    ? "No files selected yet"
                    : `${attachments.length} file(s) attached`}
                </span>
              </div>

              {attachments.length > 0 && (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {attachments.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-800"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Paperclip size={14} className="text-blue-600 shrink-0" />
                        <span className="truncate font-bold">{file.name}</span>
                        <span className="text-slate-500 font-mono">
                          ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeAttachment(idx)}
                        className="rounded p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="h-fit rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <ClipboardList size={18} />
              Task Setup
            </div>
            <div className="mt-4 space-y-3 text-sm text-slate-600">
              <p>
                New tasks are secured by backend role checks. The frontend never
                sends `createdBy`.
              </p>
              <p className="font-semibold text-slate-800">
                Status defaults to pending.
              </p>
            </div>
          </aside>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => navigate(ROUTES.SUPER_ADMIN_TASKS)}
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
            {isSubmitting ? "Creating..." : "Create Task"}
          </button>
        </div>
      </form>
    </section>
  );
};

export default CreateTask;
