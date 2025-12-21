// components/consultation/ConsultationFilters.tsx

import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ConsultationFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  companySizeFilter: string;
  setCompanySizeFilter: (value: string) => void;
  uniqueStatuses: string[];
  uniqueCompanySizes: string[];
}

export const ConsultationFilters = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  companySizeFilter,
  setCompanySizeFilter,
  uniqueStatuses,
  uniqueCompanySizes
}: ConsultationFiltersProps) => {
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
              placeholder="Cari nama, email, website..."
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Consultation Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="greetings_sent">Greetings Sent</SelectItem>
              <SelectItem value="follow_up_1_sent">Follow Up 1</SelectItem>
              <SelectItem value="follow_up_2_sent">Follow Up 2</SelectItem>
              <SelectItem value="follow_up_3_sent">Follow Up 3</SelectItem>
              <SelectItem value="replied">Replied</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="closed_won">Closed Won</SelectItem>
              <SelectItem value="closed_lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>

          <Select value={companySizeFilter} onValueChange={setCompanySizeFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Company Size" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Ukuran</SelectItem>
              <SelectItem value="1-10">1-10 karyawan</SelectItem>
              <SelectItem value="11-50">11-50 karyawan</SelectItem>
              <SelectItem value="51-200">51-200 karyawan</SelectItem>
              <SelectItem value="201+">201+ karyawan</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};