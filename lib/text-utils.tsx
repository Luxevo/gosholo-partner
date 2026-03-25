import React from 'react'

/**
 * Converts URLs in text to clickable links
 * @param text - The text that may contain URLs
 * @returns React elements with clickable links
 */
export function renderTextWithLinks(text: string): React.ReactNode {
  if (!text) return text

  // Regex to match emails first, then URLs (order matters to avoid partial email matches)
  const linkRegex = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})|(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = linkRegex.exec(text)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    const isEmail = !!match[1]
    const display = match[0]
    const href = isEmail
      ? `mailto:${display}`
      : display.startsWith('http://') || display.startsWith('https://')
        ? display
        : 'https://' + display

    parts.push(
      <a
        key={match.index}
        href={href}
        target={isEmail ? undefined : '_blank'}
        rel={isEmail ? undefined : 'noopener noreferrer'}
        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
      >
        {display}
      </a>
    )

    lastIndex = match.index + match[0].length
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex))
  }

  return parts.length > 0 ? <>{parts}</> : text
}

