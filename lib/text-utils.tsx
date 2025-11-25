import React from 'react'

/**
 * Converts URLs in text to clickable links
 * @param text - The text that may contain URLs
 * @returns React elements with clickable links
 */
export function renderTextWithLinks(text: string): React.ReactNode {
  if (!text) return text

  // Regex to match URLs (http, https, www, or just domain names)
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.[a-zA-Z]{2,}[^\s]*)/g

  const parts: React.ReactNode[] = []
  let lastIndex = 0
  let match

  while ((match = urlRegex.exec(text)) !== null) {
    // Add text before the URL
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index))
    }

    // Process the URL
    let url = match[0]
    let displayUrl = url

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      if (url.startsWith('www.')) {
        url = 'https://' + url
      } else {
        url = 'https://' + url
      }
    }

    // Add clickable link
    parts.push(
      <a
        key={match.index}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 hover:underline break-all"
      >
        {displayUrl}
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

