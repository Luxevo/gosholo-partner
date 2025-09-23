"use client"

import { useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Upload, X, Image as ImageIcon, Loader2 } from "lucide-react"
import Image from "next/image"
import { useLanguage } from "@/contexts/language-context"
import { t } from "@/lib/category-translations"

interface ImageUploadProps {
  bucket: string // e.g., "images"
  folder: string // e.g., "commerces", "offers", "events"
  onUploadComplete: (url: string) => void
  onUploadError?: (error: string) => void
  currentImage?: string | null
  onRemoveImage?: () => void
  className?: string
}

export default function ImageUpload({
  bucket,
  folder,
  onUploadComplete,
  onUploadError,
  currentImage,
  onRemoveImage,
  className = ""
}: ImageUploadProps) {
  const supabase = createClient()
  const { locale } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleFileSelect = async (file: File) => {
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    console.log('File type detected:', file.type, 'File name:', file.name)
    
    if (!allowedTypes.includes(file.type)) {
      // Fallback: check file extension if MIME type detection fails
      const fileName = file.name.toLowerCase()
      const hasValidExtension = fileName.endsWith('.jpg') || 
                               fileName.endsWith('.jpeg') || 
                               fileName.endsWith('.png') || 
                               fileName.endsWith('.webp') || 
                               fileName.endsWith('.gif')
      
      if (!hasValidExtension) {
        onUploadError?.(`Type de fichier non supporté (${file.type}). Utilisez JPG, PNG, WebP ou GIF.`)
        return
      }
    }

    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      onUploadError?.("Le fichier est trop volumineux. Maximum 5 MB.")
      return
    }

    setIsUploading(true)

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file)

      if (error) {
        console.error('Upload error:', error)
        onUploadError?.("Erreur lors du téléchargement de l'image.")
        return
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath)

      onUploadComplete(publicUrl)
    } catch (error) {
      console.error('Upload error:', error)
      onUploadError?.("Erreur lors du téléchargement de l'image.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleRemoveImage = () => {
    onRemoveImage?.()
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {currentImage ? (
        // Show current image
        <Card className="relative overflow-hidden">
          <div className="w-48 h-24 relative bg-gray-50 mx-auto" style={{ aspectRatio: '2/1' }}>
            <Image
              src={currentImage}
              alt="Image téléchargée"
              fill
              className="object-cover rounded"
            />
            {onRemoveImage && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={handleRemoveImage}
                disabled={isUploading}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>
      ) : (
        // Upload area
        <Card
          className={`border-2 border-dashed transition-colors cursor-pointer ${
            dragActive 
              ? 'border-brand-primary bg-brand-primary/5' 
              : 'border-gray-300 hover:border-brand-primary'
          } ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
          onClick={!isUploading ? handleButtonClick : undefined}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="p-8 text-center">
            {isUploading ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 mx-auto animate-spin text-brand-primary" />
                <p className="text-sm text-gray-600">Téléchargement en cours...</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="mx-auto w-12 h-12 bg-brand-light/20 rounded-full flex items-center justify-center">
                  <ImageIcon className="h-6 w-6 text-brand-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-brand-primary">
                    {locale === 'en' ? 'Click to upload an image' : 'Cliquez pour télécharger une image'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {locale === 'en' ? 'or drag and drop your file here' : 'ou glissez-déposez votre fichier ici'}
                  </p>
                  <div className="mt-3 text-xs text-gray-500 space-y-1 text-center">
                    <div>📐 {locale === 'en' ? 'Any format works - we\'ll crop it perfectly!' : 'N\'importe quel format - nous l\'ajusterons parfaitement !'}</div>
                    <div>📁 {locale === 'en' ? 'Formats: JPG, PNG, WebP, GIF' : 'Formats : JPG, PNG, WebP, GIF'}</div>
                    <div>💾 {locale === 'en' ? 'Max: 5 MB' : 'Max : 5 MB'}</div>
                  </div>
                </div>
                <div className="flex items-center justify-center">
                  <Button type="button" variant="outline" size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    {locale === 'en' ? 'Choose image' : 'Choisir une image'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}