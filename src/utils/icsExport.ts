import { JobApplication } from '../types';

export function getGoogleCalendarUrl(job: Partial<JobApplication>): string {
  if (!job.followUpDate) return '#';
  const cleanDate = job.followUpDate.replace(/-/g, '');
  const title = encodeURIComponent(`Follow up with ${job.company || 'Company'} - ${job.position || 'Role'}`);
  const details = encodeURIComponent(
    `Reminder to follow up on job application for ${job.position || 'Role'} at ${job.company || 'Company'}.\n\nJob URL: ${job.jobUrl || 'N/A'}\nNotes: ${job.notes || ''}`
  );
  // Full day event or 9am event
  const startDate = `${cleanDate}T090000Z`;
  const endDate = `${cleanDate}T100000Z`;
  
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}`;
}

export function getOutlookCalendarUrl(job: Partial<JobApplication>): string {
  if (!job.followUpDate) return '#';
  const cleanDate = job.followUpDate;
  const title = encodeURIComponent(`Follow up with ${job.company || 'Company'} - ${job.position || 'Role'}`);
  const details = encodeURIComponent(
    `Reminder to follow up on job application for ${job.position || 'Role'} at ${job.company || 'Company'}.\nJob URL: ${job.jobUrl || 'N/A'}`
  );
  return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${title}&body=${details}&startdt=${cleanDate}T09:00:00Z&enddt=${cleanDate}T10:00:00Z`;
}

export function downloadIcsFile(job: Partial<JobApplication>) {
  if (!job.followUpDate) return;

  const cleanDate = job.followUpDate.replace(/-/g, '');
  const company = job.company || 'Company';
  const position = job.position || 'Job';
  const notes = (job.notes || '').replace(/\n/g, '\\n');
  const jobUrl = job.jobUrl || 'N/A';

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobTrack Kanban//Job Application Reminder//EN',
    'BEGIN:VEVENT',
    `SUMMARY:Follow up with ${company} for ${position}`,
    `DESCRIPTION:Reminder to follow up on your job application for ${position} at ${company}.\\n\\nJob URL: ${jobUrl}\\nNotes: ${notes}`,
    `DTSTART:${cleanDate}T090000Z`,
    `DTEND:${cleanDate}T093000Z`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'TRIGGER:-PT15M',
    'ACTION:DISPLAY',
    'DESCRIPTION:Job Application Follow-up Reminder',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `followup-${company.toLowerCase().replace(/[^a-z0-9]/g, '-')}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function downloadBulkIcsFile(jobs: JobApplication[]) {
  const jobsWithFollowUp = jobs.filter(j => j.followUpDate);
  if (jobsWithFollowUp.length === 0) return;

  const eventsList = jobsWithFollowUp.map(job => {
    const cleanDate = job.followUpDate.replace(/-/g, '');
    const company = job.company || 'Company';
    const position = job.position || 'Job';
    const notes = (job.notes || '').replace(/\n/g, '\\n');
    const jobUrl = job.jobUrl || 'N/A';

    return [
      'BEGIN:VEVENT',
      `SUMMARY:Follow up: ${company} (${position})`,
      `DESCRIPTION:Follow up on job application at ${company}.\\nURL: ${jobUrl}\\nNotes: ${notes}`,
      `DTSTART:${cleanDate}T090000Z`,
      `DTEND:${cleanDate}T093000Z`,
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      'DESCRIPTION:Follow-up Reminder',
      'END:VALARM',
      'END:VEVENT'
    ].join('\n');
  });

  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//JobTrack Kanban//All Reminders//EN',
    ...eventsList,
    'END:VCALENDAR'
  ].join('\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `all-job-reminders.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
