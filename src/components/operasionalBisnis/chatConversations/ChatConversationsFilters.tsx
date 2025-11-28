import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChatConversationsFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  feedbackFilter: string;
  setFeedbackFilter: (value: string) => void;
  startDate: string;
  setStartDate: (value: string) => void;
  endDate: string;
  setEndDate: (value: string) => void;
}

export const ChatConversationsFilters = ({
  searchTerm,
  setSearchTerm,
  feedbackFilter,
  setFeedbackFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: ChatConversationsFiltersProps) => {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Filter & Pencarian Percakapan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari sender ID atau pesan (min 3 kar)..."
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

          <Select value={feedbackFilter} onValueChange={setFeedbackFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter Feedback" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Feedback</SelectItem>
              <SelectItem value="like">Ada Like</SelectItem>
              <SelectItem value="dislike">Ada Dislike</SelectItem>
              <SelectItem value="none">Tanpa Feedback</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center gap-2">
            <Input
              type="date"
              placeholder="Tanggal Mulai"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="text-sm text-muted-foreground">to</span>
            <Input
              type="date"
              placeholder="Tanggal Akhir"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>

        {(startDate || endDate) && (
          <div className="mt-3 flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              Periode: {startDate || 'Awal'} - {endDate || 'Sekarang'}
            </Badge>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
              className="h-6 text-xs"
            >
              Reset Periode
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};