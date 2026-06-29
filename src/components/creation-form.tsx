'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ExternalLink, Loader2, SlidersHorizontal, Sparkles } from 'lucide-react';
import type { VideoModel, VideoSeconds, VideoSize } from 'openai/resources/videos';
import * as React from 'react';

export type CreationFormData = {
    model: VideoModel;
    prompt: string;
    size: VideoSize;
    seconds: VideoSeconds;
    input_reference?: File;
};

// Starter prompts follow Sora 2 best practices: shot type, subject, action,
// setting, lighting, and camera movement described in a single concise scene.
const STARTER_PROMPTS: { label: string; prompt: string }[] = [
    {
        label: 'Cinematic nature',
        prompt: 'Wide cinematic shot of a lone red fox trotting across a snow-covered meadow at dawn. Soft golden light, breath visible in the cold air, shallow depth of field. The camera slowly tracks alongside in a smooth dolly move. Photorealistic.'
    },
    {
        label: 'Cozy close-up',
        prompt: 'Close-up of a barista pouring steamed milk into a latte to form a leaf pattern. Warm cafe interior lit by soft window light, gentle steam rising, shallow focus on the cup. The camera slowly pushes in. Warm documentary style.'
    },
    {
        label: 'Aerial coastline',
        prompt: 'Aerial drone shot flying forward over turquoise ocean waves breaking on a tropical coastline. Bright midday sun, sparkling water, palm trees swaying along the shore. Smooth continuous forward motion. Vibrant, crisp, high detail.'
    }
];

type CreationFormProps = {
    onSubmit: (data: CreationFormData) => void;
    isLoading: boolean;
    currentMode: 'create' | 'remix';
    onModeChange: (mode: 'create' | 'remix') => void;
    model: VideoModel;
    setModel: React.Dispatch<React.SetStateAction<VideoModel>>;
    prompt: string;
    setPrompt: React.Dispatch<React.SetStateAction<string>>;
    size: VideoSize;
    setSize: React.Dispatch<React.SetStateAction<VideoSize>>;
    seconds: VideoSeconds;
    setSeconds: React.Dispatch<React.SetStateAction<VideoSeconds>>;
    inputReference: File | null;
    setInputReference: React.Dispatch<React.SetStateAction<File | null>>;
};

export function CreationForm({
    onSubmit,
    isLoading,
    model,
    setModel,
    prompt,
    setPrompt,
    size,
    setSize,
    seconds,
    setSeconds,
    inputReference,
    setInputReference
}: CreationFormProps) {
    const [showSettings, setShowSettings] = React.useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData: CreationFormData = {
            model,
            prompt,
            size,
            seconds
        };
        if (inputReference) {
            formData.input_reference = inputReference;
        }
        onSubmit(formData);
    };

    const handleInputReferenceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const maxSizeBytes = 100 * 1024 * 1024; // 100 MB
            if (file.size > maxSizeBytes) {
                alert(`File size exceeds 100 MB limit. Selected file is ${(file.size / (1024 * 1024)).toFixed(2)} MB.`);
                event.target.value = ''; // Clear the input
                return;
            }
            setInputReference(file);
        }
    };

    return (
        <Card className='bg-card flex h-full w-full flex-col overflow-hidden rounded-lg shadow-sm'>
            <CardHeader className='border-b pb-4'>
                <CardTitle className='py-1 text-lg font-semibold'>Create video</CardTitle>
                <CardDescription className='mt-1'>
                    Generate a new video from a text prompt using Sora 2.
                </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit} className='flex h-full flex-1 flex-col overflow-hidden'>
                <CardContent className='flex-1 space-y-5 overflow-y-auto p-4 lg:overflow-visible'>
                    <div className='space-y-1.5'>
                        <Label htmlFor='prompt'>Prompt</Label>
                        <Textarea
                            id='prompt'
                            placeholder='e.g., Wide shot of a child flying a red kite in a grassy park, golden hour sunlight, camera slowly pans upward.'
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            required
                            disabled={isLoading}
                            className='min-h-[160px] resize-none text-base'
                        />
                        <p className='text-muted-foreground text-xs'>
                            Describe: shot type, subject, action, setting, and lighting for best results.{' '}
                            <a
                                href='https://developers.openai.com/cookbook/examples/sora/sora2_prompting_guide'
                                target='_blank'
                                rel='noopener noreferrer'
                                className='text-primary inline-flex items-center gap-0.5 font-medium underline-offset-2 hover:underline'>
                                Sora 2 prompting guide
                                <ExternalLink className='h-3 w-3' />
                            </a>
                        </p>
                        <div className='flex flex-wrap items-center gap-2 pt-1'>
                            <span className='text-muted-foreground text-xs'>Starter prompts:</span>
                            {STARTER_PROMPTS.map((starter) => (
                                <button
                                    key={starter.label}
                                    type='button'
                                    onClick={() => setPrompt(starter.prompt)}
                                    disabled={isLoading}
                                    className='border-border bg-secondary text-secondary-foreground hover:border-primary hover:bg-accent hover:text-accent-foreground rounded-full border px-3 py-1 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50'>
                                    {starter.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className='space-y-4'>
                        <button
                            type='button'
                            onClick={() => setShowSettings((v) => !v)}
                            aria-expanded={showSettings}
                            className='bg-secondary/50 text-foreground hover:bg-accent flex w-full items-center justify-between rounded-md border px-3 py-2 text-sm font-medium transition-colors'>
                            <span className='flex items-center gap-2'>
                                <SlidersHorizontal className='h-4 w-4' />
                                Video settings
                                <span className='text-muted-foreground font-normal'>
                                    ({model === 'sora-2' ? 'Sora 2' : 'Sora 2 Pro'} • {size} • {seconds}s)
                                </span>
                            </span>
                            <ChevronDown
                                className={`h-4 w-4 transition-transform ${showSettings ? 'rotate-180' : ''}`}
                            />
                        </button>

                        {showSettings && (
                            <div className='bg-secondary/30 space-y-5 rounded-md border p-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='model-select'>Model</Label>
                                    <Select
                                        value={model}
                                        onValueChange={(value) => {
                                            const newModel = value as VideoModel;
                                            setModel(newModel);
                                            // If switching to sora-2 and currently have 1080p selected, switch to portrait 720p
                                            if (
                                                newModel === 'sora-2' &&
                                                (size === '1024x1792' || size === '1792x1024')
                                            ) {
                                                setSize('720x1280');
                                            }
                                        }}
                                        disabled={isLoading}>
                                        <SelectTrigger id='model-select' className='w-full'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='sora-2'>Sora 2</SelectItem>
                                            <SelectItem value='sora-2-pro'>Sora 2 Pro</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='size-select'>Size (resolution)</Label>
                                    <Select
                                        value={size}
                                        onValueChange={(value) => setSize(value as VideoSize)}
                                        disabled={isLoading}>
                                        <SelectTrigger id='size-select' className='w-full'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='720x1280'>720x1280 (Portrait - 720p)</SelectItem>
                                            <SelectItem value='1280x720'>1280x720 (Landscape - 720p)</SelectItem>
                                            <SelectSeparator />
                                            <SelectGroup>
                                                <SelectLabel className='text-muted-foreground px-2 py-1.5 text-xs font-medium'>
                                                    Sora 2 Pro only
                                                </SelectLabel>
                                                <SelectItem value='1024x1792' disabled={model === 'sora-2'}>
                                                    1024x1792 (Portrait - 1080p)
                                                </SelectItem>
                                                <SelectItem value='1792x1024' disabled={model === 'sora-2'}>
                                                    1792x1024 (Landscape - 1080p)
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label>Duration</Label>
                                    <RadioGroup
                                        value={seconds}
                                        onValueChange={(value) => setSeconds(value as VideoSeconds)}
                                        disabled={isLoading}
                                        className='flex gap-4'>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='4' id='duration-4' />
                                            <Label
                                                htmlFor='duration-4'
                                                className='cursor-pointer text-base font-normal'>
                                                4 seconds
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='8' id='duration-8' />
                                            <Label
                                                htmlFor='duration-8'
                                                className='cursor-pointer text-base font-normal'>
                                                8 seconds
                                            </Label>
                                        </div>
                                        <div className='flex items-center space-x-2'>
                                            <RadioGroupItem value='12' id='duration-12' />
                                            <Label
                                                htmlFor='duration-12'
                                                className='cursor-pointer text-base font-normal'>
                                                12 seconds
                                            </Label>
                                        </div>
                                    </RadioGroup>
                                </div>

                                <div className='space-y-2'>
                                    <Label htmlFor='input-reference'>Input reference (optional)</Label>
                                    <Input
                                        id='input-reference'
                                        type='file'
                                        accept='image/jpeg,image/png,image/webp,video/mp4'
                                        onChange={handleInputReferenceChange}
                                        disabled={isLoading}
                                        className='file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/80 cursor-pointer file:mr-4 file:cursor-pointer file:rounded-md file:border-0 file:px-3 file:text-sm file:font-medium'
                                    />
                                    {inputReference && (
                                        <p className='text-muted-foreground text-xs'>Selected: {inputReference.name}</p>
                                    )}
                                    <p className='text-muted-foreground text-xs'>
                                        Upload an image or video to use as the first frame. Must match the selected
                                        resolution.
                                    </p>
                                    <p className='text-muted-foreground text-xs'>
                                        Maximum file size is 100 MB. Video input is not available for all organizations.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
                <CardFooter className='border-t p-4'>
                    <Button type='submit' disabled={isLoading || !prompt.trim()} className='w-full'>
                        {isLoading ? (
                            <>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Creating Video...
                            </>
                        ) : (
                            <>
                                <Sparkles className='mr-2 h-4 w-4' />
                                Create Video
                            </>
                        )}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    );
}
