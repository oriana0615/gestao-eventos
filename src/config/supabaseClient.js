
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
});

export async function processQRCode(qrData) {
  try {
    console.log('[QR_DEBUG] Dados brutos recebidos:', qrData);

    // Caso 1: QR é uma URL (ex: "https://exemplo.com/eventos/123")
    if (qrData.startsWith('http')) {
      console.log('[QR_DEBUG] Tipo detectado: URL');
      const url = new URL(qrData);
      const id = url.pathname.split('/').find(part => part.match(/^\d+$/));
      if (!id) throw new Error('URL não contém ID válido');
      return await fetchEventWithLog(id, 'url');
    }

    // Caso 2: Formato "evento:123"
    if (qrData.includes('evento:')) {
      console.log('[QR_DEBUG] Tipo detectado: formato evento:id');
      const [, id] = qrData.split(':');
      return await fetchEventWithLog(id, 'evento');
    }

    // Caso 3: Formato "EV-123" (novo formato suportado)
    if (qrData.match(/^EV-\d+$/i)) {
      console.log('[QR_DEBUG] Tipo detectado: formato EV-id');
      const [, id] = qrData.split('-');
      return await fetchEventWithLog(id, 'ev');
    }

    // Caso 4: Apenas ID numérico (ex: "123")
    if (qrData.match(/^\d+$/)) {
      console.log('[QR_DEBUG] Tipo detectado: ID direto');
      return await fetchEventWithLog(qrData, 'direct');
    }

    throw new Error(`Formato não suportado: ${qrData.substring(0, 20)}...`);

  } catch (error) {
    console.error('[QR_ERROR]', {
      error: error.message,
      qrData,
      timestamp: new Date().toISOString()
    });
    throw error;
  }
}

// Função auxiliar com logs
async function fetchEventWithLog(id, type) {
  console.log(`[QR_DEBUG] Buscando evento ID: ${id} (Tipo: ${type})`);
  
  const { data, error } = await supabase
    .from('eventos')
    .select('id, nome, data, local')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    console.error('[QR_ERROR] Evento não encontrado', { id, error });
    throw new Error('Evento não encontrado');
  }

  console.log('[QR_SUCCESS] Evento encontrado:', { id, nome: data.nome });
  return data;
}

/**
 * Registra ações de escaneamento com mais detalhes
 */
export async function logScanAction({ userId, actionType, qrData, metadata = {} }) {
  const logData = {
    user_id: userId,
    action_type: actionType,
    qr_data: qrData.substring(0, 255), // Limita tamanho
    device_info: navigator?.userAgent || 'mobile-app',
    metadata: {
      qr_type: detectQRType(qrData),
      ...metadata
    }
  };

  console.log('[LOG_ENTRY]', logData);
  
  return await supabase
    .from('logs_qrcode')
    .insert([logData]);
}

// Detecta automaticamente o tipo de QR
function detectQRType(qrData) {
  if (qrData.startsWith('http')) return 'url';
  if (qrData.includes('evento:')) return 'evento';
  if (qrData.match(/^EV-\d+$/i)) return 'ev_format';
  if (qrData.match(/^\d+$/)) return 'direct_id';
  return 'unknown';
}

