'use client';

import type { VideoModel, VideoSize } from 'openai/resources/videos';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Sparkles } from 'lucide-react';
import * as React from 'react';

export type RemixFormData = {
    source_video_id: string;
    prompt: string;
};

type RemixFormProps = {
    onSubmit: (data: RemixFormData) => void;
    isLoading: boolean;
    currentMode: 'create' | 'remix';
    onModeChange: (mode: 'create' | 'remix') => void;
    sourceVideoId: string;
    setSourceVideoId: React.Dispatch<React.SetStateAction<string>>;
    remixPrompt: string;
    setRemixPrompt: React.Dispatch<React.SetStateAction<string>>;
    completedVideos: Array<{
        id: string;
        prompt: string;
        model: VideoModel;
        size: VideoSize;
        seconds: number;
    }>;
    getVideoSrc: (id: string) => string | undefined;
};

export function RemixForm({
    onSubmit,
    isLoading,
    sourceVideoId,
    setSourceVideoId,
    remixPrompt,
    setRemixPrompt,
    completedVideos,
    getVideoSrc
}: RemixFormProps) {
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!sourceVideoId) {
            alert('Please select a source video to remix.');
            return;
        }
        const formData: RemixFormData = {
            source_video_id: sourceVideoId,
            prompt: remixPrompt
        };
        onSubmit(formData);
    };

    const selectedVideo = completedVideos.find((v) => v.id === sourceVideoId);
    const videoSrc = sourceVideoId ? getVideoSrc(sourceVideoId) : undefined;

    return (
        <Card className='flex h-full w-full flex-col overflow-hidden rounded-lg bg-card shadow-sm'>
            <CardHeader className='border-b pb-4'>
                <CardTitle className='py-1 text-lg font-semibold'>Remix video</CardTitle>
                <CardDescription className='mt-1'>
                    Make targeted changes to an existing video.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className='flex h-full flex-1 flex-col overflow-hidden'>
                <CardContent className='flex-1 space-y-5 overflow-y-auto p-4 lg:overflow-visible'>
                    <div className='space-y-2'>
                        <Label htmlFor='source-video-select'>Source video</Label>
                        <Select value={sourceVideoId} onValueChange={setSourceVideoId} disabled={isLoading}>
                            <SelectTrigger id='source-video-select' className='w-full'>
                                <SelectValue placeholder='Select a completed video...' />
                            </SelectTrigger>
                            <SelectContent>
                                {completedVideos.length === 0 ? (
                                    <SelectItem value='none' disabled>
                                        No completed videos available
                                    </SelectItem>
                                ) : (
                                    completedVideos.map((video) => (
                                        <SelectItem key={video.id} value={video.id}>
                                            <div className='flex flex-col'>
                                                <span className='font-medium'>
                                                    {video.prompt.length > 50
                                                        ? video.prompt.substring(0, 50) + '...'
                                                        : video.prompt}
                                                </span>
                                                <span className='text-xs text-muted-foreground'>
                                                    {video.model} • {video.size} • {video.seconds}s
                                                </span>
                                            </div>
                                        </SelectItem>
                                    ))
                                )}
                            </SelectContent>
                        </Select>
                        <p className='text-xs text-muted-foreground'>
                            Choose a video from your history to use as the base for the remix.
                        </p>
                    </div>

                    {selectedVideo && videoSrc && (
                        <div className='space-y-2'>
                            <Label>Source video preview</Label>
                            <div className='overflow-hidden rounded-lg border'>
                                <video
                                    src={videoSrc}
                                    controls
                                    className='w-full bg-black'
                                    style={{ maxHeight: '300px' }}
                                />
                            </div>
                            <div className='rounded-md bg-muted p-3'>
                                <p className='text-xs text-muted-foreground'>
                                    <span className='font-medium text-foreground'>Original prompt:</span>{' '}
                                    {selectedVideo.prompt}
                                </p>
                                <p className='mt-1 text-xs text-muted-foreground'>
                                    {selectedVideo.model} • {selectedVideo.size} • {selectedVideo.seconds}s
                                </p>
                            </div>
                        </div>
                    )}

                    <div className='space-y-1.5'>
                        <Label htmlFor='remix-prompt'>Remix prompt</Label>
                        <Textarea
                            id='remix-prompt'
                            placeholder='e.g., Change the color palette to teal, sand, and rust, with a warm backlight.'
                            value={remixPrompt}
                            onChange={(e) => setRemixPrompt(e.target.value)}
                            required
                            disabled={isLoading || !sourceVideoId}
                            className='min-h-[100px] resize-none'
                        />
                        <p className='text-xs text-muted-foreground'>
                            Describe a single, well-defined change. Smaller edits preserve more of the original fidelity.
                        </p>
                    </div>

                    {!sourceVideoId && completedVideos.length > 0 && (
                        <div className='rounded-md border bg-muted p-4 text-center'>
                            <p className='text-sm text-muted-foreground'>Select a source video above to begin remixing.</p>
                        </div>
                    )}

                    {completedVideos.length === 0 && (
                        <div className='rounded-md border bg-muted p-4 text-center'>
                            <p className='text-sm text-muted-foreground'>
                                No completed videos available yet. Create a video first, then you can remix it here.
                            </p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className='border-t p-4'>
                    <Button type='submit' disabled={isLoading || !remixPrompt.trim() || !sourceVideoId} className='w-full'>
                        {isLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Creating Remix...
                            </>
                        ) : (
                            <>
                                <Sparkles className='mr-2 h-4 w-4' />
                                Remix Video
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
