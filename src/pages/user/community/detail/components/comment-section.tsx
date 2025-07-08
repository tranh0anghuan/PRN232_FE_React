"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MessageCircle,
  Reply,
  Edit,
  Trash2,
  MoreVertical,
  Send,
  ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import {
  commentService,
  type Comment,
} from "@/services/user/community/comment/service";

interface CommentSectionProps {
  postId: number;
  username?: string;
  onCommentCountChange?: (count: number) => void;
}

interface CommentItemProps {
  comment: Comment;
  username?: string;
  onReply: (commentId: number, userFullName: string) => void;
  onEdit: (comment: Comment) => void;
  onDelete: (commentId: number) => void;
  level?: number;
}

const CommentItem = ({
  comment,
  username,
  onReply,
  onEdit,
  onDelete,
  level = 0,
}: CommentItemProps) => {
  const isOwner = username === comment.username;
  const maxLevel = 3;

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`${level > 0 ? "ml-12 mt-3" : "mt-4"}`}>
      <div className="group">
        <div className="flex items-start space-x-3">
          <Avatar className="h-10 w-10 ring-2 ring-white shadow-sm">
            <AvatarImage src={`/placeholder.svg?height=40&width=40`} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold text-sm">
              {getInitials(comment.userFullName)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 rounded-2xl px-4 py-3 relative">
              <div className="flex items-center space-x-2 mb-1">
                <span className="font-semibold text-gray-900 text-sm">
                  {comment.userFullName}
                </span>
                <span className="text-gray-500 text-xs">
                  @{comment.username}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500 text-xs">
                  {formatDateTime(comment.createdAt)}
                </span>
                {comment.createdAt !== comment.updatedAt && (
                  <Badge
                    variant="outline"
                    className="text-xs px-2 py-0 h-5 bg-blue-50 text-blue-600 border-blue-200"
                  >
                    Edited
                  </Badge>
                )}
              </div>

              <p className="text-gray-800 text-sm leading-relaxed whitespace-pre-wrap">
                {comment.content}
              </p>

              {comment.mediaUrl && (
                <div className="mt-3">
                  <img
                    src={comment.mediaUrl || "/placeholder.svg"}
                    alt="Comment media"
                    className="max-w-sm rounded-xl border shadow-sm"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center space-x-4 mt-2 ml-2">
              {username && level < maxLevel && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    onReply(comment.commentId, comment.userFullName)
                  }
                  className="text-gray-500! hover:text-blue-600! hover:bg-blue-50! h-8 px-3 text-xs font-medium"
                >
                  <Reply className="h-3 w-3 mr-1" />
                  Reply
                </Button>
              )}

              {isOwner && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-400! hover:text-gray-600! hover:bg-gray-100! h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() => onEdit(comment)}
                      className="text-sm"
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete(comment.commentId)}
                      className="text-red-600 text-sm focus:text-red-600"
                    >
                      <Trash2 className="h-3 w-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Render replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="space-y-1">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.commentId}
              comment={reply}
              username={username}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default function CommentSection({
  postId,
  username,
  onCommentCountChange,
}: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [newCommentMedia, setNewCommentMedia] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<{
    commentId: number;
    userFullName: string;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const [editContent, setEditContent] = useState("");
  const [editMedia, setEditMedia] = useState<File | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await commentService.getCommentsByPostId(postId);
      const commentsData = response.data || [];

      const topLevelComments = commentsData.filter(
        (comment) => comment.parentCommentId === null
      );
      setComments(topLevelComments);

      const totalCount = countAllComments(commentsData);
      onCommentCountChange?.(totalCount);
    } catch (error) {
      console.error("Error fetching comments:", error);
      toast("Failed to load comments");
    } finally {
      setLoading(false);
    }
  };

  const countAllComments = (comments: Comment[]): number => {
    return comments.reduce((count, comment) => {
      return (
        count + 1 + (comment.replies ? countAllComments(comment.replies) : 0)
      );
    }, 0);
  };

  const handleSubmitComment = async () => {
    if (!username) {
      toast("Please log in to comment");
      return;
    }

    if (!newComment.trim()) {
      toast("Please enter a comment");
      return;
    }

    try {
      setSubmitting(true);
      await commentService.createComment({
        postId,
        username,
        content: newComment,
        mediaFile: newCommentMedia,
        parentCommentId: replyTo?.commentId,
      });

      setNewComment("");
      setNewCommentMedia(null);
      setReplyTo(null);
      await fetchComments();
      toast("Comment posted successfully!");
    } catch (error) {
      console.error("Error posting comment:", error);
      toast("Failed to post comment");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async () => {
    if (!editingComment) return;

    try {
      await commentService.updateComment({
        commentId: editingComment.commentId,
        content: editContent,
        mediaFile: editMedia,
        isActive: true,
      });

      setEditDialogOpen(false);
      setEditingComment(null);
      setEditContent("");
      setEditMedia(null);
      await fetchComments();
      toast("Comment updated successfully!");
    } catch (error) {
      console.error("Error updating comment:", error);
      toast("Failed to update comment");
    }
  };

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm("Are you sure you want to delete this comment?")) {
      return;
    }

    try {
      await commentService.deleteComment(commentId);
      await fetchComments();
      toast("Comment deleted successfully!");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast("Failed to delete comment");
    }
  };

  const openEditDialog = (comment: Comment) => {
    setEditingComment(comment);
    setEditContent(comment.content);
    setEditMedia(null);
    setEditDialogOpen(true);
  };

  const removeMediaFile = () => {
    setNewCommentMedia(null);
  };

  if (loading) {
    return (
      <div className="px-6 py-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-20 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="flex space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-16 w-full bg-gray-200 rounded-2xl animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 bg-white">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-6">
        <MessageCircle className="h-5 w-5 text-gray-600" />
        <span className="font-semibold text-gray-900 text-lg">
          {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
        </span>
      </div>

      {/* Comment Form */}
      {username && (
        <div className="mb-6">
          {replyTo && (
            <div className="mb-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700 font-medium">
                  Replying to {replyTo.userFullName}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyTo(null)}
                  className="h-6 w-6 p-0 text-blue-600! hover:text-blue-800! hover:bg-blue-100"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Textarea
              placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px] border-0 bg-transparent p-0 resize-none focus-visible:ring-0 placeholder:text-gray-500 text-sm"
            />

            {newCommentMedia && (
              <div className="mt-3 relative inline-block">
                <img
                  src={
                    URL.createObjectURL(newCommentMedia) || "/placeholder.svg"
                  }
                  alt="Preview"
                  className="max-w-xs rounded-xl border shadow-sm"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={removeMediaFile}
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500! hover:bg-red-600! text-white rounded-full"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setNewCommentMedia(e.target.files?.[0] || null)
                  }
                  className="hidden"
                  id="comment-media"
                />
                <label htmlFor="comment-media">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    asChild
                    className="text-gray-500! hover:text-blue-600! hover:bg-blue-50!"
                  >
                    <span>
                      <ImageIcon className="h-4 w-4 mr-1" />
                      Add Image
                    </span>
                  </Button>
                </label>
              </div>

              <Button
                onClick={handleSubmitComment}
                disabled={submitting || !newComment.trim()}
                className="bg-blue-600! hover:bg-blue-700! text-white px-6 rounded-full"
                size="sm"
              >
                {submitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2"></div>
                    Posting...
                  </div>
                ) : (
                  <>
                    <Send className="h-3 w-3 mr-1" />
                    {replyTo ? "Reply" : "Comment"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      <div className="space-y-1">
        {comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No comments yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your thoughts!
            </p>
            {username && (
              <Button
                onClick={() =>
                  document.getElementById("comment-textarea")?.focus()
                }
                className="bg-blue-600! hover:bg-blue-700! text-white rounded-full px-6"
              >
                Start the conversation
              </Button>
            )}
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.commentId}
              comment={comment}
              username={username}
              onReply={(commentId, userFullName) =>
                setReplyTo({ commentId, userFullName })
              }
              onEdit={openEditDialog}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>

      {/* Edit Comment Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              Edit Comment
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Make changes to your comment below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 focus-within:bg-white focus-within:border-blue-300 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                placeholder="Edit your comment..."
                className="min-h-[100px] border-0 bg-transparent p-0 resize-none focus-visible:ring-0 text-sm"
              />

              {editMedia && (
                <div className="mt-3 relative inline-block">
                  <img
                    src={URL.createObjectURL(editMedia) || "/placeholder.svg"}
                    alt="New Preview"
                    className="max-w-xs rounded-xl border shadow-sm"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditMedia(null)}
                    className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-500! hover:bg-red-600! text-white rounded-full"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}

              <div className="flex items-center mt-3 pt-3 border-t border-gray-200">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditMedia(e.target.files?.[0] || null)}
                  className="hidden"
                  id="edit-comment-media"
                />
                <label htmlFor="edit-comment-media">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                    asChild
                    className="text-gray-500! hover:text-blue-600! hover:bg-blue-50"
                  >
                    <span>
                      <ImageIcon className="h-4 w-4 mr-1" />
                      {editMedia ? "Change Image" : "Add Image"}
                    </span>
                  </Button>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setEditDialogOpen(false)}
                className="rounded-full px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditComment}
                disabled={!editContent.trim()}
                className="bg-blue-600! hover:bg-blue-700! text-white rounded-full px-6"
              >
                Update Comment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
