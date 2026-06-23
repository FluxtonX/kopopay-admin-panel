"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
  ShieldCheck, 
  User as UserIcon,
  Loader2,
  Check,
  X,
  FileText,
  Car,
  Clock
} from "lucide-react";
import { useState } from "react";

interface VehicleDetails {
  model: string;
  plateNumber: string;
  color: string;
  vehicleType?: string;
}

interface MakerCheckerRequest {
  requestId: string;
  createdAt: string;
  requestType: string;
  entityId: string;
  entityType: string;
  requestedBy: string;
  status: string;
  reason: string;
  payload: {
    userId: string;
    vehicleDetails: VehicleDetails;
    documents: {
      cnicFront?: string;
      license?: string;
      registration?: string;
    };
  };
}

export default function DriverApprovalsPage() {
  const queryClient = useQueryClient();
  const [rejectReason, setRejectReason] = useState<string>("");
  const [activeRejectId, setActiveRejectId] = useState<string | null>(null);

  // Fetch pending maker-checker requests
  const { data: requests = [], isLoading } = useQuery<MakerCheckerRequest[]>({
    queryKey: ['maker-checker-pending'],
    queryFn: async () => {
      const resp = await api.get('/maker-checker/pending');
      // Filter for DRIVER_APPROVAL requests
      return (resp.data.data || []).filter((r: MakerCheckerRequest) => r.requestType === 'DRIVER_APPROVAL');
    }
  });

  // Approve Mutation
  const approveMutation = useMutation({
    mutationFn: async (requestId: string) => {
      await api.post(`/maker-checker/${requestId}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maker-checker-pending'] });
    }
  });

  // Reject Mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, reason }: { requestId: string, reason: string }) => {
      await api.post(`/maker-checker/${requestId}/reject`, { reason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['maker-checker-pending'] });
      setActiveRejectId(null);
      setRejectReason("");
    }
  });

  const handleApprove = (requestId: string) => {
    if (confirm("Are you sure you want to approve this driver application?")) {
      approveMutation.mutate(requestId);
    }
  };

  const handleRejectSubmit = (requestId: string) => {
    if (!rejectReason.trim()) {
      alert("Please provide a reason for rejection.");
      return;
    }
    rejectMutation.mutate({ requestId, reason: rejectReason });
  };

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header>
        <h2 className="text-3xl font-bold">Driver Approvals</h2>
        <p className="text-foreground/60">Review driver registration applications, vehicle credentials, and document uploads.</p>
      </header>

      <div className="bg-sidebar border border-dark-border rounded-2xl overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center text-foreground/40">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Loading pending approvals...</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center text-foreground/40 text-center space-y-2">
            <ShieldCheck size={48} className="text-primary/40" />
            <p className="font-bold text-lg text-foreground/80">All Clean!</p>
            <p className="text-sm">There are no pending driver applications awaiting review.</p>
          </div>
        ) : (
          <div className="divide-y divide-dark-border">
            {requests.map((request) => (
              <div key={request.requestId} className="p-6 hover:bg-dark-surface/50 transition-colors flex flex-col lg:flex-row gap-6 justify-between items-start">
                <div className="space-y-4 flex-1">
                  {/* Driver Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/5">
                      <UserIcon size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-foreground tracking-tight">Driver Candidate</h3>
                      <p className="text-xs text-foreground/40 font-mono">User ID: {request.entityId}</p>
                    </div>
                  </div>

                  {/* Vehicle Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-foreground/[0.02] p-4 rounded-xl border border-dark-border">
                    <div className="flex items-center gap-3">
                      <Car className="text-primary shrink-0" size={20} />
                      <div>
                        <p className="text-[10px] uppercase font-bold text-foreground/40">Vehicle Info</p>
                        <p className="text-sm font-semibold">
                          {request.payload.vehicleDetails.color} {request.payload.vehicleDetails.model}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-foreground/40">Plate Number</p>
                        <p className="text-xs font-mono font-bold bg-dark-border px-2 py-0.5 rounded w-fit uppercase text-foreground/80">
                          {request.payload.vehicleDetails.plateNumber}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-foreground/40">Class Type</p>
                        <p className="text-xs font-bold text-primary">
                          {request.payload.vehicleDetails.vehicleType || "Economy"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="space-y-2">
                    <p className="text-[10px] uppercase font-bold text-foreground/40 tracking-wider">Uploaded Documents</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {[
                        { label: "CNIC / National ID Front", value: request.payload.documents.cnicFront },
                        { label: "Driver License", value: request.payload.documents.license },
                        { label: "Vehicle Registration", value: request.payload.documents.registration },
                      ].map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-foreground/[0.01] rounded-xl border border-dark-border hover:border-primary/20 transition-all">
                          <FileText className="text-foreground/40" size={24} />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold truncate text-foreground/80">{doc.label}</p>
                            <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">
                              {doc.value ? "✓ Uploaded" : "✗ Missing"}
                            </p>
                          </div>
                          {doc.value && (
                            <a 
                              href={doc.value} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="text-xs font-bold text-teal-400 hover:text-teal-300 ml-auto hover:underline cursor-pointer"
                            >
                              View
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-foreground/40">
                    <Clock size={14} />
                    <span>Applied on: {new Date(request.createdAt).toLocaleString()}</span>
                  </div>
                </div>

                {/* Actions Section */}
                <div className="flex flex-col gap-3 min-w-[200px] shrink-0 w-full lg:w-auto">
                  <button 
                    onClick={() => handleApprove(request.requestId)}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="w-full bg-primary hover:bg-primary-hover disabled:opacity-50 text-white font-bold px-4 py-3 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-sm transition-all"
                  >
                    {approveMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Check size={16} />}
                    Approve Driver
                  </button>

                  {activeRejectId === request.requestId ? (
                    <div className="space-y-2 bg-foreground/[0.02] p-3 rounded-xl border border-red-500/20">
                      <textarea
                        placeholder="Reason for rejection..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full bg-sidebar border border-dark-border rounded-lg p-2 text-xs focus:border-red-500/50 focus:outline-none text-foreground"
                        rows={2}
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setActiveRejectId(null)}
                          className="p-1 hover:bg-dark-border rounded text-foreground/60"
                        >
                          <X size={14} />
                        </button>
                        <button
                          onClick={() => handleRejectSubmit(request.requestId)}
                          disabled={rejectMutation.isPending}
                          className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold hover:bg-red-600 transition-colors"
                        >
                          {rejectMutation.isPending ? "Submitting..." : "Reject"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => setActiveRejectId(request.requestId)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="w-full bg-transparent hover:bg-red-500/10 border border-red-500/20 disabled:opacity-50 text-red-500 font-bold px-4 py-3 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
                    >
                      <X size={16} />
                      Reject Application
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
