import { ref } from 'vue'
import { supabase } from '../lib/supabase'

const uploading = ref(false)
const uploadError = ref(null)
const uploadProgress = ref(0)

export function useStorage() {
  /**
   * Subir un archivo a Supabase Storage
   * @param {File} file - El archivo a subir
   * @param {string} bucket - Nombre del bucket (ej: 'avatars')
   * @param {string} path - Ruta dentro del bucket (ej: 'user-id/avatar.jpg')
   * @returns {Promise<{ success: boolean, url: string|null, error: string|null }>}
   */
  const uploadFile = async (file, bucket, path) => {
    uploading.value = true
    uploadError.value = null
    uploadProgress.value = 0

    try {
      // Subir el archivo a Storage
      const { data, error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600', // Cache por 1 hora
          upsert: true // Reemplazar si ya existe
        })

      if (uploadError) throw uploadError

      // Construir la URL pública manualmente (más fiable)
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`

      console.log('URL pública construida:', publicUrl)  // ← Debug

      uploadProgress.value = 100
      return { success: true, url: publicUrl, error: null }

    } catch (err) {
      uploadError.value = err.message
      console.error('Error subiendo archivo:', err)
      return { success: false, url: null, error: err.message }
    } finally {
      uploading.value = false
    }
  }

  /**
   * Eliminar un archivo de Supabase Storage
   * @param {string} bucket - Nombre del bucket
   * @param {string} path - Ruta del archivo a eliminar
   * @returns {Promise<{ success: boolean, error: string|null }>}
   */
  const deleteFile = async (bucket, path) => {
    uploading.value = true
    uploadError.value = null

    try {
      const { error: deleteError } = await supabase.storage
        .from(bucket)
        .remove([path])

      if (deleteError) throw deleteError

      return { success: true, error: null }

    } catch (err) {
      uploadError.value = err.message
      console.error('Error eliminando archivo:', err)
      return { success: false, error: err.message }
    } finally {
      uploading.value = false
    }
  }

  /**
   * Obtener la URL pública de un archivo
   * @param {string} bucket - Nombre del bucket
   * @param {string} path - Ruta del archivo
   * @returns {string} URL pública
   */
  const getPublicUrl = (bucket, path) => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
  }

  return {
    uploading,
    uploadError,
    uploadProgress,
    uploadFile,
    deleteFile,
    getPublicUrl
  }
}