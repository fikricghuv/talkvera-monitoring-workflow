// src/services/operasionalBisnisToolUsageService.ts

import { supabase } from '@/integrations/supabase/client';
import type { OperasionalBisnisOverviewFilters } from '@/types/operasionalBisnisToolUsage';

/**
 * Fetch all data needed for OperasionalBisnis overview
 */
export const fetchOperasionalBisnisOverviewData = async (
  filters: OperasionalBisnisOverviewFilters
) => {
  const { startDate, endDate, sourceFilter, lifecycleFilter, leadStatusFilter } = filters;

  try {
    // Get current client ID from auth
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Fetch CRM contacts with filters
    let contactsQuery = supabase
      .from('dt_crm_contacts')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (sourceFilter && sourceFilter !== 'all') {
      contactsQuery = contactsQuery.eq('first_source', sourceFilter);
    }

    if (lifecycleFilter) {
      contactsQuery = contactsQuery.eq('lifecycle_stage', lifecycleFilter);
    }

    if (leadStatusFilter) {
      contactsQuery = contactsQuery.eq('lead_status', leadStatusFilter);
    }

    const { data: contacts, error: contactsError } = await contactsQuery;
    if (contactsError) throw contactsError;

    // Fetch chat sessions with filters
    let sessionsQuery = supabase
      .from('dt_chat_sessions')
      .select('*')
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    if (sourceFilter && sourceFilter !== 'all') {
      sessionsQuery = sessionsQuery.eq('source', sourceFilter);
    }

    const { data: sessions, error: sessionsError } = await sessionsQuery;
    if (sessionsError) throw sessionsError;

    // Fetch appointments with filters
    let appointmentsQuery = supabase
      .from('dt_crm_appointments')
      .select('*')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (sourceFilter && sourceFilter !== 'all') {
      appointmentsQuery = appointmentsQuery.eq('source', sourceFilter);
    }

    const { data: appointments, error: appointmentsError } = await appointmentsQuery;
    if (appointmentsError) throw appointmentsError;

    return {
      contacts: contacts || [],
      sessions: sessions || [],
      appointments: appointments || [],
    };
  } catch (error) {
    console.error('Error fetching OperasionalBisnis overview data:', error);
    throw error;
  }
};

/**
 * Fetch detailed contact information with related data
 */
export const fetchContactDetails = async (contactId: string) => {
  try {
    // Fetch contact details
    const { data: contact, error: contactError } = await supabase
      .from('dt_crm_contacts')
      .select('*')
      .eq('id', contactId)
      .single();

    if (contactError) throw contactError;

    // Fetch related sessions
    const { data: sessions, error: sessionsError } = await supabase
      .from('dt_chat_sessions')
      .select('*')
      .eq('contact_id', contactId)
      .order('start_time', { ascending: false });

    if (sessionsError) throw sessionsError;

    // Fetch related appointments
    const { data: appointments, error: appointmentsError } = await supabase
      .from('dt_crm_appointments')
      .select('*')
      .eq('contact_id', contactId)
      .order('appointment_start', { ascending: false });

    if (appointmentsError) throw appointmentsError;

    return {
      contact,
      sessions: sessions || [],
      appointments: appointments || [],
    };
  } catch (error) {
    console.error('Error fetching contact details:', error);
    throw error;
  }
};

/**
 * Fetch session messages (both LP and WA)
 */
export const fetchSessionMessages = async (sessionId: string) => {
  try {
    // First, get session details to know the source
    const { data: session, error: sessionError } = await supabase
      .from('dt_chat_sessions')
      .select('source')
      .eq('id', sessionId)
      .single();

    if (sessionError) throw sessionError;

    // Fetch messages based on source
    if (session.source === 'landing_page') {
      const { data: lpMessages, error: lpError } = await supabase
        .from('dt_lp_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (lpError) throw lpError;
      
      // Normalize message structure
      return lpMessages.map(msg => ({
        id: msg.id,
        session_id: msg.session_id,
        sender_type: msg.role === 'agent' ? 'BOT' : 'USER',
        message: msg.message,
        timestamp: msg.created_at,
        feedback: msg.feedback,
        feedback_text: msg.feedback_text,
      }));
      
    } else if (session.source === 'whatsapp') {
      const { data: waMessages, error: waError } = await supabase
        .from('dt_wa_chat_messages')
        .select('*')
        .eq('session_id', sessionId)
        .order('timestamp', { ascending: true });

      if (waError) throw waError;
      
      // Normalize message structure
      return waMessages.map(msg => ({
        id: msg.id,
        session_id: msg.session_id,
        sender_type: msg.sender_type,
        message: msg.message_content,
        timestamp: msg.timestamp,
        context_step: msg.context_step,
      }));
    }

    return [];
  } catch (error) {
    console.error('Error fetching session messages:', error);
    throw error;
  }
};

/**
 * Get session statistics by source
 */
export const fetchSessionStatsBySource = async (
  startDate: string,
  endDate: string
) => {
  try {
    const { data, error } = await supabase
      .from('dt_chat_sessions')
      .select('source, status, total_messages')
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    if (error) throw error;

    // Group by source
    const stats = {
      landing_page: {
        total: 0,
        completed: 0,
        in_progress: 0,
        abandoned: 0,
        total_messages: 0,
        avg_messages: 0,
      },
      whatsapp: {
        total: 0,
        completed: 0,
        in_progress: 0,
        abandoned: 0,
        total_messages: 0,
        avg_messages: 0,
      },
    };

    data.forEach(session => {
      const sourceKey = session.source as 'landing_page' | 'whatsapp';
      if (!stats[sourceKey]) return;

      stats[sourceKey].total++;
      stats[sourceKey].total_messages += session.total_messages || 0;
      
      if (session.status === 'COMPLETED') {
        stats[sourceKey].completed++;
      } else if (session.status === 'IN_PROGRESS') {
        stats[sourceKey].in_progress++;
      } else if (session.status === 'ABANDONED') {
        stats[sourceKey].abandoned++;
      }
    });

    // Calculate averages
    if (stats.landing_page.total > 0) {
      stats.landing_page.avg_messages = stats.landing_page.total_messages / stats.landing_page.total;
    }
    if (stats.whatsapp.total > 0) {
      stats.whatsapp.avg_messages = stats.whatsapp.total_messages / stats.whatsapp.total;
    }

    return stats;
  } catch (error) {
    console.error('Error fetching session stats by source:', error);
    throw error;
  }
};

/**
 * Get conversion funnel data (first_source -> lifecycle_stage)
 */
export const fetchConversionFunnel = async (
  startDate: string,
  endDate: string
) => {
  try {
    const { data: contacts, error: contactsError } = await supabase
      .from('dt_crm_contacts')
      .select('first_source, lifecycle_stage')
      .gte('created_at', startDate)
      .lte('created_at', endDate);

    if (contactsError) throw contactsError;

    const { data: sessions, error: sessionsError } = await supabase
      .from('dt_chat_sessions')
      .select('source, contact_id')
      .gte('start_time', startDate)
      .lte('start_time', endDate);

    if (sessionsError) throw sessionsError;

    // Group by first_source and lifecycle_stage
    const funnel: Record<string, Record<string, number>> = {};

    // Count contacts by source and lifecycle
    contacts.forEach(contact => {
      const source = contact.first_source || 'unknown';
      const stage = contact.lifecycle_stage;

      if (!funnel[source]) {
        funnel[source] = {
          total_contacts: 0,
          lead: 0,
          qualified: 0,
          customer: 0,
          inactive: 0,
        };
      }

      funnel[source].total_contacts++;
      funnel[source][stage]++;
    });

    // Count sessions by source
    const sessionsBySource: Record<string, number> = {};
    sessions.forEach(session => {
      const source = session.source;
      sessionsBySource[source] = (sessionsBySource[source] || 0) + 1;
    });

    // Combine data
    const result = Object.keys(funnel).map(source => ({
      source,
      total_sessions: sessionsBySource[source] || 0,
      total_contacts: funnel[source].total_contacts,
      leads: funnel[source].lead,
      qualified: funnel[source].qualified,
      customers: funnel[source].customer,
      inactive: funnel[source].inactive,
    }));

    return result;
  } catch (error) {
    console.error('Error fetching conversion funnel:', error);
    throw error;
  }
};

/**
 * Update contact information
 */
export const updateContact = async (contactId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('dt_crm_contacts')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', contactId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating contact:', error);
    throw error;
  }
};

/**
 * Create new appointment
 */
export const createAppointment = async (appointmentData: any) => {
  try {
    const { data, error } = await supabase
      .from('dt_crm_appointments')
      .insert([appointmentData])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating appointment:', error);
    throw error;
  }
};

/**
 * Update appointment
 */
export const updateAppointment = async (appointmentId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('dt_crm_appointments')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating appointment:', error);
    throw error;
  }
};