
"use client";

import { useState, useContext, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { AppDataContext } from '@/context/AppDataContext';
import { PlusCircle, Loader2 } from 'lucide-react';
import { useUser } from '@/firebase';
import { useRouter } from 'next/navigation';
import { ResourceDialog } from '@/components/edutrack/resource/ResourceDialog';
import ResourceCard from '@/components/edutrack/resource/ResourceCard';

export default function ResourcesPage() {
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const { resources } = useContext(AppDataContext);
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.push('/login');
      } else if (!user.emailVerified) {
        router.push('/verify-email');
      }
    }
  }, [user, isUserLoading, router]);

  const sortedResources = useMemo(() => {
    return [...resources].sort((a, b) => a.serialNumber - b.serialNumber);
  }, [resources]);
  
  if (isUserLoading || !user || !user.emailVerified) {
    return (
      <div className="flex min-h-[calc(100vh-theme(spacing.14))] items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-foreground">
              My Resources
            </h1>
            <Button 
                variant="default"
                className="font-bold transition-all duration-300 bg-primary text-primary-foreground border-2 border-primary hover:bg-transparent hover:text-primary hover:shadow-lg hover:shadow-primary/20"
                onClick={() => setIsResourceDialogOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Resource
            </Button>
        </div>

        {resources.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-card p-12 text-center shadow-sm mt-8">
                <h3 className="text-lg font-semibold text-muted-foreground">No resources yet</h3>
                <p className="mt-1 text-sm text-muted-foreground">Click "Add Resource" to create your first resource.</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {sortedResources.map((resource, index) => (
                    <div
                      key={resource.id}
                      className="animate-fade-in-from-bottom"
                      style={{ animationDelay: `${index * 0.1}s`, animationFillMode: 'both' }}
                    >
                      <ResourceCard resource={resource} />
                    </div>
                ))}
            </div>
        )}
      
      <ResourceDialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen} />
    </div>
  );
}
