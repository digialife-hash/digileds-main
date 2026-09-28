import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  MessageSquarePlus,
  Save,
  Send,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import TaskDocumentManager from "../../components/documents/TaskDocumentManager";
import LoadingSpinner from "../../components/common/LoadingSpinner";

import SelectDropdown from "../../components/common/SelectDropdown";
import { useAuth } from "../../context/authStore";
import { ROUTES } from "../../routes/routeConstants";
import {
  addMyTaskProgressUpdate,
  addTaskComment,
  deleteTask,
  getMyTaskById,
  getTaskById,
  updateMyTaskStatus,
  updateTask,
} from "../../services/taskService";

const statusOptions = ["pending", "in_progress", "submitted", "approved", "rejected", "completed"];
const priorityOptions = ["low", "medium", "high", "urgent"];

const statusBadgeClass = {
  pending: "bg-slate-100 text-slate-700 ring-slate-200",
  in_progress: "bg-blue-50 text-blue-700 ring-blue-100",
  submitted: "bg-violet-50 text-violet-700 ring-violet-100",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  rejected: "bg-red-50 text-red-700 ring-red-100",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-100",
};

const priorityBadgeClass = {
  low: "bg-slate-100 text-slate-700 ring-slate-200",
  medium: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  high: "bg-amber-50 text-amber-700 ring-amber-100",
  urgent: "bg-red-50 text-red-700 ring-red-100",
};

const nextStatusByStatus = {
  pending: "in_progress",
  in_progress: "submitted",
  rejected: "in_progress",
};

const formatLabel = (value = "") =>
  (value === "review" ? "submitted" : value).replaceAll("_", " ");
const statusDropdownOptions = statusOptions.map((status) => [status, formatLabel(status)]);
const priorityDropdownOptions = priorityOptions.map((priority) => [priority, formatLabel(priority)]);

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

const formatDate = (value) => {
  if (!value) return "No deadline";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

const toDateInputValue = (value) => {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
};

const getName = (value, fallback = "Not assigned") => {
  if (!value) return fallback;
  if (typeof value === "string") return value;
  return value.name || value.projectName || value.email || fallback;
};

const getBackPath = (role) => {
  if (role === "super_admin") return ROUTES.SUPER_ADMIN_TASKS;
  return ROUTES.EMPLOYEE_TASKS;
};

const getTaskFormData = (task) => ({
  taskTitle: task?.taskTitle || "",
  description: task?.description || "",
  priority: task?.priority || "medium",
  deadline: toDateInputValue(task?.deadline),
  status: task?.status || "pending",
});

const buildTaskPayload = (formData) => ({
  taskTitle: formData.taskTitle.trim(),
  description: formData.description.trim(),
  priority: formData.priority,
  deadline: formData.deadline || undefined,
  status: formData.status,
});

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [actionId, setActionId] = useState("");
  const [commentText, setCommentText] = useState("");
  const [progressText, setProgressText] = useState("");
  const [editModal, setEditModal] = useState(false);
  const [editData, setEditData] = useState(getTaskFormData(null));
  const [deleteModal, setDeleteModal] = useState(false);

  const role = user?.role;
  const isSuperAdmin = role === "super_admin";
  const isEmployee = role === "employee";
  const canManageTask = isSuperAdmin;
  const canComment = isSuperAdmin;
  const canDelete = isSuperAdmin;
  const nextStatus = task ? nextStatusByStatus[task.status] : "";
  const isTerminal = task && ["submitted", "approved", "completed"].includes(task.status);

  const fetchTask = async () => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      setNotFound(false);

      const result = isSuperAdmin ? await getTaskById(id) : await getMyTaskById(id);

      setTask(result.data.task);
      setEditData(getTaskFormData(result.data.task));
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
        setNotFound(true);
        return;
      }

      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user && !["super_admin", "employee"].includes(role)) {
      navigate(ROUTES.UNAUTHORIZED, { replace: true });
    }
  }, [navigate, role, user]);

  useEffect(() => {
    if (role) {
      void fetchTask();
    }
  }, [id, role]);

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditData((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleUpdateTask = async () => {
    if (!editData.taskTitle.trim() || !task) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      const payload = buildTaskPayload(editData);

      await updateTask(task._id, payload);

      setEditModal(false);
      await fetchTask();
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

  const handleAddComment = async () => {
    if (!task || !commentText.trim()) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      await addTaskComment(task._id, { commentText: commentText.trim() });
      setCommentText("");
      await fetchTask();
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

  const handleAddProgress = async () => {
    if (!task || !progressText.trim()) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      await addMyTaskProgressUpdate(task._id, {
        updateText: progressText.trim(),
      });
      setProgressText("");
      await fetchTask();
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

  const handleStatusUpdate = async () => {
    if (!task || !nextStatus) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      await updateMyTaskStatus(task._id, { status: nextStatus });
      await fetchTask();
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

  const handleManagerStatusUpdate = async (status) => {
    if (!task) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      await updateTask(task._id, { status });

      await fetchTask();
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

  const handleDeleteTask = async () => {
    if (!task) return;

    try {
      setActionId(task._id);
      setErrorMessage("");

      await deleteTask(task._id);
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
      setActionId("");
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-96 items-center justify-center rounded-lg border border-slate-200 bg-white">
        <LoadingSpinner />
      </div>
    );
  }

  if (notFound || !task) {
    return (
      <section className="flex min-h-96 flex-col items-center justify-center rounded-lg border border-slate-200 bg-white px-5 text-center shadow-sm">
        <Clock3 size={28} className="text-slate-400" />
        <h1 className="mt-4 text-xl font-black text-slate-950">Task not found</h1>
        <p className="mt-1 text-sm text-slate-500">
          The task may not exist or may be outside your allowed access.
        </p>
        <button
          type="button"
          onClick={() => navigate(getBackPath(role))}
          className="mt-5 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700"
        >
          Back to Tasks
        </button>
      </section>
    );
  }

  return (
    <section className="h-full space-y-6 overflow-y-auto pb-8">
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <button
            type="button"
            onClick={() => navigate(getBackPath(role))}
            className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-slate-600 transition hover:text-slate-950"
          >
            <ArrowLeft size={16} />
            Back to Tasks
          </button>
          <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Task Details
          </p>
          <h1 className="mt-1 text-2xl font-black text-slate-950 sm:text-3xl">
            {task.taskTitle}
          </h1>
        </div>

        <div className="flex flex-wrap gap-2">
          {isEmployee && nextStatus && !isTerminal && (
            <button
              type="button"
              onClick={handleStatusUpdate}
              disabled={actionId === task._id}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <CheckCircle2 size={17} />
              Move to {formatLabel(nextStatus)}
            </button>
          )}

          {canManageTask && task.status === "submitted" && (
            <>
              <button
                type="button"
                onClick={() => handleManagerStatusUpdate("approved")}
                disabled={actionId === task._id}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <CheckCircle2 size={17} />
                Approve
              </button>
              <button
                type="button"
                onClick={() => handleManagerStatusUpdate("rejected")}
                disabled={actionId === task._id}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-bold text-red-700 shadow-sm transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <X size={17} />
                Reject
              </button>
            </>
          )}

          {canManageTask && (
            <button
              type="button"
              onClick={() => setEditModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <Edit3 size={17} />
              Edit Task
            </button>
          )}

          {canDelete && (
            <button
              type="button"
              onClick={() => setDeleteModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
            >
              <Trash2 size={17} />
              Delete
            </button>
          )}
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {errorMessage}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap gap-2">
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                  statusBadgeClass[task.status] || statusBadgeClass.pending
                }`}
              >
                {formatLabel(task.status)}
              </span>
              <span
                className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ring-1 ${
                  priorityBadgeClass[task.priority] || priorityBadgeClass.medium
                }`}
              >
                {task.priority}
              </span>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-600">
              {task.description || "No description added."}
            </p>
          </div>

          <TaskDocumentManager
            taskId={task._id}
            taskStatus={task.status}
            user={user}
            onDocumentChange={fetchTask}
          />


          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Progress Timeline</h2>
            {task.progressUpdates?.length ? (
              <div className="mt-5 space-y-4">
                {task.progressUpdates.map((update) => (
                  <div key={update._id} className="border-l-2 border-blue-100 pl-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-slate-950">
                        {getName(update.updatedBy, "User")}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-bold capitalize text-slate-600">
                        {formatLabel(update.statusAtThatTime)}
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {update.updateText}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {formatDateTime(update.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No progress updates yet.</p>
            )}

            {isEmployee && !isTerminal && (
              <div className="mt-5 rounded-lg bg-slate-50 p-3">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">
                    Add progress update
                  </span>
                  <textarea
                    value={progressText}
                    onChange={(event) => setProgressText(event.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAddProgress}
                  disabled={actionId === task._id || !progressText.trim()}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <Send size={16} />
                  Add Update
                </button>
              </div>
            )}
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Comments</h2>
            {task.comments?.length ? (
              <div className="mt-5 space-y-3">
                {task.comments.map((comment) => (
                  <div key={comment._id} className="rounded-lg bg-slate-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-black text-slate-950">
                        {getName(comment.commentedBy, "User")}
                      </p>
                      <p className="shrink-0 text-xs font-semibold text-slate-400">
                        {formatDateTime(comment.createdAt)}
                      </p>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {comment.commentText}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-slate-500">No comments yet.</p>
            )}

            {canComment && (
              <div className="mt-5 rounded-lg bg-slate-50 p-3">
                <label className="block">
                  <span className="text-sm font-bold text-slate-700">Add comment</span>
                  <textarea
                    value={commentText}
                    onChange={(event) => setCommentText(event.target.value)}
                    rows={3}
                    className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                  />
                </label>
                <button
                  type="button"
                  onClick={handleAddComment}
                  disabled={actionId === task._id || !commentText.trim()}
                  className="mt-3 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  <MessageSquarePlus size={16} />
                  Add Comment
                </button>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-black text-slate-950">Assignment</h2>
            <div className="mt-4 space-y-3">
              {[
                ["Assigned Employee", getName(task.assignedEmployee, "Unassigned")],
                ["Related Project", getName(task.relatedProject, "No project")],
                ["Created By", getName(task.createdBy, "User")],
                ["Deadline", formatDate(task.deadline)],
                ["Created", formatDateTime(task.createdAt)],
                ["Completed", formatDateTime(task.completedAt)],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    {label}
                  </p>
                  <p className="mt-1 text-sm font-black text-slate-950">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-black text-slate-950">
              <UserRound size={17} />
              Access Note
            </div>
            <p className="mt-3 text-sm leading-6 text-slate-500">
              Task visibility and mutations are enforced by the backend using your
              authenticated role and ownership.
            </p>
          </div>
        </aside>
      </div>

      {editModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                  Edit Task
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {task.taskTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setEditModal(false)}
                disabled={Boolean(actionId)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close edit task"
              >
                <X size={20} />
              </button>
            </div>

            <div className="grid gap-4 px-5 py-5 md:grid-cols-2">
              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Task Title</span>
                <input
                  type="text"
                  name="taskTitle"
                  value={editData.taskTitle}
                  onChange={handleEditChange}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Priority</span>
                <SelectDropdown
                  name="priority"
                  value={editData.priority}
                  options={priorityDropdownOptions}
                  onChange={handleEditChange}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Status</span>
                <SelectDropdown
                  name="status"
                  value={editData.status}
                  options={statusDropdownOptions}
                  onChange={handleEditChange}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-slate-700">Deadline</span>
                <input
                  type="date"
                  name="deadline"
                  value={editData.deadline}
                  onChange={handleEditChange}
                  className="mt-2 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>

              <label className="block md:col-span-2">
                <span className="text-sm font-bold text-slate-700">Description</span>
                <textarea
                  name="description"
                  value={editData.description}
                  onChange={handleEditChange}
                  rows={4}
                  className="mt-2 w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 outline-none transition focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
              </label>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setEditModal(false)}
                disabled={Boolean(actionId)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateTask}
                disabled={Boolean(actionId) || !editData.taskTitle.trim()}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Save size={17} />
                {actionId ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md overflow-hidden rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-red-600">
                  Delete Task
                </p>
                <h2 className="mt-1 text-xl font-black text-slate-950">
                  {task.taskTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                disabled={Boolean(actionId)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-60"
                aria-label="Close delete task"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-5 py-5">
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
                <p className="text-sm font-semibold text-red-800">
                  This task will be permanently deleted.
                </p>
              </div>
            </div>

            <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteModal(false)}
                disabled={Boolean(actionId)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTask}
                disabled={Boolean(actionId)}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Trash2 size={17} />
                {actionId ? "Deleting..." : "Delete Task"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default TaskDetails;
