'use client';

import type { VideoMetadata, VideoJob } from '@/types/video';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
    DollarSign,
    Sparkles as SparklesIcon,
    HardDrive,
    Database,
    Trash2,
    RefreshCw,
    Loader2
} from 'lucide-react';
import * as React from 'react';

type VideoHistoryPanelProps = {
    history: VideoMetadata[];
    activeJobs?: Map<string, VideoJob>;
    onSelectVideo: (item: VideoMetadata) => void;
    onClearHistory: () => void;
    getVideoSrc: (id: string) => string | undefined;
    getThumbnailSrc?: (id: string) => string | undefined;
    onDeleteItem?: (item: VideoMetadata) => void;
};

export function VideoHistoryPanel({
    history,
    activeJobs,
    onSelectVideo,
    onClearHistory,
    getVideoSrc,
    getThumbnailSrc,
    onDeleteItem
}: VideoHistoryPanelProps) {
    const [openCostDialogId, setOpenCostDialogId] = React.useState<string | null>(null);
    const [isTotalCostDialogOpen, setIsTotalCostDialogOpen] = React.useState(false);

    const { totalCost, totalVideos, successfulVideos } = React.useMemo(() => {
        let cost = 0;
        let videos = 0;
        let successful = 0;
        history.forEach((item) => {
            // Only count cost for non-failed videos
            if (item.costDetails && item.status !== 'failed') {
                cost += item.costDetails.totalCost;
                successful += 1;
            }
            // Count all videos (including failed)
            videos += 1;
        });

        return { totalCost: Math.round(cost * 100) / 100, totalVideos: videos, successfulVideos: successful };
    }, [history]);

    const averageCost = successfulVideos > 0 ? totalCost / successfulVideos : 0;

    const handlePreviewEnter = React.useCallback((video: HTMLVideoElement) => {
        const tryPlay = () => {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch((error) => {
                    console.warn('Preview playback failed:', error);
                });
            }
        };

        video.dataset.hoverPreview = 'true';
        video.currentTime = 0;

        if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
            tryPlay();
            return;
        }

        const handleCanPlay = () => {
            video.removeEventListener('canplay', handleCanPlay);
            if (video.dataset.hoverPreview === 'true') {
                tryPlay();
            }
        };

        video.addEventListener('canplay', handleCanPlay, { once: true });
        video.load();
    }, []);

    const handlePreviewLeave = React.useCallback((video: HTMLVideoElement) => {
        video.dataset.hoverPreview = 'false';
        video.pause();
        try {
            video.currentTime = 0;
        } catch (error) {
            console.warn('Unable to reset preview time:', error);
        }
    }, []);

    return (
        <Card className='flex h-full w-full flex-col overflow-hidden rounded-lg bg-card shadow-sm'>
            <CardHeader className='flex flex-row items-center justify-between gap-4 border-b px-4 py-3'>
                <div className='flex items-center gap-2'>
                    <CardTitle className='text-lg font-semibold'>History</CardTitle>
                    {totalCost > 0 && (
                        <Dialog open={isTotalCostDialogOpen} onOpenChange={setIsTotalCostDialogOpen}>
                            <DialogTrigger asChild>
                                <button
                                    className='mt-0.5 flex items-center gap-1 rounded-full bg-success px-2 py-0.5 text-[12px] font-medium text-success-foreground transition-colors hover:bg-success/90'
                                    aria-label='Show total cost summary'>
                                    Total cost: ${totalCost.toFixed(2)}
                                </button>
                            </DialogTrigger>
                            <DialogContent className='sm:max-w-[450px]'>
                                <DialogHeader>
                                    <DialogTitle>Total cost summary</DialogTitle>
                                    <DialogDescription className='sr-only'>
                                        A summary of the total estimated cost for all generated videos in the history.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className='space-y-1 pt-1 text-xs text-muted-foreground'>
                                    <p>Pricing for Sora 2:</p>
                                    <ul className='list-disc pl-4'>
                                        <li>sora-2 (720p): $0.10/sec</li>
                                        <li>sora-2-pro (720p): $0.30/sec</li>
                                        <li>sora-2-pro (1080p): $0.50/sec</li>
                                    </ul>
                                </div>
                                <div className='space-y-2 py-4 text-sm text-muted-foreground'>
                                    <div className='flex justify-between'>
                                        <span>Total videos generated:</span> <span>{totalVideos.toLocaleString()}</span>
                                    </div>
                                    <div className='flex justify-between'>
                                        <span>Average cost per video:</span> <span>${averageCost.toFixed(2)}</span>
                                    </div>
                                    <hr className='my-2 border-border' />
                                    <div className='flex justify-between font-medium text-foreground'>
                                        <span>Total estimated cost:</span>
                                        <span>${totalCost.toFixed(2)}</span>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button type='button' variant='secondary' size='sm'>
                                            Close
                                        </Button>
                                    </DialogClose>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    )}
                </div>
                {history.length > 0 && (
                    <Button variant='ghost' size='sm' onClick={onClearHistory} className='h-auto px-2 py-1'>
                        Clear
                    </Button>
                )}
            </CardHeader>
            <CardContent className='flex-grow overflow-y-auto p-4'>
                {history.length === 0 ? (
                    <div className='flex h-full items-center justify-center text-muted-foreground'>
                        <p>Generated videos will appear here.</p>
                    </div>
                ) : (
                    <div className='grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'>
                        {[...history].map((item) => {
                            const thumbnailUrl = getThumbnailSrc ? getThumbnailSrc(item.id) : undefined;
                            const videoUrl = getVideoSrc(item.id);
                            const originalStorageMode = item.storageModeUsed || 'fs';
                            const job = activeJobs?.get(item.id);
                            const isProcessing = item.status === 'processing' || (job && (job.status === 'queued' || job.status === 'in_progress'));
                            const isFailed = item.status === 'failed' || (job && job.status === 'failed');

                            return (
                                <div key={item.id} className='flex flex-col'>
                                    <div className='group relative'>
                                        <button
                                            onClick={() => onSelectVideo(item)}
                                            className='relative block aspect-square w-full overflow-hidden rounded-t-md border transition-all duration-150 group-hover:border-primary/50 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background focus:outline-none'
                                            aria-label={`View video from ${new Date(item.timestamp).toLocaleString()}`}>
                                            {isProcessing ? (
                                                <div className='flex h-full w-full flex-col items-center justify-center bg-muted'>
                                                    <Loader2 className='h-8 w-8 animate-spin text-primary mb-2' />
                                                    <span className='text-xs text-muted-foreground'>
                                                        {job?.status === 'queued' ? 'Queued' : `${item.progress || job?.progress || 0}%`}
                                                    </span>
                                                </div>
                                            ) : isFailed ? (
                                                <div className='flex h-full w-full flex-col items-center justify-center bg-destructive/10 text-destructive p-2'>
                                                    <span className='text-xs font-semibold'>Failed</span>
                                                    {item.error && (
                                                        <span className='text-[10px] text-destructive/80 mt-1 text-center line-clamp-2'>
                                                            {item.error}
                                                        </span>
                                                    )}
                                                </div>
                                            ) : videoUrl && item.status !== 'failed' ? (
                                                <video
                                                    src={videoUrl}
                                                    poster={thumbnailUrl}
                                                    className='h-full w-full object-cover'
                                                    muted
                                                    preload='metadata'
                                                    playsInline
                                                    onMouseEnter={(event) => handlePreviewEnter(event.currentTarget)}
                                                    onMouseLeave={(event) => handlePreviewLeave(event.currentTarget)}
                                                />
                                            ) : (
                                                <div className='flex h-full w-full items-center justify-center bg-muted text-muted-foreground'>
                                                    ?
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    'pointer-events-none absolute top-1 left-1 z-10 flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium',
                                                    item.mode === 'remix'
                                                        ? 'bg-accent text-accent-foreground'
                                                        : 'bg-primary text-primary-foreground'
                                                )}>
                                                {item.mode === 'remix' ? (
                                                    <RefreshCw size={12} />
                                                ) : (
                                                    <SparklesIcon size={12} />
                                                )}
                                                {item.mode === 'remix' ? 'Remix' : 'Create'}
                                            </div>
                                            <div className='pointer-events-none absolute bottom-1 left-1 z-10 flex items-center gap-1'>
                                                <div className='flex items-center gap-1 rounded-full border bg-background/80 px-1 py-0.5 text-[11px] text-muted-foreground backdrop-blur-sm'>
                                                    {originalStorageMode === 'fs' ? (
                                                        <HardDrive size={12} />
                                                    ) : (
                                                        <Database size={12} className='text-primary' />
                                                    )}
                                                    <span>{originalStorageMode === 'fs' ? 'file' : 'db'}</span>
                                                </div>
                                                <div className='flex items-center gap-1 rounded-full border bg-background/80 px-1 py-0.5 text-[11px] text-muted-foreground backdrop-blur-sm'>
                                                    <span>{item.seconds}s</span>
                                                </div>
                                            </div>
                                        </button>
                                        {item.costDetails && item.status !== 'failed' && (
                                            <Dialog
                                                open={openCostDialogId === item.id}
                                                onOpenChange={(isOpen) => !isOpen && setOpenCostDialogId(null)}>
                                                <DialogTrigger asChild>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setOpenCostDialogId(item.id);
                                                        }}
                                                        className='absolute top-1 right-1 z-20 flex items-center gap-0.5 rounded-full bg-success px-1.5 py-0.5 text-[11px] font-medium text-success-foreground transition-colors hover:bg-success/90'
                                                        aria-label='Show cost breakdown'>
                                                        <DollarSign size={12} />
                                                        {item.costDetails.totalCost.toFixed(2)}
                                                    </button>
                                                </DialogTrigger>
                                                <DialogContent className='sm:max-w-[450px]'>
                                                    <DialogHeader>
                                                        <DialogTitle>Cost breakdown</DialogTitle>
                                                        <DialogDescription className='sr-only'>
                                                            Estimated cost breakdown for this video generation.
                                                        </DialogDescription>
                                                    </DialogHeader>
                                                    <div className='space-y-2 py-4 text-sm text-muted-foreground'>
                                                        <div className='flex justify-between'>
                                                            <span>Model:</span> <span>{item.costDetails.model}</span>
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            <span>Resolution:</span>{' '}
                                                            <span>{item.costDetails.resolution}</span>
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            <span>Duration:</span> <span>{item.costDetails.duration}s</span>
                                                        </div>
                                                        <div className='flex justify-between'>
                                                            <span>Price per second:</span>{' '}
                                                            <span>${item.costDetails.pricePerSecond.toFixed(2)}</span>
                                                        </div>
                                                        <hr className='my-2 border-border' />
                                                        <div className='flex justify-between font-medium text-foreground'>
                                                            <span>Total cost:</span>
                                                            <span>${item.costDetails.totalCost.toFixed(2)}</span>
                                                        </div>
                                                    </div>
                                                    <DialogFooter>
                                                        <DialogClose asChild>
                                                            <Button type='button' variant='secondary' size='sm'>
                                                                Close
                                                            </Button>
                                                        </DialogClose>
                                                    </DialogFooter>
                                                </DialogContent>
                                            </Dialog>
                                        )}
                                        {onDeleteItem && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    const message = item.status === 'failed'
                                                        ? 'Are you sure you want to delete this failed request from your history?'
                                                        : 'Are you sure you want to delete this video? This will delete it from both your local storage AND OpenAI servers permanently.';
                                                    if (confirm(message)) {
                                                        onDeleteItem(item);
                                                    }
                                                }}
                                                className='absolute bottom-1 right-1 z-20 flex items-center gap-0.5 rounded-full bg-destructive p-1 text-white transition-colors hover:bg-destructive/90'
                                                aria-label='Delete video'>
                                                <Trash2 size={12} />
                                            </button>
                                        )}
                                    </div>
                                    <div className='rounded-b-md border border-t-0 bg-muted/50 p-2'>
                                        <p className='line-clamp-1 text-xs text-foreground/80' title={item.prompt}>
                                            {item.prompt}
                                        </p>
                                        <div className='mt-1 flex items-center justify-between text-[10px] text-muted-foreground'>
                                            <span>{item.model}</span>
                                            <span>{item.size}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
