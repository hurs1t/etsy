"use client";

import { useEffect, useState, useMemo } from "react";
import { getTaxonomyNodes } from "@/services/product.service";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface CategorySelectorProps {
    value?: string | number;
    onChange: (value: string) => void;
}

interface TaxonomyNode {
    id: number;
    name: string;
    parent_id: number | null;
    children: TaxonomyNode[];
    level: number;
}

export function CategorySelector({ value, onChange }: CategorySelectorProps) {
    const [nodes, setNodes] = useState<TaxonomyNode[]>([]);
    const [loading, setLoading] = useState(true);

    // Selections for each level
    const [level1Id, setLevel1Id] = useState<string | null>(null);
    const [level2Id, setLevel2Id] = useState<string | null>(null);
    const [level3Id, setLevel3Id] = useState<string | null>(null);
    // Add more levels if needed, usually 3-4 is max for Etsy

    useEffect(() => {
        loadNodes();
    }, []);

    const loadNodes = async () => {
        try {
            const data = await getTaxonomyNodes();
            // Data might be a flat list or tree. 
            // If API returns a tree (results has top level nodes with children), use it directly.
            // If flat, we might need to build it.
            // Etsy public API usually returns depth 1 if unrelated? 
            // "findAllBuyerTaxonomyNodes" returns the full hierarchy. 
            // Let's assume `data` is the array of root nodes with children.
            setNodes(data || []);
            setLoading(false);
        } catch (error) {
            console.error("Failed to load taxonomies", error);
            toast.error("Failed to load Etsy categories");
            setLoading(false);
        }
    };

    // Calculate available options for each level
    const level1Nodes = useMemo(() => nodes, [nodes]);

    const level2Nodes = useMemo(() => {
        if (!level1Id) return [];
        const parent = nodes.find(n => String(n.id) === level1Id);
        return parent?.children || [];
    }, [nodes, level1Id]);

    const level3Nodes = useMemo(() => {
        if (!level2Id) return [];
        // Flatten search or just find in level2Nodes?
        // level2Nodes is already the children of selected level1.
        const parent = level2Nodes.find(n => String(n.id) === level2Id);
        return parent?.children || [];
    }, [level2Nodes, level2Id]);

    const handleLevel1Change = (val: string) => {
        setLevel1Id(val);
        setLevel2Id(null);
        setLevel3Id(null);
        onChange(val); // Update parent with new ID immediately
    };

    const handleLevel2Change = (val: string) => {
        setLevel2Id(val);
        setLevel3Id(null);
        onChange(val);
    };

    const handleLevel3Change = (val: string) => {
        setLevel3Id(val);
        onChange(val);
    };

    // Initialize state if initial value exists?
    // This is hard because we need to traverse down to find the path to the ID.
    // For MVP, if value is set but we don't have the path state, we might show just the ID?
    // Or we leave it empty.
    // Ideally we traverse the tree to find the ID and set level1Id, level2Id, etc.
    useEffect(() => {
        if (!value || nodes.length === 0) return;

        const findPath = (currentNodes: TaxonomyNode[], targetId: number, path: TaxonomyNode[] = []): TaxonomyNode[] | null => {
            for (const node of currentNodes) {
                if (node.id === targetId) {
                    return [...path, node];
                }
                if (node.children && node.children.length > 0) {
                    const found = findPath(node.children, targetId, [...path, node]);
                    if (found) return found;
                }
            }
            return null;
        };

        const path = findPath(nodes, Number(value));

        if (path) {
            if (path.length > 0) setLevel1Id(String(path[0].id));
            if (path.length > 1) setLevel2Id(String(path[1].id));
            if (path.length > 2) setLevel3Id(String(path[2].id));
        }
    }, [value, nodes]);

    // Flatten nodes for search
    const allCategories = useMemo(() => {
        const result: { id: number, label: string, path: string }[] = [];
        const traverse = (node: TaxonomyNode, parentPath: string[]) => {
            const currentPath = [...parentPath, node.name];
            result.push({
                id: node.id,
                label: node.name,
                path: currentPath.join(" > ")
            });
            if (node.children) {
                node.children.forEach(child => traverse(child, currentPath));
            }
        };
        nodes.forEach(node => traverse(node, []));
        return result;
    }, [nodes]);

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState<{ id: number, label: string, path: string }[]>([]);

    useEffect(() => {
        if (!searchTerm) {
            setSearchResults([]);
            return;
        }
        const lowerTerm = searchTerm.toLowerCase();
        const filtered = allCategories.filter(cat =>
            cat.label.toLowerCase().includes(lowerTerm) ||
            cat.path.toLowerCase().includes(lowerTerm)
        ).slice(0, 50); // Limit results
        setSearchResults(filtered);
    }, [searchTerm, allCategories]);

    const handleSearchSelect = (cat: { id: number, path: string }) => {
        onChange(String(cat.id));
        setSearchTerm("");
        setSearchResults([]);
    };

    if (loading) return <div className="text-sm text-muted-foreground">Loading categories...</div>;

    return (
        <div className="space-y-4">

            {/* Search Bar */}
            <div className="relative space-y-2">
                <Label className="text-sm font-semibold flex items-center gap-2">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px]">1</span>
                    Hızlı Kategori Arama
                </Label>
                <div className="relative group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    </div>
                    <input
                        type="text"
                        placeholder="Örn: Kolye, Yağlı Boya, Pet Gift..."
                        className="flex h-11 w-full rounded-xl border border-input bg-background pl-10 pr-4 py-2 text-sm ring-offset-background transition-all focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchResults.length > 0 && (
                        <div className="absolute z-[100] w-full mt-2 bg-popover text-popover-foreground rounded-xl border shadow-2xl max-h-72 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="p-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest border-b">
                                Sonuçlar ({searchResults.length})
                            </div>
                            {searchResults.map(cat => (
                                <div
                                    key={cat.id}
                                    className="px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer border-b last:border-0 transition-colors flex flex-col gap-0.5"
                                    onClick={() => handleSearchSelect(cat)}
                                >
                                    <span className="font-medium">{cat.label}</span>
                                    <span className="text-[10px] text-muted-foreground line-clamp-1">{cat.path}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                <p className="text-[11px] text-muted-foreground px-1 italic">
                    Kategori ismini yazın veya aşağıdan manuel seçin.
                </p>
            </div>

            <div className="space-y-3 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                <div className="space-y-1">
                    <Label>Hierarchy Selection (Level 1)</Label>
                    <Select value={level1Id || ""} onValueChange={handleLevel1Change}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {level1Nodes.map(node => (
                                <SelectItem key={node.id} value={String(node.id)}>
                                    {node.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {level2Nodes.length > 0 && (
                    <div className="space-y-1">
                        <Label>Subcategory (Level 2)</Label>
                        <Select value={level2Id || ""} onValueChange={handleLevel2Change}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Subcategory" />
                            </SelectTrigger>
                            <SelectContent max-h="200px">
                                {level2Nodes.map(node => (
                                    <SelectItem key={node.id} value={String(node.id)}>
                                        {node.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {level3Nodes.length > 0 && (
                    <div className="space-y-1">
                        <Label>Subcategory (Level 3)</Label>
                        <Select value={level3Id || ""} onValueChange={handleLevel3Change}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Subcategory" />
                            </SelectTrigger>
                            <SelectContent max-h="200px">
                                {level3Nodes.map(node => (
                                    <SelectItem key={node.id} value={String(node.id)}>
                                        {node.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}
            </div>

            {/* Show Selected ID */}
            {value && (
                <div className="text-xs text-muted-foreground px-1">
                    Selected Taxonomy ID: <span className="font-mono font-medium text-primary">{value}</span>
                </div>
            )}
        </div>
    );
}
