// components/ragManagement/RagUploadModal.tsx
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, FileText, ExternalLink, Plus } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface RagUploadModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  uploadType: 'document' | 'url';
  onUploadComplete: () => void;
}

interface FileWithMeta {
  file: File;
  title: string;
  description: string;
  tags: string[];
}

export const RagUploadModal = ({ 
  isOpen, 
  onClose, 
  uploadType,
  onUploadComplete 
}: RagUploadModalProps) => {
  const [files, setFiles] = useState<FileWithMeta[]>([]);
  const [urlData, setUrlData] = useState({
    title: '',
    url: '',
    description: '',
    tags: [] as string[],
    crawlFrequency: 'manual'
  });
  const [tagInput, setTagInput] = useState('');
  const [n8nWebhook, setN8nWebhook] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).map(file => ({
        file,
        title: file.name.replace(/\.[^/.]+$/, ''),
        description: '',
        tags: []
      }));
      setFiles([...files, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const updateFileMetadata = (index: number, field: keyof FileWithMeta, value: any) => {
    const updated = [...files];
    updated[index] = { ...updated[index], [field]: value };
    setFiles(updated);
  };

  const addTag = (tags: string[], setTags: (tags: string[]) => void) => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tags: string[], setTags: (tags: string[]) => void, tag: string) => {
    setTags(tags.filter(t => t !== tag));
  };

  const handleUploadDocuments = async () => {
    if (files.length === 0) {
      toast.error("Pilih minimal 1 file untuk diupload");
      return;
    }

    setIsUploading(true);
    
    try {
      const uploadPromises = files.map(async (fileData) => {
        // 1. Upload file ke Supabase Storage
        const fileExt = fileData.file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `rag-documents/${fileName}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, fileData.file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // 2. Insert metadata ke database
        const { data: insertData, error: insertError } = await supabase
          .from('dt_rag_documents')
          .insert({
            title: fileData.title,
            file_name: fileData.file.name,
            file_path: filePath,
            file_size: fileData.file.size,
            file_type: fileExt || 'unknown',
            mime_type: fileData.file.type,
            description: fileData.description || null,
            tags: fileData.tags.length > 0 ? fileData.tags : null,
            status: 'pending',
            n8n_webhook_url: n8nWebhook || null,
            metadata: {
              original_name: fileData.file.name,
              uploaded_at: new Date().toISOString()
            }
          })
          .select()
          .single();

        if (insertError) throw insertError;

        // 3. Optional: Trigger n8n webhook
        if (n8nWebhook) {
          try {
            await fetch(n8nWebhook, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                document_id: insertData.id,
                file_path: filePath,
                title: fileData.title
              })
            });
          } catch (webhookError) {
            console.warn('Webhook trigger failed:', webhookError);
          }
        }

        return insertData;
      });

      await Promise.all(uploadPromises);

      toast.success(`${files.length} dokumen berhasil diupload`);
      setFiles([]);
      setN8nWebhook('');
      onUploadComplete();
      onClose(false);

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || "Gagal mengupload dokumen");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmitUrl = async () => {
    if (!urlData.title || !urlData.url) {
      toast.error("Judul dan URL wajib diisi");
      return;
    }

    // Validate URL format
    try {
      new URL(urlData.url);
    } catch {
      toast.error("Format URL tidak valid");
      return;
    }

    setIsUploading(true);

    try {
      // Insert URL ke database
      const { data: insertData, error: insertError } = await supabase
        .from('dt_rag_urls')
        .insert({
          title: urlData.title,
          url: urlData.url,
          description: urlData.description || null,
          tags: urlData.tags.length > 0 ? urlData.tags : null,
          status: 'pending',
          crawl_frequency: urlData.crawlFrequency,
          n8n_webhook_url: n8nWebhook || null,
          metadata: {
            added_at: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (insertError) {
        if (insertError.code === '23505') {
          toast.error("URL ini sudah ada dalam database");
        } else {
          throw insertError;
        }
        return;
      }

      // Optional: Trigger n8n webhook untuk crawling
      if (n8nWebhook) {
        try {
          await fetch(n8nWebhook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              url_id: insertData.id,
              url: urlData.url,
              title: urlData.title,
              crawl_frequency: urlData.crawlFrequency
            })
          });
        } catch (webhookError) {
          console.warn('Webhook trigger failed:', webhookError);
        }
      }

      toast.success("URL berhasil ditambahkan");
      setUrlData({
        title: '',
        url: '',
        description: '',
        tags: [],
        crawlFrequency: 'manual'
      });
      setN8nWebhook('');
      onUploadComplete();
      onClose(false);

    } catch (error: any) {
      console.error('URL submission error:', error);
      toast.error(error.message || "Gagal menambahkan URL");
    } finally {
      setIsUploading(false);
    }
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
            {uploadType === 'document' ? (
              <>
                <FileText className="h-6 w-6" />
                Upload Dokumen
              </>
            ) : (
              <>
                <ExternalLink className="h-6 w-6" />
                Tambah URL
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {uploadType === 'document' 
              ? 'Upload satu atau lebih dokumen untuk RAG Agent'
              : 'Tambahkan URL website untuk di-crawl oleh RAG Agent'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* N8n Webhook URL (Optional) */}
          <div className="space-y-2 bg-blue-50 p-4 rounded-lg border border-blue-200">
            <Label htmlFor="n8nWebhook" className="flex items-center gap-2">
              <ExternalLink className="h-4 w-4" />
              N8n Webhook URL (Opsional)
            </Label>
            <Input
              id="n8nWebhook"
              value={n8nWebhook}
              onChange={(e) => setN8nWebhook(e.target.value)}
              placeholder="https://your-n8n-instance.com/webhook/..."
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Jika diisi, akan men-trigger webhook n8n setelah upload/submit
            </p>
          </div>

          {uploadType === 'document' ? (
            <>
              {/* File Upload Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Upload Files</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Pilih File
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>

                {files.length === 0 ? (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Belum ada file dipilih. Klik tombol "Pilih File" untuk upload.
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Format: PDF, DOC, DOCX, TXT, CSV, XLSX, XLS
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {files.map((fileData, index) => (
                      <div key={index} className="border rounded-lg p-4 space-y-3 bg-white">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div>
                              <p className="font-medium text-sm">{fileData.file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {formatFileSize(fileData.file.size)} • {fileData.file.type || 'Unknown type'}
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          <div>
                            <Label className="text-xs">Judul</Label>
                            <Input
                              value={fileData.title}
                              onChange={(e) => updateFileMetadata(index, 'title', e.target.value)}
                              placeholder="Judul dokumen"
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Deskripsi</Label>
                            <Textarea
                              value={fileData.description}
                              onChange={(e) => updateFileMetadata(index, 'description', e.target.value)}
                              placeholder="Deskripsi singkat"
                              className="text-sm h-16"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Tags</Label>
                            <div className="flex gap-2">
                              <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addTag(fileData.tags, (tags) => updateFileMetadata(index, 'tags', tags));
                                  }
                                }}
                                placeholder="Ketik tag dan tekan Enter"
                                className="text-sm"
                              />
                              <Button
                                type="button"
                                size="sm"
                                onClick={() => addTag(fileData.tags, (tags) => updateFileMetadata(index, 'tags', tags))}
                              >
                                Add
                              </Button>
                            </div>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {fileData.tags.map((tag, tagIdx) => (
                                <Badge key={tagIdx} variant="secondary" className="text-xs">
                                  {tag}
                                  <X
                                    className="h-3 w-3 ml-1 cursor-pointer"
                                    onClick={() => removeTag(fileData.tags, (tags) => updateFileMetadata(index, 'tags', tags), tag)}
                                  />
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => onClose(false)} disabled={isUploading}>
                  Batal
                </Button>
                <Button 
                  onClick={handleUploadDocuments}
                  disabled={files.length === 0 || isUploading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isUploading ? 'Mengupload...' : `Upload ${files.length} Dokumen`}
                </Button>
              </div>
            </>
          ) : (
            <>
              {/* URL Form Section */}
              <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="space-y-2">
                  <Label htmlFor="urlTitle">Judul URL *</Label>
                  <Input
                    id="urlTitle"
                    value={urlData.title}
                    onChange={(e) => setUrlData({...urlData, title: e.target.value})}
                    placeholder="Nama/judul untuk URL ini"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="url">URL *</Label>
                  <Input
                    id="url"
                    value={urlData.url}
                    onChange={(e) => setUrlData({...urlData, url: e.target.value})}
                    placeholder="https://example.com/page"
                    type="url"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="urlDescription">Deskripsi</Label>
                  <Textarea
                    id="urlDescription"
                    value={urlData.description}
                    onChange={(e) => setUrlData({...urlData, description: e.target.value})}
                    placeholder="Deskripsi konten URL"
                    className="h-20"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="crawlFrequency">Frekuensi Crawl</Label>
                  <Select 
                    value={urlData.crawlFrequency} 
                    onValueChange={(value) => setUrlData({...urlData, crawlFrequency: value})}
                  >
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addTag(urlData.tags, (tags) => setUrlData({...urlData, tags}));
                        }
                      }}
                      placeholder="Ketik tag dan tekan Enter"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => addTag(urlData.tags, (tags) => setUrlData({...urlData, tags}))}
                    >
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {urlData.tags.map((tag, idx) => (
                      <Badge key={idx} variant="secondary">
                        {tag}
                        <X
                          className="h-3 w-3 ml-1 cursor-pointer"
                          onClick={() => removeTag(urlData.tags, (tags) => setUrlData({...urlData, tags}), tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <Button variant="outline" onClick={() => onClose(false)} disabled={isUploading}>
                  Batal
                </Button>
                <Button 
                  onClick={handleSubmitUrl}
                  disabled={!urlData.title || !urlData.url || isUploading}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {isUploading ? 'Menyimpan...' : 'Tambah URL'}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};