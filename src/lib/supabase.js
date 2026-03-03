/**
 * Crear el cliente de Supabase
 * Archivo centralizado que inicializa la conexión
 */

import { createClient } from '@supabase/supabase-js'

/**
 * import.meta.env es la forma en que Vite lee las variables que están en el archivo .env
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)