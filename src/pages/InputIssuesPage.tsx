import React, { useState, useEffect } from 'react';
import { api } from '../services/api.ts';
import { InputIssue } from '../types/index.ts';
import Badge from '../components/common/Badge.tsx';
import Modal from '../components/common/Modal.tsx';
import IssueFormModal from '../components/issues/IssueFormModal.tsx';
import { formatDate } from '../utils/formatters.ts';
import { AlertTriangle, Search, Plus, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

export const InputIssuesPage: React.FC = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState<InputIssue[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<InputIssue | null>(null);
  const [newStatus, setNewStatus] = useState<string>('Resolved');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [resolving, setResolving] = useState(false);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await api.issues.getAll({
        search,
        status: statusFilter,
        priority: priorityFilter,
      });
      setIssues(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, [search, statusFilter, priorityFilter]);

  const handleOpenResolve = (issue: InputIssue) => {
    setSelectedIssue(issue);
    setNewStatus('Resolved');
    setResolutionNotes(`Dispatched replacement batch from district warehouse on ${new Date().toLocaleDateString()}`);
    setResolveModalOpen(true);
  };

  const handleSaveResolution = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;

    setResolving(true);
    try {
      await api.issues.update(selectedIssue.issueId, {
        status: newStatus,
        resolutionNotes,
      });
      setResolveModalOpen(false);
      fetchIssues();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update issue.');
    } finally {
      setResolving(false);
    }
  };

  const canResolve = user?.role === 'admin' || user?.role === 'officer';

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight">Agricultural Input Tickets</h2>
          <p className="text-xs text-stone-500">
            Escalation and resolution tracker for seed germination, bio-fertilizer, pesticide, and irrigation supply bottlenecks
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Report Input Shortage</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-stone-200/90 shadow-xs flex flex-wrap items-center gap-3 text-xs">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search input name, ticket ID, farmer..."
            className="w-full pl-9 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-700"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="Under Review">Under Review</option>
            <option value="Assigned">Assigned</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-stone-500 font-medium">Priority:</span>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
          >
            <option value="All">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
      </div>

      {/* Issues Table */}
      <div className="bg-white rounded-xl border border-stone-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-semibold text-stone-800">
              <tr>
                <th className="py-3 px-4">Ticket ID</th>
                <th className="py-3 px-4">Farmer / Contract</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Material / Problem</th>
                <th className="py-3 px-4">Qty Needed</th>
                <th className="py-3 px-4">Priority</th>
                <th className="py-3 px-4">Reported</th>
                <th className="py-3 px-4">Status</th>
                {canResolve && <th className="py-3 px-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">Loading input issues...</td>
                </tr>
              ) : issues.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-stone-400">No input issue tickets found.</td>
                </tr>
              ) : (
                issues.map((i) => (
                  <tr key={i.issueId} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-emerald-950">{i.issueId}</td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-stone-900 block">{i.farmerName}</span>
                      <span className="text-[10px] text-stone-400">{i.contractId} &middot; {i.cropName}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-stone-100 text-stone-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {i.issueCategory}
                      </span>
                    </td>
                    <td className="py-3 px-4 max-w-xs">
                      <span className="font-semibold text-stone-900 block">{i.inputName}</span>
                      <span className="text-[11px] text-stone-500 line-clamp-1">{i.description}</span>
                    </td>
                    <td className="py-3 px-4 font-medium text-stone-800">{i.quantityRequired || '-'}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          i.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : i.priority === 'High'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-700'
                        }`}
                      >
                        {i.priority}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-stone-500 whitespace-nowrap">
                      {formatDate(i.reportedDate)}
                    </td>
                    <td className="py-3 px-4">
                      <Badge status={i.status} />
                    </td>
                    {canResolve && (
                      <td className="py-3 px-4 text-right">
                        {i.status !== 'Resolved' && i.status !== 'Closed' ? (
                          <button
                            onClick={() => handleOpenResolve(i)}
                            className="px-2.5 py-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md border border-emerald-200 transition-colors"
                          >
                            Resolve Ticket
                          </button>
                        ) : (
                          <span className="text-[10px] text-stone-400 font-medium">Resolved</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resolve Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title={selectedIssue ? `Resolve Ticket: ${selectedIssue.issueId}` : 'Resolve Ticket'}
        subtitle={`Input Item: ${selectedIssue?.inputName} · Farmer: ${selectedIssue?.farmerName}`}
        maxWidth="md"
      >
        <form onSubmit={handleSaveResolution} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-stone-700 mb-1">Update Status *</label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-semibold"
            >
              <option value="Under Review">Under Review</option>
              <option value="Assigned">Assigned to Warehouse Dispatch</option>
              <option value="Resolved">Resolved (Material Dispatched)</option>
              <option value="Closed">Closed &amp; Acknowledged</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Agronomist Resolution Notes *</label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              placeholder="Detail actions taken, dispatched lot numbers, or application guidance..."
              required
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolving}
              className="px-5 py-2 text-white bg-[#1b4332] hover:bg-[#2d6a4f] rounded-lg font-semibold transition-colors shadow-xs disabled:opacity-50"
            >
              {resolving ? 'Updating...' : 'Save Resolution'}
            </button>
          </div>
        </form>
      </Modal>

      <IssueFormModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onSuccess={fetchIssues}
      />
    </div>
  );
};

export default InputIssuesPage;
