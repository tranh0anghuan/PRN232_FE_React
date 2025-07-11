/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, ArrowRight, CheckCircle, Clock } from "lucide-react"
import { toast } from "sonner"
import { coachService } from "@/services/coach/coachService"
import { USER_ROUTES } from "@/routes/user/user"
import { getUserFromToken } from "@/utils/token/auth"

export default function CoachProfilePage() {
  const [profileData, setProfileData] = useState({
    username: "",
    specialization: "",
    qualifications: "",
    experience: "",
    certificationProof: "",
    hourlyRate: 0,
    availability: "",
  })
  const [existingProfile, setExistingProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingProfile, setIsCheckingProfile] = useState(false)

  useEffect(() => {
    const user = getUserFromToken()
    if (user) {
      setProfileData((prev) => ({ ...prev, username: user.username }))
      checkCoachProfile(user.username)
    }
  }, [])

  const checkCoachProfile = async (username: string) => {
    setIsCheckingProfile(true)
    try {
      const response = await coachService.getProfileByUsername(username)
      if (response.success) {
        setExistingProfile(response.data)
        setProfileData(response.data)
      }
    } catch (error: any) {
        console.log(error);
    } finally {
      setIsCheckingProfile(false)
    }
  }

  const handleSubmit = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (existingProfile) {
        await coachService.updateProfile(profileData)
        toast("Cập nhật thành công")
      } else {
        await coachService.createProfile(profileData)
        toast("Tạo profile thành công")
      }
      checkCoachProfile(getUserFromToken()?.username ?? "")
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Có lỗi xảy ra khi lưu profile")
    } finally {
      setIsLoading(false)
    }
  }

  

  return (
    <div className=" min-h-screen bg-gradient-to-br from-green-50 to-blue-50">

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {existingProfile ? "Coach Profile" : "Tạo Coach Profile"}
              </h1>
              <p className="text-gray-600 mt-2">
                {existingProfile
                  ? "Quản lý thông tin coach profile của bạn"
                  : "Tạo profile để bắt đầu hành trình coaching"}
              </p>
            </div>
            {existingProfile && existingProfile.isVerified && existingProfile.isApproved && (
              <Button asChild className="bg-white hover:bg-blue-200">
                <a href={USER_ROUTES.SESSION_MANAGEMENT}>
                  <Calendar className="w-4 h-4 mr-2" />
                  My Sessions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {existingProfile ? "Cập nhật Profile" : "Tạo Coach Profile"}
                </CardTitle>
                <CardDescription>
                  {existingProfile ? "Cập nhật thông tin coach profile của bạn" : "Điền thông tin để tạo coach profile"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="specialization">Chuyên môn *</Label>
                      <Input
                        id="specialization"
                        value={profileData.specialization}
                        onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
                        placeholder="VD: Cai thuốc lá, Tư vấn tâm lý..."
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="hourlyRate">Giá theo giờ (VND) *</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        value={profileData.hourlyRate}
                        onChange={(e) =>
                          setProfileData({ ...profileData, hourlyRate: Number.parseInt(e.target.value) || 0 })
                        }
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="qualifications">Bằng cấp *</Label>
                    <Textarea
                      id="qualifications"
                      value={profileData.qualifications}
                      onChange={(e) => setProfileData({ ...profileData, qualifications: e.target.value })}
                      placeholder="Mô tả bằng cấp, chứng chỉ..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="experience">Kinh nghiệm *</Label>
                    <Textarea
                      id="experience"
                      value={profileData.experience}
                      onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
                      placeholder="Mô tả kinh nghiệm làm việc..."
                      rows={3}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="certificationProof">Chứng minh chứng chỉ *</Label>
                    <Input
                      id="certificationProof"
                      value={profileData.certificationProof}
                      onChange={(e) => setProfileData({ ...profileData, certificationProof: e.target.value })}
                      placeholder="Link hoặc mô tả chứng minh chứng chỉ"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availability">Lịch có thể làm việc *</Label>
                    <Textarea
                      id="availability"
                      value={profileData.availability}
                      onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
                      placeholder="VD: Thứ 2-6, 9h-17h..."
                      rows={2}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-green-600! hover:bg-green-700!" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                        Đang lưu...
                      </>
                    ) : existingProfile ? (
                      "Cập nhật Profile"
                    ) : (
                      "Tạo Coach Profile"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            {existingProfile && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Trạng thái Profile</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <CheckCircle
                      className={`w-5 h-5 ${existingProfile.isVerified ? "text-green-500" : "text-gray-400"}`}
                    />
                    <span className={existingProfile.isVerified ? "text-green-700" : "text-gray-500"}>
                      {existingProfile.isVerified ? "Đã xác thực" : "Chờ xác thực"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className={`w-5 h-5 ${existingProfile.isActive ? "text-green-500" : "text-gray-400"}`} />
                    <span className={existingProfile.isActive ? "text-green-700" : "text-gray-500"}>
                      {existingProfile.isActive ? "Đang hoạt động" : "Không hoạt động"}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Hành động nhanh</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {existingProfile ? (
                  <>
                    {existingProfile.isVerified && existingProfile.isActive && (
                    <Button asChild variant="outline" className="w-full justify-start">
                      <a href={USER_ROUTES.SESSION_MANAGEMENT}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Quản lý Sessions
                      </a>
                    </Button>
                    )}
                    
                    <Button asChild variant="outline" className="w-full justify-start">
                      <a href={USER_ROUTES.USER_SESSION}>
                        <Calendar className="w-4 h-4 mr-2" />
                        Tìm Sessions
                      </a>
                    </Button>
                  </>
                ) : (
                  <div className="text-sm text-gray-500 text-center py-4">Tạo profile để truy cập các tính năng</div>
                )}
              </CardContent>
            </Card>

            {/* Tips Card */}
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">💡 Mẹo</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm text-green-700 space-y-2">
                  <li>• Điền đầy đủ thông tin để tăng độ tin cậy</li>
                  <li>• Cập nhật lịch làm việc thường xuyên</li>
                  <li>• Chờ admin xác thực để bắt đầu coaching</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
