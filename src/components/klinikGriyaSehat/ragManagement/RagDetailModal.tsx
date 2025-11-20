// components/ragManagement/RagDetailModal.tsx
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { RagDocument, RagUrl } from "@/types/ragManagement";
import { FileText, ExternalLink, X } from "lucide-react";

interface RagDetailModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  item: RagDocument | RagUrl | null;
  onUpdateItem: (id: string, updates: Partial<RagDocument | RagUrl>) => void;
}

export const RagDetailModal = ({ 
  isOpen, 
  onClose, 
  item,
  onUpdateItem 
}: RagDetailModalProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [url, setUrl] = useState("");
  const [crawlFrequency, setCrawlFrequency] = useState("");
  const [metadataText, setMetadataText] = useState("");

  useEffect(() => {
    if (item) {
      setTitle(item.title || "");
      setDescription(item.description || "");
      setStatus(item.status || "pending");
      setTags(item.tags || []);
      setMetadataText(item.metadata ? JSON.stringify(item.metadata, null, 2) : "");
      
      if ('url' in item) {
        setUrl(item.url || "");
        setCrawlFrequency(item.crawl_frequency || "manual");
      }
    }
  }, [item]);

  if (!item) return null;

  const isDocument = (item: RagDocument | RagUrl): item is RagDocument => {
    return 'file_name' in item;
  };

  const handleSave = () => {
    let parsedMetadata = null;
    
    if (metadataText.trim()) {
      try {
        parsedMetadata = JSON.parse(metadataText);
      } catch (error) {
        alert("Format metadata JSON tidak valid!");
        return;
      }
    }

    const updates: any = {
      title: title.trim() || null,
      description: description.trim() || null,
      status: status,
      tags: tags,
      metadata: parsedMetadata
    };

    if (!isDocument(item)) {
      updates.crawl_frequency = crawlFrequency;
    }

    onUpdateItem(item.id, updates);
    onClose(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatFileSize = (bytes: number) => {
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            {isDocument(item) ? (
              <>
                <FileText className="h-6 w-6 text-blue-500" />
                Detail Dokumen
              </>
            ) : (
              <>
                <ExternalLink className="h-6 w-6 text-green-500" />
                Detail URL
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Lihat dan update informasi {isDocument(item) ? 'dokumen' : 'URL'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Read-Only Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg border">
            <div>
              <Label className="text-xs text-muted-foreground">ID</Label>
              <p className="text-xs font-mono bg-white p-2 rounded border mt-1 break-all">
                {item.id}
              </p>
            </div>
            
            {isDocument(item) ? (
              <>
                <div>
                  <Label className="text-xs text-muted-foreground">File Name</Label>
                  <p className="text-sm bg-white p-2 rounded border mt-1 break-all">
                    {item.file_name}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">File Type</Label>
                  <p className="text-sm bg-white p-2 rounded border mt-1">
                    {item.file_type}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">File Size</Label>
                  <p className="text-sm bg-white p-2 rounded border mt-1">
                    {formatFileSize(item.file_size)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">File Path</Label>
                  <p className="text-xs font-mono bg-white p-2 rounded border mt-1 break-all">
                    {item.file_path}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Indexed At</Label>
                  <p className="text-sm bg-white p-2 rounded border mt-1">
                    {formatDate(item.indexed_at)}
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="md:col-span-2">
                  <Label className="text-xs text-muted-foreground">URL</Label>
                  <p className="text-sm font-mono bg-white p-2 rounded border mt-1 break-all">
                    {item.url}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Last Crawled</Label>
                  <p className="text-sm bg-white p-2 rounded border mt-1">
                    {formatDate(item.last_crawled_at)}
                  </p>
                </div>
              </>
            )}

            <div>
              <Label className="text-xs text-muted-foreground">Created At</Label>
              <p className="text-sm bg-white p-2 rounded border mt-1">
                {formatDate(item.created_at)}
              </p>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Updated At</Label>
              <p className="text-sm bg-white p-2 rounded border mt-1">
                {formatDate(item.updated_at)}
              </p>
            </div>
            
            {item.n8n_webhook_url && (
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground">N8N Webhook URL</Label>
                <p className="text-xs font-mono bg-white p-2 rounded border mt-1 break-all">
                  {item.n8n_webhook_url}
                </p>
              </div>
            )}
          </div>

          {/* Editable Fields */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
            <h3 className="font-semibold text-lg">Edit Informasi</h3>
            
            <div className="space-y-2">
              <Label htmlFor="title">Judul</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Judul item"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi detail"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {!isDocument(item) && (
                <div className="space-y-2">
                  <Label htmlFor="crawlFreq">Crawl Frequency</Label>
                  <Select value={crawlFrequency} onValueChange={setCrawlFrequency}>
                    <SelectTrigger id="crawlFreq">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="Ketik tag dan tekan Enter"
                />
                <Button type="button" onClick={addTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, idx) => (
                  <Badge key={idx} variant="secondary">
                    {tag}
                    <X
                      className="h-3 w-3 ml-1 cursor-pointer"
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="metadata">Metadata (JSON Format)</Label>
              <Textarea
                id="metadata"
                value={metadataText}
                onChange={(e) => setMetadataText(e.target.value)}
                placeholder='{"key": "value"}'
                className="font-mono text-sm min-h-[120px]"
              />
              <p className="text-xs text-muted-foreground">
                Format JSON untuk menyimpan informasi tambahan
              </p>
            </div>
          </div>

          {/* Processing Status */}
          {item.processing_status && (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <Label className="text-sm font-medium mb-2 block">Processing Status:</Label>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto max-h-[200px]">
                {JSON.stringify(item.processing_status, null, 2)}
              </pre>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => onClose(false)}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Simpan Perubahan
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};