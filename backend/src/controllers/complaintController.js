const Complaint = require("../models/Complaint");

exports.fileComplaint = async (req, res) => {
  const complaint = await Complaint.create({
    riderId: req.user.id,
    rideId: req.body.ride_id || undefined,
    title: req.body.title,
    description: req.body.description,
  });
  res.status(201).json({ success: true, message: "Complaint filed", data: complaint });
};

exports.getMyComplaints = async (req, res) => {
  const complaints = await Complaint.find({ riderId: req.user.id }).sort({ createdAt: -1 });
  res.json({ success: true, data: complaints });
};

exports.getComplaint = async (req, res) => {
  const complaint = await Complaint.findById(req.params.id);
  if (!complaint) return res.status(404).json({ success: false, message: "Complaint not found." });
  res.json({ success: true, data: complaint });
};
