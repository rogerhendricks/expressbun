import prisma from "../utils/prisma.js";

// Function to get all reports
exports.getReports = async () => {
  const reports = await prisma.report.findMany({
    include: {
      appointment: {
        include: {
          patient: true
        }
      }
    }
  });
  return reports;
};

// Function to get report by ID
exports.getReportById = async (id) => {
  const report = await prisma.report.findUnique({
    where: { id: Number(id) },
    include: {
      appointment: {
        include: {
          patient: true
        }
      }
    }
  });
  return report;
};

// Function to generate reports based on date range
exports.getReportByDateRange = async (startDate, endDate) => {
  const appointments = await prisma.appointment.findMany({
    where: {
      AND: [
        { date: { gte: new Date(startDate) } },
        { date: { lte: new Date(endDate) } },
      ],
    },
    include: {
      patient: true,
    },
  });

  const reportData = appointments.map(appointment => ({
    patientName: appointment.patient.name,
    checkupType: appointment.checkupType,
    date: appointment.date,
  }));

  return reportData;
};

// Function to get reports by type
exports.getReportByType = async (type) => {
  const appointments = await prisma.appointment.findMany({
    where: {
      checkupType: type
    },
    include: {
      patient: true
    }
  });
  
  return appointments;
};

// Function to generate summary report
exports.getVisitSummary = async () => {
  const totalAppointments = await prisma.appointment.count();
  
  // Count by checkup type
  const annualCheckups = await prisma.appointment.count({
    where: { checkupType: 'annual' }
  });
  
  const biannualCheckups = await prisma.appointment.count({
    where: { checkupType: 'biannual' }
  });
  
  // Count remote vs in-person
  const remoteAppointments = await prisma.appointment.count({
    where: { isRemote: true }
  });
  
  const inPersonAppointments = await prisma.appointment.count({
    where: { isRemote: false }
  });
  
  return {
    totalAppointments,
    byType: {
      annualCheckups,
      biannualCheckups
    },
    byMode: {
      remoteAppointments,
      inPersonAppointments
    }
  };
};