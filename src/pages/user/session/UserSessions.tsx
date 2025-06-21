/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState, useEffect } from "react"
import { Button } from "../../../components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card"
import { Badge } from "../../../components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../../components/ui/dialog"
import { Input } from "../../../components/ui/input"
import { Label } from "../../../components/ui/label"
import { Textarea } from "../../../components/ui/textarea"
import { Calendar, Clock, User, Star, Search } from "lucide-react"
import { sessionService } from "../../../services/session/sessionService"
import { ratingService } from "../../../services/rating/ratingService"
import { toast } from "sonner"
import { getUserFromToken } from "@/utils/auth"

export default function UserSessions() {
    const currentUser = getUserFromToken()
  const [availableSessions, setAvailableSessions] = useState([])
  const [mySessions, setMySessions] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [showRatingDialog, setShowRatingDialog] = useState(false)
  const [selectedSession, setSelectedSession] = useState(null)
  const [rating, setRating] = useState({
    sessionId: 0,
    ratingValue: 5,
    review: "",
    ratingType: "session",
  })

  useEffect(() => {
    fetchAvailableSessions()
    fetchMySessions()
  }, [])

  const fetchAvailableSessions = async () => {
    setIsLoading(true)
    try {
      const response = await sessionService.getAllSessions({ pageIndex: 1, pageSize: 50 })
      if (response.success) {
        const available = response.data.filter((session: any) => !session.clientUsername)
        setAvailableSessions(available)
      }
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể tải danh sách sessions")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchMySessions = async () => {
    try {
      const response = await sessionService.getAllSessions({ pageIndex: 1, pageSize: 50 })
      if (response.success) {
        const mySessions = response.data.filter((session: any) => session.clientUsername === currentUser?.username)
        setMySessions(mySessions)
      }
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể tải danh sách sessions")
    }
  }

  const handleJoinSession = async (sessionId: any) => {
    try {
      await sessionService.joinSession({
        sessionId,
        clientUsername: currentUser?.username,
      })
      toast("Tham gia thành công")
      fetchAvailableSessions()
      fetchMySessions()
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể tham gia session")
    }
  }

  const handleSubmitRating = async (e: any) => {
    e.preventDefault()
    try {
      await ratingService.createRating(rating)
      toast("Đánh giá thành công")
      setShowRatingDialog(false)
      fetchMySessions()
    } catch (error: any) {
      toast("Lỗi", error.response?.data?.message || "Không thể gửi đánh giá")
    }
  }

  const openRatingDialog = (session: any) => {
    setSelectedSession(session)
    setRating({
      sessionId: session.sessionId,
      ratingValue: 5,
      review: "",
      ratingType: "session",
    })
    setShowRatingDialog(true)
  }

  const formatDateTime = (dateString: any) => {
    return new Date(dateString).toLocaleString("vi-VN")
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Available Sessions */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Search className="w-5 h-5" />
            Sessions Có Sẵn
          </h2>
          <div className="space-y-4">
            {availableSessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Không có session nào</p>
                </CardContent>
              </Card>
            ) : (
              availableSessions.map((session: any) => (
                <Card key={session.sessionId}>
                  <CardHeader>
                    <CardTitle className="text-lg">{session.sessionTitle}</CardTitle>
                    <CardDescription>{session.sessionDescription}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Coach: {session.coach?.fullName || session.coach?.username}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDateTime(session.scheduledStart)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>
                          Thời lượng:{" "}
                          {Math.round(
                            (new Date(session.scheduledEnd).getTime() - new Date(session.scheduledStart).getTime()) /
                              (1000 * 60),
                          )}{" "}
                          phút
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{session.sessionFee.toLocaleString("vi-VN")} VND</Badge>
                        <Button size="sm" onClick={() => handleJoinSession(session.sessionId)}>
                          Tham gia
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* My Sessions */}
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Sessions Của Tôi
          </h2>
          <div className="space-y-4">
            {mySessions.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">Bạn chưa tham gia session nào</p>
                </CardContent>
              </Card>
            ) : (
              mySessions.map((session: any) => (
                <Card key={session.sessionId}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{session.sessionTitle}</CardTitle>
                        <CardDescription>{session.sessionDescription}</CardDescription>
                      </div>
                      <Badge variant={session.status === "completed" ? "default" : "secondary"}>{session.status}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span>Coach: {session.coach?.fullName || session.coach?.username}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>{formatDateTime(session.scheduledStart)}</span>
                      </div>

                      <div className="flex gap-2">
                        {session.meetingLink && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={session.meetingLink} target="_blank" rel="noopener noreferrer">
                              Tham gia Meeting
                            </a>
                          </Button>
                        )}

                        {session.status === "completed" && !session.rating && (
                          <Button variant="outline" size="sm" onClick={() => openRatingDialog(session)}>
                            <Star className="w-4 h-4 mr-1" />
                            Đánh giá
                          </Button>
                        )}
                      </div>

                      {session.rating && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm font-medium">Đánh giá của bạn: {session.rating.ratingValue}/5</p>
                          <p className="text-sm text-muted-foreground">{session.rating.review}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      <Dialog open={showRatingDialog} onOpenChange={setShowRatingDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Đánh giá Session</DialogTitle>
            <DialogDescription>Hãy chia sẻ trải nghiệm của bạn về session này</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitRating} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ratingValue">Điểm đánh giá (1-5)</Label>
              <Input
                id="ratingValue"
                type="number"
                min="1"
                max="5"
                value={rating.ratingValue}
                onChange={(e) => setRating({ ...rating, ratingValue: Number.parseInt(e.target.value) })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="review">Nhận xét</Label>
              <Textarea
                id="review"
                value={rating.review}
                onChange={(e) => setRating({ ...rating, review: e.target.value })}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setShowRatingDialog(false)}>
                Hủy
              </Button>
              <Button type="submit">Gửi đánh giá</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
