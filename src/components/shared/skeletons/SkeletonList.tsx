import { Skeleton } from '@/components/ui/Skeleton';
import { Card } from '@/components/ui';

export const SkeletonStats = ({ count = 3 }: { count?: number }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} className="p-8 rounded-[2rem] bg-slate-500/5 border border-white/5 space-y-4">
                    <Skeleton width="40%" height="12px" className="opacity-50" />
                    <Skeleton width="80%" height="32px" className="rounded-xl" />
                </Card>
            ))}
        </div>
    );
};

export const SkeletonKPI = ({ count = 4 }: { count?: number }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: count }).map((_, i) => (
            <Card key={i} className="p-6 rounded-3xl bg-slate-500/5 border border-white/5 space-y-4 h-48">
                <div className="flex justify-between">
                    <Skeleton variant="circle" width={48} height={48} />
                    <Skeleton width={60} height={20} className="rounded-xl opacity-50" />
                </div>
                <div className="space-y-2">
                    <Skeleton width="40%" height={12} className="opacity-30" />
                    <Skeleton width="70%" height={32} className="rounded-xl" />
                </div>
            </Card>
        ))}
    </div>
);

export const SkeletonShiftCard = () => (
    <Card className="p-8 rounded-[2.5rem] bg-white/5 border border-white/5 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
                <Skeleton variant="circle" width={64} height={64} />
                <div className="space-y-3">
                    <Skeleton width={180} height={24} />
                    <Skeleton width={120} height={12} className="opacity-50" />
                </div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 flex-1 lg:max-w-2xl">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                        <Skeleton width="40px" height="10px" className="opacity-30" />
                        <Skeleton width="80px" height="20px" />
                    </div>
                ))}
            </div>
        </div>
    </Card>
);

export const SkeletonList = ({ count = 4 }: { count?: number }) => (
    <div className="space-y-4">
        {Array.from({ length: count }).map((_, i) => (
            <SkeletonShiftCard key={i} />
        ))}
    </div>
);
