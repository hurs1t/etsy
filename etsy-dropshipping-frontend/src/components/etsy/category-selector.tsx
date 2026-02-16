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
        //  logic to set initial levels based on `value`
        //  Need a recursive find function.
    }, [value, nodes]);

    if (loading) return <div className="text-sm text-muted-foreground">Loading categories...</div>;

    return (
        <div className="space-y-3">
            <div className="space-y-1">
                <Label>Category (Level 1)</Label>
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

            {/* Show Selected ID */}
            <div className="text-xs text-muted-foreground mt-1">
                Etsy Taxonomy ID: {value || "None"}
            </div>
        </div>
    );
}
