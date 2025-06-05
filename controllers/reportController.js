import asyncHandler from "express-async-handler";
import prisma from "../utils/prisma.js";
import multer from 'multer';
import path from 'path';
import fs  from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const { patientId, reportDate } = req.body;

    // Add logging to check the values
    console.log('patientId:', patientId);
    console.log('reportDate:', reportDate);

    if (!patientId || !reportDate) {
      return cb(new Error('Missing patientId or reportDate'));
    }

    const dir = path.join(__dirname, 'uploads', patientId, reportDate);

    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, 'uploadedFile.pdf');
  },
});
const upload = multer({ storage }).single('file')
// const upload = multer({ storage }).fields([
//   { name: 'file', maxCount: 1 },
//   { name: 'patientId' },
//   { name: 'reportDate' },
//   { name: 'reportType' },
//   { name: 'reportStatus' },
//   { name: 'currentHeartRate' },
//   { name: 'currentRhythm' },
//   { name: 'currentDependency' },
//   { name: 'mdc_idc_stat_ataf_burden_percent' },
//   { name: 'mdc_idc_set_brady_mode' },
//   { name: 'mdc_idc_set_brady_lowrate' },
//   { name: 'mdc_idc_set_brady_max_tracking_rate' },
//   { name: 'mdc_idc_set_brady_max_sensor_rate' },
//   { name: 'mdc_idc_dev_sav' },
//   { name: 'mdc_idc_dev_pav' },
//   { name: 'mdc_idc_stat_brady_ra_percent_paced' },
//   { name: 'mdc_idc_stat_brady_rv_percent_paced' },
//   { name: 'mdc_idc_stat_brady_lv_percent_paced' },
//   { name: 'mdc_idc_stat_brady_biv_percent_paced' },
//   { name: 'mdc_idc_batt_volt' },
//   { name: 'mdc_idc_batt_remaining' },
//   { name: 'mdc_idc_batt_status' },
//   { name: 'mdc_idc_cap_charge_time' },
//   { name: 'mdc_idc_msmt_ra_impedance_mean' },
//   { name: 'mdc_idc_msmt_ra_sensing' },
//   { name: 'mdc_idc_msmt_ra_pacing_threshold' },
//   { name: 'mdc_idc_msmt_ra_pw' },
//   { name: 'mdc_idc_msmt_rv_impedance_mean' },
//   { name: 'mdc_idc_msmt_rv_sensing' },
//   { name: 'mdc_idc_msmt_rv_pacing_threshold' },
//   { name: 'mdc_idc_msmt_rv_pw' },
//   { name: 'mdc_idc_msmt_shock_impedance' },
//   { name: 'mdc_idc_msmt_lv_impedance_mean' },
//   { name: 'mdc_idc_msmt_lv_sensing' },
//   { name: 'mdc_idc_msmt_lv_pacing_threshold' },
//   { name: 'mdc_idc_msmt_lv_pw' },
//   { name: 'comments' },
//   { name: 'isCompleted' },
// ]);


// @desc    Get all reports
// @route   GET /api/reports
// @access  Private
const findAll = asyncHandler(async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        patient: true
      }
    });
    res.status(200).json(reports);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @desc    Get single report
// @route   GET /api/reports/:id using request.params, /api/reports?id=1 using request.query
// @access  Private
const getReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // const { id } = req.query;
  const report = await prisma.report.findUnique({
    where: { id: parseInt(id) },
    include: {
      patient: true
    }
  });

  if (report) {
    res.status(200).json(report);
  } else {
    res.status(404).json({ error: 'Report not found' });
  }
});

// @desc    Get a list of reports for a specific patient
// @route   GET /api/reports/patient/:id
// @access  Private
const getReportsByPatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const reports = await prisma.report.findMany({
    where: { patientId: parseInt(id) },
    // include: {
    //   patient: true,
      
    // },
    select: {
      id: true,
      reportDate: true,
      reportType: true,
      reportStatus: true,
      isCompleted: true,
      patient: true
    },
    orderBy: {
      reportDate: 'desc'
    },
  });
  if (reports) {
    res.status(200).json(reports);
  } else {
    res.status(404).json({ error: 'Reports not found' });
  }
});


// @desc    Get single report
// @route   GET /api/reports/:id
// @access  Private
const createReport = asyncHandler(async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error('File upload error:', err);
      return res.status(500).json({ error: 'File upload failed' });
    }
    console.log('File uploaded successfully');
  const {
      patientId,
      reportDate,
      reportType,
      reportStatus,
      currentHeartRate,
      currentRhythm,
      currentDependency,
      mdc_idc_stat_ataf_burden_percent,
      mdc_idc_set_brady_mode,
      mdc_idc_set_brady_lowrate,
      mdc_idc_set_brady_max_tracking_rate,
      mdc_idc_set_brady_max_sensor_rate,
      mdc_idc_dev_sav,
      mdc_idc_dev_pav,
      mdc_idc_stat_brady_ra_percent_paced,
      mdc_idc_stat_brady_rv_percent_paced,
      mdc_idc_stat_brady_lv_percent_paced,
      mdc_idc_stat_brady_biv_percent_paced,
      mdc_idc_batt_volt,
      mdc_idc_batt_remaining,
      mdc_idc_batt_status,
      mdc_idc_cap_charge_time,
      mdc_idc_msmt_ra_impedance_mean,
      mdc_idc_msmt_ra_sensing,
      mdc_idc_msmt_ra_pacing_threshold,
      mdc_idc_msmt_ra_pw,
      mdc_idc_msmt_rv_impedance_mean,
      mdc_idc_msmt_rv_sensing,
      mdc_idc_msmt_rv_pacing_threshold,
      mdc_idc_msmt_rv_pw,
      mdc_idc_msmt_shock_impedance,
      mdc_idc_msmt_lv_impedance_mean,
      mdc_idc_msmt_lv_sensing,
      mdc_idc_msmt_lv_pacing_threshold,
      mdc_idc_msmt_lv_pw,
      comments,
      isCompleted,
      // file_path // Add this field to the request body
    } = req.body;
  
    const userId = req.user.id;
    const filePath = path.join('storage', patientId, reportDate, 'uploadedFile.pdf');
  try{
    const report = await prisma.report.create({
      data: {
        patientId, //: parseInt(patientId)
        userId,
        reportDate, //: new Date(reportDate)
        reportType,
        reportStatus,
        currentHeartRate,
        currentRhythm,
        currentDependency,
        mdc_idc_stat_ataf_burden_percent,
        mdc_idc_set_brady_mode,
        mdc_idc_set_brady_lowrate,
        mdc_idc_set_brady_max_tracking_rate,
        mdc_idc_set_brady_max_sensor_rate,
        mdc_idc_dev_sav,
        mdc_idc_dev_pav,
        mdc_idc_stat_brady_ra_percent_paced,
        mdc_idc_stat_brady_rv_percent_paced,
        mdc_idc_stat_brady_lv_percent_paced,
        mdc_idc_stat_brady_biv_percent_paced,
        mdc_idc_batt_volt,
        mdc_idc_batt_remaining,
        mdc_idc_batt_status,
        mdc_idc_cap_charge_time,
        mdc_idc_msmt_ra_impedance_mean,
        mdc_idc_msmt_ra_sensing,
        mdc_idc_msmt_ra_pacing_threshold,
        mdc_idc_msmt_ra_pw,
        mdc_idc_msmt_rv_impedance_mean,
        mdc_idc_msmt_rv_sensing,
        mdc_idc_msmt_rv_pacing_threshold,
        mdc_idc_msmt_rv_pw,
        mdc_idc_msmt_shock_impedance,
        mdc_idc_msmt_lv_impedance_mean,
        mdc_idc_msmt_lv_sensing,
        mdc_idc_msmt_lv_pacing_threshold,
        mdc_idc_msmt_lv_pw,
        comments,
        isCompleted,
        file_path: filePath // Include the file_path in the data
      }
    });
  
    res.status(201).json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
  });
}); 

// @desc    Update a report
// @route   PUT /api/reports/:id
// @access  Private
const updateReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {
    patientId,
    reportDate,
    reportType,
    reportStatus,
    currentHeartRate,
    currentRhythm,
    currentDependency,
    mdc_idc_stat_ataf_burden_percent,
    mdc_idc_set_brady_mode,
    mdc_idc_set_brady_lowrate,
    mdc_idc_set_brady_max_tracking_rate,
    mdc_idc_set_brady_max_sensor_rate,
    mdc_idc_dev_sav,
    mdc_idc_dev_pav,
    mdc_idc_stat_brady_ra_percent_paced,
    mdc_idc_stat_brady_rv_percent_paced,
    mdc_idc_stat_brady_lv_percent_paced,
    mdc_idc_stat_brady_biv_percent_paced,
    mdc_idc_batt_volt,
    mdc_idc_batt_remaining,
    mdc_idc_batt_status,
    mdc_idc_cap_charge_time,
    mdc_idc_msmt_ra_impedance_mean,
    mdc_idc_msmt_ra_sensing,
    mdc_idc_msmt_ra_pacing_threshold,
    mdc_idc_msmt_ra_pw,
    mdc_idc_msmt_rv_impedance_mean,
    mdc_idc_msmt_rv_sensing,
    mdc_idc_msmt_rv_pacing_threshold,
    mdc_idc_msmt_rv_pw,
    mdc_idc_msmt_shock_impedance,
    mdc_idc_msmt_lv_impedance_mean,
    mdc_idc_msmt_lv_sensing,
    mdc_idc_msmt_lv_pacing_threshold,
    mdc_idc_msmt_lv_pw,
    comments,
    isCompleted,
    file_path 
  } = req.body;

  try {
    const report = await prisma.report.update({
      where: { id: parseInt(id) },
      data: {
        patientId,
        reportDate,
        reportType,
        reportStatus,
        currentHeartRate,
        currentRhythm,
        currentDependency,
        mdc_idc_stat_ataf_burden_percent,
        mdc_idc_set_brady_mode,
        mdc_idc_set_brady_lowrate,
        mdc_idc_set_brady_max_tracking_rate,
        mdc_idc_set_brady_max_sensor_rate,
        mdc_idc_dev_sav,
        mdc_idc_dev_pav,
        mdc_idc_stat_brady_ra_percent_paced,
        mdc_idc_stat_brady_rv_percent_paced,
        mdc_idc_stat_brady_lv_percent_paced,
        mdc_idc_stat_brady_biv_percent_paced,
        mdc_idc_batt_volt,
        mdc_idc_batt_remaining,
        mdc_idc_batt_status,
        mdc_idc_cap_charge_time,
        mdc_idc_msmt_ra_impedance_mean,
        mdc_idc_msmt_ra_sensing,
        mdc_idc_msmt_ra_pacing_threshold,
        mdc_idc_msmt_ra_pw,
        mdc_idc_msmt_rv_impedance_mean,
        mdc_idc_msmt_rv_sensing,
        mdc_idc_msmt_rv_pacing_threshold,
        mdc_idc_msmt_rv_pw,
        mdc_idc_msmt_shock_impedance,
        mdc_idc_msmt_lv_impedance_mean,
        mdc_idc_msmt_lv_sensing,
        mdc_idc_msmt_lv_pacing_threshold,
        mdc_idc_msmt_lv_pw,
        comments,
        isCompleted,
        file_path // Include the file_path in the data
        }
    });
    res.status(201).json(report);
    } catch (error) {
    res.status(400).json({ error: error.message });
    }
});

// @desc    Delete a report
// @route   DELETE /api/reports/:id
// @access  Private
const deleteReport = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.report.delete({
      where: { id: parseInt(id) }
    });
    res.status(200).json({ message: 'Report deleted' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

export { 
    findAll, 
    getReport,
    getReportsByPatient, 
    createReport, 
    updateReport, 
    deleteReport 
};