import { useEffect, useState } from "react"
import { userService } from "@/services/user/user"

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

const ProfilePage = () => {
    const [user, setUser] = useState<UserProfile | null>(null)
    const [editing, setEditing] = useState(false)
    const [form, setForm] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await userService.getUser()
                if (res.code === 200) {
                    setUser(res.data)
                    setForm(res.data)
                } else {
                    setError("Server responded with code " + res.code)
                }
            } catch (err) {
                setError("Failed to fetch profile")
                console.error(err)
            } finally {
                setLoading(false)
            }
        }

        fetchProfile()
    }, [])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!form) return
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSave = async () => {
        if (!form) return
        setSaving(true)
        try {
            const res = await userService.updateUser(form)
            if (res.code === 200) {
                setUser(res.data)
                setEditing(false)
                // Show success message
                const successDiv = document.createElement('div')
                successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                successDiv.textContent = 'Cập nhật thành công!'
                document.body.appendChild(successDiv)
                setTimeout(() => {
                    if (document.body.contains(successDiv)) {
                        document.body.removeChild(successDiv)
                    }
                }, 3000)
            } else {
                // Show error message
                const errorDiv = document.createElement('div')
                errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
                errorDiv.textContent = `Cập nhật thất bại! (Mã lỗi: ${res.code})`
                document.body.appendChild(errorDiv)
                setTimeout(() => {
                    if (document.body.contains(errorDiv)) {
                        document.body.removeChild(errorDiv)
                    }
                }, 3000)
            }
        } catch (err) {
            // Show error message
            const errorDiv = document.createElement('div')
            errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50'
            errorDiv.textContent = 'Lỗi khi cập nhật thông tin!'
            document.body.appendChild(errorDiv)
            setTimeout(() => {
                if (document.body.contains(errorDiv)) {
                    document.body.removeChild(errorDiv)
                }
            }, 3000)
            console.error(err)
        } finally {
            setSaving(false)
        }
    }

    const handleCancel = () => {
        setForm(user)
        setEditing(false)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải thông tin...</p>
                </div>
            </div>
        )
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-2">Có lỗi xảy ra</h2>
                    <p className="text-gray-600">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Thông tin cá nhân</h1>
                    <p className="text-gray-600">Quản lý thông tin tài khoản của bạn</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Picture Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
                            <div className="relative inline-block">
                                <img
                                    src={user.profilePicture || "/default-avatar.png"}
                                    alt="Avatar"
                                    className="w-32 h-32 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                                />
                                <div className="absolute bottom-2 right-2 bg-blue-500 text-white rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-800 mb-1">{user.fullName}</h2>
                            <p className="text-gray-600 mb-4">@{user.username}</p>
                            <div className="flex justify-center space-x-2">
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                    {user.gender}
                                </span>
                                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                                    Đang hoạt động
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Profile Details Card */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-semibold text-gray-800">Chi tiết thông tin</h3>
                                {!editing ? (
                                    <button
                                        onClick={() => setEditing(true)}
                                        className="flex items-center space-x-2 !bg-blue-600 !hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                        </svg>
                                        <span className="text-white font-medium">Chỉnh sửa</span>
                                    </button>
                                ) : (
                                    <div className="flex space-x-3">
                                        <button
                                            onClick={handleCancel}
                                            className="flex items-center space-x-2 !bg-gray-600 !hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                            <span className="text-white font-medium">Hủy</span>
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex items-center space-x-2 !bg-green-600 !hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
                                        >
                                            {saving ? (
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            ) : (
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                </svg>
                                            )}
                                            <span className="text-white font-medium">{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</span>
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: "Họ tên", name: "fullName", icon: "👤" },
                                    { label: "Email", name: "email", icon: "✉️" },
                                    { label: "Số điện thoại", name: "phoneNumber", icon: "📞" },
                                    { label: "Giới tính", name: "gender", icon: "⚧", type: "select" },
                                    { label: "Ngày sinh", name: "dateOfBirth", icon: "🎂", type: "date" },
                                ].map((field) => (
                                    <div key={field.name} className="space-y-2">
                                        <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                            <span>{field.icon}</span>
                                            <span>{field.label}</span>
                                        </label>
                                        {editing ? (
                                            field.type === "select" ? (
                                                <select
                                                    name={field.name}
                                                    value={form?.[field.name as keyof UserProfile] || ""}
                                                    onChange={handleChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                >
                                                    <option value="">Chọn giới tính</option>
                                                    <option value="Nam">Nam</option>
                                                    <option value="Nữ">Nữ</option>
                                                    <option value="Khác">Khác</option>
                                                </select>
                                            ) : (
                                                <input
                                                    type={field.type || "text"}
                                                    name={field.name}
                                                    value={form?.[field.name as keyof UserProfile] || ""}
                                                    onChange={handleChange}
                                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                />
                                            )
                                        ) : (
                                            <div className="p-3 bg-gray-50 rounded-lg">
                                                <p className="text-gray-800">
                                                    {user[field.name as keyof UserProfile] ||
                                                        <span className="text-gray-400 italic">(chưa có thông tin)</span>
                                                    }
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Bio Section */}
                            <div className="mt-6 space-y-2">
                                <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                                    <span>📝</span>
                                    <span>Tiểu sử</span>
                                </label>
                                {editing ? (
                                    <textarea
                                        name="bio"
                                        value={form?.bio || ""}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                        placeholder="Hãy giới thiệu về bản thân..."
                                    />
                                ) : (
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-800">
                                            {user.bio ||
                                                <span className="text-gray-400 italic">(chưa có thông tin)</span>
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ProfilePage