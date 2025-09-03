"use client";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, EllipsisVertical } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getAllScheduleTypes } from "@/services/scheduleTypeServices";
import CreateScheduleType from "./CreateScheduleType";
import DeleteScheduleType from "./DeleteScheduleType";
import EditScheduleType from "./EditScheduleType";

interface ScheduleType {
    scheduleTypeId: number;
    scheduleTypeName: string;
    scheduleTypeDow: string;
    slotName: string;
    slotStartTime: string;
    slotEndTime: string;
    classCount: number;
    scheduleCount: number;
    scheduleTypeStatus: string;
}

export default function ScheduleType() {
    const [searchQuery, setSearchQuery] = useState("");
    const [scheduleTypes, setScheduleTypes] = useState<ScheduleType[]>([]);
    const [pageNum, setPageNum] = useState(1);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedScheduleType, setSelectedScheduleType] = useState<{
        id: number | null;
        name: string;
    }>({ id: null, name: "" });

    const fetchScheduleTypes = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await getAllScheduleTypes();
            setScheduleTypes(response);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || err.message || "Failed to fetch schedule types";
            setError(errorMessage);
            console.error("Error fetching schedule types:", err);
            setScheduleTypes([]);
        } finally {
            setIsLoading(false);
        }
    }, [searchQuery, pageNum]);

    useEffect(() => {
        fetchScheduleTypes();
    }, [fetchScheduleTypes]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Active":
                return <Badge className="bg-green-500 hover:bg-green-600">Active</Badge>;
            case "InActive":
                return <Badge className="bg-red-500 hover:bg-red-600">Inactive</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleEdit = (id: number, name: string) => {
        setSelectedScheduleType({ id, name });
        setIsEditDialogOpen(true);
    };

    const handleDelete = (id: number, name: string) => {
        setSelectedScheduleType({ id, name });
        setIsDeleteDialogOpen(true);
    };

    return (
        <>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Schedule Type</h1>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between gap-4">
                        <div className="flex gap-2">
                            <div className="relative">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    type="search"
                                    placeholder="Tìm kiếm loại lịch..."
                                    className="pl-8 w-full sm:w-[200px] md:w-[300px]"
                                    value={searchQuery}
                                    onChange={(e) => {
                                        setSearchQuery(e.target.value);
                                        setPageNum(1);
                                    }}
                                />
                            </div>
                        </div>
                        <Button onClick={() => setIsCreateDialogOpen(true)} className="sm:self-start">
                            Create Schedule Type
                        </Button>
                    </div>

                    <Card>
                        <div className="grid grid-cols-[1fr_1fr_1fr_1fr_80px_80px_100px_60px] gap-2 p-4 font-medium border-b">
                            <div>Schedule Type</div>
                            <div>Day</div>
                            <div>Slot Name</div>
                            <div>Time</div>
                            <div>Classes</div>
                            <div>Sessions</div>
                            <div>Status</div>
                            <div>Actions</div>
                        </div>

                        {isLoading ? (
                            <div className="p-4 text-center text-muted-foreground">Loading schedule types...</div>
                        ) : error ? (
                            <div className="p-4 text-center text-red-500">{error}</div>
                        ) : scheduleTypes.length === 0 ? (
                            <div className="p-4 text-center text-muted-foreground">No schedule types found matching your filters.</div>
                        ) : (
                            scheduleTypes.map((item: ScheduleType, index: number) => (
                                <div
                                    key={item.scheduleTypeId ?? `fallback-${index}`}
                                    className="grid grid-cols-[1fr_1fr_1fr_1fr_80px_80px_100px_60px] gap-2 p-4 border-b last:border-0 items-center"
                                >
                                    <div className="font-medium">{item.scheduleTypeName}</div>
                                    <div className="text-sm">{item.scheduleTypeDow}</div>
                                    <div className="text-sm">{item.slotName}</div>
                                    <div className="text-sm">{`${item.slotStartTime}-${item.slotEndTime}`}</div>
                                    <div className="text-sm">{item.classCount}</div>
                                    <div className="text-sm">{item.scheduleCount}</div>
                                    <div>{getStatusBadge(item.scheduleTypeStatus)}</div>
                                    <div>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <EllipsisVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleEdit(item.scheduleTypeId, item.scheduleTypeName)}>
                                                    Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(item.scheduleTypeId, item.scheduleTypeName)}>
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))
                        )}
                    </Card>
                </div>
            </div>
            <CreateScheduleType
                open={isCreateDialogOpen}
                onOpenChange={setIsCreateDialogOpen}
                onSuccess={fetchScheduleTypes}
            />
            <DeleteScheduleType
                open={isDeleteDialogOpen}
                onOpenChange={setIsDeleteDialogOpen}
                scheduleTypeId={selectedScheduleType.id}
                scheduleTypeName={selectedScheduleType.name}
                onSuccess={fetchScheduleTypes}
            />
            <EditScheduleType
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                scheduleTypeId={selectedScheduleType.id}
                onSuccess={fetchScheduleTypes}
            />
        </>
    );
}