"use client"

import * as React from "react"

interface CommentFormProps {
  slug: string
  onCommentAdded?: () => void
  parentId?: string // For replies
  placeholder?: string
  className?: string
}

export function CommentForm({
  slug,
  onCommentAdded,
  parentId,
  placeholder = "Share your thoughts...",
  className = ""
}: CommentFormProps) {
  const [content, setContent] = React.useState("")
  const [author, setAuthor] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState("")

  // Load author from localStorage if available
  React.useEffect(() => {
    const savedAuthor = localStorage.getItem("xyd-author")
    if (savedAuthor) {
      setAuthor(savedAuthor)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      setError("Comment cannot be empty")
      return
    }

    if (!author.trim()) {
      setError("Please enter your name")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          slug,
          content: content.trim(),
          author: author.trim(),
          parentId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to post comment")
      }

      // Save author to localStorage
      localStorage.setItem("xyd-author", author.trim())

      // Update user statistics
      await fetch("/api/users/update-stats", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: author.trim(),
          action: "comment_posted",
        }),
      })

      // Reset form
      setContent("")
      if (!parentId) {
        setAuthor("")
      }

      // Notify parent component
      onCommentAdded?.()

    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to post comment")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={`comment-form ${className}`} style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1rem'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{
            display: 'block',
            marginBottom: '0.5rem',
            fontSize: '0.9rem',
            color: '#fff',
            fontWeight: '500'
          }}>
            {parentId ? "Reply" : "Add a comment"}
          </label>

          {!parentId && (
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
              style={{
                width: '100%',
                padding: '0.5rem',
                marginBottom: '0.5rem',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                background: 'rgba(0, 0, 0, 0.3)',
                color: '#fff',
                fontSize: '0.9rem'
              }}
              required
            />
          )}

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder}
            rows={parentId ? 3 : 4}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              background: 'rgba(0, 0, 0, 0.3)',
              color: '#fff',
              fontSize: '0.9rem',
              resize: 'vertical',
              minHeight: parentId ? '60px' : '80px'
            }}
            required
          />
        </div>

        {error && (
          <div style={{
            color: '#ef4444',
            fontSize: '0.9rem',
            marginBottom: '1rem',
            padding: '0.5rem',
            background: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '4px'
          }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              padding: '0.5rem 1rem',
              background: '#0070f3',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '0.9rem',
              fontWeight: '500',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              opacity: isSubmitting ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isSubmitting ? "Posting..." : parentId ? "Reply" : "Post Comment"}
          </button>

          {parentId && (
            <button
              type="button"
              onClick={() => {
                // This would be handled by parent component to cancel reply
              }}
              style={{
                padding: '0.5rem 1rem',
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '4px',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}
