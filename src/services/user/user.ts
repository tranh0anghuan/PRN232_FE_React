import api from "@/config/api/api"

export interface UserProfile {
    username: string
    fullName: string
    email: string
    phoneNumber: string
    gender: string
    bio: string
    dateOfBirth: string
    profilePicture?: string
}

export interface UserResponse {
    code: number
    data: UserProfile
}

export interface UpdateUserResponse {
    code: number
    data: UserProfile
}

export const userService = {
    /**
     * Get current logged-in user info
     */
    getUser: async (): Promise<UserResponse> => {
        const response = await api.get("/User/get-user")
        return response.data
    },

    /**
     * Update user profile
     * @param profile new user profile info
     */
    updateUser: async (profile: UserProfile): Promise<UpdateUserResponse> => {
        const response = await api.put("/User/update-user", profile)
        return response.data
    }
}
