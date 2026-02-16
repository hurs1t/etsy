"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { scrapeProduct, createProduct, generateAiContent } from "@/services/product.service";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";

const formSchema = z.object({
    url: z.string().url("Please enter a valid URL").refine(
        (url) => url.includes("aliexpress.com"),
        "Only AliExpress URLs are supported for now"
    ),
});

interface UrlScraperFormProps {
    onSuccess: () => void;
}

export function UrlScraperForm({ onSuccess }: UrlScraperFormProps) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState<'input' | 'preview'>('input');
    const [loading, setLoading] = useState(false);
    const [scrapedData, setScrapedData] = useState<any>(null);
    const [enhancing, setEnhancing] = useState(false);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            url: "",
        },
    });

    async function onScrape(values: z.infer<typeof formSchema>) {
        setLoading(true);
        try {
            const data = await scrapeProduct(values.url);
            setScrapedData(data);
            setStep('preview');
            toast.success("Product scraped successfully");
        } catch (error: any) {
            console.error("Scrape error:", error);
            toast.error(error.response?.data?.message || "Failed to scrape product");
        } finally {
            setLoading(false);
        }
    }

    async function onEnhance() {
        if (!scrapedData) return;
        setEnhancing(true);
        try {
            const enhanced = await generateAiContent({
                productTitle: scrapedData.originalTitle,
                productDescription: scrapedData.originalDescription,
                keywords: ["handmade", "gift", "unique"] // Example keywords
            });

            setScrapedData({
                ...scrapedData,
                originalTitle: enhanced.title,
                originalDescription: enhanced.description,
                generatedTags: enhanced.tags
            });
            toast.success("Content enhanced with AI");
        } catch (error) {
            toast.error("Failed to enhance content");
        } finally {
            setEnhancing(false);
        }
    }

    async function onConfirm() {
        setLoading(true);
        try {
            await createProduct(scrapedData);
            toast.success("Product created successfully");
            setOpen(false);
            setStep('input');
            form.reset();
            setScrapedData(null);
            onSuccess();
        } catch (error: any) {
            toast.error("Failed to create product");
        } finally {
            setLoading(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" /> Import from URL
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Import Product</DialogTitle>
                    <DialogDescription>
                        {step === 'input'
                            ? "Enter an AliExpress product URL to import details automatically."
                            : "Review the scraped details before creating the product."
                        }
                    </DialogDescription>
                </DialogHeader>

                {step === 'input' ? (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onScrape)} className="space-y-4">
                            <FormField
                                control={form.control}
                                name="url"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product URL</FormLabel>
                                        <FormControl>
                                            <Input placeholder="https://aliexpress.com/item/..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <DialogFooter>
                                <Button type="submit" disabled={loading}>
                                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Scrape Data
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                ) : (
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <img
                                src={scrapedData?.images?.[0]}
                                alt="Product Preview"
                                className="w-full h-48 object-cover rounded-md"
                            />
                            <div>
                                <h4 className="font-medium">Title</h4>
                                <p className="text-sm text-gray-500 line-clamp-2">{scrapedData?.originalTitle}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Description</h4>
                                <div className="text-sm text-gray-500 h-20 overflow-y-auto border p-2 rounded-md">
                                    {scrapedData?.originalDescription?.substring(0, 200)}...
                                </div>
                            </div>
                            {scrapedData?.generatedTags && (
                                <div>
                                    <h4 className="font-medium">AI Tags</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {scrapedData.generatedTags.map((tag: string, i: number) => (
                                            <span key={i} className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <div>
                                <h4 className="font-medium">Price</h4>
                                <p className="text-sm text-gray-500">${scrapedData?.price}</p>
                            </div>
                        </div>
                        <DialogFooter className="gap-2 sm:gap-0">
                            <Button variant="outline" onClick={() => setStep('input')} disabled={loading || enhancing}>Back</Button>
                            <Button variant="secondary" onClick={onEnhance} disabled={loading || enhancing} className="bg-purple-100 text-purple-900 hover:bg-purple-200">
                                {enhancing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                AI Enhance
                            </Button>
                            <Button onClick={onConfirm} disabled={loading || enhancing}>
                                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm & Create
                            </Button>
                        </DialogFooter>
                    </div>
                )}

            </DialogContent>
        </Dialog>
    );
}
