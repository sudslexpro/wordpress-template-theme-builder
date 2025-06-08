'use client';

import { useState } from 'react';
import { DeploymentFile } from '@prisma/client';
import { File, FolderTree, Search, Download, Code, Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DeploymentFilesProps {
  files: DeploymentFile[];
}

interface FileTreeNode {
  name: string;
  path: string;
  isDirectory: boolean;
  children: FileTreeNode[];
  file?: DeploymentFile;
}

export default function DeploymentFiles({ files }: DeploymentFilesProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [selectedFile, setSelectedFile] = useState<DeploymentFile | null>(null);
  const [isFileDialogOpen, setIsFileDialogOpen] = useState(false);

  const filteredFiles = files.filter(file => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      file.path.toLowerCase().includes(term) ||
      file.type.toLowerCase().includes(term)
    );
  });

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'php':
        return <Code className="h-4 w-4 text-purple-500" />;
      case 'css':
        return <Code className="h-4 w-4 text-blue-500" />;
      case 'js':
      case 'javascript':
        return <Code className="h-4 w-4 text-yellow-500" />;
      default:
        return <File className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFileExtension = (path: string) => {
    const parts = path.split('.');
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : '';
  };

  const handleDownload = (file: DeploymentFile) => {
    try {
      // Create a blob with the file content
      const blob = new Blob([file.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      
      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = file.path.split('/').pop() || 'file';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('File downloaded successfully');
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleViewFile = (file: DeploymentFile) => {
    setSelectedFile(file);
    setIsFileDialogOpen(true);
  };

  const buildFileTree = (files: DeploymentFile[]): FileTreeNode => {
    const root: FileTreeNode = {
      name: 'root',
      path: '',
      isDirectory: true,
      children: [],
    };

    files.forEach(file => {
      const pathParts = file.path.split('/');
      let currentNode = root;

      pathParts.forEach((part, index) => {
        const isLastPart = index === pathParts.length - 1;
        const currentPath = pathParts.slice(0, index + 1).join('/');
        
        let childNode = currentNode.children.find(child => child.name === part);
        
        if (!childNode) {
          childNode = {
            name: part,
            path: currentPath,
            isDirectory: !isLastPart,
            children: [],
            file: isLastPart ? file : undefined,
          };
          currentNode.children.push(childNode);
        }
        
        currentNode = childNode;
      });
    });

    return root;
  };

  const renderFileTree = (node: FileTreeNode, depth = 0) => {
    const paddingLeft = `${depth * 1.5}rem`;
    
    if (node.name === 'root') {
      return (
        <div className="space-y-1">
          {node.children
            .sort((a, b) => {
              // Directories first, then files
              if (a.isDirectory && !b.isDirectory) return -1;
              if (!a.isDirectory && b.isDirectory) return 1;
              return a.name.localeCompare(b.name);
            })
            .map(child => renderFileTree(child, depth))}
        </div>
      );
    }

    return (
      <div key={node.path} className="w-full">
        <div 
          className={`flex items-center p-2 rounded-md hover:bg-muted ${!node.isDirectory ? 'cursor-pointer' : ''}`}
          style={{ paddingLeft }}
          onClick={() => node.file && handleViewFile(node.file)}
        >
          {node.isDirectory ? (
            <FolderTree className="h-4 w-4 text-amber-500 mr-2" />
          ) : (
            getFileIcon(getFileExtension(node.name))
          )}
          <span className="ml-2 text-sm truncate">{node.name}</span>
          {!node.isDirectory && node.file && (
            <div className="ml-auto flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownload(node.file!);
                }}
              >
                <Download className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewFile(node.file!);
                }}
              >
                <Eye className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        {node.isDirectory && node.children.length > 0 && (
          <div className="ml-2">
            {node.children
              .sort((a, b) => {
                // Directories first, then files
                if (a.isDirectory && !b.isDirectory) return -1;
                if (!a.isDirectory && b.isDirectory) return 1;
                return a.name.localeCompare(b.name);
              })
              .map(child => renderFileTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  if (files.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No files available for this deployment.</p>
      </Card>
    );
  }

  const fileTree = buildFileTree(filteredFiles);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select
          value={viewMode}
          onValueChange={(value) => setViewMode(value as 'list' | 'tree')}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="View Mode" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="list">List View</SelectItem>
            <SelectItem value="tree">Tree View</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {filteredFiles.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No files match your search criteria.</p>
        </Card>
      ) : viewMode === 'tree' ? (
        <Card className="p-4">
          {renderFileTree(fileTree)}
        </Card>
      ) : (
        <div className="border rounded-md divide-y">
          {filteredFiles.map((file) => (
            <div key={file.id} className="p-4 hover:bg-muted/50">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {getFileIcon(getFileExtension(file.path))}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium">{file.path}</p>
                    <p className="text-sm text-muted-foreground">{file.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewFile(file)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(file)}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={isFileDialogOpen} onOpenChange={setIsFileDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{selectedFile?.path}</DialogTitle>
            <DialogDescription>
              {selectedFile?.type} file
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto whitespace-pre-wrap">
              {selectedFile?.content}
            </pre>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="outline"
              onClick={() => selectedFile && handleDownload(selectedFile)}
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}