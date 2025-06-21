/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { coachService } from "../../../services/coach/coachService"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Label } from "@radix-ui/react-label"
import { Input } from "../../../components/ui/input"
import { Textarea } from "../../../components/ui/textarea"
import { Button } from "../../../components/ui/button"

export default function CoachProfileForm({ currentUser }: { currentUser: any }) {
  const [profileData, setProfileData] = useState({
    username: currentUser?.username || "",
    specialization: "",
    qualifications: "",
    experience: "",
    certificationProof: "",
    hourlyRate: 0,
    availability: "",
  })
  const [existingProfile, setExistingProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchCoachProfile()
  }, [])

  const fetchCoachProfile = async () => {
    try {
      const response = await coachService.getProfileByUsername(currentUser.username)
      if (response.success) {
        setExistingProfile(response.data)
        setProfileData(response.data)
      }
    } catch (error) {
      console.log("Chưa có profile coach")
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
      fetchCoachProfile()
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Có lỗi xảy ra khi lưu profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Coach Profile
          {existingProfile && (
            <div className="flex gap-2">
              <Badge variant={existingProfile.isVerified ? "default" : "secondary"}>
                {existingProfile.isVerified ? "Đã xác thực" : "Chờ xác thực"}
              </Badge>
              <Badge variant={existingProfile.isActive ? "default" : "destructive"}>
                {existingProfile.isActive ? "Hoạt động" : "Không hoạt động"}
              </Badge>
            </div>
          )}
        </CardTitle>
        <CardDescription>
          {existingProfile ? "Cập nhật thông tin coach profile" : "Tạo coach profile để bắt đầu tư vấn"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="specialization">Chuyên môn</Label>
            <Input
              id="specialization"
              value={profileData.specialization}
              onChange={(e) => setProfileData({ ...profileData, specialization: e.target.value })}
              placeholder="VD: Cai thuốc lá, Tư vấn tâm lý..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualifications">Bằng cấp</Label>
            <Textarea
              id="qualifications"
              value={profileData.qualifications}
              onChange={(e) => setProfileData({ ...profileData, qualifications: e.target.value })}
              placeholder="Mô tả bằng cấp, chứng chỉ..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experience">Kinh nghiệm</Label>
            <Textarea
              id="experience"
              value={profileData.experience}
              onChange={(e) => setProfileData({ ...profileData, experience: e.target.value })}
              placeholder="Mô tả kinh nghiệm làm việc..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="certificationProof">Chứng minh chứng chỉ</Label>
            <Input
              id="certificationProof"
              value={profileData.certificationProof}
              onChange={(e) => setProfileData({ ...profileData, certificationProof: e.target.value })}
              placeholder="Link hoặc mô tả chứng minh chứng chỉ"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Giá theo giờ (VND)</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={profileData.hourlyRate}
              onChange={(e) => setProfileData({ ...profileData, hourlyRate: Number.parseInt(e.target.value) || 0 })}
              placeholder="0"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="availability">Lịch có thể làm việc</Label>
            <Textarea
              id="availability"
              value={profileData.availability}
              onChange={(e) => setProfileData({ ...profileData, availability: e.target.value })}
              placeholder="VD: Thứ 2-6, 9h-17h..."
              required
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang lưu..." : existingProfile ? "Cập nhật Profile" : "Tạo Coach Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
