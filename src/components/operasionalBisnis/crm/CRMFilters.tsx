// components/crm/CRMFilters.tsx

import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CRMFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  lifecycleFilter: string;
  setLifecycleFilter: (value: string) => void;
  leadStatusFilter: string;
  setLeadStatusFilter: (value: string) => void;
  uniqueLifecycleStages: string[];
  uniqueLeadStatuses: string[];
}

export const CRMFilters = ({
  searchTerm,
  setSearchTerm,
  lifecycleFilter,
  setLifecycleFilter,
  leadStatusFilter,
  setLeadStatusFilter,
  uniqueLifecycleStages,
  uniqueLeadStatuses
}: CRMFiltersProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Filter & Pencarian</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama, email, atau perusahaan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            {searchTerm.length > 0 && searchTerm.length < 3 && (
              <p className="text-xs text-amber-600 mt-1">
                Minimal 3 karakter untuk pencarian
              </p>
            )}
          </div>

          <Select value={lifecycleFilter} onValueChange={setLifecycleFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lifecycle Stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Stage</SelectItem>
              <SelectItem value="lead">Lead</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="customer">Customer</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>

          <Select value={leadStatusFilter} onValueChange={setLeadStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Lead Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="follow_up">Follow Up</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};