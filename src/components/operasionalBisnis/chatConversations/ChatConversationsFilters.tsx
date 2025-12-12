import { Search, Globe, MessageCircle } from "lucide-react";
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
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
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
  sourceFilter,
  setSourceFilter,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: ChatConversationsFiltersProps) => {
  const hasActiveFilters = startDate || endDate || sourceFilter !== 'all' || feedbackFilter !== 'all';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl">Filter & Pencarian Percakapan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Search Input */}
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

          {/* Source Filter */}
          <Select value={sourceFilter} onValueChange={setSourceFilter}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter Source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4" />
                  <span>Semua Source</span>
                </div>
              </SelectItem>
              <SelectItem value="landing_page">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-blue-500" />
                  <span>Landing Page</span>
                </div>
              </SelectItem>
              <SelectItem value="whatsapp">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-green-500" />
                  <span>WhatsApp</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Feedback Filter */}
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

          {/* Date Range */}
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

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {sourceFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Source: {sourceFilter === 'landing_page' ? '🌐 Landing Page' : '💬 WhatsApp'}
              </Badge>
            )}
            {feedbackFilter !== 'all' && (
              <Badge variant="secondary" className="text-xs">
                Feedback: {feedbackFilter === 'none' ? 'Tanpa Feedback' : feedbackFilter}
              </Badge>
            )}
            {(startDate || endDate) && (
              <Badge variant="secondary" className="text-xs">
                Periode: {startDate || 'Awal'} - {endDate || 'Sekarang'}
              </Badge>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartDate("");
                setEndDate("");
                setSourceFilter("all");
                setFeedbackFilter("all");
              }}
              className="h-6 text-xs"
            >
              Reset Semua Filter
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};