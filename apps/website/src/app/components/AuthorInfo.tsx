"use client"

import * as React from "react"
import { PersonIcon, StarIcon, CalendarIcon, CommentIcon, FileIcon } from "@primer/octicons-react"

interface User {
  id: string
  username: string
  displayName: string
  email?: string
  avatar?: string
  bio?: string
  reputation: number
  level: string
  docsCreated: number
  commentsPosted: number
  joinedAt: string
  lastActive: string
  badges?: string[]
}

interface AuthorInfoProps {
  authorName: string
  className?: string
}

function getLevelColor(level: string): string {
  switch (level.toLowerCase()) {
    case 'expert': return '#ffd700' // Gold
    case 'advanced': return '#c0c0c0' // Silver
    case 'intermediate': return '#cd7f32' // Bronze
    case 'contributor': return '#10b981' // Green
    default: return '#6b7280' // Gray
  }
}

function getLevelIcon(level: string): JSX.Element {
  switch (level.toLowerCase()) {
    case 'expert': return <StarIcon size={14} />
    case 'advanced': return <StarIcon size={14} />
    case 'intermediate': return <StarIcon size={14} />
    case 'contributor': return <StarIcon size={14} />
    default: return <PersonIcon size={14} />
  }
}

export function AuthorInfo({ authorName, className = "" }: AuthorInfoProps) {
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState("")

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/users?username=${encodeURIComponent(authorName)}`)
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch user")
        }

        setUser(data.user || null)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load author info")
      } finally {
        setLoading(false)
      }
    }

    if (authorName) {
      fetchUser()
    }
  }, [authorName])

  if (loading) {
    return (
      <div className={`author-info ${className}`} style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#888',
          fontSize: '0.9rem'
        }}>
          <PersonIcon size={16} />
          <span>Loading author info...</span>
        </div>
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className={`author-info ${className}`} style={{
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          color: '#888',
          fontSize: '0.9rem'
        }}>
          <PersonIcon size={16} />
          <span>By: {authorName}</span>
        </div>
      </div>
    )
  }

  const levelColor = getLevelColor(user.level)

  return (
    <div className={`author-info ${className}`} style={{
      background: 'rgba(255, 255, 255, 0.05)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      borderRadius: '8px',
      padding: '1rem',
      marginBottom: '1.5rem'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem'
      }}>
        {/* Avatar */}
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          background: user.avatar ? `url(${user.avatar})` : '#0070f3',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          flexShrink: 0
        }}>
          {!user.avatar && user.displayName.charAt(0).toUpperCase()}
        </div>

        {/* Author Details */}
        <div style={{ flex: 1 }}>
          {/* Name and Level */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.25rem',
            flexWrap: 'wrap'
          }}>
            <h4 style={{
              margin: 0,
              color: '#fff',
              fontSize: '1rem',
              fontWeight: '600'
            }}>
              {user.displayName}
            </h4>

            {/* Level Badge */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              background: levelColor,
              color: levelColor === '#ffd700' ? '#000' : '#fff',
              padding: '0.2rem 0.5rem',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: '600'
            }}>
              {getLevelIcon(user.level)}
              <span>{user.level}</span>
            </div>
          </div>

          {/* Reputation Score */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            marginBottom: '0.5rem'
          }}>
            <StarIcon size={14} style={{ color: '#ffd700' }} />
            <span style={{
              color: '#ffd700',
              fontSize: '0.9rem',
              fontWeight: '600'
            }}>
              {user.reputation} reputation
            </span>
          </div>

          {/* Bio */}
          {user.bio && (
            <p style={{
              margin: '0 0 0.75rem 0',
              color: '#ccc',
              fontSize: '0.9rem',
              lineHeight: '1.4'
            }}>
              {user.bio}
            </p>
          )}

          {/* Stats */}
          <div style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#888',
              fontSize: '0.8rem'
            }}>
              <FileIcon size={12} />
              <span>{user.docsCreated} docs created</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#888',
              fontSize: '0.8rem'
            }}>
              <CommentIcon size={12} />
              <span>{user.commentsPosted} comments</span>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              color: '#888',
              fontSize: '0.8rem'
            }}>
              <CalendarIcon size={12} />
              <span>Joined {new Date(user.joinedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Badges */}
          {user.badges && user.badges.length > 0 && (
            <div style={{
              marginTop: '0.75rem',
              display: 'flex',
              gap: '0.5rem',
              flexWrap: 'wrap'
            }}>
              {user.badges.map((badge, index) => (
                <span
                  key={index}
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#fff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '10px',
                    fontSize: '0.75rem',
                    fontWeight: '500'
                  }}
                >
                  {badge}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
