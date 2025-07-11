import api from "@/config/api/api"

export interface MembershipPlan {
    planId: number
    planName: string
    description: string
    price: number
    durationDays: number
    features: string
    isActive: boolean
}
export interface Payment {
    paymentId: number
    username: string
    membershipId: number
    amount: number
    paymentMethod: string
    transactionId: string
    status: string
    paymentDate: string
}

export interface ApiResponse<T> {
    code: number
    data: T
    message?: string
}

export const membershipService = {
    /**
     * Get all membership plans
     */
    getAll: async (): Promise<ApiResponse<MembershipPlan[]>> => {
        const response = await api.get("/MembershipPlan/get-all")
        return response.data
    },

    /**
     * Get all payments
     */
    getAllPayment: async (): Promise<ApiResponse<Payment[]>> => {
        const response = await api.get("/MembershipPlan/get-all-payment")
        return response.data
    },

    /**
     * Get membership plan by ID
     * @param planId
     */
    getById: async (planId: number): Promise<ApiResponse<MembershipPlan>> => {
        const response = await api.get(`/MembershipPlan/get-by-id/${planId}`)
        return response.data
    },

    /**
     * Create a new membership plan
     * @param plan
     */
    create: async (plan: Omit<MembershipPlan, "planId">): Promise<ApiResponse<MembershipPlan>> => {
        const response = await api.post("/MembershipPlan/create", plan)
        return response.data
    },

    /**
     * Update an existing membership plan
     * @param plan
     */
    update: async (plan: MembershipPlan): Promise<ApiResponse<MembershipPlan>> => {
        const response = await api.put("/MembershipPlan/update", plan)
        return response.data
    },

    /**
     * Register a user for a plan
     * @param planId
     */
    register: async (planId: number): Promise<ApiResponse<string>> => {
        const response = await api.post(`/MembershipPlan/register/${planId}`)
        return response.data
    },

    /**
     * Handle payment success
     * @param paymentId
     */
    success: async (paymentId: number,token: string): Promise<ApiResponse<string>> => {
        const response = await api.post(`/MembershipPlan/success?paymentId=${paymentId}&token=${token}`)
        return response.data
    },

    /**
     * Handle payment cancel
     * @param paymentId
     */
    cancel: async (paymentId: number, token: string): Promise<ApiResponse<string>> => {
        const response = await api.post(`/MembershipPlan/cancel?paymentId=${paymentId}&token=${token}`)
        return response.data
    }
}