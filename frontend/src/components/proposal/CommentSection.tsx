import { useState, useEffect } from 'react';
import { proposalService } from '../../services/proposal.service';
import { Comment } from '../../types/proposal.types';
import { useAuthStore } from '../../stores/auth.store';
import Button from '../common/Button';
import { toast } from '../common/Toast';
import { MessageSquare, Send, Trash2, Reply } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';

interface CommentSectionProps {
  proposalId: string;
}

export default function CommentSection({ proposalId }: CommentSectionProps) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadComments();
  }, [proposalId]);

  const loadComments = async () => {
    try {
      setLoading(true);
      const data = await proposalService.getComments(proposalId);
      // Organize comments into threaded structure
      const organized = organizeComments(data);
      setComments(organized);
    } catch (error) {
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const organizeComments = (comments: Comment[]): Comment[] => {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map
    comments.forEach((comment) => {
      commentMap.set(comment.id, { ...comment, replies: [] });
    });

    // Second pass: organize into tree
    comments.forEach((comment) => {
      const commentWithReplies = commentMap.get(comment.id)!;
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          if (!parent.replies) parent.replies = [];
          parent.replies.push(commentWithReplies);
        } else {
          rootComments.push(commentWithReplies);
        }
      } else {
        rootComments.push(commentWithReplies);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newComment.trim()) {
      toast.error('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await proposalService.createComment(proposalId, {
        content: newComment,
      });
      setNewComment('');
      toast.success('Comment added!');
      loadComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim()) {
      toast.error('Reply cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      await proposalService.createComment(proposalId, {
        content: replyContent,
        parentId,
      });
      setReplyTo(null);
      setReplyContent('');
      toast.success('Reply added!');
      loadComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add reply');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!window.confirm('Delete this comment?')) {
      return;
    }

    try {
      await proposalService.deleteComment(proposalId, commentId);
      toast.success('Comment deleted');
      loadComments();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const renderComment = (comment: Comment, level = 0) => {
    const isOwnComment = comment.userId === user?.id;

    return (
      <div key={comment.id} className={`${level > 0 ? 'ml-8 mt-3' : 'mt-4'}`}>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-blue-600 font-medium text-xs">
                  {comment.user?.firstName?.[0]}
                  {comment.user?.lastName?.[0]}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {comment.user?.firstName} {comment.user?.lastName}
                  {isOwnComment && (
                    <span className="ml-2 text-xs text-gray-500">(You)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
            {isOwnComment && (
              <button
                onClick={() => handleDelete(comment.id)}
                className="p-1 text-red-600 hover:bg-red-50 rounded"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          <p className="text-gray-700 text-sm mb-3">{comment.content}</p>

          {level < 3 && (
            <button
              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <Reply size={14} />
              Reply
            </button>
          )}

          {replyTo === comment.id && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                rows={2}
                className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-2"
              />
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSubmitReply(comment.id)}
                  loading={submitting}
                  disabled={submitting || !replyContent.trim()}
                >
                  <Send size={14} className="mr-2" />
                  Reply
                </Button>
              </div>
            </div>
          )}
        </div>

        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2">
            {comment.replies.map((reply) => renderComment(reply, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* New Comment Form */}
      <form onSubmit={handleSubmitComment} className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
          <MessageSquare size={16} />
          Add a comment
        </h3>
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Share your thoughts..."
          rows={3}
          className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-3"
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            loading={submitting}
            disabled={submitting || !newComment.trim()}
          >
            <Send size={14} className="mr-2" />
            Post Comment
          </Button>
        </div>
      </form>

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <MessageSquare size={48} className="mx-auto text-gray-300 mb-2" />
          <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-900">
            Comments ({comments.length})
          </h3>
          {comments.map((comment) => renderComment(comment))}
        </div>
      )}
    </div>
  );
}
