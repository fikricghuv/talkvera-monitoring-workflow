// src/hooks/useOperasionalBisnisOverview.ts

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import type {
  OperasionalBisnisOverviewKPI,
  OperasionalBisnisTimeSeriesData,
  ContactSourceDistribution,
  ContactLifecycleDistribution,
  LeadStatusDistribution,
  SessionStatusDistribution,
  AppointmentStatusDistribution,
  TopContact,
  SessionWithContact,
  AppointmentWithContact,
  OperasionalBisnisOverviewFilters,
  ConversionFunnel,
} from '@/types/operasionalBisnisToolUsage';
import { fetchOperasionalBisnisOverviewData } from '@/services/operasionalBisnisToolUsageService';
import {
  groupByDate,
  formatDate,
  calculateSessionDuration,
} from '@/utils/operasionalBisnisToolUsageUtils';
import { MESSAGES } from '@/constants/operasionalBisnisToolUsage';

/**
 * Main hook for OperasionalBisnis overview data
 */
export const useOperasionalBisnisOverview = (filters: OperasionalBisnisOverviewFilters) => {
  const [kpiData, setKpiData] = useState<OperasionalBisnisOverviewKPI>({
    totalContacts: 0,
    newContacts: 0,
    leadsCount: 0,
    qualifiedLeadsCount: 0,
    customersCount: 0,
    inactiveCount: 0,
    totalSessions: 0,
    landingPageSessions: 0,
    whatsappSessions: 0,
    completedSessions: 0,
    inProgressSessions: 0,
    avgMessagesPerSession: 0,
    totalAppointments: 0,
    scheduledAppointments: 0,
    completedAppointments: 0,
    canceledAppointments: 0,
    lpToContactRate: 0,
    waToContactRate: 0,
    contactToAppointmentRate: 0,
  });

  const [timeSeriesData, setTimeSeriesData] = useState<OperasionalBisnisTimeSeriesData[]>([]);
  const [sourceDistribution, setSourceDistribution] = useState<ContactSourceDistribution[]>([]);
  const [lifecycleDistribution, setLifecycleDistribution] = useState<ContactLifecycleDistribution[]>([]);
  const [leadStatusDistribution, setLeadStatusDistribution] = useState<LeadStatusDistribution[]>([]);
  const [sessionStatusDistribution, setSessionStatusDistribution] = useState<SessionStatusDistribution[]>([]);
  const [appointmentStatusDistribution, setAppointmentStatusDistribution] = useState<AppointmentStatusDistribution[]>([]);
  const [conversionFunnels, setConversionFunnels] = useState<ConversionFunnel[]>([]);
  const [topContacts, setTopContacts] = useState<TopContact[]>([]);
  const [recentSessions, setRecentSessions] = useState<SessionWithContact[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { startDate, endDate, sourceFilter, lifecycleFilter, leadStatusFilter } = filters;

  /**
   * Calculate KPI data
   */
  const calculateKPI = useCallback((data: any) => {
    const { contacts, sessions, appointments } = data;

    // Contact metrics
    const totalContacts = contacts.length;
    const newContacts = contacts.filter((c: any) => {
      const createdDate = new Date(c.created_at);
      const filterStartDate = new Date(startDate);
      return createdDate >= filterStartDate;
    }).length;
    
    const leadsCount = contacts.filter((c: any) => c.lifecycle_stage === 'lead').length;
    const qualifiedLeadsCount = contacts.filter((c: any) => c.lifecycle_stage === 'qualified').length;
    const customersCount = contacts.filter((c: any) => c.lifecycle_stage === 'customer').length;
    const inactiveCount = contacts.filter((c: any) => c.lifecycle_stage === 'inactive').length;

    // Session metrics
    const totalSessions = sessions.length;
    const landingPageSessions = sessions.filter((s: any) => s.source === 'landing_page').length;
    const whatsappSessions = sessions.filter((s: any) => s.source === 'whatsapp').length;
    const completedSessions = sessions.filter((s: any) => s.status === 'COMPLETED').length;
    const inProgressSessions = sessions.filter((s: any) => s.status === 'IN_PROGRESS').length;
    
    const totalMessages = sessions.reduce((sum: number, s: any) => sum + (s.total_messages || 0), 0);
    const avgMessagesPerSession = totalSessions > 0 ? totalMessages / totalSessions : 0;

    // Appointment metrics
    const totalAppointments = appointments.length;
    const scheduledAppointments = appointments.filter((a: any) => a.status === 'scheduled').length;
    const completedAppointments = appointments.filter((a: any) => a.status === 'completed').length;
    const canceledAppointments = appointments.filter((a: any) => a.status === 'canceled').length;

    // Conversion rates
    const sessionsWithContact = sessions.filter((s: any) => s.contact_id).length;
    const lpToContactRate = landingPageSessions > 0 
      ? (sessionsWithContact / totalSessions) * 100 
      : 0;
    
    const waToContactRate = whatsappSessions > 0 
      ? (sessionsWithContact / totalSessions) * 100 
      : 0;
    
    const contactToAppointmentRate = totalContacts > 0 
      ? (totalAppointments / totalContacts) * 100 
      : 0;

    return {
      totalContacts,
      newContacts,
      leadsCount,
      qualifiedLeadsCount,
      customersCount,
      inactiveCount,
      totalSessions,
      landingPageSessions,
      whatsappSessions,
      completedSessions,
      inProgressSessions,
      avgMessagesPerSession,
      totalAppointments,
      scheduledAppointments,
      completedAppointments,
      canceledAppointments,
      lpToContactRate,
      waToContactRate,
      contactToAppointmentRate,
    };
  }, [startDate]);

  /**
   * Calculate time series data
   */
  const calculateTimeSeries = useCallback((data: any, dateRange: { start: string; end: string }) => {
    const { contacts, sessions, appointments } = data;
    const grouped = groupByDate(contacts, dateRange);
    
    const seriesData: OperasionalBisnisTimeSeriesData[] = [];
    
    grouped.forEach((_, date) => {
      const contactsOnDate = contacts.filter((c: any) => {
        const contactDate = new Date(c.created_at).toISOString().split('T')[0];
        return contactDate === date;
      }).length;

      const sessionsOnDate = sessions.filter((s: any) => {
        const sessionDate = new Date(s.start_time).toISOString().split('T')[0];
        return sessionDate === date;
      }).length;

      const appointmentsOnDate = appointments.filter((a: any) => {
        const appointmentDate = new Date(a.created_at).toISOString().split('T')[0];
        return appointmentDate === date;
      }).length;

      const lpSessionsOnDate = sessions.filter((s: any) => {
        const sessionDate = new Date(s.start_time).toISOString().split('T')[0];
        return sessionDate === date && s.source === 'landing_page';
      }).length;

      const waSessionsOnDate = sessions.filter((s: any) => {
        const sessionDate = new Date(s.start_time).toISOString().split('T')[0];
        return sessionDate === date && s.source === 'whatsapp';
      }).length;

      seriesData.push({
        date: formatDate(date, "dd MMM"),
        contacts: contactsOnDate,
        sessions: sessionsOnDate,
        appointments: appointmentsOnDate,
        lpSessions: lpSessionsOnDate,
        waSessions: waSessionsOnDate,
      });
    });

    return seriesData;
  }, []);

  /**
   * Calculate source distribution
   */
  const calculateSourceDistribution = useCallback((contacts: any[]) => {
    const landingPage = contacts.filter(c => c.first_source === 'landing_page').length;
    const whatsapp = contacts.filter(c => c.first_source === 'whatsapp').length;
    const manual = contacts.filter(c => c.first_source === 'manual').length;

    const total = contacts.length || 1;

    return [
      { source: 'Landing Page', count: landingPage, percentage: (landingPage / total) * 100 },
      { source: 'WhatsApp', count: whatsapp, percentage: (whatsapp / total) * 100 },
      { source: 'Manual', count: manual, percentage: (manual / total) * 100 },
    ].filter(item => item.count > 0);
  }, []);

  /**
   * Calculate lifecycle distribution
   */
  const calculateLifecycleDistribution = useCallback((contacts: any[]) => {
    const lead = contacts.filter(c => c.lifecycle_stage === 'lead').length;
    const qualified = contacts.filter(c => c.lifecycle_stage === 'qualified').length;
    const customer = contacts.filter(c => c.lifecycle_stage === 'customer').length;
    const inactive = contacts.filter(c => c.lifecycle_stage === 'inactive').length;

    const total = contacts.length || 1;

    return [
      { lifecycle_stage: 'Lead', count: lead, percentage: (lead / total) * 100 },
      { lifecycle_stage: 'Qualified', count: qualified, percentage: (qualified / total) * 100 },
      { lifecycle_stage: 'Customer', count: customer, percentage: (customer / total) * 100 },
      { lifecycle_stage: 'Inactive', count: inactive, percentage: (inactive / total) * 100 },
    ].filter(item => item.count > 0);
  }, []);

  /**
   * Calculate lead status distribution
   */
  const calculateLeadStatusDistribution = useCallback((contacts: any[]) => {
    const newStatus = contacts.filter(c => c.lead_status === 'new').length;
    const inProgress = contacts.filter(c => c.lead_status === 'in_progress').length;
    const followUp = contacts.filter(c => c.lead_status === 'follow_up').length;
    const closedWon = contacts.filter(c => c.lead_status === 'closed_won').length;
    const closedLost = contacts.filter(c => c.lead_status === 'closed_lost').length;

    const total = contacts.length || 1;

    return [
      { lead_status: 'New', count: newStatus, percentage: (newStatus / total) * 100 },
      { lead_status: 'In Progress', count: inProgress, percentage: (inProgress / total) * 100 },
      { lead_status: 'Follow Up', count: followUp, percentage: (followUp / total) * 100 },
      { lead_status: 'Closed Won', count: closedWon, percentage: (closedWon / total) * 100 },
      { lead_status: 'Closed Lost', count: closedLost, percentage: (closedLost / total) * 100 },
    ].filter(item => item.count > 0);
  }, []);

  /**
   * Calculate session status distribution
   */
  const calculateSessionStatusDistribution = useCallback((sessions: any[]) => {
    const inProgress = sessions.filter(s => s.status === 'IN_PROGRESS').length;
    const completed = sessions.filter(s => s.status === 'COMPLETED').length;
    const abandoned = sessions.filter(s => s.status === 'ABANDONED').length;

    const total = sessions.length || 1;

    return [
      { status: 'In Progress', count: inProgress, percentage: (inProgress / total) * 100 },
      { status: 'Completed', count: completed, percentage: (completed / total) * 100 },
      { status: 'Abandoned', count: abandoned, percentage: (abandoned / total) * 100 },
    ].filter(item => item.count > 0);
  }, []);

  /**
   * Calculate appointment status distribution
   */
  const calculateAppointmentStatusDistribution = useCallback((appointments: any[]) => {
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const completed = appointments.filter(a => a.status === 'completed').length;
    const canceled = appointments.filter(a => a.status === 'canceled').length;
    const rescheduled = appointments.filter(a => a.status === 'rescheduled').length;

    const total = appointments.length || 1;

    return [
      { status: 'Scheduled', count: scheduled, percentage: (scheduled / total) * 100 },
      { status: 'Completed', count: completed, percentage: (completed / total) * 100 },
      { status: 'Canceled', count: canceled, percentage: (canceled / total) * 100 },
      { status: 'Rescheduled', count: rescheduled, percentage: (rescheduled / total) * 100 },
    ].filter(item => item.count > 0);
  }, []);

  /**
   * Calculate conversion funnels
   */
  const calculateConversionFunnels = useCallback((data: any) => {
    const { contacts, sessions, appointments } = data;
    
    const sources = ['landing_page', 'whatsapp', 'manual'];
    const funnels: ConversionFunnel[] = [];

    sources.forEach(source => {
      const sourceSessions = sessions.filter((s: any) => s.source === source);
      const sourceContacts = contacts.filter((c: any) => c.first_source === source);
      const sourceAppointments = appointments.filter((a: any) => a.source === source);

      const totalSessions = sourceSessions.length;
      const contactsCreated = sourceContacts.length;
      const appointmentsBooked = sourceAppointments.length;

      funnels.push({
        source: source === 'landing_page' ? 'Landing Page' : 
                source === 'whatsapp' ? 'WhatsApp' : 'Manual',
        totalSessions,
        contactsCreated,
        appointmentsBooked,
        sessionToContactRate: totalSessions > 0 ? (contactsCreated / totalSessions) * 100 : 0,
        contactToAppointmentRate: contactsCreated > 0 ? (appointmentsBooked / contactsCreated) * 100 : 0,
      });
    });

    return funnels.filter(f => f.totalSessions > 0 || f.contactsCreated > 0);
  }, []);

  /**
   * Get top contacts
   */
  const getTopContacts = useCallback((data: any) => {
    const { contacts, sessions, appointments } = data;

    const contactsWithMetrics = contacts.map((contact: any) => {
      const contactSessions = sessions.filter((s: any) => s.contact_id === contact.id);
      const contactAppointments = appointments.filter((a: any) => a.contact_id === contact.id);

      return {
        ...contact,
        total_sessions: contactSessions.length,
        total_appointments: contactAppointments.length,
      };
    });

    return contactsWithMetrics
      .sort((a: any, b: any) => {
        // Sort by lead score first, then by total sessions
        if (b.lead_score !== a.lead_score) {
          return b.lead_score - a.lead_score;
        }
        return b.total_sessions - a.total_sessions;
      })
      .slice(0, 10);
  }, []);

  /**
   * Get recent sessions
   */
  const getRecentSessions = useCallback((data: any) => {
    const { sessions, contacts } = data;

    const sessionsWithContact = sessions.map((session: any) => {
      const contact = contacts.find((c: any) => c.id === session.contact_id);
      return {
        ...session,
        duration_minutes: calculateSessionDuration(session.start_time, session.end_time),
        contact_name: contact?.full_name || null,
        contact_email: contact?.email || null,
      };
    });

    return sessionsWithContact
      .sort((a: any, b: any) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())
      .slice(0, 10);
  }, []);

  /**
   * Get upcoming appointments
   */
  const getUpcomingAppointments = useCallback((data: any) => {
    const { appointments, contacts } = data;

    const appointmentsWithContact = appointments.map((appointment: any) => {
      const contact = contacts.find((c: any) => c.id === appointment.contact_id);
      return {
        ...appointment,
        contact_name: contact?.full_name || null,
        contact_email: contact?.email || null,
        contact_phone: contact?.phone || null,
      };
    });

    const now = new Date();
    return appointmentsWithContact
      .filter((a: any) => new Date(a.appointment_start) >= now)
      .sort((a: any, b: any) => new Date(a.appointment_start).getTime() - new Date(b.appointment_start).getTime())
      .slice(0, 10);
  }, []);

  /**
   * Fetch and process all data
   */
  const fetchData = useCallback(async () => {
    setIsLoading(true);

    try {
      const currentFilters: OperasionalBisnisOverviewFilters = {
        startDate,
        endDate,
        sourceFilter,
        lifecycleFilter,
        leadStatusFilter,
      };

      const data = await fetchOperasionalBisnisOverviewData(currentFilters);

      const kpi = calculateKPI(data);
      setKpiData(kpi);

      const timeSeries = calculateTimeSeries(data, { start: startDate, end: endDate });
      setTimeSeriesData(timeSeries);

      const sourceDistrib = calculateSourceDistribution(data.contacts);
      setSourceDistribution(sourceDistrib);

      const lifecycleDistrib = calculateLifecycleDistribution(data.contacts);
      setLifecycleDistribution(lifecycleDistrib);

      const leadStatusDistrib = calculateLeadStatusDistribution(data.contacts);
      setLeadStatusDistribution(leadStatusDistrib);

      const sessionStatusDistrib = calculateSessionStatusDistribution(data.sessions);
      setSessionStatusDistribution(sessionStatusDistrib);

      const appointmentStatusDistrib = calculateAppointmentStatusDistribution(data.appointments);
      setAppointmentStatusDistribution(appointmentStatusDistrib);

      const funnels = calculateConversionFunnels(data);
      setConversionFunnels(funnels);

      const topContactsList = getTopContacts(data);
      setTopContacts(topContactsList);

      const recentSessionsList = getRecentSessions(data);
      setRecentSessions(recentSessionsList);

      const upcomingAppts = getUpcomingAppointments(data);
      setUpcomingAppointments(upcomingAppts);

    } catch (error) {
      console.error("Error fetching OperasionalBisnis overview data:", error);
      toast.error(MESSAGES.ERROR_FETCH);
    } finally {
      setIsLoading(false);
    }
  }, [
    startDate,
    endDate,
    sourceFilter,
    lifecycleFilter,
    leadStatusFilter,
    calculateKPI,
    calculateTimeSeries,
    calculateSourceDistribution,
    calculateLifecycleDistribution,
    calculateLeadStatusDistribution,
    calculateSessionStatusDistribution,
    calculateAppointmentStatusDistribution,
    calculateConversionFunnels,
    getTopContacts,
    getRecentSessions,
    getUpcomingAppointments
  ]);

  /**
   * Refresh data
   */
  const refreshData = useCallback(() => {
    fetchData();
    toast.success(MESSAGES.SUCCESS_REFRESH);
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    kpiData,
    timeSeriesData,
    sourceDistribution,
    lifecycleDistribution,
    leadStatusDistribution,
    sessionStatusDistribution,
    appointmentStatusDistribution,
    conversionFunnels,
    topContacts,
    recentSessions,
    upcomingAppointments,
    isLoading,
    refreshData,
  };
};