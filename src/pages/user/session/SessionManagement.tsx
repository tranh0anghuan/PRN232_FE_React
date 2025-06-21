/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Badge } from "../../../components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../../components/ui/dialog"
import { toast } from "sonner"
import { Calendar, Clock, Users, Star, Plus, Edit, Trash2 } from "lucide-react"
import { sessionService } from "../../../services/session/sessionService"
import { getUserFromToken } from "@/utils/auth"

export default function SessionManagement() {
    const currentUser = getUserFromToken()
  const [sessions, setSessions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [newSession, setNewSession] = useState({
    coachUsername: currentUser?.username || "",
    sessionTitle: "",
    sessionDescription: "",
    scheduledStart: "",
    scheduledEnd: "",
    sessionType: "",
    meetingLink: "",
    sessionFee: 0,
    notes: "",
  })

  useEffect(() => {
    fetchSessions()
  }, [])

  const fetchSessions = async () => {
    setIsLoading(true)
    try {
      const response = await sessionService.getAllSessions({
        coachUsername: currentUser?.username || "",
        pageIndex: 1,
        pageSize: 50,
      })
      if (response.success) {
        setSessions(response.data)
      }
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể tải danh sách sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateSession = async (e: any) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await sessionService.createSession(newSession)
      toast("Tạo session thành công")
      setShowCreateDialog(false)
      setNewSession({
        coachUsername: currentUser?.username || "",
        sessionTitle: "",
        sessionDescription: "",
        scheduledStart: "",
        scheduledEnd: "",
        sessionType: "",
        meetingLink: "",
        sessionFee: 0,
        notes: "",
      })
      fetchSessions()
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể tạo session")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteSession = async (sessionId: any) => {
    if (!confirm("Bạn có chắc muốn xóa session này?")) return

    try {
      await sessionService.deleteSession(sessionId)
      toast("Xóa thành công")
      fetchSessions()
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể xóa session")
    }
  }

  const formatDateTime = (dateString: any) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Quản lý Sessions</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Tạo Session Mới
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Tạo Session Mới</DialogTitle>
              <DialogDescription>Tạo session tư vấn mới cho khách hàng</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSession} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionTitle">Tiêu đề session</Label>
                  <Input
                    id="sessionTitle"
                    value={newSession.sessionTitle}
                    onChange={(e) => setNewSession({ ...newSession, sessionTitle: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionType">Loại session</Label>
                  <Input
                    id="sessionType"
                    value={newSession.sessionType}
                    onChange={(e) => setNewSession({ ...newSession, sessionType: e.target.value })}
                    placeholder="VD: Tư vấn cá nhân, Nhóm..."
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sessionDescription">Mô tả</Label>
                <Textarea
                  id="sessionDescription"
                  value={newSession.sessionDescription}
                  onChange={(e) => setNewSession({ ...newSession, sessionDescription: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="scheduledStart">Thời gian bắt đầu</Label>
                  <Input
                    id="scheduledStart"
                    type="datetime-local"
                    value={newSession.scheduledStart}
                    onChange={(e) => setNewSession({ ...newSession, scheduledStart: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scheduledEnd">Thời gian kết thúc</Label>
                  <Input
                    id="scheduledEnd"
                    type="datetime-local"
                    value={newSession.scheduledEnd}
                    onChange={(e) => setNewSession({ ...newSession, scheduledEnd: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="meetingLink">Link meeting</Label>
                  <Input
                    id="meetingLink"
                    value={newSession.meetingLink}
                    onChange={(e) => setNewSession({ ...newSession, meetingLink: e.target.value })}
                    placeholder="https://meet.google.com/..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionFee">Phí session (VND)</Label>
                  <Input
                    id="sessionFee"
                    type="number"
                    value={newSession.sessionFee}
                    onChange={(e) => setNewSession({ ...newSession, sessionFee: Number.parseInt(e.target.value) || 0 })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Ghi chú</Label>
                <Textarea
                  id="notes"
                  value={newSession.notes}
                  onChange={(e) => setNewSession({ ...newSession, notes: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Hủy
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Đang tạo..." : "Tạo Session"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Đang tải...</div>
      ) : (
        <div className="grid gap-6">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">Chưa có session nào</p>
              </CardContent>
            </Card>
          ) : (
            sessions.map((session: any) => (
              <Card key={session.sessionId}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {session.sessionTitle}
                        <Badge variant={session.status === "scheduled" ? "default" : "secondary"}>
                          {session.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{session.sessionDescription}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDeleteSession(session.sessionId)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDateTime(session.scheduledStart)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{formatDateTime(session.scheduledEnd)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{session.clientUsername || "Chưa có khách hàng"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-muted-foreground" />
                      <span>{session.rating ? `${session.rating.ratingValue}/5` : "Chưa đánh giá"}</span>
                    </div>
                  </div>

                  {session.meetingLink && (
                    <div className="mt-4">
                      <Button variant="outline" size="sm" asChild>
                        <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                          Tham gia Meeting
                        </a>
                      </Button>
                    </div>
                  )}

                  {session.rating && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <p className="text-sm font-medium">Đánh giá từ khách hàng:</p>
                      <p className="text-sm text-muted-foreground">{session.rating.review}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  )
}
