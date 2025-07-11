"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, DollarSign, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { membershipService } from "@/services/membership-plan/service.ts";

const useToast = () => {
    const toast = ({ title, description, variant }: { title: string; description: string; variant?: string }) => {
        if (variant === "destructive") {
            alert(`❌ ${title}: ${description}`);
        } else {
            alert(`✅ ${title}: ${description}`);
        }
    };
    return { toast };
};

interface MembershipFormData {
    planName: string;
    price: number;
    durationDays: number;
    description: string;
    features: string;
    isActive: boolean;
}

interface MembershipPlan {
    planId: number;
    planName: string;
    description: string;
    price: number;
    durationDays: number;
    features: string;
    isActive: boolean;
}

export default function MembershipPlanManagement() {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [noPlansFound, setNoPlansFound] = useState(false);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<MembershipPlan | null>(null);
    const [formData, setFormData] = useState<MembershipFormData>({
        planName: "",
        price: 0,
        durationDays: 0,
        description: "",
        features: "",
        isActive: true,
    });
    const [submitting, setSubmitting] = useState(false);
    const { toast } = useToast();

    // Fetch all membership plans
    const fetchPlans = async () => {
        try {
            setLoading(true);
            setNoPlansFound(false);
            const response = await membershipService.getAll();

            if (response.code === 200) {
                setPlans(response.data);
                setNoPlansFound(false);
            } else if (response.code === 404) {
                // Handle 404 - no plans found
                setPlans([]);
                setNoPlansFound(true);
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to fetch membership plans",
                    variant: "destructive",
                });
                setPlans([]);
                setNoPlansFound(false);
            }
        } catch (error) {
            console.error("Error fetching plans:", error);
            toast({
                title: "Error",
                description: "Failed to fetch membership plans",
                variant: "destructive",
            });
            setPlans([]);
            setNoPlansFound(false);
        } finally {
            setLoading(false);
        }
    };

    // Create new membership plan
    const handleCreate = async () => {
        if (!formData.planName || formData.price <= 0 || formData.durationDays <= 0) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields with valid values",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            const response = await membershipService.create(formData);
            if (response.code === 200 || response.code === 201) {
                toast({
                    title: "Success",
                    description: "Membership plan created successfully",
                });
                setIsCreateDialogOpen(false);
                resetForm();

                // Reset noPlansFound state in case this was the first plan
                setNoPlansFound(false);

                // Refresh the plans list
                await fetchPlans();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to create membership plan",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error creating plan:", error);
            toast({
                title: "Error",
                description: "Failed to create membership plan",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Update existing membership plan
    const handleUpdate = async () => {
        if (!selectedPlan || !formData.planName || formData.price <= 0 || formData.durationDays <= 0) {
            toast({
                title: "Validation Error",
                description: "Please fill in all required fields with valid values",
                variant: "destructive",
            });
            return;
        }

        try {
            setSubmitting(true);
            const updatedPlan: MembershipPlan = {
                ...selectedPlan,
                ...formData,
            };
            const response = await membershipService.update(updatedPlan);
            if (response.code === 200 || response.code === 201) {
                toast({
                    title: "Success",
                    description: "Membership plan updated successfully",
                });
                setIsEditDialogOpen(false);
                resetForm();

                // Refresh the plans list
                await fetchPlans();
            } else {
                toast({
                    title: "Error",
                    description: response.message || "Failed to update membership plan",
                    variant: "destructive",
                });
            }
        } catch (error) {
            console.error("Error updating plan:", error);
            toast({
                title: "Error",
                description: "Failed to update membership plan",
                variant: "destructive",
            });
        } finally {
            setSubmitting(false);
        }
    };

    // Reset form data
    const resetForm = () => {
        setFormData({
            planName: "",
            price: 0,
            durationDays: 0,
            description: "",
            features: "",
            isActive: true,
        });
        setSelectedPlan(null);
    };

    // Open edit dialog
    const openEditDialog = (plan: MembershipPlan) => {
        setSelectedPlan(plan);
        setFormData({
            planName: plan.planName,
            price: plan.price,
            durationDays: plan.durationDays,
            description: plan.description,
            features: plan.features,
            isActive: plan.isActive,
        });
        setIsEditDialogOpen(true);
    };

    // Format price for display
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(price);
    };

    // Format duration for display
    const formatDuration = (days: number) => {
        if (days === 1) return "1 day";
        if (days === 7) return "1 week";
        if (days === 30) return "1 month";
        if (days === 90) return "3 months";
        if (days === 365) return "1 year";
        return `${days} days`;
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Membership Plans</h1>
                    <p className="text-gray-600">Manage your membership plans and pricing</p>
                </div>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="!bg-green-600 !hover:bg-green-700">
                            <Plus className="h-4 w-4 mr-2" />
                            Add New Plan
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create New Membership Plan</DialogTitle>
                            <DialogDescription>
                                Fill in the details for the new membership plan.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label htmlFor="planName">Plan Name</Label>
                                <Input
                                    id="planName"
                                    value={formData.planName}
                                    onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                    placeholder="e.g., Premium Plan"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="price">Price (VND)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                    placeholder="e.g., 100000"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="durationDays">Duration (Days)</Label>
                                <Input
                                    id="durationDays"
                                    type="number"
                                    value={formData.durationDays}
                                    onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                                    placeholder="e.g., 30"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Describe the benefits of this plan..."
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="features">Features</Label>
                                <Textarea
                                    id="features"
                                    value={formData.features}
                                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                    placeholder="List the features included in this plan..."
                                />
                            </div>
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="h-4 w-4 rounded border-gray-300"
                                />
                                <Label htmlFor="isActive">Active Plan</Label>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsCreateDialogOpen(false);
                                    resetForm();
                                }}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={submitting}
                                className="!bg-green-600 !hover:bg-green-700"
                            >
                                {submitting ? "Creating..." : "Create Plan"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Plans</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{plans.length}</div>
                        <p className="text-xs text-muted-foreground">
                            Active membership plans
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Price</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {plans.length > 0 ? formatPrice(plans.reduce((sum, plan) => sum + plan.price, 0) / plans.length) : "0₫"}
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average plan price
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {plans.length > 0 ? Math.round(plans.reduce((sum, plan) => sum + plan.durationDays, 0) / plans.length) : 0} days
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Average plan duration
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Plans Grid or No Plans Message */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                </div>
            ) : noPlansFound ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Membership Plans Found</h3>
                    <p className="text-gray-600 mb-4 max-w-md">
                        You haven't created any membership plans yet. Start by creating your first plan to manage your membership offerings.
                    </p>
                    <Button
                        onClick={() => setIsCreateDialogOpen(true)}
                        className="!bg-green-600 !hover:bg-green-700"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Plan
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {plans.map((plan) => (
                        <Card key={plan.planId} className={`relative ${!plan.isActive ? 'opacity-60' : ''}`}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CardTitle className="text-lg">{plan.planName}</CardTitle>
                                        {!plan.isActive && (
                                            <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                                Inactive
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => openEditDialog(plan)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                                <div className="text-2xl font-bold text-green-600">
                                    {formatPrice(plan.price)}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {formatDuration(plan.durationDays)}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-700">
                                        {plan.description || "No description available"}
                                    </p>
                                    {plan.features && (
                                        <div>
                                            <p className="text-xs font-semibold text-gray-600 mb-1">Features:</p>
                                            <p className="text-xs text-gray-600">
                                                {plan.features}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Membership Plan</DialogTitle>
                        <DialogDescription>
                            Update the details for this membership plan.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="edit-planName">Plan Name</Label>
                            <Input
                                id="edit-planName"
                                value={formData.planName}
                                onChange={(e) => setFormData({ ...formData, planName: e.target.value })}
                                placeholder="e.g., Premium Plan"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-price">Price (VND)</Label>
                            <Input
                                id="edit-price"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                placeholder="e.g., 100000"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-durationDays">Duration (Days)</Label>
                            <Input
                                id="edit-durationDays"
                                type="number"
                                value={formData.durationDays}
                                onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
                                placeholder="e.g., 30"
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-description">Description</Label>
                            <Textarea
                                id="edit-description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Describe the benefits of this plan..."
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="edit-features">Features</Label>
                            <Textarea
                                id="edit-features"
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                placeholder="List the features included in this plan..."
                            />
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="edit-isActive"
                                checked={formData.isActive}
                                onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="edit-isActive">Active Plan</Label>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsEditDialogOpen(false);
                                resetForm();
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdate}
                            disabled={submitting}
                            className="!bg-green-600 !hover:bg-green-700"
                        >
                            {submitting ? "Updating..." : "Update Plan"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}