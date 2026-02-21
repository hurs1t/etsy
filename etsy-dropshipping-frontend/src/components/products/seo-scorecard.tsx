import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, CheckCircle, Lightbulb, RefreshCw, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface SeoScorecardProps {
    analysis: any;
    loading: boolean;
    onAnalyze: () => void;
}

export function SeoScorecard({ analysis, loading, onAnalyze }: SeoScorecardProps) {
    if (!analysis) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>AI SEO Analysis</CardTitle>
                    <CardDescription>
                        Get instant feedback on your title, description, and tags to improve Etsy ranking.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                    <Trophy className="h-16 w-16 text-muted-foreground/20" />
                    <Button onClick={onAnalyze} disabled={loading}>
                        {loading ? <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Analyzing...</> : "Analyze Listing"}
                    </Button>
                </CardContent>
            </Card>
        );
    }

    const { score, issues, recommendations } = analysis;

    let scoreColor = "text-red-500";
    if (score >= 50) scoreColor = "text-yellow-500";
    if (score >= 80) scoreColor = "text-green-500";

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card className="md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Optimization Score</CardTitle>
                    <Button variant="ghost" size="sm" onClick={onAnalyze} disabled={loading}>
                        <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-4">
                        <div className={`text-4xl font-bold ${scoreColor}`}>{score}/100</div>
                        <Progress value={score} className="h-3 flex-1" />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <AlertCircle className="h-4 w-4 text-orange-500" />
                        Issues to Fix
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {issues && issues.length > 0 ? (
                        issues.map((issue: any, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm bg-orange-50 p-2 rounded text-orange-800">
                                <span>•</span>
                                <span>{issue.message}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-green-600 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" /> No critical issues found!
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        AI Recommendations
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {recommendations && recommendations.length > 0 ? (
                        recommendations.map((rec: string, i: number) => (
                            <div key={i} className="flex items-start gap-2 text-sm bg-yellow-50 p-2 rounded text-yellow-800">
                                <span>•</span>
                                <span>{rec}</span>
                            </div>
                        ))
                    ) : (
                        <div className="text-sm text-muted-foreground">No recommendations available.</div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
