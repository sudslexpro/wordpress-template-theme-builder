'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { DeploymentLog } from '@prisma/client';
import { Info, AlertTriangle, CheckCircle, Clock, Search } from 'lucide-react';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface DeploymentLogsProps {
  logs: DeploymentLog[];
}

export default function DeploymentLogs({ logs }: DeploymentLogsProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = logs.filter(log => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      log.message.toLowerCase().includes(term) ||
      log.level.toLowerCase().includes(term)
    );
  });

  const getLogIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getLogLevelBadge = (level: string) => {
    switch (level.toLowerCase()) {
      case 'info':
        return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50">Info</Badge>;
      case 'warning':
        return <Badge variant="outline" className="text-amber-500 border-amber-200 bg-amber-50">Warning</Badge>;
      case 'error':
        return <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50">Error</Badge>;
      case 'success':
        return <Badge variant="outline" className="text-green-500 border-green-200 bg-green-50">Success</Badge>;
      default:
        return <Badge variant="outline">{level}</Badge>;
    }
  };

  if (logs.length === 0) {
    return (
      <Card className="p-6 text-center">
        <p className="text-muted-foreground">No logs available for this deployment.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>
      
      {filteredLogs.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">No logs match your search criteria.</p>
        </Card>
      ) : (
        <div className="border rounded-md divide-y">
          {filteredLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-muted/50">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {getLogIcon(log.level)}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getLogLevelBadge(log.level)}
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(log.timestamp), 'HH:mm:ss')}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(log.timestamp), 'PPP')}
                    </span>
                  </div>
                  <p className="text-sm whitespace-pre-wrap">{log.message}</p>
                  {log.metadata && (
                    <pre className="mt-2 p-2 bg-muted rounded-md text-xs overflow-x-auto">
                      {JSON.stringify(log.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}