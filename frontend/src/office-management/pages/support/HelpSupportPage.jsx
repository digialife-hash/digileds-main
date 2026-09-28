import React, { useState, useEffect } from "react";
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Search,
  Star,
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  getFAQsApi,
  getSupportTicketsApi,
  createTicketApi,
  submitFeedbackApi,
} from "../../services/supportService";

const HelpSupportPage = () => {
  const [activeTab, setActiveTab] = useState("faqs"); // 'faqs', 'tickets', 'contact', 'feedback'
  const [faqs, setFaqs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & FAQ Accordion
  const [search, setSearch] = useState("");
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // Raise Ticket Modal State
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Technical Issues");
  const [priority, setPriority] = useState("Medium");
  const [description, setDescription] = useState("");
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);

  // Feedback Form State
  const [rating, setRating] = useState(5);
  const [feedbackCategory, setFeedbackCategory] = useState("Suggestions");
  const [comments, setComments] = useState("");
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  useEffect(() => {
    if (activeTab === "faqs") fetchFAQs();
    if (activeTab === "tickets") fetchTickets();
  }, [activeTab, search]);

  const fetchFAQs = async () => {
    try {
      setIsLoading(true);
      const res = await getFAQsApi({ search });
      if (res.success) setFaqs(res.data.faqs || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      const res = await getSupportTicketsApi({ search });
      if (res.success) setTickets(res.data.tickets || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRaiseTicket = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingTicket(true);
      const formData = new FormData();
      formData.append("subject", subject);
      formData.append("category", category);
      formData.append("priority", priority);
      formData.append("description", description);

      const res = await createTicketApi(formData);
      if (res.success) {
        toast.success("Support ticket raised successfully!");
        setSubject("");
        setDescription("");
        setShowTicketModal(false);
        fetchTickets();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to raise ticket");
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsSubmittingFeedback(true);
      const res = await submitFeedbackApi({
        rating,
        category: feedbackCategory,
        comments,
      });
      if (res.success) {
        toast.success("Thank you for your feedback!");
        setComments("");
      }
    } catch (err) {
      toast.error("Failed to submit feedback");
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">
            Help & Support Center
          </h1>
          <p className="text-xs font-semibold text-slate-500">
            Frequently asked questions, ticket dispatches & company contacts
          </p>
        </div>

        <button
          onClick={() => setShowTicketModal(true)}
          className="inline-flex items-center gap-1.5 rounded-2xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4" />
          <span>Raise Support Ticket</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-bold">
        {[
          { key: "faqs", label: "Searchable FAQs", icon: HelpCircle },
          { key: "tickets", label: "My Support Tickets", icon: MessageSquare },
          { key: "contact", label: "Contact Company", icon: Mail },
          { key: "feedback", label: "Submit Feedback", icon: Star },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-1.5 rounded-t-2xl px-4 py-2.5 transition ${
                activeTab === tab.key
                  ? "bg-blue-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: FAQS */}
      {activeTab === "faqs" && (
        <div className="space-y-4">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search questions..."
              className="w-full rounded-2xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-xs font-semibold text-slate-900"
            />
          </div>

          <div className="space-y-3">
            {isLoading ? (
              <div className="py-8 text-center text-slate-400">Loading FAQs...</div>
            ) : faqs.map((f) => (
              <div key={f._id} className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs">
                <button
                  onClick={() => setExpandedFaqId(expandedFaqId === f._id ? null : f._id)}
                  className="flex w-full items-center justify-between p-4 text-left text-xs font-bold text-slate-900 hover:bg-slate-50"
                >
                  <span className="flex items-center gap-2">
                    <span className="rounded-full bg-blue-50 text-blue-700 px-2 py-0.5 text-[10px]">
                      {f.category}
                    </span>
                    <span>{f.question}</span>
                  </span>
                  {expandedFaqId === f._id ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                {expandedFaqId === f._id && (
                  <div className="border-t border-slate-100 bg-slate-50/50 p-4 text-xs text-slate-700 leading-relaxed font-medium">
                    {f.answer}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUPPORT TICKETS */}
      {activeTab === "tickets" && (
        <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 font-bold text-slate-700 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Ticket #</th>
                <th className="px-4 py-3.5">Subject</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-slate-400">Loading tickets...</td>
                </tr>
              ) : tickets.map((t) => (
                <tr key={t._id} className="hover:bg-slate-50">
                  <td className="px-4 py-3.5 font-mono font-bold text-blue-600">{t.ticketNumber}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{t.subject}</td>
                  <td className="px-4 py-3.5 font-semibold text-slate-700">{t.category}</td>
                  <td className="px-4 py-3.5 font-bold text-amber-600">{t.priority}</td>
                  <td className="px-4 py-3.5">
                    <span className="rounded-full bg-blue-50 text-blue-700 px-2.5 py-0.5 text-xs font-bold">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-500">{new Date(t.createdAt).toLocaleDateString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 3: CONTACT COMPANY */}
      {activeTab === "contact" && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900">Official Contact Info</h2>
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Mail className="h-4 w-4" /></div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Email Support</span>
                  <span className="font-bold text-slate-900">support@digitalalife.com</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><Phone className="h-4 w-4" /></div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Phone Hotline</span>
                  <span className="font-bold text-slate-900">+91 1800 123 4567</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600"><MapPin className="h-4 w-4" /></div>
                <div>
                  <span className="text-slate-500 block text-[10px] uppercase font-bold">Office Address</span>
                  <span className="font-bold text-slate-900">Digital Alife Tower, Tech Park, India</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FEEDBACK */}
      {activeTab === "feedback" && (
        <form onSubmit={handleFeedbackSubmit} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4 max-w-lg">
          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Rating (1 to 5 Stars)</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded-xl text-xs font-bold transition ${
                    rating >= star ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-400"
                  }`}
                >
                  <Star className="h-5 w-5 fill-current" />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Feedback Category</label>
            <select
              value={feedbackCategory}
              onChange={(e) => setFeedbackCategory(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900"
            >
              <option value="Suggestions">Suggestions</option>
              <option value="Complaints">Complaints</option>
              <option value="Feature Requests">Feature Requests</option>
              <option value="General">General</option>
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-slate-700">Comments</label>
            <textarea
              rows="4"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Share your experience or suggestions..."
              required
              className="w-full rounded-xl border border-slate-200 p-3 text-xs font-medium text-slate-900"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmittingFeedback}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmittingFeedback ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            <span>Submit Feedback</span>
          </button>
        </form>
      )}
    </div>
  );
};

export default HelpSupportPage;
